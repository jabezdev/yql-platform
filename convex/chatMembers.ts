import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireUser, requireMinRole } from "./accessControl";
import { assertCanReadChannel } from "./chat/lib/access";

// ── Queries ──────────────────────────────────────────────────────────────────

export const listMembers = query({
    args: { channelId: v.id("chatChannels") },
    handler: async (ctx, { channelId }) => {
        const user = await requireUser(ctx);
        await assertCanReadChannel(ctx, user, channelId);
        const members = await ctx.db
            .query("chatChannelMembers")
            .withIndex("by_channelId", (q) => q.eq("channelId", channelId))
            .collect();

        const uniqueUserIds = [...new Set(members.map((m) => m.userId))];
        const users = await Promise.all(uniqueUserIds.map((id) => ctx.db.get(id)));
        const usersById = new Map(uniqueUserIds.map((id, index) => [id, users[index]]));

        return Promise.all(
            members.map(async (m) => {
                const user = usersById.get(m.userId) ?? null;
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
        await assertCanReadChannel(ctx, user, channelId);

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
        await assertCanReadChannel(ctx, user, channelId);

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

// ═════════════════════════════════════════════════════════════════════════
// PHASE 1: Read State Tracking & Presence
// ═════════════════════════════════════════════════════════════════════════

/**
 * Get members of a channel with their read/seen state.
 * Shows lastSeenAt for presence indicators.
 */
export const listMembersWithPresence = query({
    args: { channelId: v.id("chatChannels") },
    handler: async (ctx, { channelId }) => {
        const user = await requireUser(ctx);
        await assertCanReadChannel(ctx, user, channelId);
        const members = await ctx.db
            .query("chatChannelMembers")
            .withIndex("by_channelId", (q) => q.eq("channelId", channelId))
            .collect();

        const uniqueUserIds = [...new Set(members.map((m) => m.userId))];
        const users = await Promise.all(uniqueUserIds.map((id) => ctx.db.get(id)));
        const usersById = new Map(uniqueUserIds.map((id, index) => [id, users[index]]));

        return Promise.all(
            members.map(async (m) => {
                const user = usersById.get(m.userId) ?? null;
                return {
                    ...m,
                    user: user
                        ? {
                            _id: user._id,
                            name: user.name,
                            role: user.role,
                            profileChip: user.profileChip,
                        }
                        : null,
                    // Include read/seen state for UI
                    lastReadAt: m.lastReadTimestamp,
                    lastSeenAt: m.lastSeenAt,
                    isReading: m.lastSeenAt ? Date.now() - m.lastSeenAt < 30000 : false, // "reading" if seen in last 30s
                };
            })
        );
    },
});

/**
 * Get unread counts for all channels, including presence data.
 * Respects notification preferences (mentions only, all, none).
 */
export const getUnreadCountsWithPresence = query({
    args: {},
    handler: async (ctx) => {
        const user = await requireUser(ctx);

        const memberships = await ctx.db
            .query("chatChannelMembers")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .collect();

        const counts: Record<
            string,
            {
                unreadCount: number;
                lastReadAt?: number;
                lastSeenAt?: number;
                notificationLevel?: string;
            }
        > = {};

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

                counts[m.channelId] = {
                    unreadCount: unreadMessages.length,
                    lastReadAt: m.lastReadTimestamp,
                    lastSeenAt: m.lastSeenAt,
                    notificationLevel: m.notificationLevel,
                };
            })
        );

        return counts;
    },
});

// ═════════════════════════════════════════════════════════════════════════
// PHASE 2: Moderation Helpers (Hide/Mute/SoftBan)
// ═════════════════════════════════════════════════════════════════════════

/**
 * Hide user from channel (invisible to others, cannot see/post).
 * Optionally set temporary softban via duration parameter.
 */
export const hideUserFromChannel = mutation({
    args: {
        channelId: v.id("chatChannels"),
        userId: v.id("users"),
        duration: v.optional(v.number()), // milliseconds; if set, softban until timestamp
        reason: v.optional(v.string()),
    },
    handler: async (ctx, { channelId, userId, duration, reason }) => {
        const moderator = await requireMinRole(ctx, "T3");

        // Get user's membership
        const membership = await ctx.db
            .query("chatChannelMembers")
            .withIndex("by_channel_user", (q) =>
                q.eq("channelId", channelId).eq("userId", userId)
            )
            .first();

        if (!membership) {
            throw new Error("User is not a member of this channel");
        }

        const softBanUntil = duration ? Date.now() + duration : undefined;

        // Update membership
        await ctx.db.patch(membership._id, {
            isHidden: true,
            softBanUntil,
        });

        // Audit log
        await ctx.db.insert("chatAuditLog", {
            type: "user_hidden",
            actor: moderator._id,
            targetUserId: userId,
            channelId,
            reason,
            metadata: { duration, softBanUntil },
            createdAt: Date.now(),
        });
    },
});

/**
 * Unhide/unmute user in channel.
 */
export const unhideUserFromChannel = mutation({
    args: {
        channelId: v.id("chatChannels"),
        userId: v.id("users"),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, { channelId, userId, reason }) => {
        const moderator = await requireMinRole(ctx, "T3");

        const membership = await ctx.db
            .query("chatChannelMembers")
            .withIndex("by_channel_user", (q) =>
                q.eq("channelId", channelId).eq("userId", userId)
            )
            .first();

        if (!membership) {
            throw new Error("User is not a member of this channel");
        }

        // Update membership
        await ctx.db.patch(membership._id, {
            isHidden: false,
            softBanUntil: undefined,
            isMuted: false,
        });

        // Audit log
        await ctx.db.insert("chatAuditLog", {
            type: "user_unhidden",
            actor: moderator._id,
            targetUserId: userId,
            channelId,
            reason,
            createdAt: Date.now(),
        });
    },
});

/**
 * Bulk moderate messages (delete or hide).
 */
export const bulkModerateMessages = mutation({
    args: {
        messageIds: v.array(v.id("chatMessages")),
        action: v.union(v.literal("delete"), v.literal("hide")),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, { messageIds, action, reason }) => {
        const moderator = await requireMinRole(ctx, "T3");

        for (const messageId of messageIds) {
            const message = await ctx.db.get(messageId);
            if (!message) continue;

            if (action === "delete") {
                await ctx.db.patch(messageId, {
                    isDeleted: true,
                    deletedAt: Date.now(),
                    deletedBy: moderator._id,
                });
            } else if (action === "hide") {
                // Mark as system message indicating hidden for policy violation
                await ctx.db.patch(messageId, {
                    body: "[Hidden by moderator]",
                    bodyPlainText: "[Hidden by moderator]",
                    isSystem: true,
                    systemType: "message_hidden",
                });
            }

            // Audit log each action
            await ctx.db.insert("chatAuditLog", {
                type: `message_${action}`,
                actor: moderator._id,
                targetMessageId: messageId,
                channelId: message.channelId,
                reason,
                createdAt: Date.now(),
            });
        }
    },
});

/**
 * List moderation audit events for a channel.
 */
export const listModerationEvents = query({
    args: {
        channelId: v.optional(v.id("chatChannels")),
        type: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, { channelId, type, limit = 50 }) => {
        await requireMinRole(ctx, "T3");

        let query = ctx.db.query("chatAuditLog");

        if (channelId) {
            query = query.withIndex("by_channelId", (q) => q.eq("channelId", channelId));
        }

        const events = await query.collect();

        // Filter by type if specified
        let filtered = events;
        if (type) {
            filtered = events.filter((e) => e.type === type);
        }

        // Sort by date descending, limit
        return filtered.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
    },
});

/**
 * Get unresolved abuse reports for a channel or globally.
 */
export const listAbuseReports = query({
    args: {
        channelId: v.optional(v.id("chatChannels")),
        status: v.optional(v.union(v.literal("open"), v.literal("reviewed"), v.literal("resolved"))),
    },
    handler: async (ctx, { channelId, status = "open" }) => {
        await requireMinRole(ctx, "T3");

        let reports = await ctx.db
            .query("chatAbuseReports")
            .withIndex("by_status", (q) => q.eq("status", status))
            .collect();

        if (channelId) {
            const reportWithMessage = await Promise.all(
                reports.map(async (report) => ({
                    report,
                    message: await ctx.db.get(report.messageId),
                }))
            );
            reports = reportWithMessage
                .filter(({ message }) => message?.channelId === channelId)
                .map(({ report }) => report);
        }

        // Enrich with message and reporter info
        return Promise.all(
            reports.map(async (report) => {
                const message = await ctx.db.get(report.messageId);
                const reporter = await ctx.db.get(report.reportedBy);
                const reviewer = report.reviewedBy ? await ctx.db.get(report.reviewedBy) : null;

                return {
                    ...report,
                    message: message ? { _id: message._id, body: message.bodyPlainText } : null,
                    reporter: reporter ? { _id: reporter._id, name: reporter.name } : null,
                    reviewer: reviewer ? { _id: reviewer._id, name: reviewer.name } : null,
                };
            })
        );
    },
});

/**
 * Review an abuse report (mark as reviewed/resolved).
 */
export const reviewAbuseReport = mutation({
    args: {
        reportId: v.id("chatAbuseReports"),
        status: v.union(v.literal("reviewed"), v.literal("resolved")),
        notes: v.optional(v.string()),
        action: v.optional(v.union(v.literal("delete"), v.literal("hide"), v.literal("mute"), v.literal("none"))),
    },
    handler: async (ctx, { reportId, status, notes, action }) => {
        const moderator = await requireMinRole(ctx, "T3");
        const report = await ctx.db.get(reportId);

        if (!report) throw new Error("Report not found");

        // Update report status
        await ctx.db.patch(reportId, {
            status,
            reviewedBy: moderator._id,
            reviewedAt: Date.now(),
            notes,
        });

        // If action specified, execute it
        if (action && action !== "none") {
            const message = await ctx.db.get(report.messageId);
            if (message) {
                if (action === "delete") {
                    await ctx.db.patch(report.messageId, {
                        isDeleted: true,
                        deletedAt: Date.now(),
                        deletedBy: moderator._id,
                    });
                } else if (action === "hide") {
                    await ctx.db.patch(report.messageId, {
                        body: "[Hidden by moderator]",
                        bodyPlainText: "[Hidden by moderator]",
                        isSystem: true,
                        systemType: "message_hidden",
                    });
                } else if (action === "mute") {
                    // Mute the message author in the channel
                    const membership = await ctx.db
                        .query("chatChannelMembers")
                        .withIndex("by_channel_user", (q) =>
                            q.eq("channelId", message.channelId).eq("userId", message.authorId)
                        )
                        .first();

                    if (membership) {
                        await ctx.db.patch(membership._id, { isMuted: true });
                    }
                }

                // Audit log the action
                await ctx.db.insert("chatAuditLog", {
                    type: `message_${action}_from_report`,
                    actor: moderator._id,
                    targetMessageId: report.messageId,
                    targetUserId: message.authorId,
                    channelId: message.channelId,
                    reason: `Abuse report #${reportId} - ${report.reason}`,
                    createdAt: Date.now(),
                });
            }
        }
    },
});


