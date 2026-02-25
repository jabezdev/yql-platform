import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getRubric = query({
    args: {
        cohortId: v.id("cohorts"),
        round: v.union(v.literal("round1"), v.literal("round2"), v.literal("round3"), v.literal("round4")),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("rubrics")
            .withIndex("by_cohort_round", (q) => q.eq("cohortId", args.cohortId).eq("round", args.round))
            .first();
    },
});

export const saveRubric = mutation({
    args: {
        rubricId: v.optional(v.id("rubrics")),
        cohortId: v.id("cohorts"),
        round: v.union(v.literal("round1"), v.literal("round2"), v.literal("round3"), v.literal("round4")),
        criteria: v.array(
            v.object({
                name: v.string(),
                description: v.string(),
                maxScore: v.number(),
            })
        ),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();

        if (!user || user.role !== "Admin") {
            throw new Error("Unauthorized: Only Admins can edit rubrics");
        }

        if (args.rubricId) {
            return await ctx.db.patch(args.rubricId, {
                criteria: args.criteria,
            });
        }
        return await ctx.db.insert("rubrics", {
            cohortId: args.cohortId,
            round: args.round,
            criteria: args.criteria,
        });
    },
});

export const saveEvaluation = mutation({
    args: {
        applicationId: v.id("applications"),
        reviewerId: v.id("users"),
        round: v.union(v.literal("round1"), v.literal("round2"), v.literal("round3"), v.literal("round4")),
        scores: v.array(
            v.object({
                criterionName: v.string(),
                score: v.number(),
            })
        ),
        feedback: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();

        if (!user || user.role === "Applicant" || (user.role === "Staff" && user.staffSubRole !== "Reviewer")) {
            throw new Error("Unauthorized");
        }

        if (args.reviewerId !== user._id && user.role !== "Admin") {
            throw new Error("Unauthorized");
        }

        // Check for existing evaluation
        const existing = await ctx.db
            .query("evaluations")
            .withIndex("by_application_round", (q) => q.eq("applicationId", args.applicationId).eq("round", args.round))
            .filter((q) => q.eq(q.field("reviewerId"), args.reviewerId))
            .first();

        if (existing) {
            return await ctx.db.patch(existing._id, {
                scores: args.scores,
                feedback: args.feedback,
            });
        }

        return await ctx.db.insert("evaluations", {
            applicationId: args.applicationId,
            reviewerId: args.reviewerId,
            round: args.round,
            scores: args.scores,
            feedback: args.feedback,
        });
    },
});

export const getEvaluations = query({
    args: {
        applicationId: v.id("applications"),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("evaluations")
            .withIndex("by_application_round", (q) => q.eq("applicationId", args.applicationId))
            .collect();
    },
});
