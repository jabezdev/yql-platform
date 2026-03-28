/**
 * Moderation Helpers
 * Handles hide/mute/softban checks and audit logging
 */

import type { Id } from "../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../_generated/server";

async function logAudit(
    ctx: MutationCtx,
    args: {
        type: string;
        actor: Id<"users">;
        channelId?: Id<"chatChannels">;
        targetUserId?: Id<"users">;
        targetMessageId?: Id<"chatMessages">;
        reason?: string;
        metadata?: unknown;
    }
) {
    await ctx.db.insert("chatAuditLog", {
        ...args,
        createdAt: Date.now(),
    });
}

/**
 * Check if user is muted in a channel
 */
export async function isUserMuted(
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

    return membership?.isMuted ?? false;
}

/**
 * Check if user is soft-banned in a channel (temporary ban)
 */
export async function isUserSoftBanned(
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

    if (!membership?.softBanUntil) return false;

    return membership.softBanUntil > Date.now();
}

/**
 * Check if user is hidden from a channel (soft moderation)
 */
export async function isUserHidden(
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

    return membership?.isHidden ?? false;
}

/**
 * Mute a user in a channel (prevent posting)
 */
export async function muteUser(
    ctx: MutationCtx,
    userId: Id<"users">,
    channelId: Id<"chatChannels">,
    actor: Id<"users">,
    reason?: string
) {
    const membership = await ctx.db
        .query("chatChannelMembers")
        .withIndex("by_channel_user", (q) =>
            q.eq("channelId", channelId).eq("userId", userId)
        )
        .first();

    if (!membership) {
        throw new Error("User is not a member of this channel");
    }

    await ctx.db.patch(membership._id, { isMuted: true });

    // Log audit event
    await logAudit(ctx, {
        type: "user_muted",
        actor,
        targetUserId: userId,
        channelId,
        reason,
    });
}

/**
 * Unmute a user in a channel
 */
export async function unmuteUser(
    ctx: MutationCtx,
    userId: Id<"users">,
    channelId: Id<"chatChannels">,
    actor: Id<"users">
) {
    const membership = await ctx.db
        .query("chatChannelMembers")
        .withIndex("by_channel_user", (q) =>
            q.eq("channelId", channelId).eq("userId", userId)
        )
        .first();

    if (!membership) {
        throw new Error("User is not a member of this channel");
    }

    await ctx.db.patch(membership._id, { isMuted: false });

    // Log audit event
    await logAudit(ctx, {
        type: "user_unmuted",
        actor,
        targetUserId: userId,
        channelId,
    });
}

/**
 * Soft ban a user (temporary ban, can rejoin after duration)
 * durationMs: duration in milliseconds (e.g., 1000 * 60 * 60 = 1 hour)
 */
export async function softBanUser(
    ctx: MutationCtx,
    userId: Id<"users">,
    channelId: Id<"chatChannels">,
    durationMs: number,
    actor: Id<"users">,
    reason?: string
) {
    const membership = await ctx.db
        .query("chatChannelMembers")
        .withIndex("by_channel_user", (q) =>
            q.eq("channelId", channelId).eq("userId", userId)
        )
        .first();

    if (!membership) {
        throw new Error("User is not a member of this channel");
    }

    const softBanUntil = Date.now() + durationMs;
    await ctx.db.patch(membership._id, { softBanUntil });

    // Log audit event
    await logAudit(ctx, {
        type: "user_soft_banned",
        actor,
        targetUserId: userId,
        channelId,
        reason,
        metadata: { softBanUntil },
    });
}

/**
 * Remove soft ban from a user
 */
export async function removeSoftBan(
    ctx: MutationCtx,
    userId: Id<"users">,
    channelId: Id<"chatChannels">,
    actor: Id<"users">
) {
    const membership = await ctx.db
        .query("chatChannelMembers")
        .withIndex("by_channel_user", (q) =>
            q.eq("channelId", channelId).eq("userId", userId)
        )
        .first();

    if (!membership) {
        throw new Error("User is not a member of this channel");
    }

    await ctx.db.patch(membership._id, { softBanUntil: undefined });

    // Log audit event
    await logAudit(ctx, {
        type: "soft_ban_removed",
        actor,
        targetUserId: userId,
        channelId,
    });
}

/**
 * Hide a user from a channel (soft moderation - visible only to admins)
 */
export async function hideUserInChannel(
    ctx: MutationCtx,
    userId: Id<"users">,
    channelId: Id<"chatChannels">,
    actor: Id<"users">,
    reason?: string
) {
    const membership = await ctx.db
        .query("chatChannelMembers")
        .withIndex("by_channel_user", (q) =>
            q.eq("channelId", channelId).eq("userId", userId)
        )
        .first();

    if (!membership) {
        throw new Error("User is not a member of this channel");
    }

    await ctx.db.patch(membership._id, { isHidden: true });

    // Log audit event
    await logAudit(ctx, {
        type: "user_hidden",
        actor,
        targetUserId: userId,
        channelId,
        reason,
    });
}

/**
 * Unhide a user in a channel
 */
export async function unhideUserInChannel(
    ctx: MutationCtx,
    userId: Id<"users">,
    channelId: Id<"chatChannels">,
    actor: Id<"users">
) {
    const membership = await ctx.db
        .query("chatChannelMembers")
        .withIndex("by_channel_user", (q) =>
            q.eq("channelId", channelId).eq("userId", userId)
        )
        .first();

    if (!membership) {
        throw new Error("User is not a member of this channel");
    }

    await ctx.db.patch(membership._id, { isHidden: false });

    // Log audit event
    await logAudit(ctx, {
        type: "user_unhidden",
        actor,
        targetUserId: userId,
        channelId,
    });
}

/**
 * Hide a message (soft delete - visible only to author/admins)
 */
export async function hideMessage(
    ctx: MutationCtx,
    messageId: Id<"chatMessages">,
    actor: Id<"users">,
    reason?: string
) {
    const msg = await ctx.db.get(messageId);
    if (!msg) throw new Error("Message not found");

    await ctx.db.patch(messageId, {
        isDeleted: true,
        deletedAt: Date.now(),
        deletedBy: actor,
    });

    // Log audit event
    await logAudit(ctx, {
        type: "message_deleted",
        actor,
        targetMessageId: messageId,
        channelId: msg.channelId,
        reason,
    });
}

/**
 * Unhide a message
 */
export async function unhideMessage(
    ctx: MutationCtx,
    messageId: Id<"chatMessages">,
    actor: Id<"users">
) {
    const msg = await ctx.db.get(messageId);
    if (!msg) throw new Error("Message not found");

    // Restore message by marking as not deleted
    await ctx.db.patch(messageId, {
        isDeleted: false,
        deletedAt: undefined,
        deletedBy: undefined,
    });

    // Log audit event
    await logAudit(ctx, {
        type: "message_restored",
        actor,
        targetMessageId: messageId,
        channelId: msg.channelId,
    });
}

/**
 * Get audit log entries for a channel
 */
export async function getChannelAuditLog(
    ctx: QueryCtx,
    channelId: Id<"chatChannels">,
    limit: number = 50
) {
    return ctx.db
        .query("chatAuditLog")
        .withIndex("by_channelId", (q) => q.eq("channelId", channelId))
        .order("desc")
        .take(limit);
}

/**
 * Get moderation events for a user
 */
export async function getUserModerationHistory(
    ctx: QueryCtx,
    userId: Id<"users">,
    limit: number = 50
) {
    return ctx.db
        .query("chatAuditLog")
        .withIndex("by_targetUserId", (q) => q.eq("targetUserId", userId))
        .order("desc")
        .take(limit);
}
