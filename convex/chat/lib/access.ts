/**
 * Chat Access Control Helpers
 * Handles channel visibility, membership checks, and permission validation
 */

import { ConvexError } from "convex/values";
import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import { hasMinRole } from "../../roleHierarchy";
import type { Role } from "../../roleHierarchy";

type AnyCtx = QueryCtx | MutationCtx;
type AccessUser = {
    _id: Id<"users">;
    role?: string;
};

/**
 * Check if a user is a member of a channel
 */
export async function isChannelMember(
    ctx: QueryCtx,
    userId: Id<"users">,
    channelId: Id<"chatChannels">
): Promise<boolean> {
    const membership = await ctx.db
        .query("chatChannelMembers")
        .withIndex("by_channel_user", (q) =>
            q.eq("channelId", channelId).eq("userId", userId)
        )
        .first();

    return !!membership && !membership.isHidden;
}

/**
 * Check if a user has a specific role in a channel
 */
export async function hasChannelRole(
    ctx: QueryCtx,
    userId: Id<"users">,
    channelId: Id<"chatChannels">,
    role: "owner" | "admin" | "member"
): Promise<boolean> {
    const membership = await ctx.db
        .query("chatChannelMembers")
        .withIndex("by_channel_user", (q) =>
            q.eq("channelId", channelId).eq("userId", userId)
        )
        .first();

    if (!membership || membership.isHidden) return false;

    if (role === "owner") return membership.role === "owner";
    if (role === "admin") return ["owner", "admin"].includes(membership.role);
    return true;
}

/**
 * Get user's membership in a channel (including hidden members)
 */
export async function getChannelMembership(
    ctx: AnyCtx,
    userId: Id<"users">,
    channelId: Id<"chatChannels">
): Promise<Doc<"chatChannelMembers"> | null> {
    return ctx.db
        .query("chatChannelMembers")
        .withIndex("by_channel_user", (q) =>
            q.eq("channelId", channelId).eq("userId", userId)
        )
        .first();
}

/**
 * Load channel and enforce that user can read it.
 * Private, gated, and DM channels require membership unless caller is T3+.
 */
export async function assertCanReadChannel(
    ctx: AnyCtx,
    user: AccessUser,
    channelId: Id<"chatChannels">
): Promise<{ channel: Doc<"chatChannels">; membership: Doc<"chatChannelMembers"> | null }> {
    const channel = await ctx.db.get(channelId);
    if (!channel) {
        throw new ConvexError({ code: "NOT_FOUND", message: "Channel not found" });
    }
    if (channel.isArchived) {
        throw new ConvexError({ code: "FORBIDDEN", message: "Channel is archived" });
    }

    const membership = await getChannelMembership(ctx, user._id, channelId);
    const isPrivileged = user.role ? hasMinRole(user.role as Role, "T3") : false;

    if (membership?.isHidden && !isPrivileged) {
        throw new ConvexError({ code: "FORBIDDEN", message: "You do not have access to this channel" });
    }

    const requiresMembership =
        channel.type === "dm" ||
        channel.type === "group_dm" ||
        !!channel.isPrivate ||
        !!channel.requiresApproval;

    if (requiresMembership && !membership && !isPrivileged) {
        throw new ConvexError({ code: "FORBIDDEN", message: "You do not have access to this channel" });
    }

    return { channel, membership };
}

/**
 * Enforce message visibility by validating access to the parent channel.
 */
export async function assertCanReadMessage(
    ctx: AnyCtx,
    user: AccessUser,
    messageId: Id<"chatMessages">
): Promise<Doc<"chatMessages">> {
    const message = await ctx.db.get(messageId);
    if (!message || message.isDeleted) {
        throw new ConvexError({ code: "NOT_FOUND", message: "Message not found" });
    }
    await assertCanReadChannel(ctx, user, message.channelId);
    return message;
}

/**
 * Get all channels where user is a member (excludes hidden)
 */
export async function getUserChannels(
    ctx: QueryCtx,
    userId: Id<"users">
): Promise<Array<Doc<"chatChannelMembers">>> {
    return ctx.db
        .query("chatChannelMembers")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect()
        .then((members) => members.filter((m) => !m.isHidden));
}

/**
 * Check if channel is visible to user (not archived, not private if not member)
 */
export async function isChannelVisible(
    ctx: QueryCtx,
    userId: Id<"users">,
    channel: Doc<"chatChannels">
): Promise<boolean> {
    if (channel.isArchived) return false;

    if (channel.isPrivate) {
        return isChannelMember(ctx, userId, channel._id);
    }

    return true;
}

/**
 * Get list of channels visible to user
 */
export async function getVisibleChannels(
    ctx: QueryCtx,
    userId: Id<"users">
): Promise<Array<Doc<"chatChannels">>> {
    const myChannels = await getUserChannels(ctx, userId);
    const myChannelIds = new Set(myChannels.map((m) => m.channelId));

    const channelTypes: Array<"channel" | "subchannel" | "group" | "sidechat"> = [
        "channel",
        "subchannel",
        "group",
        "sidechat",
    ];

    const channelBuckets = await Promise.all(
        channelTypes.map((type) =>
            ctx.db
                .query("chatChannels")
                .withIndex("by_type", (q) => q.eq("type", type))
                .collect()
        )
    );
    const allChannels = channelBuckets.flat();

    return allChannels.filter((channel) => {
        if (channel.isArchived) return false;

        if (channel.isPrivate) {
            return myChannelIds.has(channel._id);
        }

        return true;
    });
}

/**
 * Check if user can post in a channel (member + not muted + not softbanned)
 */
export async function canPostInChannel(
    ctx: AnyCtx,
    userId: Id<"users">,
    channelId: Id<"chatChannels">
): Promise<boolean> {
    const membership = await getChannelMembership(ctx, userId, channelId);
    if (!membership || membership.isHidden) return false;

    if (membership.isMuted) return false;

    // Check soft ban
    if (membership.softBanUntil) {
        if (membership.softBanUntil > Date.now()) {
            return false;
        }
    }

    return true;
}

/**
 * Check if channel is soft-moderated (all new members hidden until approved)
 */
export async function isChannelModerated(
    ctx: QueryCtx,
    channelId: Id<"chatChannels">
): Promise<boolean> {
    const channel = await ctx.db.get(channelId);
    return channel?.requiresApproval ?? false;
}
