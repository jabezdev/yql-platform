import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin } from "./accessControl";

export const getAll = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("cohorts").order("desc").collect();
    }
});

export const getAvailable = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("cohorts")
            .withIndex("by_status", (q) => q.eq("status", "upcoming"))
            .collect();
    }
});

export const createCohort = mutation({
    args: {
        name: v.string(),
        applicationStartDate: v.number(),
        applicationEndDate: v.number(),
        termStartDate: v.number(),
        termEndDate: v.number(),
        status: v.union(v.literal("upcoming"), v.literal("active"), v.literal("past")),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        return await ctx.db.insert("cohorts", args);
    },
});

export const updateCohort = mutation({
    args: {
        cohortId: v.id("cohorts"),
        name: v.optional(v.string()),
        applicationStartDate: v.optional(v.number()),
        applicationEndDate: v.optional(v.number()),
        termStartDate: v.optional(v.number()),
        termEndDate: v.optional(v.number()),
        status: v.optional(v.union(v.literal("upcoming"), v.literal("active"), v.literal("past"))),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        const { cohortId, ...fields } = args;
        const patch = Object.fromEntries(
            Object.entries(fields).filter(([, v]) => v !== undefined)
        );
        return await ctx.db.patch(cohortId, patch);
    },
});

export const deleteCohort = mutation({
    args: { cohortId: v.id("cohorts") },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        // Check for associated applications before deleting
        const apps = await ctx.db
            .query("applications")
            .withIndex("by_cohort", (q) => q.eq("cohortId", args.cohortId))
            .first();
        if (apps) {
            throw new Error("Cannot delete a cohort that has existing applications.");
        }
        await ctx.db.delete(args.cohortId);
    },
});
