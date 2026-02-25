import { query } from "./_generated/server";
import { v } from "convex/values";

export const getDashboardStats = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const admin = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();

        if (!admin || admin.role !== "Admin") {
            throw new Error("Unauthorized: Only Admins can view stats");
        }

        // Get total users
        const users = await ctx.db.query("users").collect();
        const totalUsers = users.length;

        // Get active cohorts
        const activeCohorts = await ctx.db
            .query("cohorts")
            .withIndex("by_status", (q) => q.eq("status", "active"))
            .collect();

        // Get pending applications (anything not accepted, rejected, or withdrawn)
        const allApplications = await ctx.db.query("applications").collect();
        const pendingApplications = allApplications.filter(
            app => !["accepted", "rejected", "withdrawn"].includes(app.status)
        ).length;

        return {
            totalUsers,
            activeCohorts: activeCohorts.length,
            pendingApplications
        };
    },
});

export const getAllUsers = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const admin = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();

        if (!admin || admin.role !== "Admin") {
            return [];
        }

        return await ctx.db.query("users").collect();
    }
});

export const getExpandedApplicationsForCohort = query({
    args: { cohortId: v.id("cohorts") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const admin = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();

        // Admins and Reviewers can see it. Let's allow Staff too just in case.
        if (!admin || admin.role === "Applicant") {
            return [];
        }

        const apps = await ctx.db
            .query("applications")
            .withIndex("by_cohort", (q) => q.eq("cohortId", args.cohortId))
            .collect();

        return await Promise.all(
            apps.map(async (app) => {
                const user = await ctx.db.get(app.userId);
                const reviewer = app.assignedReviewerId ? await ctx.db.get(app.assignedReviewerId) : null;
                return { ...app, user, reviewer };
            })
        );
    }
});
