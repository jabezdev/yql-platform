import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { requireUser } from "./accessControl";
import { assertCanReadChannel } from "./chat/lib/access";

const TYPING_EXPIRY_MS = 8000; // 8 seconds — client re-sends every ~4s

// Set (or refresh) the current user's typing indicator in a channel.
export const setTyping = mutation({
    args: { channelId: v.id("chatChannels") },
    handler: async (ctx, { channelId }) => {
        const user = await requireUser(ctx);
        await assertCanReadChannel(ctx, user, channelId);
        const expiresAt = Date.now() + TYPING_EXPIRY_MS;

        // Upsert: update existing row or insert a new one
        const existing = await ctx.db
            .query("chatTypingIndicators")
            .withIndex("by_channelId", (q) => q.eq("channelId", channelId))
            .filter((q) => q.eq(q.field("userId"), user._id))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, { expiresAt });
        } else {
            await ctx.db.insert("chatTypingIndicators", {
                channelId,
                userId: user._id,
                expiresAt,
            });
        }
    },
});

// Clear the current user's typing indicator (called on send or blur).
export const clearTyping = mutation({
    args: { channelId: v.id("chatChannels") },
    handler: async (ctx, { channelId }) => {
        const user = await requireUser(ctx);
        await assertCanReadChannel(ctx, user, channelId);

        const existing = await ctx.db
            .query("chatTypingIndicators")
            .withIndex("by_channelId", (q) => q.eq("channelId", channelId))
            .filter((q) => q.eq(q.field("userId"), user._id))
            .first();

        if (existing) await ctx.db.delete(existing._id);
    },
});

// Return names of users currently typing in a channel (excluding the caller).
export const getTyping = query({
    args: { channelId: v.id("chatChannels") },
    handler: async (ctx, { channelId }) => {
        const user = await requireUser(ctx);
        await assertCanReadChannel(ctx, user, channelId);
        const now = Date.now();

        const indicators = await ctx.db
            .query("chatTypingIndicators")
            .withIndex("by_channelId", (q) => q.eq("channelId", channelId))
            .collect();

        const active = indicators.filter(
            (t) => t.expiresAt > now && t.userId !== user._id
        );

        const names = await Promise.all(
            active.map(async (t) => {
                const u = await ctx.db.get(t.userId);
                return u?.name ?? "Someone";
            })
        );

        return names;
    },
});

// Cron target: delete all expired typing indicators.
export const cleanupExpired = internalMutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        const expired = await ctx.db
            .query("chatTypingIndicators")
            .withIndex("by_expiresAt", (q) => q.lt("expiresAt", now))
            .collect();

        await Promise.all(expired.map((t) => ctx.db.delete(t._id)));
    },
});
