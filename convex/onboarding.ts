import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireUser, requireStaff } from "./accessControl";
import { isAdmin as checkAdmin } from "./roleHierarchy";
import type { Role } from "./roleHierarchy";

export const getModules = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("onboardingModules").withIndex("by_order").collect();
    },
});

export const getModule = query({
    args: { moduleId: v.id("onboardingModules") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.moduleId);
    },
});

export const createModule = mutation({
    args: {
        title: v.string(),
        description: v.optional(v.string()),
        content: v.string(),
        order: v.number(),
        isRequired: v.boolean(),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        return await ctx.db.insert("onboardingModules", args);
    },
});

export const updateModule = mutation({
    args: {
        moduleId: v.id("onboardingModules"),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        content: v.optional(v.string()),
        order: v.optional(v.number()),
        isRequired: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        const { moduleId, ...updates } = args;
        return await ctx.db.patch(moduleId, updates);
    },
});

export const deleteModule = mutation({
    args: { moduleId: v.id("onboardingModules") },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);

        // Find and delete any progress records for this module
        const progressRecords = await ctx.db
            .query("onboardingProgress")
            .filter((q) => q.eq(q.field("moduleId"), args.moduleId))
            .collect();

        for (const record of progressRecords) {
            await ctx.db.delete(record._id);
        }

        return await ctx.db.delete(args.moduleId);
    },
});

export const getProgress = query({
    args: { userId: v.optional(v.id("users")) },
    handler: async (ctx, args) => {
        // Anyone can see their own progress, but only Staff/Admin can see others
        const currentUser = await requireUser(ctx);
        const targetUserId = args.userId || currentUser._id;

        if (targetUserId !== currentUser._id) {
            await requireStaff(ctx);
        }

        return await ctx.db
            .query("onboardingProgress")
            .withIndex("by_user", (q) => q.eq("userId", targetUserId))
            .collect();
    },
});

export const markCompleted = mutation({
    args: {
        userId: v.id("users"),
        moduleId: v.id("onboardingModules"),
    },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);

        if (user._id !== args.userId && !checkAdmin(user.role as Role)) {
            throw new Error("Unauthorized: Cannot mark progress for another user");
        }

        const existing = await ctx.db
            .query("onboardingProgress")
            .withIndex("by_user_module", (q) => q.eq("userId", args.userId).eq("moduleId", args.moduleId))
            .unique();

        if (existing) {
            return existing._id;
        }

        return await ctx.db.insert("onboardingProgress", {
            userId: args.userId,
            moduleId: args.moduleId,
            completedAt: Date.now(),
        });
    },
});
