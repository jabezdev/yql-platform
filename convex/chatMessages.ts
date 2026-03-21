import { v, ConvexError } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireUser, requireMinRole } from "./accessControl";
import type { Role } from "./roleHierarchy";
import { hasMinRole } from "./roleHierarchy";
import { paginationOptsValidator } from "convex/server";

// ── Permission helper ────────────────────────────────────────────────────────

async function checkCanSend(
    ctx: any,
    channelId: any,
    user: any
) {
    const channel = await ctx.db.get(channelId);
    if (!channel) throw new ConvexError({ code: "NOT_FOUND", message: "Channel not found" });
    if (channel.isArchived) throw new ConvexError({ code: "FORBIDDEN", message: "Channel is archived" });

    // Check for explicit read_only restrictions
    const permissions = await ctx.db
        .query("chatChannelPermissions")
        .withIndex("by_channelId", (q: any) => q.eq("channelId", channelId))
        .collect();

    for (const perm of permissions) {
        if (perm.permission === "read_only") {
            if (perm.targetUserId && perm.targetUserId === user._id) return false;
            if (perm.targetRole && perm.targetRole === user.role) return false;
            if (perm.targetSpecialRole && user.specialRoles?.includes(perm.targetSpecialRole)) return false;
        }
    }

    // Check for explicit send grants
    const sendGrants = permissions.filter((p: any) => p.permission === "send");
    if (sendGrants.length > 0) {
        // If explicit send grants exist, user must match one
        for (const perm of sendGrants) {
            if (perm.targetUserId && perm.targetUserId === user._id) return true;
            if (perm.targetRole && perm.targetRole === user.role) return true;
            if (perm.targetSpecialRole && user.specialRoles?.includes(perm.targetSpecialRole)) return true;
        }
        return false;
    }

    // Default: T5+ can send
    return hasMinRole(user.role as Role, "T5");
}

// ── Queries ──────────────────────────────────────────────────────────────────

export const listMessages = query({
    args: {
        channelId: v.id("chatChannels"),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, { channelId, paginationOpts }) => {
        await requireUser(ctx);

        const results = await ctx.db
            .query("chatMessages")
            .withIndex("by_channelId", (q) => q.eq("channelId", channelId))
            .order("desc")
            .paginate(paginationOpts);

        // Enrich with author info and reactions
        const enriched = await Promise.all(
            results.page.map(async (msg) => {
                const author = await ctx.db.get(msg.authorId);
                const reactions = await ctx.db
                    .query("chatReactions")
                    .withIndex("by_messageId", (q) => q.eq("messageId", msg._id))
                    .collect();

                // Group reactions by emoji
                const reactionGroups: Record<string, { emoji: string; userIds: string[]; count: number }> = {};
                for (const r of reactions) {
                    if (!reactionGroups[r.emoji]) {
                        reactionGroups[r.emoji] = { emoji: r.emoji, userIds: [], count: 0 };
                    }
                    reactionGroups[r.emoji].userIds.push(r.userId);
                    reactionGroups[r.emoji].count++;
                }

                // Check for poll
                const poll = await ctx.db
                    .query("chatPolls")
                    .withIndex("by_messageId", (q) => q.eq("messageId", msg._id))
                    .first();

                const attachmentsWithUrls = msg.attachments
                    ? await Promise.all(
                        msg.attachments.map(async (att) => ({
                            ...att,
                            url: await ctx.storage.getUrl(att.storageId),
                        }))
                    )
                    : undefined;

                return {
                    ...msg,
                    attachments: attachmentsWithUrls,
                    author: author ? { _id: author._id, name: author.name, role: author.role, profileChip: author.profileChip } : null,
                    reactions: Object.values(reactionGroups),
                    poll: poll || null,
                };
            })
        );

        return { ...results, page: enriched };
    },
});

export const listPinnedMessages = query({
    args: { channelId: v.id("chatChannels") },
    handler: async (ctx, { channelId }) => {
        await requireUser(ctx);
        const messages = await ctx.db
            .query("chatMessages")
            .withIndex("by_channelId_isPinned", (q) =>
                q.eq("channelId", channelId).eq("isPinned", true)
            )
            .collect();

        return Promise.all(
            messages.map(async (msg) => {
                const author = await ctx.db.get(msg.authorId);
                return {
                    ...msg,
                    author: author ? { _id: author._id, name: author.name } : null,
                };
            })
        );
    },
});

export const searchMessages = query({
    args: {
        channelId: v.optional(v.id("chatChannels")),
        searchText: v.string(),
    },
    handler: async (ctx, { channelId, searchText }) => {
        await requireUser(ctx);
        if (!searchText.trim()) return [];

        // Get all messages and filter (Convex doesn't have full-text search on all plans)
        // For production, consider adding a search index
        let messages;
        if (channelId) {
            messages = await ctx.db
                .query("chatMessages")
                .withIndex("by_channelId", (q) => q.eq("channelId", channelId))
                .collect();
        } else {
            messages = await ctx.db.query("chatMessages").collect();
        }

        const lowerSearch = searchText.toLowerCase();
        const filtered = messages
            .filter((m) => !m.isDeleted && m.bodyPlainText.toLowerCase().includes(lowerSearch))
            .slice(0, 50);

        return Promise.all(
            filtered.map(async (msg) => {
                const author = await ctx.db.get(msg.authorId);
                const channel = await ctx.db.get(msg.channelId);
                return {
                    ...msg,
                    author: author ? { _id: author._id, name: author.name } : null,
                    channelName: channel?.name || "Unknown",
                };
            })
        );
    },
});

export const listMyNotifications = query({
    args: {},
    handler: async (ctx) => {
        const user = await requireUser(ctx);
        const notifications = await ctx.db
            .query("chatNotifications")
            .withIndex("by_userId_isRead", (q) =>
                q.eq("userId", user._id).eq("isRead", false)
            )
            .order("desc")
            .collect();

        return Promise.all(
            notifications.map(async (n) => {
                const message = await ctx.db.get(n.messageId);
                const channel = await ctx.db.get(n.channelId);
                const sender = await ctx.db.get(n.mentionedBy);
                return {
                    ...n,
                    message: message
                        ? { bodyPlainText: message.bodyPlainText, _creationTime: message._creationTime }
                        : null,
                    channelName: channel?.name ?? "Unknown",
                    senderName: sender?.name ?? "Someone",
                };
            })
        );
    },
});

export const markNotificationsRead = mutation({
    args: { channelId: v.optional(v.id("chatChannels")) },
    handler: async (ctx, { channelId }) => {
        const user = await requireUser(ctx);
        const notifications = await ctx.db
            .query("chatNotifications")
            .withIndex("by_userId_isRead", (q) =>
                q.eq("userId", user._id).eq("isRead", false)
            )
            .collect();

        const toMark = channelId
            ? notifications.filter((n) => n.channelId === channelId)
            : notifications;

        await Promise.all(toMark.map((n) => ctx.db.patch(n._id, { isRead: true })));
    },
});

export const canSendInChannel = query({
    args: { channelId: v.id("chatChannels") },
    handler: async (ctx, { channelId }) => {
        const user = await requireUser(ctx);
        return checkCanSend(ctx, channelId, user);
    },
});

// ── Mutations ────────────────────────────────────────────────────────────────

export const sendMessage = mutation({
    args: {
        channelId: v.id("chatChannels"),
        body: v.string(),
        bodyPlainText: v.string(),
        threadRootMessageId: v.optional(v.id("chatMessages")),
        attachments: v.optional(v.array(v.object({
            storageId: v.id("_storage"),
            filename: v.string(),
            mimeType: v.string(),
            size: v.number(),
        }))),
        mentions: v.optional(v.object({
            userIds: v.optional(v.array(v.id("users"))),
            roles: v.optional(v.array(v.string())),
            specialRoles: v.optional(v.array(v.string())),
            everyone: v.optional(v.boolean()),
        })),
    },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);
        const canSend = await checkCanSend(ctx, args.channelId, user);
        if (!canSend) {
            throw new ConvexError({ code: "FORBIDDEN", message: "You cannot send messages in this channel" });
        }

        const messageId = await ctx.db.insert("chatMessages", {
            channelId: args.channelId,
            authorId: user._id,
            body: args.body,
            bodyPlainText: args.bodyPlainText,
            threadRootMessageId: args.threadRootMessageId,
            attachments: args.attachments,
            mentions: args.mentions,
            isEdited: false,
            isDeleted: false,
            isPinned: false,
        });

        // Update thread counters if this is a thread reply
        if (args.threadRootMessageId) {
            const root = await ctx.db.get(args.threadRootMessageId);
            if (root) {
                await ctx.db.patch(args.threadRootMessageId, {
                    threadReplyCount: (root.threadReplyCount || 0) + 1,
                    threadLastReplyAt: Date.now(),
                });
            }
        }

        // Create mention notifications
        if (args.mentions) {
            const notifyUserIds = new Set<string>();

            // Direct user mentions
            for (const uid of args.mentions.userIds ?? []) {
                if (uid !== user._id) notifyUserIds.add(uid);
            }

            // Role mentions — find all users with that role
            if (args.mentions.roles && args.mentions.roles.length > 0) {
                for (const role of args.mentions.roles) {
                    const roleUsers = await ctx.db
                        .query("users")
                        .withIndex("by_role", (q) => q.eq("role", role as any))
                        .collect();
                    for (const u of roleUsers) {
                        if (u._id !== user._id) notifyUserIds.add(u._id);
                    }
                }
            }

            // @everyone — notify all channel members
            if (args.mentions.everyone) {
                const channelMembers = await ctx.db
                    .query("chatChannelMembers")
                    .withIndex("by_channelId", (q) => q.eq("channelId", args.channelId))
                    .collect();
                for (const m of channelMembers) {
                    if (m.userId !== user._id) notifyUserIds.add(m.userId);
                }
            }

            await Promise.all(
                [...notifyUserIds].map((uid) =>
                    ctx.db.insert("chatNotifications", {
                        userId: uid as any,
                        messageId,
                        channelId: args.channelId,
                        mentionedBy: user._id,
                        isRead: false,
                    })
                )
            );
        }

        // Auto-join user to channel if not a member
        const membership = await ctx.db
            .query("chatChannelMembers")
            .withIndex("by_channel_user", (q) =>
                q.eq("channelId", args.channelId).eq("userId", user._id)
            )
            .first();

        if (!membership) {
            await ctx.db.insert("chatChannelMembers", {
                channelId: args.channelId,
                userId: user._id,
                joinedAt: Date.now(),
                role: "member",
                isMuted: false,
            });
        }

        return messageId;
    },
});

export const editMessage = mutation({
    args: {
        messageId: v.id("chatMessages"),
        body: v.string(),
        bodyPlainText: v.string(),
    },
    handler: async (ctx, { messageId, body, bodyPlainText }) => {
        const user = await requireUser(ctx);
        const message = await ctx.db.get(messageId);
        if (!message) throw new ConvexError({ code: "NOT_FOUND", message: "Message not found" });
        if (message.authorId !== user._id) {
            throw new ConvexError({ code: "FORBIDDEN", message: "You can only edit your own messages" });
        }
        if (message.isDeleted) throw new ConvexError({ code: "FORBIDDEN", message: "Cannot edit deleted message" });

        const previousEntry = {
            body: message.body,
            bodyPlainText: message.bodyPlainText,
            editedAt: message.editedAt ?? message._creationTime,
        };
        const editHistory = [...(message.editHistory ?? []), previousEntry];

        await ctx.db.patch(messageId, {
            body,
            bodyPlainText,
            isEdited: true,
            editedAt: Date.now(),
            editHistory,
        });
    },
});

export const deleteMessage = mutation({
    args: { messageId: v.id("chatMessages") },
    handler: async (ctx, { messageId }) => {
        const user = await requireUser(ctx);
        const message = await ctx.db.get(messageId);
        if (!message) throw new ConvexError({ code: "NOT_FOUND", message: "Message not found" });

        // Author can delete own messages, T3+ can delete any
        const isAuthor = message.authorId === user._id;
        const isManager = hasMinRole(user.role as Role, "T3");

        if (!isAuthor && !isManager) {
            throw new ConvexError({ code: "FORBIDDEN", message: "Cannot delete this message" });
        }

        await ctx.db.patch(messageId, {
            isDeleted: true,
            deletedAt: Date.now(),
            deletedBy: user._id,
        });

        // Clean up attachments from storage
        if (message.attachments && message.attachments.length > 0) {
            await Promise.all(
                message.attachments.map((att) => ctx.storage.delete(att.storageId))
            );
        }
    },
});

export const pinMessage = mutation({
    args: { messageId: v.id("chatMessages") },
    handler: async (ctx, { messageId }) => {
        const user = await requireMinRole(ctx, "T5");
        const message = await ctx.db.get(messageId);
        if (!message) throw new ConvexError({ code: "NOT_FOUND", message: "Message not found" });

        await ctx.db.patch(messageId, {
            isPinned: !message.isPinned,
            pinnedAt: message.isPinned ? undefined : Date.now(),
            pinnedBy: message.isPinned ? undefined : user._id,
        });

        // System message
        await ctx.db.insert("chatMessages", {
            channelId: message.channelId,
            authorId: user._id,
            body: "",
            bodyPlainText: `${user.name} ${message.isPinned ? "unpinned" : "pinned"} a message`,
            isEdited: false,
            isDeleted: false,
            isPinned: false,
            isSystem: true,
            systemType: message.isPinned ? "message_unpinned" : "message_pinned",
        });
    },
});

export const moveMessage = mutation({
    args: {
        messageId: v.id("chatMessages"),
        toChannelId: v.id("chatChannels"),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, { messageId, toChannelId, reason }) => {
        const user = await requireMinRole(ctx, "T3");
        const message = await ctx.db.get(messageId);
        if (!message) throw new ConvexError({ code: "NOT_FOUND", message: "Message not found" });

        const toChannel = await ctx.db.get(toChannelId);
        if (!toChannel) throw new ConvexError({ code: "NOT_FOUND", message: "Destination channel not found" });

        const fromChannelId = message.channelId;
        const fromChannel = await ctx.db.get(fromChannelId);

        // Move the message
        await ctx.db.patch(messageId, { channelId: toChannelId });

        // Audit trail
        await ctx.db.insert("chatMessageMoves", {
            messageId,
            fromChannelId,
            toChannelId,
            movedBy: user._id,
            movedAt: Date.now(),
            reason,
        });

        // System message in source
        await ctx.db.insert("chatMessages", {
            channelId: fromChannelId,
            authorId: user._id,
            body: "",
            bodyPlainText: `${user.name} moved a message to #${toChannel.name}`,
            isEdited: false,
            isDeleted: false,
            isPinned: false,
            isSystem: true,
            systemType: "message_moved_out",
        });

        // System message in destination
        await ctx.db.insert("chatMessages", {
            channelId: toChannelId,
            authorId: user._id,
            body: "",
            bodyPlainText: `${user.name} moved a message from #${fromChannel?.name || "unknown"}`,
            isEdited: false,
            isDeleted: false,
            isPinned: false,
            isSystem: true,
            systemType: "message_moved_in",
        });
    },
});

export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        await requireUser(ctx);
        return ctx.storage.generateUploadUrl();
    },
});
