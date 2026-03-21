import { v, ConvexError } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireUser } from "./accessControl";

// ── Queries ──────────────────────────────────────────────────────────────────

// Get a poll with aggregated vote counts and the current user's votes.
export const getPollWithVotes = query({
    args: { pollId: v.id("chatPolls") },
    handler: async (ctx, { pollId }) => {
        const user = await requireUser(ctx);

        const poll = await ctx.db.get(pollId);
        if (!poll) return null;

        const votes = await ctx.db
            .query("chatPollVotes")
            .withIndex("by_pollId", (q) => q.eq("pollId", pollId))
            .collect();

        // Count votes per option
        const voteCounts: Record<string, number> = {};
        for (const opt of poll.options) {
            voteCounts[opt.id] = 0;
        }
        for (const vote of votes) {
            voteCounts[vote.optionId] = (voteCounts[vote.optionId] ?? 0) + 1;
        }

        const myVotes = votes
            .filter((v) => v.userId === user._id)
            .map((v) => v.optionId);

        return {
            ...poll,
            voteCounts,
            totalVotes: votes.length,
            myVotes,
        };
    },
});

// ── Mutations ─────────────────────────────────────────────────────────────────

// Create a poll. Inserts both a chatMessages record and a chatPolls record.
export const createPoll = mutation({
    args: {
        channelId: v.id("chatChannels"),
        threadRootMessageId: v.optional(v.id("chatMessages")),
        question: v.string(),
        options: v.array(v.object({ id: v.string(), text: v.string() })),
        allowMultipleVotes: v.boolean(),
        isAnonymous: v.boolean(),
    },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);

        if (args.question.trim().length === 0) {
            throw new ConvexError({ code: "BAD_REQUEST", message: "Poll question cannot be empty" });
        }
        if (args.options.length < 2) {
            throw new ConvexError({ code: "BAD_REQUEST", message: "A poll needs at least 2 options" });
        }

        // Create the host message (empty body — the poll UI is the content)
        const pollBody = JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] });

        const messageId = await ctx.db.insert("chatMessages", {
            channelId: args.channelId,
            authorId: user._id,
            body: pollBody,
            bodyPlainText: `📊 Poll: ${args.question}`,
            threadRootMessageId: args.threadRootMessageId,
            isEdited: false,
            isDeleted: false,
            isPinned: false,
        });

        const pollId = await ctx.db.insert("chatPolls", {
            messageId,
            channelId: args.channelId,
            question: args.question,
            options: args.options,
            allowMultipleVotes: args.allowMultipleVotes,
            isAnonymous: args.isAnonymous,
            createdBy: user._id,
        });

        // Update thread counters if this poll is a thread reply
        if (args.threadRootMessageId) {
            const root = await ctx.db.get(args.threadRootMessageId);
            if (root) {
                await ctx.db.patch(args.threadRootMessageId, {
                    threadReplyCount: (root.threadReplyCount || 0) + 1,
                    threadLastReplyAt: Date.now(),
                });
            }
        }

        return { messageId, pollId };
    },
});

// Toggle a vote on a poll option.
// Single-vote polls: replaces any existing vote. Multi-vote polls: toggles independently.
export const vote = mutation({
    args: {
        pollId: v.id("chatPolls"),
        optionId: v.string(),
    },
    handler: async (ctx, { pollId, optionId }) => {
        const user = await requireUser(ctx);

        const poll = await ctx.db.get(pollId);
        if (!poll) throw new ConvexError({ code: "NOT_FOUND", message: "Poll not found" });
        if (poll.closedAt) throw new ConvexError({ code: "FORBIDDEN", message: "This poll is closed" });

        // Validate option exists
        const validOption = poll.options.some((o) => o.id === optionId);
        if (!validOption) throw new ConvexError({ code: "BAD_REQUEST", message: "Invalid option" });

        // Check if the user already voted for this specific option
        const existingVote = await ctx.db
            .query("chatPollVotes")
            .withIndex("by_pollId_userId", (q) =>
                q.eq("pollId", pollId).eq("userId", user._id)
            )
            .filter((q) => q.eq(q.field("optionId"), optionId))
            .first();

        if (existingVote) {
            // Toggle off
            await ctx.db.delete(existingVote._id);
        } else {
            if (!poll.allowMultipleVotes) {
                // Remove any existing vote from this user before adding the new one
                const previousVote = await ctx.db
                    .query("chatPollVotes")
                    .withIndex("by_pollId_userId", (q) =>
                        q.eq("pollId", pollId).eq("userId", user._id)
                    )
                    .first();
                if (previousVote) await ctx.db.delete(previousVote._id);
            }

            await ctx.db.insert("chatPollVotes", {
                pollId,
                userId: user._id,
                optionId,
            });
        }
    },
});

// Close a poll (creator or T3+ only).
export const closePoll = mutation({
    args: { pollId: v.id("chatPolls") },
    handler: async (ctx, { pollId }) => {
        const user = await requireUser(ctx);

        const poll = await ctx.db.get(pollId);
        if (!poll) throw new ConvexError({ code: "NOT_FOUND", message: "Poll not found" });
        if (poll.closedAt) throw new ConvexError({ code: "BAD_REQUEST", message: "Poll is already closed" });

        const isCreator = poll.createdBy === user._id;
        const isManager = user.role === "T1" || user.role === "T2" || user.role === "T3" || user.role === "Super Admin";
        if (!isCreator && !isManager) {
            throw new ConvexError({ code: "FORBIDDEN", message: "Only the creator or a manager can close this poll" });
        }

        await ctx.db.patch(pollId, { closedAt: Date.now() });
    },
});
