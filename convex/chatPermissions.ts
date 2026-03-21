import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireMinRole } from "./accessControl";

// ── Queries ──────────────────────────────────────────────────────────────────

export const getChannelPermissions = query({
    args: { channelId: v.id("chatChannels") },
    handler: async (ctx, { channelId }) => {
        await requireMinRole(ctx, "T3");
        const perms = await ctx.db
            .query("chatChannelPermissions")
            .withIndex("by_channelId", (q) => q.eq("channelId", channelId))
            .collect();

        return Promise.all(
            perms.map(async (p) => {
                const grantor = await ctx.db.get(p.grantedBy);
                const targetUser = p.targetUserId ? await ctx.db.get(p.targetUserId) : null;
                return {
                    ...p,
                    grantorName: grantor?.name ?? "Unknown",
                    targetUserName: targetUser?.name ?? null,
                };
            })
        );
    },
});

// ── Mutations ────────────────────────────────────────────────────────────────

export const setPermission = mutation({
    args: {
        channelId: v.id("chatChannels"),
        permission: v.union(v.literal("send"), v.literal("manage"), v.literal("read_only")),
        targetUserId: v.optional(v.id("users")),
        targetRole: v.optional(v.string()),
        targetSpecialRole: v.optional(v.string()),
    },
    handler: async (ctx, { channelId, permission, targetUserId, targetRole, targetSpecialRole }) => {
        const user = await requireMinRole(ctx, "T3");

        // Exactly one target must be specified
        const targetCount = [targetUserId, targetRole, targetSpecialRole].filter(Boolean).length;
        if (targetCount !== 1) throw new Error("Specify exactly one of targetUserId, targetRole, or targetSpecialRole");

        const channel = await ctx.db.get(channelId);
        if (!channel) throw new Error("Channel not found");

        // Find existing rule for this target
        const existing = await ctx.db
            .query("chatChannelPermissions")
            .withIndex("by_channelId", (q) => q.eq("channelId", channelId))
            .collect()
            .then((perms) =>
                perms.find((p) =>
                    (targetUserId && p.targetUserId === targetUserId) ||
                    (targetRole && p.targetRole === targetRole) ||
                    (targetSpecialRole && p.targetSpecialRole === targetSpecialRole)
                )
            );

        if (existing) {
            await ctx.db.patch(existing._id, { permission, grantedBy: user._id });
        } else {
            await ctx.db.insert("chatChannelPermissions", {
                channelId,
                permission,
                targetUserId,
                targetRole,
                targetSpecialRole,
                grantedBy: user._id,
            });
        }
    },
});

export const removePermission = mutation({
    args: { permissionId: v.id("chatChannelPermissions") },
    handler: async (ctx, { permissionId }) => {
        await requireMinRole(ctx, "T3");
        await ctx.db.delete(permissionId);
    },
});
