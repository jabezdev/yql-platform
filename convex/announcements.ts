import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireUser, requireStaff } from "./accessControl";
import { isStaff } from "./org/roleHierarchy";
import type { Role } from "./org/roleHierarchy";

export const getAnnouncements = query({
    args: { includeExpired: v.optional(v.boolean()) },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);
        const isUserStaff = isStaff(user.role as Role);

        let announcements = await ctx.db
            .query("announcements")
            .withIndex("by_pinned", (q) => q.eq("isPinned", true))
            .collect();

        const normal = await ctx.db
            .query("announcements")
            .withIndex("by_pinned", (q) => q.eq("isPinned", false))
            .collect();

        announcements = [...announcements, ...normal];

        const now = Date.now();
        return announcements.filter((a) => {
            // Expiry check
            if (!args.includeExpired && a.expiresAt && a.expiresAt < now) return false;
            
            // Staff-only check
            if (a.staffOnly && !isUserStaff) return false;

            return true;
        });
    },
});

export const createAnnouncement = mutation({
    args: {
        title: v.string(),
        content: v.string(),
        isPinned: v.boolean(),
        expiresAt: v.optional(v.number()),
        staffOnly: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const user = await requireStaff(ctx);
        return await ctx.db.insert("announcements", {
            ...args,
            authorId: user._id,
            staffOnly: args.staffOnly ?? false,
        });
    },
});

export const updateAnnouncement = mutation({
    args: {
        announcementId: v.id("announcements"),
        title: v.optional(v.string()),
        content: v.optional(v.string()),
        isPinned: v.optional(v.boolean()),
        expiresAt: v.optional(v.number()),
        staffOnly: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        await requireStaff(ctx);
        const { announcementId, ...updates } = args;
        return await ctx.db.patch(announcementId, updates);
    },
});

export const deleteAnnouncement = mutation({
    args: { announcementId: v.id("announcements") },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        return await ctx.db.delete(args.announcementId);
    },
});
