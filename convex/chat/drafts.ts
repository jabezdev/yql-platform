import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { requireUser } from "../accessControl";

export const getDraft = query({
    args: { channelId: v.id("chatChannels") },
    handler: async (ctx, { channelId }) => {
        const user = await requireUser(ctx);
        const draft = await ctx.db
            .query("chatDrafts")
            .withIndex("by_userId_channelId", (q) =>
                q.eq("userId", user._id).eq("channelId", channelId)
            )
            .first();
        return draft?.body ?? "";
    },
});

export const updateDraft = mutation({
    args: {
        channelId: v.id("chatChannels"),
        body: v.string(),
    },
    handler: async (ctx, { channelId, body }) => {
        const user = await requireUser(ctx);
        
        const existing = await ctx.db
            .query("chatDrafts")
            .withIndex("by_userId_channelId", (q) =>
                q.eq("userId", user._id).eq("channelId", channelId)
            )
            .unique();

        if (existing) {
            if (body.trim() === "") {
                await ctx.db.delete(existing._id);
            } else {
                await ctx.db.patch(existing._id, {
                    body,
                    updatedAt: Date.now(),
                });
            }
        } else if (body.trim() !== "") {
            await ctx.db.insert("chatDrafts", {
                userId: user._id,
                channelId,
                body,
                updatedAt: Date.now(),
            });
        }
    },
});
