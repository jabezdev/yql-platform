import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, requireStaff } from "./accessControl";

export const getDashboardStats = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);

        const users = await ctx.db.query("users").collect();
        const staffUsers = users.filter(u => u.role !== "Applicant");
        const totalStaff = staffUsers.length;

        const activeCohorts = await ctx.db
            .query("cohorts")
            .withIndex("by_status", (q) => q.eq("status", "active"))
            .collect();

        const allApplications = await ctx.db.query("applications").collect();
        const pendingApplications = allApplications.filter(
            app => !["accepted", "rejected", "withdrawn"].includes(app.status)
        ).length;

        const pendingHRSubmissions = await ctx.db
            .query("hrFormSubmissions")
            .withIndex("by_status", (q) => q.eq("status", "pending"))
            .collect();

        const openTasks = await ctx.db
            .query("openTasks")
            .withIndex("by_status", (q) => q.eq("status", "open"))
            .collect();

        return {
            totalStaff,
            activeCohorts: activeCohorts.length,
            pendingApplications,
            pendingHRSubmissions: pendingHRSubmissions.length,
            openTasks: openTasks.length,
        };
    },
});

export const getAllUsers = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);
        return await ctx.db.query("users").collect();
    }
});

export const getExpandedApplicationsForCohort = query({
    args: { cohortId: v.id("cohorts") },
    handler: async (ctx, args) => {
        // Safe for Admins and Reviewers/Staff
        await requireStaff(ctx);

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
