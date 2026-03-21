import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireUser } from "./accessControl";
import { paginationOptsValidator } from "convex/server";

// List all replies for a thread (messages with this threadRootMessageId)
export const listThreadReplies = query({
    args: {
        rootMessageId: v.id("chatMessages"),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, { rootMessageId, paginationOpts }) => {
        await requireUser(ctx);

        const results = await ctx.db
            .query("chatMessages")
            .withIndex("by_threadRootMessageId", (q) =>
                q.eq("threadRootMessageId", rootMessageId)
            )
            .order("asc")
            .paginate(paginationOpts);

        const enriched = await Promise.all(
            results.page.map(async (msg) => {
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
            })
        );

        return { ...results, page: enriched };
    },
});

// Get the root message of a thread (enriched like listMessages)
export const getRootMessage = query({
    args: { messageId: v.id("chatMessages") },
    handler: async (ctx, { messageId }) => {
        await requireUser(ctx);

        const msg = await ctx.db.get(messageId);
        if (!msg) return null;

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
