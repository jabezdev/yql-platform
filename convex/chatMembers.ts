import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireUser, requireMinRole } from "./accessControl";

// ── Queries ──────────────────────────────────────────────────────────────────

export const listMembers = query({
    args: { channelId: v.id("chatChannels") },
    handler: async (ctx, { channelId }) => {
        await requireUser(ctx);
        const members = await ctx.db
            .query("chatChannelMembers")
            .withIndex("by_channelId", (q) => q.eq("channelId", channelId))
            .collect();

        return Promise.all(
            members.map(async (m) => {
                const user = await ctx.db.get(m.userId);
                return {
                    ...m,
                    user: user
                        ? { _id: user._id, name: user.name, role: user.role, specialRoles: user.specialRoles, profileChip: user.profileChip }
                        : null,
                };
            })
        );
    },
});

export const getMyMembership = query({
    args: { channelId: v.id("chatChannels") },
    handler: async (ctx, { channelId }) => {
        const user = await requireUser(ctx);
        return ctx.db
            .query("chatChannelMembers")
            .withIndex("by_channel_user", (q) =>
                q.eq("channelId", channelId).eq("userId", user._id)
            )
            .first();
    },
});

export const getUnreadCounts = query({
    args: {},
    handler: async (ctx) => {
        const user = await requireUser(ctx);

        const memberships = await ctx.db
            .query("chatChannelMembers")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .collect();

        const counts: Record<string, number> = {};

        await Promise.all(
            memberships.map(async (m) => {
                const since = m.lastReadTimestamp ?? 0;
                const unreadMessages = await ctx.db
                    .query("chatMessages")
                    .withIndex("by_channelId", (q) => q.eq("channelId", m.channelId))
                    .filter((q) =>
                        q.and(
                            q.gt(q.field("_creationTime"), since),
                            q.neq(q.field("authorId"), user._id),
                            q.neq(q.field("isSystem"), true)
                        )
                    )
                    .collect();

                counts[m.channelId] = unreadMessages.length;
            })
        );

        return counts;
    },
});

// ── Mutations ────────────────────────────────────────────────────────────────

export const joinChannel = mutation({
    args: { channelId: v.id("chatChannels") },
    handler: async (ctx, { channelId }) => {
        const user = await requireUser(ctx);

        const existing = await ctx.db
            .query("chatChannelMembers")
            .withIndex("by_channel_user", (q) =>
                q.eq("channelId", channelId).eq("userId", user._id)
            )
            .first();

        if (existing) return existing._id;

        const id = await ctx.db.insert("chatChannelMembers", {
            channelId,
            userId: user._id,
            joinedAt: Date.now(),
            role: "member",
            isMuted: false,
        });

        // System message
        await ctx.db.insert("chatMessages", {
            channelId,
            authorId: user._id,
            body: "",
            bodyPlainText: `${user.name} joined the channel`,
            isEdited: false,
            isDeleted: false,
            isPinned: false,
            isSystem: true,
            systemType: "member_joined",
        });

        return id;
    },
});

export const leaveChannel = mutation({
    args: { channelId: v.id("chatChannels") },
    handler: async (ctx, { channelId }) => {
        const user = await requireUser(ctx);

        const membership = await ctx.db
            .query("chatChannelMembers")
            .withIndex("by_channel_user", (q) =>
                q.eq("channelId", channelId).eq("userId", user._id)
            )
            .first();

        if (!membership) return;
        if (membership.role === "owner") throw new Error("Channel owner cannot leave. Transfer ownership first.");

        await ctx.db.delete(membership._id);

        await ctx.db.insert("chatMessages", {
            channelId,
            authorId: user._id,
            body: "",
            bodyPlainText: `${user.name} left the channel`,
            isEdited: false,
            isDeleted: false,
            isPinned: false,
            isSystem: true,
            systemType: "member_left",
        });
    },
});

export const markAsRead = mutation({
    args: {
        channelId: v.id("chatChannels"),
        lastMessageId: v.optional(v.id("chatMessages")),
    },
    handler: async (ctx, { channelId, lastMessageId }) => {
        const user = await requireUser(ctx);

        const membership = await ctx.db
            .query("chatChannelMembers")
            .withIndex("by_channel_user", (q) =>
                q.eq("channelId", channelId).eq("userId", user._id)
            )
            .first();

        if (!membership) {
            // Auto-join on first read
            await ctx.db.insert("chatChannelMembers", {
                channelId,
                userId: user._id,
                joinedAt: Date.now(),
                role: "member",
                isMuted: false,
                lastReadTimestamp: Date.now(),
                lastReadMessageId: lastMessageId,
            });
            return;
        }

        await ctx.db.patch(membership._id, {
            lastReadTimestamp: Date.now(),
            lastReadMessageId: lastMessageId,
        });
    },
});

export const updateNotificationPreference = mutation({
    args: {
        channelId: v.id("chatChannels"),
        level: v.union(v.literal("all"), v.literal("mentions"), v.literal("none")),
    },
    handler: async (ctx, { channelId, level }) => {
        const user = await requireUser(ctx);

        const membership = await ctx.db
            .query("chatChannelMembers")
            .withIndex("by_channel_user", (q) =>
                q.eq("channelId", channelId).eq("userId", user._id)
            )
            .first();

        if (!membership) throw new Error("Not a member of this channel");
        await ctx.db.patch(membership._id, { notificationLevel: level });
    },
});

export const inviteToChannel = mutation({
    args: {
        channelId: v.id("chatChannels"),
        userId: v.id("users"),
    },
    handler: async (ctx, { channelId, userId }) => {
        const inviter = await requireMinRole(ctx, "T5");

        const existing = await ctx.db
            .query("chatChannelMembers")
            .withIndex("by_channel_user", (q) =>
                q.eq("channelId", channelId).eq("userId", userId)
            )
            .first();

        if (existing) return existing._id;

        const invitee = await ctx.db.get(userId);
        if (!invitee) throw new Error("User not found");

        const id = await ctx.db.insert("chatChannelMembers", {
            channelId,
            userId,
            joinedAt: Date.now(),
            role: "member",
            isMuted: false,
        });

        await ctx.db.insert("chatMessages", {
            channelId,
            authorId: inviter._id,
            body: "",
            bodyPlainText: `${inviter.name} added ${invitee.name} to the channel`,
            isEdited: false,
            isDeleted: false,
            isPinned: false,
            isSystem: true,
            systemType: "member_added",
        });

        return id;
    },
});
