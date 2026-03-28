/**
 * Chat Enrichment Helpers
 * Handles message enrichment: author info, reactions, polls, media, previews
 */

import type { Doc, Id } from "../../_generated/dataModel";
import type { QueryCtx } from "../../_generated/server";

/**
 * Enrich a message with author info, reactions, poll, and media
 */
export async function enrichMessage(
    ctx: QueryCtx,
    msg: Doc<"chatMessages">
) {
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

    const reactionGroups: Record<
        string,
        { emoji: string; userIds: string[]; count: number }
    > = {};
    for (const r of reactions) {
        if (!reactionGroups[r.emoji]) {
            reactionGroups[r.emoji] = {
                emoji: r.emoji,
                userIds: [],
                count: 0,
            };
        }
        reactionGroups[r.emoji].userIds.push(r.userId);
        reactionGroups[r.emoji].count++;
    }

    const poll = await ctx.db
        .query("chatPolls")
        .withIndex("by_messageId", (q) => q.eq("messageId", msg._id))
        .first();

    // Media items are now in separate chatMediaItems table; query by messageId when needed
    const mediaItems = await ctx.db
        .query("chatMediaItems")
        .withIndex("by_messageId", (q) => q.eq("messageId", msg._id))
        .collect();

    return {
        ...msg,
        attachments: attachmentsWithUrls,
        author: author
            ? { _id: author._id, name: author.name, email: author.email, role: author.role }
            : null,
        reactions: Object.values(reactionGroups),
        poll: poll || null,
        mediaItems: mediaItems || [],
    };
}

/**
 * Enrich multiple messages (batch)
 */
export async function enrichMessages(
    ctx: QueryCtx,
    messages: Doc<"chatMessages">[]
) {
    return Promise.all(messages.map((msg) => enrichMessage(ctx, msg)));
}

/**
 * Get reactions grouped by emoji for a message
 */
export async function getMessageReactions(
    ctx: QueryCtx,
    messageId: Id<"chatMessages">
) {
    const reactions = await ctx.db
        .query("chatReactions")
        .withIndex("by_messageId", (q) => q.eq("messageId", messageId))
        .collect();

    const grouped: Record<string, { emoji: string; count: number; userIds: Id<"users">[] }> = {};

    for (const r of reactions) {
        if (!grouped[r.emoji]) {
            grouped[r.emoji] = {
                emoji: r.emoji,
                count: 0,
                userIds: [],
            };
        }
        grouped[r.emoji].count++;
        grouped[r.emoji].userIds.push(r.userId);
    }

    return Object.values(grouped);
}

/**
 * Get poll for a message (if exists)
 */
export async function getMessagePoll(
    ctx: QueryCtx,
    messageId: Id<"chatMessages">
) {
    return ctx.db
        .query("chatPolls")
        .withIndex("by_messageId", (q) => q.eq("messageId", messageId))
        .first();
}

/**
 * Get media items for a message
 */
export async function getMessageMedia(
    ctx: QueryCtx,
    messageId: Id<"chatMessages">
) {
    return ctx.db
        .query("chatMediaItems")
        .withIndex("by_messageId", (q) => q.eq("messageId", messageId))
        .collect();
}

/**
 * Get preview for a URL (if exists in message attachments)
 */
export async function getUrlPreview(
    url: string,
    previews?: Doc<"chatMediaItems">[]
): Promise<Doc<"chatMediaItems"> | undefined> {
    if (!previews) return undefined;

    return previews.find(
        (p) => p.type === "link" && p.url === url
    );
}

/**
 * Format attachment metadata for display
 */
export function formatAttachment(attachment: any) {
    return {
        name: attachment.name,
        size: attachment.size,
        mimeType: attachment.mimeType,
        url: attachment.url,
    };
}

/**
 * Check if message has rich content (reactions, polls, media, etc)
 */
export async function hasRichContent(
    ctx: QueryCtx,
    messageId: Id<"chatMessages">
): Promise<boolean> {
    const reactions = await ctx.db
        .query("chatReactions")
        .withIndex("by_messageId", (q) => q.eq("messageId", messageId))
        .first();

    const poll = await getMessagePoll(ctx, messageId);
    const media = await ctx.db
        .query("chatMediaItems")
        .withIndex("by_messageId", (q) => q.eq("messageId", messageId))
        .first();

    return !!(reactions || poll || media);
}

/**
 * Get thread metadata: reply count, last reply time, participants
 */
export async function getThreadMetadata(
    ctx: QueryCtx,
    threadRootId: Id<"chatMessages">
) {
    const replies = await ctx.db
        .query("chatMessages")
        .withIndex("by_threadRootMessageId", (q) =>
            q.eq("threadRootMessageId", threadRootId)
        )
        .collect();

    const participants = new Set<Id<"users">>();
    let lastReplyTime = "";

    for (const reply of replies) {
        participants.add(reply.authorId);
        if (reply._creationTime > (lastReplyTime ? parseInt(lastReplyTime) : 0)) {
            lastReplyTime = reply._creationTime.toString();
        }
    }

    return {
        replyCount: replies.length,
        lastReplyTime,
        participantCount: participants.size,
        participants: Array.from(participants),
    };
}
