import { v, ConvexError } from "convex/values";
import { query, mutation, action } from "../_generated/server";
import { requireUser } from "../accessControl";
import { paginationOptsValidator } from "convex/server";

// ── Queries ──────────────────────────────────────────────────────────────────

/**
 * Get paginated unread notifications for current user.
 * Includes mentions + watched threads context.
 */
export const listUnread = query({
    args: {
        paginationOpts: paginationOptsValidator,
        channelId: v.optional(v.id("chatChannels")),
        includeContext: v.optional(v.boolean()),
    },
    handler: async (ctx, { paginationOpts, channelId, includeContext }) => {
        const user = await requireUser(ctx);

        let query_builder = ctx.db
            .query("chatNotifications")
            .withIndex("by_userId_isRead", (q) =>
                q.eq("userId", user._id).eq("isRead", false)
            );

        if (channelId) {
            query_builder = query_builder.filter((q) => q.eq(q.field("channelId"), channelId));
        }

        const results = await query_builder.order("desc").paginate(paginationOpts);

        // Optionally include message and channel context
        const enriched = await Promise.all(
            results.page.map(async (notif) => {
                let context: any = {};

                if (includeContext) {
                    const message = await ctx.db.get(notif.messageId);
                    const channel = await ctx.db.get(notif.channelId);
                    const sender = await ctx.db.get(notif.mentionedBy);

                    context = {
                        message: message
                            ? {
                                _id: message._id,
                                bodyPlainText: message.bodyPlainText,
                                _creationTime: message._creationTime,
                            }
                            : null,
                        channel: channel ? { _id: channel._id, name: channel.name } : null,
                        sender: sender ? { _id: sender._id, name: sender.name } : null,
                    };
                }

                return { ...notif, ...context };
            })
        );

        return { ...results, page: enriched };
    },
});

/**
 * Get all unread notification count for user.
 */
export const getUnreadCount = query({
    args: {},
    handler: async (ctx) => {
        const user = await requireUser(ctx);
        const unread = await ctx.db
            .query("chatNotifications")
            .withIndex("by_userId_isRead", (q) =>
                q.eq("userId", user._id).eq("isRead", false)
            )
            .collect();

        return unread.length;
    },
});

/**
 * Get notification preferences for current user.
 */
export const getMyPreferences = query({
    args: {},
    handler: async (ctx) => {
        const user = await requireUser(ctx);
        return ctx.db
            .query("chatNotificationPreferences")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .first();
    },
});

// ── Mutations ────────────────────────────────────────────────────────────────

/**
 * Mark a single notification as read.
 */
export const markAsRead = mutation({
    args: { notificationId: v.id("chatNotifications") },
    handler: async (ctx, { notificationId }) => {
        const user = await requireUser(ctx);
        const notif = await ctx.db.get(notificationId);

        if (!notif) throw new ConvexError({ code: "NOT_FOUND", message: "Notification not found" });
        if (notif.userId !== user._id) {
            throw new ConvexError({ code: "FORBIDDEN", message: "Cannot mark others' notifications" });
        }

        await ctx.db.patch(notificationId, { isRead: true });
    },
});

/**
 * Mark all unread notifications as read, optionally filtered by channel.
 */
export const markAllAsRead = mutation({
    args: { channelId: v.optional(v.id("chatChannels")) },
    handler: async (ctx, { channelId }) => {
        const user = await requireUser(ctx);

        const unread = await ctx.db
            .query("chatNotifications")
            .withIndex("by_userId_isRead", (q) =>
                q.eq("userId", user._id).eq("isRead", false)
            )
            .collect();

        const toMark = channelId
            ? unread.filter((n) => n.channelId === channelId)
            : unread;

        await Promise.all(toMark.map((n) => ctx.db.patch(n._id, { isRead: true })));
    },
});

/**
 * Update notification preferences for current user.
 */
export const updatePreferences = mutation({
    args: {
        emailDigestFrequency: v.optional(v.union(
            v.literal("never"),
            v.literal("daily"),
            v.literal("weekly")
        )),
        pushNotificationsEnabled: v.optional(v.boolean()),
    },
    handler: async (ctx, { emailDigestFrequency, pushNotificationsEnabled }) => {
        const user = await requireUser(ctx);

        // Get or create preferences
        const existing = await ctx.db
            .query("chatNotificationPreferences")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .first();

        const updates: any = { updatedAt: Date.now() };
        if (emailDigestFrequency !== undefined) updates.emailDigestFrequency = emailDigestFrequency;
        if (pushNotificationsEnabled !== undefined) updates.pushNotificationsEnabled = pushNotificationsEnabled;

        if (existing) {
            await ctx.db.patch(existing._id, updates);
        } else {
            const prefs = {
                userId: user._id,
                emailDigestFrequency: emailDigestFrequency ?? "never",
                pushNotificationsEnabled: pushNotificationsEnabled ?? false,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };
            await ctx.db.insert("chatNotificationPreferences", prefs as any);
        }
    },
});

// ── Internal Helpers ────────────────────────────────────────────────────────

/**
 * Internal: Compute mention recipients honoring notification preferences.
 * Called after message send to determine who gets notified.
 */
export async function computeMentionRecipients(
    ctx: any,
    channelId: any,
    mentions: any,
    authorId: any,
    isSilent: boolean
): Promise<string[]> {
    if (isSilent) return []; // Silent messages don't generate notifications

    const notifyUserIds = new Set<string>();

    // Direct user mentions
    if (mentions?.userIds) {
        for (const uid of mentions.userIds) {
            if (uid !== authorId) notifyUserIds.add(uid);
        }
    }

    // Role mentions — find all users with that role
    if (mentions?.roles && mentions.roles.length > 0) {
        for (const role of mentions.roles) {
            const roleUsers = await ctx.db
                .query("users")
                .withIndex("by_role", (q: any) => q.eq("role", role as any))
                .collect();
            for (const u of roleUsers) {
                if (u._id !== authorId) notifyUserIds.add(u._id);
            }
        }
    }

    // Special role mentions
    if (mentions?.specialRoles && mentions.specialRoles.length > 0) {
        const allUsers = await ctx.db.query("users").collect();
        for (const role of mentions.specialRoles) {
            for (const u of allUsers) {
                if (u.specialRoles?.includes(role) && u._id !== authorId) {
                    notifyUserIds.add(u._id);
                }
            }
        }
    }

    // @everyone — notify all channel members
    if (mentions?.everyone) {
        const channelMembers = await ctx.db
            .query("chatChannelMembers")
            .withIndex("by_channelId", (q: any) => q.eq("channelId", channelId))
            .collect();
        for (const m of channelMembers) {
            if (m.userId !== authorId) notifyUserIds.add(m.userId);
        }
    }

    // Filter by notification preferences
    const recipients: string[] = [];
    for (const uid of notifyUserIds) {
        const prefs = await ctx.db
            .query("chatNotificationPreferences")
            .withIndex("by_userId", (q: any) => q.eq("userId", uid as any))
            .first();

        // Default to notifying if no preference set
        const shouldNotify = !prefs || prefs.pushNotificationsEnabled !== false;
        if (shouldNotify) {
            recipients.push(uid);
        }
    }

    return recipients;
}

/**
 * Internal: Queue notification for recipients after message send.
 */
export async function queueNotifications(
    ctx: any,
    recipients: string[],
    messageId: any,
    channelId: any,
    authorId: any
) {
    await Promise.all(
        recipients.map((uid) =>
            ctx.db.insert("chatNotifications", {
                userId: uid as any,
                messageId,
                channelId,
                mentionedBy: authorId,
                isRead: false,
            })
        )
    );
}

// ── External Actions (Stubs) ─────────────────────────────────────────────────

/**
 * Send email digest (unimplemented stub).
 * In production, call external email service.
 */
export const sendEmailDigest = action({
    args: { userId: v.id("users"), digestType: v.union(v.literal("daily"), v.literal("weekly")) },
    handler: async (ctx, { userId, digestType }) => {
        // TODO: Implement actual email sending
        // - Get user's email from DB
        // - Fetch unread notifications
        // - Format digest template
        // - Send via Resend/SendGrid/etc.
        console.log(`[EMAIL] Would send ${digestType} digest to user ${userId}`);
        return { sent: true, type: digestType };
    },
});

/**
 * Send push notification (unimplemented stub).
 * In production, call Firebase Cloud Messaging / OneSignal / etc.
 */
export const sendPushNotification = action({
    args: {
        userId: v.id("users"),
        title: v.string(),
        body: v.string(),
        data: v.optional(v.any()),
    },
    handler: async (ctx, { userId, title, body, data: _data }) => {
        // TODO: Implement actual push notification
        // - Get user's device tokens
        // - Send via FCM / OneSignal / etc.
        console.log(`[PUSH] Would send notification to user ${userId}: "${title}" - "${body}"`);
        return { sent: true, userId };
    },
});
