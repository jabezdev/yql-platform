import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { internal } from "../_generated/api";
import { requireAdmin, requireReviewer, requireUser, requireSelfOrMinRole } from "../accessControl";
import { isStaff as checkStaff } from "../org/roleHierarchy";
import type { Role } from "../org/roleHierarchy";

export const getApplicationsForUser = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await requireSelfOrMinRole(ctx, args.userId, "T2");

        return await ctx.db
            .query("applications")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();
    },
});

export const getApplicationsForCohort = query({
    args: { cohortId: v.id("cohorts") },
    handler: async (ctx, args) => {
        await requireReviewer(ctx);

        return await ctx.db
            .query("applications")
            .withIndex("by_cohort", (q) => q.eq("cohortId", args.cohortId))
            .collect();
    },
});

export const getApplicationsForReviewer = query({
    args: { reviewerId: v.id("users") },
    handler: async (ctx, args) => {
        await requireReviewer(ctx);

        return await ctx.db
            .query("applications")
            .withIndex("by_reviewer", (q) => q.eq("assignedReviewerId", args.reviewerId))
            .collect();
    },
});

export const getExpandedApplicationsForReviewer = query({
    args: { reviewerId: v.id("users") },
    handler: async (ctx, args) => {
        await requireReviewer(ctx);

        const apps = await ctx.db
            .query("applications")
            .withIndex("by_reviewer", (q) => q.eq("assignedReviewerId", args.reviewerId))
            .collect();

        return await Promise.all(
            apps.map(async (app) => {
                const user = await ctx.db.get(app.userId);
                return { ...app, user };
            })
        );
    },
});

export const createApplication = mutation({
    args: {
        userId: v.id("users"),
        cohortId: v.id("cohorts"),
    },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);

        if (!checkStaff(user.role as Role) && user._id !== args.userId) {
            throw new Error("Unauthorized: Cannot create application for another user");
        }

        // Check if user already has an application for this cohort
        const existing = await ctx.db
            .query("applications")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .filter((q) => q.eq(q.field("cohortId"), args.cohortId))
            .first();

        if (existing) {
            throw new Error("Application already exists for this cohort");
        }

        return await ctx.db.insert("applications", {
            userId: args.userId,
            cohortId: args.cohortId,
            status: "round1",
        });
    },
});

export const updateApplicationStatus = mutation({
    args: {
        applicationId: v.id("applications"),
        status: v.union(
            v.literal("round1"),
            v.literal("round2"),
            v.literal("round3"),
            v.literal("round4"),
            v.literal("round5"),
            v.literal("round6"),
            v.literal("rejected"),
            v.literal("withdrawn"),
            v.literal("accepted")
        ),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await requireReviewer(ctx);
        const application = await ctx.db.get(args.applicationId);
        if (!application) throw new Error("Application not found");

        const oldStatus = application.status;

        await ctx.db.patch(args.applicationId, {
            status: args.status,
        });

        await ctx.scheduler.runAfter(0, internal.recruitment.history.recordStatusChange, {
            applicationId: args.applicationId,
            oldStatus,
            newStatus: args.status,
            changedBy: user._id,
            reason: args.reason,
        });
    },
});

export const assignReviewer = mutation({
    args: {
        applicationId: v.id("applications"),
        reviewerId: v.id("users"),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);

        return await ctx.db.patch(args.applicationId, {
            assignedReviewerId: args.reviewerId,
        });
    },
});
