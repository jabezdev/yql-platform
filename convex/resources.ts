import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireStaff } from "./accessControl";

export const listResources = query({
    args: {
        type: v.optional(v.union(v.literal("link"), v.literal("document"), v.literal("video"), v.literal("other"))),
    },
    handler: async (ctx, args) => {
        await requireStaff(ctx);
        const rows = args.type
            ? await ctx.db.query("resources").withIndex("by_type", q => q.eq("type", args.type!)).collect()
            : await ctx.db.query("resources").withIndex("by_createdAt").order("desc").collect();

        return await Promise.all(rows.map(async r => {
            const uploader = await ctx.db.get(r.uploadedBy);
            return { ...r, uploaderName: uploader?.name ?? "Unknown" };
        }));
    },
});

export const createResource = mutation({
    args: {
        title: v.string(),
        description: v.optional(v.string()),
        url: v.optional(v.string()),
        fileStorageId: v.optional(v.id("_storage")),
        type: v.union(v.literal("link"), v.literal("document"), v.literal("video"), v.literal("other")),
        tags: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const user = await requireAdmin(ctx);
        return await ctx.db.insert("resources", {
            ...args,
            uploadedBy: user._id,
            createdAt: Date.now(),
        });
    },
});

export const deleteResource = mutation({
    args: { resourceId: v.id("resources") },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        const resource = await ctx.db.get(args.resourceId);
        if (resource?.fileStorageId) {
            await ctx.storage.delete(resource.fileStorageId);
        }
        await ctx.db.delete(args.resourceId);
    },
});
