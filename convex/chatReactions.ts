import { v, ConvexError } from "convex/values";
import { mutation } from "./_generated/server";
import { requireUser } from "./accessControl";

// Toggle an emoji reaction on a message.
// Adds the reaction if the user hasn't reacted with that emoji; removes it if they have.
export const toggleReaction = mutation({
    args: {
        messageId: v.id("chatMessages"),
        emoji: v.string(),
    },
    handler: async (ctx, { messageId, emoji }) => {
        const user = await requireUser(ctx);

        const message = await ctx.db.get(messageId);
        if (!message || message.isDeleted) {
            throw new ConvexError({ code: "NOT_FOUND", message: "Message not found" });
        }

        // Look for an existing reaction from this user with this emoji
        const existing = await ctx.db
            .query("chatReactions")
            .withIndex("by_userId_messageId", (q) =>
                q.eq("userId", user._id).eq("messageId", messageId)
            )
            .filter((q) => q.eq(q.field("emoji"), emoji))
            .first();

        if (existing) {
            await ctx.db.delete(existing._id);
        } else {
            await ctx.db.insert("chatReactions", {
                messageId,
                userId: user._id,
                emoji,
            });
        }
    },
});
