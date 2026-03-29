import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

async function requireUser(ctx: any) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
        .first();
    if (!user) throw new Error("User not found");
    return user;
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/** Create a new folder. */
export const createFolder = mutation({
    args: {
        name: v.string(),
        parentId: v.optional(v.id("posterFolders")),
        color: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);
        const now = Date.now();
        return await ctx.db.insert("posterFolders", {
            userId: user._id,
            name: args.name,
            parentId: args.parentId,
            color: args.color,
            createdAt: now,
            updatedAt: now,
        });
    },
});

/** Rename a folder. */
export const renameFolder = mutation({
    args: { folderId: v.id("posterFolders"), name: v.string(), color: v.optional(v.string()) },
    handler: async (ctx, { folderId, name, color }) => {
        const user = await requireUser(ctx);
        const folder = await ctx.db.get(folderId);
        if (!folder || folder.userId !== user._id) throw new Error("Not authorized");
        await ctx.db.patch(folderId, { name, color, updatedAt: Date.now() });
    },
});

/** Delete a folder (and optionally move its contents to root or parent). */
export const deleteFolder = mutation({
    args: {
        folderId: v.id("posterFolders"),
        moveContentsToRoot: v.boolean(),
    },
    handler: async (ctx, { folderId, moveContentsToRoot }) => {
        const user = await requireUser(ctx);
        const folder = await ctx.db.get(folderId);
        if (!folder || folder.userId !== user._id) throw new Error("Not authorized");

        // Collect all descendant folder IDs
        const toDelete: string[] = [folderId];
        const queue = [folderId];
        while (queue.length) {
            const current = queue.shift()!;
            const children = await ctx.db
                .query("posterFolders")
                .withIndex("by_parentId", (q) => q.eq("parentId", current as any))
                .collect();
            for (const child of children) {
                toDelete.push(child._id);
                queue.push(child._id);
            }
        }

        // Move or delete designs in affected folders
        for (const fid of toDelete) {
            const designs = await ctx.db
                .query("posterDesigns")
                .withIndex("by_userId_folderId", (q) =>
                    q.eq("userId", user._id).eq("folderId", fid as any)
                )
                .collect();
            for (const d of designs) {
                if (moveContentsToRoot) {
                    await ctx.db.patch(d._id, { folderId: undefined });
                } else {
                    // Delete design + its likes
                    const likes = await ctx.db
                        .query("posterLikes")
                        .withIndex("by_designId", (q) => q.eq("designId", d._id))
                        .collect();
                    for (const l of likes) await ctx.db.delete(l._id);
                    await ctx.db.delete(d._id);
                }
            }
        }

        // Delete all collected folders
        for (const fid of toDelete) {
            await ctx.db.delete(fid as any);
        }
    },
});

// ─── Queries ──────────────────────────────────────────────────────────────────

/** All folders owned by the current user. */
export const getMyFolders = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();
        if (!user) return [];

        return await ctx.db
            .query("posterFolders")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .collect();
    },
});

/** Design counts per folder for the current user. */
export const getFolderDesignCounts = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return {};
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();
        if (!user) return {};

        const designs = await ctx.db
            .query("posterDesigns")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .collect();

        const counts: Record<string, number> = { root: 0 };
        for (const d of designs) {
            const key = d.folderId ?? "root";
            counts[key] = (counts[key] ?? 0) + 1;
        }
        return counts;
    },
});
