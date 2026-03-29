/**
 * Chat Permissions Helpers
 * Handles private/gated channel access logic and join requests
 */

import type { Id } from "../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import { getChannelMembership } from "./access";

/**
 * Check if channel requires approval to join (requiresApproval=true)
 */
export async function requiresJoinApproval(
    ctx: QueryCtx,
    channelId: Id<"chatChannels">
): Promise<boolean> {
    const channel = await ctx.db.get(channelId);
    return channel?.requiresApproval ?? false;
}

/**
 * Check if channel is private (isPrivate=true, only owner/invited)
 */
export async function isChannelPrivate(
    ctx: QueryCtx,
    channelId: Id<"chatChannels">
): Promise<boolean> {
    const channel = await ctx.db.get(channelId);
    return channel?.isPrivate ?? false;
}

/**
 * Check if user has pending join request for channel
 */
export async function hasPendingJoinRequest(
    ctx: QueryCtx,
    userId: Id<"users">,
    channelId: Id<"chatChannels">
): Promise<boolean> {
    const request = await ctx.db
        .query("chatChannelJoinRequests")
        .withIndex("by_channelId_userId", (q) =>
            q.eq("channelId", channelId).eq("userId", userId)
        )
        .first();

    return request?.status === "pending";
}

/**
 * Get pending join request (if any) for user in channel
 */
export async function getPendingJoinRequest(
    ctx: QueryCtx,
    userId: Id<"users">,
    channelId: Id<"chatChannels">
) {
    return ctx.db
        .query("chatChannelJoinRequests")
        .withIndex("by_channelId_userId", (q) =>
            q.eq("channelId", channelId).eq("userId", userId)
        )
        .first();
}

/**
 * Validate user can join channel
 * Returns: { allowed: boolean, reason?: string }
 */
export async function validateJoinChannel(
    ctx: QueryCtx,
    userId: Id<"users">,
    channelId: Id<"chatChannels">
): Promise<{ allowed: boolean; reason?: string }> {
    const channel = await ctx.db.get(channelId);
    if (!channel) {
        return { allowed: false, reason: "Channel not found" };
    }

    // Already a member?
    const membership = await getChannelMembership(ctx, userId, channelId);
    if (membership && !membership.isHidden) {
        return { allowed: false, reason: "Already a member of this channel" };
    }

    // Private channels require owner invite
    if (channel.isPrivate) {
        return { allowed: false, reason: "Private channel - invitation only" };
    }

    // Requires approval?
    if (channel.requiresApproval) {
        return {
            allowed: false,
            reason: "Requires owner approval - submit join request",
        };
    }

    return { allowed: true };
}

/**
 * Get list of pending join requests for a channel (owner-only)
 */
export async function getChannelJoinRequests(
    ctx: QueryCtx,
    channelId: Id<"chatChannels">
) {
    return ctx.db
        .query("chatChannelJoinRequests")
        .withIndex("by_channelId_status", (q) =>
            q.eq("channelId", channelId).eq("status", "pending")
        )
        .collect();
}

/**
 * Count pending join requests for a channel
 */
export async function countPendingRequests(
    ctx: QueryCtx,
    channelId: Id<"chatChannels">
): Promise<number> {
    const requests = await getChannelJoinRequests(ctx, channelId);
    return requests.length;
}

/**
 * Add user to channel as member
 */
export async function addChannelMember(
    ctx: MutationCtx,
    channelId: Id<"chatChannels">,
    userId: Id<"users">,
    role: "owner" | "admin" | "member" = "member"
) {
    return ctx.db.insert("chatChannelMembers", {
        channelId,
        userId,
        joinedAt: Date.now(),
        role,
        isMuted: false,
    });
}

/**
 * Remove user from channel
 */
export async function removeChannelMember(
    ctx: MutationCtx,
    channelId: Id<"chatChannels">,
    userId: Id<"users">
) {
    const membership = await getChannelMembership(ctx, userId, channelId);
    if (membership) {
        await ctx.db.delete(membership._id);
    }
}

/**
 * Update join request status
 */
export async function updateJoinRequestStatus(
    ctx: MutationCtx,
    requestId: Id<"chatChannelJoinRequests">,
    status: "pending" | "approved" | "rejected"
) {
    await ctx.db.patch(requestId, { status });
}
