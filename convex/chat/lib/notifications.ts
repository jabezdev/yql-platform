/**
 * Chat Notifications Helpers
 * Handles mention recipient calculation and preference-aware delivery
 */

import type { Id } from "../../_generated/dataModel";
import type { QueryCtx } from "../../_generated/server";

/**
 * Compute list of recipient user IDs for a direct mention (@username)
 */
export async function computeDirectMentionRecipients(
    ctx: QueryCtx,
    channelId: Id<"chatChannels">,
    usernames: string[]
): Promise<Id<"users">[]> {
    if (!usernames.length) return [];

    const users = await ctx.db.query("users").collect();
    return users
        .filter((u) => usernames.includes(u.name || u.email?.split("@")[0]))
        .map((u) => u._id);
}

/**
 * Compute list of recipient user IDs for group mentions
 * Handles @group, @everyone, @channel (7d active), @here (5m active)
 */
export async function computeGroupMentionRecipients(
    ctx: QueryCtx,
    channelId: Id<"chatChannels">,
    groupNames: string[],
    includeChannel: boolean = false,
    includeHere: boolean = false
): Promise<Id<"users">[]> {
    const recipients = new Set<Id<"users">>();
    const allUsers = groupNames.length > 0 ? await ctx.db.query("users").collect() : [];

    // @group: users with matching groupTags
    for (const group of groupNames) {
        const users = allUsers.filter(
            (u) =>
                u.groupTags &&
                u.groupTags.some((tag) =>
                    tag.toLowerCase().includes(group.toLowerCase())
                )
        );
        users.forEach((u) => recipients.add(u._id));
    }

    // @channel: all members (or active in 7 days)
    if (includeChannel) {
        const members = await ctx.db
            .query("chatChannelMembers")
            .withIndex("by_channelId", (q) => q.eq("channelId", channelId))
            .collect();

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        members.forEach((m) => {
            if (!m.isHidden) {
                const lastSeen = m.lastSeenAt
                    ? new Date(m.lastSeenAt)
                    : new Date(m.joinedAt);
                if (lastSeen > sevenDaysAgo) {
                    recipients.add(m.userId);
                }
            }
        });
    }

    // @here: all members active in last 5 minutes (presence indicator)
    if (includeHere) {
        const members = await ctx.db
            .query("chatChannelMembers")
            .withIndex("by_channelId", (q) => q.eq("channelId", channelId))
            .collect();

        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        members.forEach((m) => {
            if (!m.isHidden && m.lastSeenAt) {
                const lastSeen = new Date(m.lastSeenAt);
                if (lastSeen > fiveMinutesAgo) {
                    recipients.add(m.userId);
                }
            }
        });
    }

    return Array.from(recipients);
}

/**
 * Get notification preferences for a user
 */
export async function getUserNotificationPreferences(
    ctx: QueryCtx,
    userId: Id<"users">
) {
    const prefs = await ctx.db
        .query("chatNotificationPreferences")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first();

    const memberPref = await ctx.db
        .query("chatChannelMembers")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first();

    // Return defaults if preferences don't exist yet
    const notificationLevel: "all" | "mentions" | "none" =
        memberPref?.notificationLevel ?? "all";

    return {
        notificationLevel,
        emailDigestFrequency: prefs?.emailDigestFrequency ?? "daily",
        pushNotificationsEnabled: prefs?.pushNotificationsEnabled ?? true,
    };
}

/**
 * Check if user should receive notification based on preferences
 * notificationLevel: "all" | "mentions" | "none"
 */
export async function shouldNotifyUser(
    ctx: QueryCtx,
    userId: Id<"users">,
    notificationType: "direct_mention" | "group_mention" | "reply" | "general"
): Promise<boolean> {
    const prefs = await getUserNotificationPreferences(ctx, userId);

    if (prefs.notificationLevel === "none") return false;
    if (prefs.notificationLevel === "mentions") {
        return ["direct_mention", "group_mention"].includes(
            notificationType
        );
    }

    return true;
}

/**
 * Filter recipients based on notification preferences
 */
export async function filterByPreferences(
    ctx: QueryCtx,
    userIds: Id<"users">[],
    notificationType: "direct_mention" | "group_mention" | "reply" | "general"
): Promise<Id<"users">[]> {
    const filtered: Id<"users">[] = [];

    for (const userId of userIds) {
        if (await shouldNotifyUser(ctx, userId, notificationType)) {
            filtered.push(userId);
        }
    }

    return filtered;
}

/**
 * Parse mentions from message content
 * Returns: { directMentions: string[], groupMentions: string[], channel: boolean, here: boolean }
 */
export function parseMentions(content: string): {
    directMentions: string[];
    groupMentions: string[];
    channel: boolean;
    here: boolean;
} {
    const mentionRegex = /@(\w+)/g;
    const directMentions: string[] = [];
    const groupMentions: string[] = [];
    let channel = false;
    let here = false;

    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
        const mention = match[1];
        if (mention === "channel") {
            channel = true;
        } else if (mention === "here") {
            here = true;
        } else if (mention.toLowerCase() === "everyone" ||
            mention.toLowerCase() === "group") {
            groupMentions.push(mention);
        } else {
            directMentions.push(mention);
        }
    }

    return { directMentions, groupMentions, channel, here };
}

/**
 * Create notification record for a user
 */
export async function createNotification(
    ctx: any, // MutationCtx
    userId: Id<"users">,
    channelId: Id<"chatChannels">,
    messageId: Id<"chatMessages">,
    _notificationType: string,
    mentionedBy: Id<"users">
) {
    return ctx.db.insert("chatNotifications", {
        userId,
        channelId,
        messageId,
        mentionedBy,
        isRead: false,
    });
}

/**
 * Batch create notifications for multiple recipients
 */
export async function batchCreateNotifications(
    ctx: any, // MutationCtx
    userIds: Id<"users">[],
    channelId: Id<"chatChannels">,
    messageId: Id<"chatMessages">,
    notificationType: string,
    mentionedBy: Id<"users">
) {
    return Promise.all(
        userIds.map((userId) =>
            createNotification(ctx, userId, channelId, messageId, notificationType, mentionedBy)
        )
    );
}
