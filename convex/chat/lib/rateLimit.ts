/**
 * Rate Limit Helpers
 * Handles quota checks and rate limit enforcement
 */

import type { Id } from "../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../_generated/server";

/**
 * Rate limit thresholds
 */
export const RATE_LIMITS = {
    messagesToAny: { count: 30, windowMs: 60000 }, // 30 messages per minute
    messagesToChannel: { count: 20, windowMs: 60000 }, // 20 messages per minute
    messagesToDM: { count: 50, windowMs: 60000 }, // 50 messages per minute
    reactions: { count: 100, windowMs: 60000 }, // 100 reactions per minute
} as const;

/**
 * Check if user has exceeded rate limit for posting to a channel
 */
export async function checkPostRateLimit(
    ctx: QueryCtx,
    userId: Id<"users">,
    channelId: Id<"chatChannels">
): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - RATE_LIMITS.messagesToAny.windowMs;

    const recentMessages = await ctx.db
        .query("chatMessages")
        .withIndex("by_authorId", (q) => q.eq("authorId", userId))
        .collect()
        .then((msgs) =>
            msgs.filter((m) => {
                const createdAt = m._creationTime;
                return createdAt > windowStart && m.channelId === channelId;
            })
        );

    return recentMessages.length < RATE_LIMITS.messagesToChannel.count;
}

/**
 * Get rate limit status for a user (messages in time window)
 */
export async function getRateLimitStatus(
    ctx: QueryCtx,
    userId: Id<"users">,
    channelId: Id<"chatChannels">
): Promise<{
    used: number;
    limit: number;
    remaining: number;
    resetAt: number;
}> {
    const now = Date.now();
    const windowStart = now - RATE_LIMITS.messagesToChannel.windowMs;

    const recentMessages = await ctx.db
        .query("chatMessages")
        .withIndex("by_authorId", (q) => q.eq("authorId", userId))
        .collect()
        .then((msgs) =>
            msgs.filter((m) => {
                const createdAt = m._creationTime;
                return createdAt > windowStart && m.channelId === channelId;
            })
        );

    const used = recentMessages.length;
    const limit = RATE_LIMITS.messagesToChannel.count;

    return {
        used,
        limit,
        remaining: Math.max(0, limit - used),
        resetAt: windowStart + RATE_LIMITS.messagesToChannel.windowMs,
    };
}

/**
 * Check if user can react (rate limited)
 */
export async function checkReactionRateLimit(
    ctx: QueryCtx,
    userId: Id<"users">
): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - RATE_LIMITS.reactions.windowMs;

    const recentReactions = await ctx.db
        .query("chatReactions")
        .withIndex("by_userId_messageId", (q) => q.eq("userId", userId))
        .collect()
        .then((reactions) =>
            reactions.filter((r) => {
                const createdAt = r._creationTime;
                return createdAt > windowStart;
            })
        );

    return recentReactions.length < RATE_LIMITS.reactions.count;
}

/**
 * Log rate limit event (for analytics/moderation)
 */
export async function logRateLimitEvent(
    ctx: MutationCtx,
    userId: Id<"users">,
    channelId: Id<"chatChannels">,
    type: "message_limit" | "reaction_limit" | "dm_limit"
) {
    return ctx.db.insert("chatRateLimits", {
        userId,
        channelId,
        messageType: type,
        limit: 0,
        windowMs: 0,
        createdAt: Date.now(),
    });
}

/**
 * Bypass rate limit for staff members (role-based exception)
 */
export function shouldBypassRateLimit(userRole: string): boolean {
    // T3+ staff can bypass rate limits
    const roles = ["T3", "T4", "T5", "Super Admin"];
    return roles.includes(userRole);
}

/**
 * Get rate limit violations for a user (recent events)
 */
export async function getUserRateLimitViolations(
    ctx: QueryCtx,
    userId: Id<"users">,
    lastHours: number = 24
) {
    const since = new Date(Date.now() - lastHours * 60 * 60 * 1000);

    return ctx.db
        .query("chatRateLimits")
        .withIndex("by_userId_messageType", (q) => q.eq("userId", userId))
        .collect()
        .then((events) =>
            events.filter((e) => e.createdAt > since.getTime())
        );
}

/**
 * Check if user should be temporarily throttled (multiple violations)
 */
export async function isUserThrottled(
    ctx: QueryCtx,
    userId: Id<"users">
): Promise<boolean> {
    const violations = await getUserRateLimitViolations(ctx, userId, 1);
    // If 5+ violations in last hour, user is throttled
    return violations.length >= 5;
}

/**
 * Get cooldown time in seconds for a throttled user
 */
export function getThrottleCooldown(violationCount: number): number {
    if (violationCount < 5) return 0;
    if (violationCount < 10) return 30; // 30 seconds
    if (violationCount < 20) return 300; // 5 minutes
    return 1800; // 30 minutes
}
