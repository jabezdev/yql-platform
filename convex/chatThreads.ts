import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireUser } from "./accessControl";
import { paginationOptsValidator } from "convex/server";
import { assertCanReadChannel } from "./chat/lib/access";

// List all replies for a thread (messages with this threadRootMessageId)
export const listThreadReplies = query({
    args: {
        rootMessageId: v.id("chatMessages"),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, { rootMessageId, paginationOpts }) => {
        const user = await requireUser(ctx);
        const rootMessage = await ctx.db.get(rootMessageId);
        if (!rootMessage) {
            return { continueCursor: null as any, isDone: true, pageStatus: "done", page: [] };
        }
        await assertCanReadChannel(ctx, user, rootMessage.channelId);

        const results = await ctx.db
            .query("chatMessages")
            .withIndex("by_threadRootMessageId", (q) =>
                q.eq("threadRootMessageId", rootMessageId)
            )
            .order("asc")
            .paginate(paginationOpts);

        const uniqueAuthorIds = [...new Set(results.page.map((msg) => msg.authorId))];
        const authors = await Promise.all(uniqueAuthorIds.map((id) => ctx.db.get(id)));
        const authorsById = new Map(uniqueAuthorIds.map((id, idx) => [id, authors[idx]]));

        const enriched = await Promise.all(
            results.page.map(async (msg) => {
                const author = authorsById.get(msg.authorId) ?? null;

                const attachmentsWithUrls = msg.attachments
                    ? await Promise.all(
                        msg.attachments.map(async (att) => ({
                            ...att,
                            url: await ctx.storage.getUrl(att.storageId),
                        }))
                    )
                    : undefined;

                const reactions = await ctx.db
                    .query("chatReactions")
                    .withIndex("by_messageId", (q) => q.eq("messageId", msg._id))
                    .collect();

                const reactionGroups: Record<string, { emoji: string; userIds: string[]; count: number }> = {};
                for (const r of reactions) {
                    if (!reactionGroups[r.emoji]) {
                        reactionGroups[r.emoji] = { emoji: r.emoji, userIds: [], count: 0 };
                    }
                    reactionGroups[r.emoji].userIds.push(r.userId);
                    reactionGroups[r.emoji].count++;
                }

                const poll = await ctx.db
                    .query("chatPolls")
                    .withIndex("by_messageId", (q) => q.eq("messageId", msg._id))
                    .first();

                return {
                    ...msg,
                    attachments: attachmentsWithUrls,
                    author: author
                        ? { _id: author._id, name: author.name, role: author.role }
                        : null,
                    reactions: Object.values(reactionGroups),
                    poll: poll || null,
                };
            })
        );

        return { ...results, page: enriched };
    },
});

// Get the root message of a thread (enriched like listMessages)
export const getRootMessage = query({
    args: { messageId: v.id("chatMessages") },
    handler: async (ctx, { messageId }) => {
        const user = await requireUser(ctx);

        const msg = await ctx.db.get(messageId);
        if (!msg) return null;
        await assertCanReadChannel(ctx, user, msg.channelId);

        const author = await ctx.db.get(msg.authorId);

        const attachmentsWithUrls = msg.attachments
            ? await Promise.all(
                msg.attachments.map(async (att) => ({
                    ...att,
                    url: await ctx.storage.getUrl(att.storageId),
                }))
            )
            : undefined;

        const reactions = await ctx.db
            .query("chatReactions")
            .withIndex("by_messageId", (q) => q.eq("messageId", msg._id))
            .collect();

        const reactionGroups: Record<string, { emoji: string; userIds: string[]; count: number }> = {};
        for (const r of reactions) {
            if (!reactionGroups[r.emoji]) {
                reactionGroups[r.emoji] = { emoji: r.emoji, userIds: [], count: 0 };
            }
            reactionGroups[r.emoji].userIds.push(r.userId);
            reactionGroups[r.emoji].count++;
        }

        const poll = await ctx.db
            .query("chatPolls")
            .withIndex("by_messageId", (q) => q.eq("messageId", msg._id))
            .first();

        return {
            ...msg,
            attachments: attachmentsWithUrls,
            author: author
                ? { _id: author._id, name: author.name, role: author.role }
                : null,
            reactions: Object.values(reactionGroups),
            poll: poll || null,
        };
    },
});

// Subscribe to a thread for notifications
// When user subscribes, they'll receive notifications for new replies (unless global mute)
export const subscribeToThread = mutation({
    args: {
        threadId: v.id("chatMessages"),
    },
    handler: async (ctx, { threadId }) => {
        const user = await requireUser(ctx);

        // Verify thread root exists
        const rootMsg = await ctx.db.get(threadId);
        if (!rootMsg || rootMsg.threadRootMessageId !== undefined) {
            throw new Error("Invalid thread ID");
        }
        await assertCanReadChannel(ctx, user, rootMsg.channelId);

        // Check if already subscribed
        const existing = await ctx.db
            .query("chatThreadSubscriptions")
            .withIndex("by_userId_threadRootMessageId", (q) =>
                q.eq("userId", user._id).eq("threadRootMessageId", threadId)
            )
            .first();

        if (existing) {
            return existing._id;
        }

        // Create subscription, set lastReadAt to now (already read everything so far)
        const subscriptionId = await ctx.db.insert("chatThreadSubscriptions", {
            userId: user._id,
            threadRootMessageId: threadId,
            channelId: rootMsg.channelId,
            subscribedAt: Date.now(),
            lastReadAt: Date.now(),
            lastReadReplyId: undefined,
        });

        return subscriptionId;
    },
});

// Unsubscribe from a thread (stop receiving notifications for new replies)
export const unsubscribeFromThread = mutation({
    args: {
        threadId: v.id("chatMessages"),
    },
    handler: async (ctx, { threadId }) => {
        const user = await requireUser(ctx);

        const subscription = await ctx.db
            .query("chatThreadSubscriptions")
            .withIndex("by_userId_threadRootMessageId", (q) =>
                q.eq("userId", user._id).eq("threadRootMessageId", threadId)
            )
            .first();

        if (subscription) {
            await ctx.db.delete(subscription._id);
        }

        return null;
    },
});

// Mark thread as read up to a specific reply (or current time if not specified)
// Updates subscription record with lastReadAt and lastReadReplyId
export const markThreadRead = mutation({
    args: {
        threadId: v.id("chatMessages"),
        lastReadReplyId: v.optional(v.id("chatMessages")),
    },
    handler: async (ctx, { threadId, lastReadReplyId }) => {
        const user = await requireUser(ctx);
        const rootMsg = await ctx.db.get(threadId);
        if (!rootMsg || rootMsg.threadRootMessageId !== undefined) {
            throw new Error("Invalid thread ID");
        }
        await assertCanReadChannel(ctx, user, rootMsg.channelId);

        const subscription = await ctx.db
            .query("chatThreadSubscriptions")
            .withIndex("by_userId_threadRootMessageId", (q) =>
                q.eq("userId", user._id).eq("threadRootMessageId", threadId)
            )
            .first();

        if (!subscription) {
            // Auto-subscribe if not already subscribed
            const subscriptionId = await ctx.db.insert("chatThreadSubscriptions", {
                userId: user._id,
                threadRootMessageId: threadId,
                channelId: rootMsg.channelId,
                subscribedAt: Date.now(),
                lastReadAt: Date.now(),
                lastReadReplyId,
            });
            return subscriptionId;
        }

        // Update existing subscription
        await ctx.db.patch(subscription._id, {
            lastReadAt: Date.now(),
            lastReadReplyId,
        });

        return subscription._id;
    },
});

// List user's subscribed threads with unread count
// Returns threads with metadata: root message, subscriber count, unread reply count
export const listMySubscribedThreads = query({
    args: {
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, { paginationOpts }) => {
        const user = await requireUser(ctx);

        const results = await ctx.db
            .query("chatThreadSubscriptions")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .order("desc")
            .paginate(paginationOpts);

        const threadsWithMetadata = await Promise.all(
            results.page.map(async (sub) => {
                // Get root message
                const rootMsg = await ctx.db.get(sub.threadRootMessageId);
                if (!rootMsg) return null;
                const canRead = await assertCanReadChannel(ctx, user, rootMsg.channelId)
                    .then(() => true)
                    .catch(() => false);
                if (!canRead) return null;

                // Get author of root message
                const author = await ctx.db.get(rootMsg.authorId);

                // Count total replies in thread
                const allReplies = await ctx.db
                    .query("chatMessages")
                    .withIndex("by_threadRootMessageId", (q) =>
                        q.eq("threadRootMessageId", sub.threadRootMessageId)
                    )
                    .collect();

                // Count unread replies (after lastReadAt)
                const lastReadAt = sub.lastReadAt ?? 0;
                const unreadCount = allReplies.filter(
                    (reply) => reply._creationTime > lastReadAt
                ).length;

                // Count total subscribers to this thread
                const subscribers = await ctx.db
                    .query("chatThreadSubscriptions")
                    .withIndex("by_threadRootMessageId", (q) => q.eq("threadRootMessageId", sub.threadRootMessageId))
                    .collect();

                return {
                    subscription: sub,
                    rootMessage: {
                        _id: rootMsg._id,
                        bodyPlainText: rootMsg.bodyPlainText,
                        createdAt: rootMsg._creationTime,
                        author: author
                            ? { _id: author._id, name: author.name }
                            : null,
                    },
                    replyCount: allReplies.length,
                    unreadCount,
                    subscriberCount: subscribers.length,
                };
            })
        );

        // Remove null entries (deleted messages)
        const filtered = threadsWithMetadata.filter((t) => t !== null);

        return {
            ...results,
            page: filtered,
        };
    },
});

// List only unread threads (subscribed threads with unread replies)
// Useful for a notification badge or "unread threads" view
export const listMyUnreadThreads = query({
    args: {
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, { paginationOpts }) => {
        const user = await requireUser(ctx);

        // Get all subscribed threads
        const allSubscriptions = await ctx.db
            .query("chatThreadSubscriptions")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .collect();

        // Compute unread status for each
        const threadsWithUnreadStatus = await Promise.all(
            allSubscriptions.map(async (sub) => {
                const allReplies = await ctx.db
                    .query("chatMessages")
                    .withIndex("by_threadRootMessageId", (q) =>
                        q.eq("threadRootMessageId", sub.threadRootMessageId)
                    )
                    .collect();

                const lastReadAt = sub.lastReadAt ?? 0;
                const unreadCount = allReplies.filter(
                    (reply) => reply._creationTime > lastReadAt
                ).length;

                return { sub, unreadCount };
            })
        );

        // Filter to only unread threads and sort by most recent
        const unreadThreads = threadsWithUnreadStatus
            .filter((t) => t.unreadCount > 0)
            .sort(
                (a, b) =>
                    (b.sub.lastReadAt ?? 0) -
                    (a.sub.lastReadAt ?? 0)
            )
            .slice(0, paginationOpts.numItems)
            .map((t) => t.sub);

        // Enrich with metadata
        const enriched = await Promise.all(
            unreadThreads.map(async (sub) => {
                const rootMsg = await ctx.db.get(sub.threadRootMessageId);
                if (!rootMsg) return null;
                const canRead = await assertCanReadChannel(ctx, user, rootMsg.channelId)
                    .then(() => true)
                    .catch(() => false);
                if (!canRead) return null;

                const author = await ctx.db.get(rootMsg.authorId);

                const allReplies = await ctx.db
                    .query("chatMessages")
                    .withIndex("by_threadRootMessageId", (q) =>
                        q.eq("threadRootMessageId", sub.threadRootMessageId)
                    )
                    .collect();

                const lastReadAt = sub.lastReadAt ?? 0;
                const unreadCount = allReplies.filter(
                    (reply) => reply._creationTime > lastReadAt
                ).length;

                const subscribers = await ctx.db
                    .query("chatThreadSubscriptions")
                    .withIndex("by_threadRootMessageId", (q) => q.eq("threadRootMessageId", sub.threadRootMessageId))
                    .collect();

                return {
                    subscription: sub,
                    rootMessage: {
                        _id: rootMsg._id,
                        bodyPlainText: rootMsg.bodyPlainText,
                        createdAt: rootMsg._creationTime,
                        author: author
                            ? { _id: author._id, name: author.name }
                            : null,
                    },
                    replyCount: allReplies.length,
                    unreadCount,
                    subscriberCount: subscribers.length,
                };
            })
        );

        const filtered = enriched.filter((t) => t !== null);

        return {
            continueCursor: null as any,
            isDone: true,
            pageStatus: "done",
            page: filtered,
        };
    },
});
