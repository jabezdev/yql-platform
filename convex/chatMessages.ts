import { v, ConvexError } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { requireUser, requireMinRole } from "./accessControl";
import type { Role } from "./roleHierarchy";
import { hasMinRole } from "./roleHierarchy";
import { paginationOptsValidator } from "convex/server";
import { assertCanReadChannel, assertCanReadMessage } from "./chat/lib/access";

// ── Permission helper ────────────────────────────────────────────────────────

async function checkCanSend(
    ctx: any,
    channelId: any,
    user: any
) {
    await assertCanReadChannel(ctx, user, channelId);
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
        const user = await requireUser(ctx);
        await assertCanReadChannel(ctx, user, channelId);

        const results = await ctx.db
            .query("chatMessages")
            .withIndex("by_channelId", (q) => q.eq("channelId", channelId))
            .order("desc")
            .paginate(paginationOpts);

        const uniqueAuthorIds = [...new Set(results.page.map((msg) => msg.authorId))];
        const authors = await Promise.all(uniqueAuthorIds.map((id) => ctx.db.get(id)));
        const authorsById = new Map(uniqueAuthorIds.map((id, idx) => [id, authors[idx]]));

        // Enrich with author info and reactions
        const enriched = await Promise.all(
            results.page.map(async (msg) => {
                const author = authorsById.get(msg.authorId) ?? null;
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
        const user = await requireUser(ctx);
        await assertCanReadChannel(ctx, user, channelId);
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

export const searchMessagesText = query({
    args: {
        channelId: v.optional(v.id("chatChannels")),
        searchText: v.string(),
    },
    handler: async (ctx, { channelId, searchText }) => {
        const user = await requireUser(ctx);
        if (!searchText.trim()) return [];

        let messages = [] as any[];
        if (channelId) {
            await assertCanReadChannel(ctx, user, channelId);
            messages = await ctx.db
                .query("chatMessages")
                .withIndex("by_channelId", (q) => q.eq("channelId", channelId))
                .collect();
        } else {
            const memberships = await ctx.db
                .query("chatChannelMembers")
                .withIndex("by_userId", (q) => q.eq("userId", user._id))
                .collect();
            const visibleChannelIds = memberships
                .filter((m) => !m.isHidden)
                .map((m) => m.channelId);

            const messagePages = await Promise.all(
                visibleChannelIds.map((id) =>
                    ctx.db
                        .query("chatMessages")
                        .withIndex("by_channelId", (q) => q.eq("channelId", id))
                        .collect()
                )
            );
            messages = messagePages.flat();
        }

        const lowerSearch = searchText.toLowerCase();
        const filtered = messages
            .filter((m) => !m.isDeleted && m.bodyPlainText.toLowerCase().includes(lowerSearch))
            .slice(0, 50);

        return Promise.all(
            filtered.map(async (msg) => {
                const author = (await ctx.db.get(msg.authorId as any)) as any;
                const channel = (await ctx.db.get(msg.channelId as any)) as any;
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

        const enriched = await Promise.all(
            notifications.map(async (n) => {
                const canReadChannel = await assertCanReadChannel(ctx, user, n.channelId)
                    .then(() => true)
                    .catch(() => false);
                if (!canReadChannel) return null;

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

        return enriched.filter((n) => n !== null);
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
// Removed old text-search version; use searchMessages with tokens instead (see line ~774)
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
            const notifyUserIds = await computeGroupMentionRecipients(
                ctx,
                args.channelId,
                args.mentions,
                user._id
            );

            await Promise.all(
                notifyUserIds.map((uid) =>
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

// ═════════════════════════════════════════════════════════════════════════
// PHASE 1: Silent Messages
// ═════════════════════════════════════════════════════════════════════════

/**
 * Send a message without triggering notifications.
 * Useful for non-urgent updates, info-only messages, late-night work.
 * Message is visible but shows a 🔇 indicator.
 */
export const sendSilentMessage = mutation({
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
            isSilent: true,
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

        // Skip notification generation for silent messages
        // (mentions are present in message but no notifications sent)

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

// ═════════════════════════════════════════════════════════════════════════
// PHASE 1: Read State Tracking
// ═════════════════════════════════════════════════════════════════════════

/**
 * Record that user has appeared in a channel (scrolled past messages).
 * Updates lastSeenAt and lastSeenMessageId.
 */
export const recordChannelSeen = mutation({
    args: {
        channelId: v.id("chatChannels"),
        lastSeenMessageId: v.optional(v.id("chatMessages")),
    },
    handler: async (ctx, { channelId, lastSeenMessageId }) => {
        const user = await requireUser(ctx);
        await assertCanReadChannel(ctx, user, channelId);

        // Get or create membership
        let membership = await ctx.db
            .query("chatChannelMembers")
            .withIndex("by_channel_user", (q) =>
                q.eq("channelId", channelId).eq("userId", user._id)
            )
            .first();

        if (!membership) {
            // Auto-join if not a member
            await ctx.db.insert("chatChannelMembers", {
                channelId,
                userId: user._id,
                joinedAt: Date.now(),
                role: "member",
                isMuted: false,
                lastSeenAt: Date.now(),
                lastSeenMessageId,
            });
        } else {
            // Update seen timestamp
            await ctx.db.patch(membership._id, {
                lastSeenAt: Date.now(),
                lastSeenMessageId,
            });
        }
    },
});

/**
 * Manually mark a channel as unread (for read/unread toggle).
 * Useful when user wants to revisit a channel later.
 */
export const markChannelUnread = mutation({
    args: { channelId: v.id("chatChannels") },
    handler: async (ctx, { channelId }) => {
        const user = await requireUser(ctx);

        const membership = await ctx.db
            .query("chatChannelMembers")
            .withIndex("by_channel_user", (q) =>
                q.eq("channelId", channelId).eq("userId", user._id)
            )
            .first();

        if (!membership) {
            throw new ConvexError({ code: "NOT_FOUND", message: "Not a member of this channel" });
        }

        // Reset read state to mark as unread
        await ctx.db.patch(membership._id, {
            lastReadTimestamp: 0,
            lastReadMessageId: undefined,
        });
    },
});

// ═════════════════════════════════════════════════════════════════════════
// PHASE 2: Search with Tokens
// ═════════════════════════════════════════════════════════════════════════

/**
 * Tokenize and stem text for search indexing.
 * Simple implementation: lowercased words.
 * In production, use proper stemming library.
 */
function computeSearchTokens(text: string): string[] {
    if (!text) return [];

    // Simple tokenization: lowercase, split on whitespace/punctuation, filter short words
    const tokens = text
        .toLowerCase()
        .split(/[\s\p{P}]+/u) // Split on whitespace and punctuation
        .filter((token) => token.length > 2) // Filter short words
        .map((token) => token.slice(0, 50)); // Limit token length

    // Remove duplicates
    return [...new Set(tokens)];
}

/**
 * Send message with pre-computed search tokens.
 * This is the recommended way to send messages for searchability.
 */
export const sendMessageWithTokens = mutation({
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

        // Pre-compute search tokens
        const searchTokens = computeSearchTokens(args.bodyPlainText);

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
            searchTokens, // Store computed tokens for fast lookup
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

/**
 * Search messages by pre-computed tokens.
 * Much faster than text scan; works across or within channels.
 */
export const searchMessages = query({
    args: {
        channelId: v.optional(v.id("chatChannels")),
        tokens: v.array(v.string()),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, { channelId, tokens, paginationOpts }) => {
        const user = await requireUser(ctx);

        if (!tokens.length) return { page: [], hasMore: false };

        let allMessages: any[] = [];
        if (channelId) {
            await assertCanReadChannel(ctx, user, channelId);
            allMessages = await ctx.db
                .query("chatMessages")
                .withIndex("by_channelId", (q) => q.eq("channelId", channelId))
                .collect();
        } else {
            const memberships = await ctx.db
                .query("chatChannelMembers")
                .withIndex("by_userId", (q) => q.eq("userId", user._id))
                .collect();
            const visibleChannelIds = memberships
                .filter((m) => !m.isHidden)
                .map((m) => m.channelId);

            const messagePages = await Promise.all(
                visibleChannelIds.map((id) =>
                    ctx.db
                        .query("chatMessages")
                        .withIndex("by_channelId", (q) => q.eq("channelId", id))
                        .collect()
                )
            );
            allMessages = messagePages.flat();
        }

        // Filter by token match + not deleted
        const stemmedTokens = tokens.map((t) => t.toLowerCase());
        const filtered = allMessages.filter(
            (msg) =>
                !msg.isDeleted &&
                msg.searchTokens &&
                msg.searchTokens.some((msgToken: string) =>
                    stemmedTokens.some((searchToken) => msgToken.includes(searchToken))
                )
        );

        // Manual pagination
        const pageStart = paginationOpts.cursor ? parseInt(paginationOpts.cursor as string, 10) : 0;
        const pageSize = paginationOpts.numItems ?? 20;
        const page = filtered.slice(pageStart, pageStart + pageSize);
        const hasMore = pageStart + pageSize < filtered.length;

        // Enrich with author info
        const enriched = await Promise.all(
            page.map(async (msg) => {
                const author = (await ctx.db.get(msg.authorId as any)) as any;
                return {
                    ...msg,
                    author: author ? { _id: author._id, name: author.name } : null,
                };
            })
        );

        return {
            page: enriched,
            hasMore,
            cursor: hasMore ? (pageStart + pageSize).toString() : undefined,
        };
    },
});

/**
 * List messages around a specific message for context (e.g., search result preview).
 * Returns messages before and after the target message.
 */
export const listAroundMessage = query({
    args: {
        messageId: v.id("chatMessages"),
        before: v.optional(v.number()), // number of messages before
        after: v.optional(v.number()), // number of messages after
    },
    handler: async (ctx, { messageId, before = 5, after = 5 }) => {
        const user = await requireUser(ctx);

        const targetMessage = await assertCanReadMessage(ctx, user, messageId);

        // Get all non-deleted messages in same channel
        const allMessages = await ctx.db
            .query("chatMessages")
            .withIndex("by_channelId", (q) => q.eq("channelId", targetMessage.channelId))
            .collect()
            .then((msgs) => msgs.filter((m) => !m.isDeleted));

        // Sort by creation time
        const sorted = allMessages.sort((a, b) => a._creationTime - b._creationTime);

        // Find target index
        const targetIdx = sorted.findIndex((m) => m._id === messageId);
        if (targetIdx === -1) {
            throw new ConvexError({ code: "NOT_FOUND", message: "Message not found in channel" });
        }

        // Extract context
        const start = Math.max(0, targetIdx - before);
        const end = Math.min(sorted.length, targetIdx + after + 1);
        const context = sorted.slice(start, end);

        // Enrich with author info
        const enriched = await Promise.all(
            context.map(async (msg) => {
                const author = (await ctx.db.get(msg.authorId as any)) as any;
                const reactions = await ctx.db
                    .query("chatReactions")
                    .withIndex("by_messageId", (q) => q.eq("messageId", msg._id))
                    .collect();

                return {
                    ...msg,
                    author: author ? { _id: author._id, name: author.name } : null,
                    reactions: reactions.map((r) => r.emoji),
                    isTarget: msg._id === messageId,
                };
            })
        );

        return enriched;
    },
});

// ═════════════════════════════════════════════════════════════════════════
// PHASE 2: Rich Content Pipeline (Links, Previews)
// ═════════════════════════════════════════════════════════════════════════

/**
 * Extract and populate URL previews from message body.
 * In production, call external service (node-fetch + cheerio or similar).
 * For now, stub that extracts URLs and stores placeholder
 */
function extractUrlsFromText(text: string): string[] {
    if (!text) return [];
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const matches = text.match(urlRegex) || [];
    return [...new Set(matches)]; // deduplicate
}

/**
 * Extract and attach previews from URL list.
 * In production: scrape OG tags, title, description, image.
 * For now: returns structured placeholder (real implementation requires HTTP action).
 */
export const extractAndAttachPreviews = mutation({
    args: {
        messageId: v.id("chatMessages"),
        body: v.string(),
    },
    handler: async (ctx, { messageId, body }) => {
        const user = await requireUser(ctx);
        const message = await ctx.db.get(messageId);

        if (!message) throw new ConvexError({ code: "NOT_FOUND", message: "Message not found" });
        await assertCanReadChannel(ctx, user, message.channelId);
        if (message.authorId !== user._id && !hasMinRole(user.role as Role, "T5")) {
            throw new ConvexError({ code: "FORBIDDEN", message: "Cannot modify this message" });
        }

        const urls = extractUrlsFromText(body);

        // In production: call scrapeUrlPreviews via action to fetch real data
        // For now: create placeholder previews
        const urlPreviews = urls.map((url) => ({
            url,
            title: `Preview for ${url}`,
            description: "URL preview extraction requires external action (not available in mutations)",
            imageUrl: undefined,
            siteName: new URL(url).hostname,
        }));

        await ctx.db.patch(messageId, {
            urlPreviews: urlPreviews.length > 0 ? urlPreviews : undefined,
        });
    },
});

/**
 * Create media gallery item from message attachments or URL previews.
 * Called during message enrichment to populate chatMediaItems.
 */
export const createMediaItems = mutation({
    args: {
        messageId: v.id("chatMessages"),
        channelId: v.id("chatChannels"),
        attachments: v.optional(v.array(v.object({
            storageId: v.id("_storage"),
            filename: v.string(),
            mimeType: v.string(),
        }))),
        urlPreviews: v.optional(v.array(v.object({
            url: v.string(),
            title: v.optional(v.string()),
            description: v.optional(v.string()),
            imageUrl: v.optional(v.string()),
        }))),
        uploadedBy: v.id("users"),
    },
    handler: async (ctx, { messageId, channelId, attachments, urlPreviews, uploadedBy: _uploadedBy }) => {
        const user = await requireUser(ctx);
        const message = await ctx.db.get(messageId);
        if (!message) {
            throw new ConvexError({ code: "NOT_FOUND", message: "Message not found" });
        }
        if (message.channelId !== channelId) {
            throw new ConvexError({ code: "INVALID_REQUEST", message: "Message does not belong to channel" });
        }
        await assertCanReadChannel(ctx, user, channelId);
        if (message.authorId !== user._id && !hasMinRole(user.role as Role, "T3")) {
            throw new ConvexError({ code: "FORBIDDEN", message: "Cannot create media for this message" });
        }

        // Create media items from attachments
        if (attachments && attachments.length > 0) {
            for (const att of attachments) {
                const type = att.mimeType.startsWith("image/")
                    ? "image"
                    : att.mimeType.startsWith("video/")
                        ? "video"
                        : "file";

                await ctx.db.insert("chatMediaItems", {
                    messageId,
                    channelId,
                    type,
                    url: att.storageId, // storage ID acts as URL
                    title: att.filename,
                    uploadedBy: user._id,
                    uploadedAt: Date.now(),
                });
            }
        }

        // Create media items from URL previews
        if (urlPreviews && urlPreviews.length > 0) {
            for (const preview of urlPreviews) {
                await ctx.db.insert("chatMediaItems", {
                    messageId,
                    channelId,
                    type: "link",
                    url: preview.url,
                    title: preview.title,
                    description: preview.description,
                    previewUrl: preview.imageUrl,
                    uploadedBy: user._id,
                    uploadedAt: Date.now(),
                });
            }
        }
    },
});

// ═════════════════════════════════════════════════════════════════════════
// PHASE 2: Rate Limiting & Abuse Prevention
// ═════════════════════════════════════════════════════════════════════════

/**
 * Check if user has exceeded rate limit for channel/message type.
 * Returns remaining quota or 0 if limit reached.
 */
export const checkRateLimit = query({
    args: {
        userId: v.id("users"),
        channelId: v.optional(v.id("chatChannels")),
        messageType: v.optional(v.string()),
    },
    handler: async (ctx, { userId, channelId, messageType = "text" }) => {
        const user = await requireUser(ctx);
        if (user._id !== userId) {
            throw new ConvexError({ code: "FORBIDDEN", message: "Cannot inspect another user's rate limit" });
        }

        // Staff (T5+) have no rate limits
        if (hasMinRole(user.role as Role, "T5")) {
            return { remaining: 999, limitedUntil: 0 };
        }

        // Define default limits
        const global_limit = { limit: 5, windowMs: 10000 }; // 5 messages per 10s globally
        void messageType;

        // Check if within window
        const now = Date.now();
        let messagesToday = await ctx.db
            .query("chatMessages")
            .withIndex("by_authorId", (q) => q.eq("authorId", userId))
            .collect()
            .then((msgs) =>
                msgs.filter((m) => {
                    const age = now - m._creationTime;
                    if (age > global_limit.windowMs || m.isSystem) return false;
                    return !channelId || m.channelId === channelId;
                })
            );

        const remaining = Math.max(0, global_limit.limit - messagesToday.length);

        return {
            remaining,
            limitedUntil: remaining === 0 ? now + global_limit.windowMs : 0,
        };
    },
});

/**
 * Send message with rate limit enforcement.
 * Throws error if user exceeds quota.
 */
export const sendMessageWithRateLimit = mutation({
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

        // Skip rate limit for staff
        if (!hasMinRole(user.role as Role, "T5")) {
            // Check global rate limit: 5 messages per 10 seconds
            const now = Date.now();
            const recentMessages = await ctx.db
                .query("chatMessages")
                .withIndex("by_authorId", (q) => q.eq("authorId", user._id))
                .collect()
                .then((msgs) =>
                    msgs.filter((m) => {
                        const age = now - m._creationTime;
                        return age <= 10000 && !m.isSystem;
                    })
                );

            if (recentMessages.length >= 5) {
                throw new ConvexError({
                    code: "RATE_LIMITED",
                    message: "Too many messages. Please slow down.",
                });
            }

            // Check channel rate limit: 2 messages per 5 seconds
            const channelMessages = recentMessages.filter((m) => m.channelId === args.channelId);
            if (channelMessages.length >= 2) {
                throw new ConvexError({
                    code: "RATE_LIMITED",
                    message: "You are messaging this channel too quickly.",
                });
            }
        }

        // Proceed with normal send (reuse existing sendMessage logic)
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

        // Update thread counters
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
            const notifyUserIds = await computeGroupMentionRecipients(
                ctx,
                args.channelId,
                args.mentions,
                user._id
            );

            await Promise.all(
                notifyUserIds.map((uid) =>
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

/**
 * Report a message for abuse/violation.
 * Creates abuse report record for moderation review.
 */
export const reportMessage = mutation({
    args: {
        messageId: v.id("chatMessages"),
        reason: v.string(),
    },
    handler: async (ctx, { messageId, reason }) => {
        const user = await requireUser(ctx);
        const message = await ctx.db.get(messageId);

        if (!message) throw new ConvexError({ code: "NOT_FOUND", message: "Message not found" });
        await assertCanReadChannel(ctx, user, message.channelId);

        // Check if user already reported this message
        const existingReport = await ctx.db
            .query("chatAbuseReports")
            .withIndex("by_messageId", (q) => q.eq("messageId", messageId))
            .collect()
            .then((reports) => reports.some((r) => r.reportedBy === user._id));

        if (existingReport) {
            throw new ConvexError({ code: "INVALID_REQUEST", message: "You already reported this message" });
        }

        const reportId = await ctx.db.insert("chatAbuseReports", {
            messageId,
            reportedBy: user._id,
            reason,
            status: "open",
            reportedAt: Date.now(),
        });

        return reportId;
    },
});

// ═════════════════════════════════════════════════════════════════════════
// PHASE 2: Media Gallery
// ═════════════════════════════════════════════════════════════════════════

/**
 * List channel media items (images, videos, links) with pagination.
 * Useful for gallery view or media archive.
 */
export const listChannelMedia = query({
    args: {
        channelId: v.id("chatChannels"),
        type: v.optional(v.union(v.literal("image"), v.literal("video"), v.literal("link"), v.literal("file"))),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, { channelId, type, paginationOpts }) => {
        const user = await requireUser(ctx);
        await assertCanReadChannel(ctx, user, channelId);

        let query_builder = ctx.db
            .query("chatMediaItems")
            .withIndex("by_channelId", (q) => q.eq("channelId", channelId));

        if (type) {
            query_builder = query_builder.filter((q) => q.eq(q.field("type"), type));
        }

        const results = await query_builder.order("desc").paginate(paginationOpts);

        // Enrich with uploader info
        const enriched = await Promise.all(
            results.page.map(async (item) => {
                const uploader = await ctx.db.get(item.uploadedBy);
                const message = await ctx.db.get(item.messageId);

                return {
                    ...item,
                    uploader: uploader ? { _id: uploader._id, name: uploader.name } : null,
                    message: message ? { _id: message._id, createdAt: message._creationTime } : null,
                };
            })
        );

        return { ...results, page: enriched };
    },
});

/**
 * Search media items by title/description across one or all channels.
 */
export const searchMedia = query({
    args: {
        channelId: v.optional(v.id("chatChannels")),
        text: v.string(),
        type: v.optional(v.union(v.literal("image"), v.literal("video"), v.literal("link"), v.literal("file"))),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, { channelId, text, type, paginationOpts }) => {
        const user = await requireUser(ctx);

        if (!text.trim()) return { page: [], hasMore: false };

        let allMedia: any[] = [];
        if (channelId) {
            await assertCanReadChannel(ctx, user, channelId);
            allMedia = await ctx.db
                .query("chatMediaItems")
                .withIndex("by_channelId", (q) => q.eq("channelId", channelId))
                .collect();
        } else {
            const memberships = await ctx.db
                .query("chatChannelMembers")
                .withIndex("by_userId", (q) => q.eq("userId", user._id))
                .collect();
            const visibleChannelIds = memberships
                .filter((m) => !m.isHidden)
                .map((m) => m.channelId);

            const mediaPages = await Promise.all(
                visibleChannelIds.map((id) =>
                    ctx.db
                        .query("chatMediaItems")
                        .withIndex("by_channelId", (q) => q.eq("channelId", id))
                        .collect()
                )
            );
            allMedia = mediaPages.flat();
        }

        // Search by title or description
        const lowerText = text.toLowerCase();
        const filtered = allMedia
            .filter((item) => {
                const titleMatch = item.title?.toLowerCase().includes(lowerText);
                const descMatch = item.description?.toLowerCase().includes(lowerText);
                const typeMatch = !type || item.type === type;
                return (titleMatch || descMatch) && typeMatch;
            })
            .sort((a, b) => b.uploadedAt - a.uploadedAt);

        // Manual pagination
        const pageStart = paginationOpts.cursor ? parseInt(paginationOpts.cursor as string, 10) : 0;
        const pageSize = paginationOpts.numItems ?? 20;
        const page = filtered.slice(pageStart, pageStart + pageSize);
        const hasMore = pageStart + pageSize < filtered.length;

        // Enrich with uploader info
        const enriched = await Promise.all(
            page.map(async (item) => {
                const uploader = (await ctx.db.get(item.uploadedBy as any)) as any;
                return {
                    ...item,
                    uploader: uploader ? { _id: uploader._id, name: uploader.name } : null,
                };
            })
        );

        return {
            page: enriched,
            hasMore,
            cursor: hasMore ? (pageStart + pageSize).toString() : undefined,
        };
    },
});

/**
 * Get media item with source message context.
 * Useful for viewing media and understanding context.
 */
export const getMediaContext = query({
    args: { mediaItemId: v.id("chatMediaItems") },
    handler: async (ctx, { mediaItemId }) => {
        const user = await requireUser(ctx);

        const item = await ctx.db.get(mediaItemId);
        if (!item) throw new ConvexError({ code: "NOT_FOUND", message: "Media item not found" });
        await assertCanReadChannel(ctx, user, item.channelId);

        // Get source message and channel
        const message = await ctx.db.get(item.messageId);
        const channel = await ctx.db.get(item.channelId);
        const author = message ? await ctx.db.get(message.authorId) : null;
        const uploader = (await ctx.db.get(item.uploadedBy as any)) as any;

        return {
            ...item,
            message: message
                ? {
                    _id: message._id,
                    body: message.bodyPlainText,
                    createdAt: message._creationTime,
                    author: author ? { _id: author._id, name: author.name } : null,
                }
                : null,
            channel: channel ? { _id: channel._id, name: channel.name } : null,
            uploader: uploader ? { _id: uploader._id, name: uploader.name } : null,
        };
    },
});

// ═════════════════════════════════════════════════════════════════════════
// PHASE 3: Scheduled Messages
// ═════════════════════════════════════════════════════════════════════════

/**
 * Schedule a message to be sent at a future time.
 * Useful for announcements, reminders, follow-ups.
 */
export const scheduleMessage = mutation({
    args: {
        channelId: v.id("chatChannels"),
        body: v.string(),
        bodyPlainText: v.string(),
        sendAt: v.number(), // Unix timestamp
        mentions: v.optional(v.object({
            userIds: v.optional(v.array(v.id("users"))),
            roles: v.optional(v.array(v.string())),
            specialRoles: v.optional(v.array(v.string())),
            groupNames: v.optional(v.array(v.string())),
            everyone: v.optional(v.boolean()),
            channel: v.optional(v.boolean()),
            here: v.optional(v.boolean()),
        })),
        attachments: v.optional(v.array(v.object({
            storageId: v.id("_storage"),
            filename: v.string(),
            mimeType: v.string(),
            size: v.number(),
        }))),
    },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);

        // Validate send time is in future
        if (args.sendAt <= Date.now()) {
            throw new ConvexError({ code: "INVALID_REQUEST", message: "Send time must be in the future" });
        }

        // Validate can send in this channel
        const canSend = await checkCanSend(ctx, args.channelId, user);
        if (!canSend) {
            throw new ConvexError({ code: "FORBIDDEN", message: "You cannot send messages in this channel" });
        }

        const scheduledId = await ctx.db.insert("chatScheduledMessages", {
            channelId: args.channelId,
            authorId: user._id,
            body: args.body,
            bodyPlainText: args.bodyPlainText,
            mentions: args.mentions,
            attachments: args.attachments,
            sendAt: args.sendAt,
            status: "queued",
            createdAt: Date.now(),
        });

        return scheduledId;
    },
});

/**
 * Update a scheduled message (before it's sent).
 */
export const updateScheduledMessage = mutation({
    args: {
        scheduledId: v.id("chatScheduledMessages"),
        body: v.optional(v.string()),
        bodyPlainText: v.optional(v.string()),
        sendAt: v.optional(v.number()),
        mentions: v.optional(v.any()),
    },
    handler: async (ctx, { scheduledId, ...updates }) => {
        const user = await requireUser(ctx);
        const scheduled = await ctx.db.get(scheduledId);

        if (!scheduled) throw new ConvexError({ code: "NOT_FOUND", message: "Scheduled message not found" });
        if (scheduled.authorId !== user._id) {
            throw new ConvexError({ code: "FORBIDDEN", message: "Can only update own scheduled messages" });
        }
        if (scheduled.status !== "queued") {
            throw new ConvexError({ code: "INVALID_REQUEST", message: "Cannot update sent or cancelled messages" });
        }

        const patch: Record<string, any> = {};
        if (updates.body !== undefined) patch.body = updates.body;
        if (updates.bodyPlainText !== undefined) patch.bodyPlainText = updates.bodyPlainText;
        if (updates.sendAt !== undefined) {
            if (updates.sendAt <= Date.now()) {
                throw new ConvexError({ code: "INVALID_REQUEST", message: "Send time must be in the future" });
            }
            patch.sendAt = updates.sendAt;
        }
        if (updates.mentions !== undefined) patch.mentions = updates.mentions;

        await ctx.db.patch(scheduledId, patch);
    },
});

/**
 * Cancel a scheduled message.
 */
export const cancelScheduledMessage = mutation({
    args: { scheduledId: v.id("chatScheduledMessages") },
    handler: async (ctx, { scheduledId }) => {
        const user = await requireUser(ctx);
        const scheduled = await ctx.db.get(scheduledId);

        if (!scheduled) throw new ConvexError({ code: "NOT_FOUND", message: "Scheduled message not found" });
        if (scheduled.authorId !== user._id) {
            throw new ConvexError({ code: "FORBIDDEN", message: "Can only cancel own messages" });
        }
        if (scheduled.status !== "queued") {
            throw new ConvexError({ code: "INVALID_REQUEST", message: "Can only cancel queued messages" });
        }

        await ctx.db.patch(scheduledId, {
            status: "cancelled",
            cancelledAt: Date.now(),
        });
    },
});

/**
 * List user's scheduled messages.
 */
export const listMyScheduledMessages = query({
    args: {},
    handler: async (ctx) => {
        const user = await requireUser(ctx);

        const scheduled = await ctx.db
            .query("chatScheduledMessages")
            .withIndex("by_authorId", (q) => q.eq("authorId", user._id))
            .collect();

        // Sort by sendAt, filter out old ones
        return scheduled
            .filter((s) => s.status === "queued" || s.sendAt > Date.now() - 86400000) // Keep 24h history
            .sort((a, b) => a.sendAt - b.sendAt);
    },
});

/**
 * Internal: Process due scheduled messages and send them.
 * Called periodically (every 1 minute) via cron.
 */
export const sendDueScheduledMessages = internalMutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();

        // Find all queued messages that are due
        const dueMsgs = await ctx.db
            .query("chatScheduledMessages")
            .withIndex("by_sendAt", (q) => q.lte("sendAt", now))
            .collect()
            .then((msgs) => msgs.filter((m) => m.status === "queued"));

        // Send each message
        for (const scheduled of dueMsgs) {
            try {
                const author = await ctx.db.get(scheduled.authorId);
                if (!author) {
                    await ctx.db.patch(scheduled._id, {
                        status: "cancelled",
                        cancelledAt: Date.now(),
                    });
                    continue;
                }

                const canSend = await checkCanSend(ctx, scheduled.channelId, author)
                    .then((allowed) => allowed)
                    .catch(() => false);
                if (!canSend) {
                    await ctx.db.patch(scheduled._id, {
                        status: "cancelled",
                        cancelledAt: Date.now(),
                    });
                    continue;
                }

                // Create the actual message
                const messageId = await ctx.db.insert("chatMessages", {
                    channelId: scheduled.channelId,
                    authorId: scheduled.authorId,
                    body: scheduled.body,
                    bodyPlainText: scheduled.bodyPlainText,
                    mentions: scheduled.mentions,
                    attachments: scheduled.attachments,
                    isEdited: false,
                    isDeleted: false,
                    isPinned: false,
                    isSystem: false,
                });

                // Generate notifications (reuse mention logic)
                if (scheduled.mentions) {
                    const notifyUserIds = await computeGroupMentionRecipients(
                        ctx,
                        scheduled.channelId,
                        scheduled.mentions,
                        scheduled.authorId
                    );

                    // Create notifications
                    await Promise.all(
                        notifyUserIds.map((uid) =>
                            ctx.db.insert("chatNotifications", {
                                userId: uid as any,
                                messageId,
                                channelId: scheduled.channelId,
                                mentionedBy: scheduled.authorId,
                                isRead: false,
                            })
                        )
                    );
                }

                // Mark scheduled message as sent
                await ctx.db.patch(scheduled._id, {
                    status: "sent",
                    sentAt: Date.now(),
                });
            } catch (e) {
                console.error(`Failed to send scheduled message ${scheduled._id}:`, e);
            }
        }

        return { sent: dueMsgs.length };
    },
});

// ═════════════════════════════════════════════════════════════════════════
// PHASE 3: Groups and Extended Mentions
// ═════════════════════════════════════════════════════════════════════════

/**
 * Compute mention recipients including group mentions and special scope mentions.
 * Supports: @user, @role, @group, @everyone, @channel (7 days), @here (5 min).
 */
export async function computeGroupMentionRecipients(
    ctx: any,
    channelId: any,
    mentions: any,
    authorId: any
): Promise<string[]> {
    const notifyUserIds = new Set<string>();
    const channelMembers = await ctx.db
        .query("chatChannelMembers")
        .withIndex("by_channelId", (q: any) => q.eq("channelId", channelId))
        .collect();
    const visibleMemberIds = new Set<string>(
        channelMembers
            .filter((m: any) => !m.isHidden)
            .map((m: any) => m.userId)
    );

    const shouldLoadAllUsers =
        !!mentions?.specialRoles?.length ||
        !!mentions?.groupNames?.length ||
        !!mentions?.everyone;
    const allUsers = shouldLoadAllUsers ? await ctx.db.query("users").collect() : [];

    // Direct user mentions
    if (mentions?.userIds) {
        for (const uid of mentions.userIds) {
            if (uid !== authorId && visibleMemberIds.has(uid)) notifyUserIds.add(uid);
        }
    }

    // Role mentions
    if (mentions?.roles && mentions.roles.length > 0) {
        for (const role of mentions.roles) {
            const roleUsers = await ctx.db
                .query("users")
                .withIndex("by_role", (q: any) => q.eq("role", role as any))
                .collect();
            for (const u of roleUsers) {
                if (u._id !== authorId && visibleMemberIds.has(u._id)) notifyUserIds.add(u._id);
            }
        }
    }

    // Special role mentions
    if (mentions?.specialRoles && mentions.specialRoles.length > 0) {
        for (const role of mentions.specialRoles) {
            for (const u of allUsers) {
                if (u.specialRoles?.includes(role) && u._id !== authorId && visibleMemberIds.has(u._id)) {
                    notifyUserIds.add(u._id);
                }
            }
        }
    }

    // Group mentions (@group)
    if (mentions?.groupNames && mentions.groupNames.length > 0) {
        for (const groupName of mentions.groupNames) {
            for (const u of allUsers) {
                if (u.groupTags?.includes(groupName) && u._id !== authorId && visibleMemberIds.has(u._id)) {
                    notifyUserIds.add(u._id);
                }
            }
        }
    }

    // @everyone — all visible members in the channel
    if (mentions?.everyone) {
        for (const memberId of visibleMemberIds) {
            if (memberId !== authorId) notifyUserIds.add(memberId);
        }
    }

    // @channel — users active in channel last 7 days
    if (mentions?.channel) {
        const sevenDaysAgo = Date.now() - 7 * 86400000;
        for (const m of channelMembers) {
            if (!m.isHidden && m.userId !== authorId && (m.lastSeenAt ?? 0) > sevenDaysAgo) {
                notifyUserIds.add(m.userId);
            }
        }
    }

    // @here — users active in channel last 5 minutes
    if (mentions?.here) {
        const fiveMinutesAgo = Date.now() - 5 * 60000;
        for (const m of channelMembers) {
            if (!m.isHidden && m.userId !== authorId && (m.lastSeenAt ?? 0) > fiveMinutesAgo) {
                notifyUserIds.add(m.userId);
            }
        }
    }

    return [...notifyUserIds];
}

/**
 * Update user's group tags (for group-based mentions).
 * Only admins or self can update.
 */
export const updateUserGroupTags = mutation({
    args: {
        userId: v.id("users"),
        groupTags: v.array(v.string()),
    },
    handler: async (ctx, { userId, groupTags }) => {
        const currentUser = await requireUser(ctx);

        // Only admin or self can update
        if (currentUser._id !== userId && !hasMinRole(currentUser.role as Role, "T3")) {
            throw new ConvexError({ code: "FORBIDDEN", message: "Cannot update other users' group tags" });
        }

        const user = await ctx.db.get(userId);
        if (!user) throw new ConvexError({ code: "NOT_FOUND", message: "User not found" });

        await ctx.db.patch(userId, { groupTags });
    },
});

/**
 * Get available group tags in the organization.
 */
export const listAvailableGroupTags = query({
    args: {},
    handler: async (ctx) => {
        await requireUser(ctx);

        const allUsers = await ctx.db.query("users").collect();
        const tags = new Set<string>();

        for (const user of allUsers) {
            if (user.groupTags) {
                for (const tag of user.groupTags) {
                    tags.add(tag);
                }
            }
        }

        return Array.from(tags).sort();
    },
});

