import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireStaff, requireMinRole } from "../accessControl";

const canManage = async (ctx: any) => {
    return await requireMinRole(ctx, "T3");
};

export const getAnnouncements = query({
    args: {},
    handler: async (ctx) => {
        await requireStaff(ctx);
        const all = await ctx.db.query("announcements").collect();
        const now = Date.now();
        // Filter out expired ones
        const active = all.filter((a) => !a.expiresAt || a.expiresAt > now);
        // Sort: pinned first, then by creation time desc
        active.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return b._creationTime - a._creationTime;
        });
        return active;
    },
});

export const createAnnouncement = mutation({
    args: {
        title: v.string(),
        content: v.string(),
        isPinned: v.boolean(),
        expiresAt: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const user = await canManage(ctx);
        return await ctx.db.insert("announcements", {
            ...args,
            authorId: user._id,
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
    },
    handler: async (ctx, args) => {
        await canManage(ctx);
        const { announcementId, ...updates } = args;
        return await ctx.db.patch(announcementId, updates);
    },
});

export const deleteAnnouncement = mutation({
    args: { announcementId: v.id("announcements") },
    handler: async (ctx, args) => {
        await canManage(ctx);
        return await ctx.db.delete(args.announcementId);
    },
});
