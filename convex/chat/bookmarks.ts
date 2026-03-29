import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { requireUser } from "../accessControl";

export const listBookmarks = query({
    args: {},
    handler: async (ctx) => {
        const user = await requireUser(ctx);
        const bookmarks = await ctx.db
            .query("chatBookmarks")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .order("desc")
            .collect();

        return Promise.all(
            bookmarks.map(async (b) => {
                const message = await ctx.db.get(b.messageId);
                if (!message) return null;
                const author = await ctx.db.get(message.authorId);
                const channel = await ctx.db.get(message.channelId);
                return {
                    ...b,
                    message: {
                        ...message,
                        author: author ? { _id: author._id, name: author.name } : null,
                        channelName: channel?.name ?? "Unknown",
                    },
                };
            })
        ).then((results) => results.filter((r): r is NonNullable<typeof r> => r !== null));
    },
});

export const addBookmark = mutation({
    args: {
        messageId: v.id("chatMessages"),
        note: v.optional(v.string()),
    },
    handler: async (ctx, { messageId, note }) => {
        const user = await requireUser(ctx);

        const existing = await ctx.db
            .query("chatBookmarks")
            .withIndex("by_userId_messageId", (q) =>
                q.eq("userId", user._id).eq("messageId", messageId)
            )
            .first();

        if (existing) {
            // Toggle off
            await ctx.db.delete(existing._id);
            return null;
        }

        return ctx.db.insert("chatBookmarks", {
            userId: user._id,
            messageId,
            note,
        });
    },
});

export const removeBookmark = mutation({
    args: { bookmarkId: v.id("chatBookmarks") },
    handler: async (ctx, { bookmarkId }) => {
        const user = await requireUser(ctx);
        const bookmark = await ctx.db.get(bookmarkId);
        if (!bookmark) throw new Error("Bookmark not found");
        if (bookmark.userId !== user._id) throw new Error("Not your bookmark");
        await ctx.db.delete(bookmarkId);
    },
});

export const updateBookmarkNote = mutation({
    args: {
        bookmarkId: v.id("chatBookmarks"),
        note: v.string(),
    },
    handler: async (ctx, { bookmarkId, note }) => {
        const user = await requireUser(ctx);
        const bookmark = await ctx.db.get(bookmarkId);
        if (!bookmark) throw new Error("Bookmark not found");
        if (bookmark.userId !== user._id) throw new Error("Not your bookmark");
        await ctx.db.patch(bookmarkId, { note });
    },
});
