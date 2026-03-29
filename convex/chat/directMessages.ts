import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { requireUser } from "../accessControl";

// ── Queries ───────────────────────────────────────────────────────────────────

export const listMyDMs = query({
    args: {},
    handler: async (ctx) => {
        const user = await requireUser(ctx);

        const memberships = await ctx.db
            .query("chatChannelMembers")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .collect();

        const dmChannels = await Promise.all(
            memberships.map(async (m) => {
                const channel = await ctx.db.get(m.channelId);
                if (!channel || (channel.type !== "dm" && channel.type !== "group_dm")) return null;

                const allMembers = await ctx.db
                    .query("chatChannelMembers")
                    .withIndex("by_channelId", (q) => q.eq("channelId", channel._id))
                    .collect();

                const participants = await Promise.all(
                    allMembers.map(async (mem) => {
                        const u = await ctx.db.get(mem.userId);
                        return u
                            ? { _id: u._id, name: u.name, profileChip: u.profileChip ?? null }
                            : null;
                    })
                );

                const lastMessage = await ctx.db
                    .query("chatMessages")
                    .withIndex("by_channelId", (q) => q.eq("channelId", channel._id))
                    .order("desc")
                    .first();

                const validParticipants = participants.filter((p): p is NonNullable<typeof p> => p !== null);

                // For 1-on-1 DMs, always derive the display name from the live participant
                // records so it stays fresh if a user renames themselves.
                let displayName = channel.name;
                if (channel.type === "dm") {
                    const other = validParticipants.find((p) => p._id !== user._id);
                    if (other) displayName = other.name;
                }

                return {
                    ...channel,
                    name: displayName,
                    participants: validParticipants,
                    lastMessage: lastMessage
                        ? {
                              bodyPlainText: lastMessage.bodyPlainText,
                              _creationTime: lastMessage._creationTime,
                              authorId: lastMessage.authorId,
                          }
                        : null,
                    myMembership: m,
                };
            })
        );

        return dmChannels
            .filter((c): c is NonNullable<typeof c> => c !== null)
            .sort((a, b) => {
                const aTime = a.lastMessage?._creationTime ?? a._creationTime;
                const bTime = b.lastMessage?._creationTime ?? b._creationTime;
                return bTime - aTime;
            });
    },
});

// ── Mutations ─────────────────────────────────────────────────────────────────

/**
 * Get an existing 1-on-1 DM or create a new one.
 * DMs are deduplicated via a sorted `dmKey` index.
 */
export const getOrCreateDM = mutation({
    args: { targetUserId: v.id("users") },
    handler: async (ctx, { targetUserId }) => {
        const user = await requireUser(ctx);
        if (user._id === targetUserId) throw new Error("Cannot DM yourself");

        const target = await ctx.db.get(targetUserId);
        if (!target) throw new Error("Target user not found");

        // dmKey = sorted IDs joined by ":" for deduplication
        const dmKey = [user._id, targetUserId].sort().join(":");

        const existing = await ctx.db
            .query("chatChannels")
            .withIndex("by_dmKey", (q) => q.eq("dmKey", dmKey))
            .first();

        if (existing) return existing._id;

        const channelId = await ctx.db.insert("chatChannels", {
            name: `${user.name}, ${target.name}`,
            type: "dm",
            createdBy: user._id,
            isArchived: false,
            dmKey,
            sortOrder: 0,
        });

        await ctx.db.insert("chatChannelMembers", {
            channelId,
            userId: user._id,
            joinedAt: Date.now(),
            role: "member",
            isMuted: false,
        });

        await ctx.db.insert("chatChannelMembers", {
            channelId,
            userId: targetUserId,
            joinedAt: Date.now(),
            role: "member",
            isMuted: false,
        });

        return channelId;
    },
});

/**
 * Create a group DM with 3+ participants (including the creator).
 */
export const createGroupDM = mutation({
    args: {
        participantIds: v.array(v.id("users")),
        name: v.optional(v.string()),
    },
    handler: async (ctx, { participantIds, name }) => {
        const user = await requireUser(ctx);

        const uniqueOthers = [...new Set(participantIds.filter((id) => id !== user._id))];
        if (uniqueOthers.length < 2) throw new Error("Group DM requires at least 3 participants");

        const others = await Promise.all(uniqueOthers.map((id) => ctx.db.get(id)));
        if (others.some((u) => !u)) throw new Error("One or more users not found");

        const validOthers = others.filter((u): u is NonNullable<typeof u> => u !== null);
        const allParticipants = [user, ...validOthers];
        const dmName = name ?? allParticipants.map((u) => u.name.split(" ")[0]).join(", ");

        const channelId = await ctx.db.insert("chatChannels", {
            name: dmName,
            type: "group_dm",
            createdBy: user._id,
            isArchived: false,
            sortOrder: 0,
        });

        for (const uid of [user._id, ...uniqueOthers]) {
            await ctx.db.insert("chatChannelMembers", {
                channelId,
                userId: uid,
                joinedAt: Date.now(),
                role: uid === user._id ? "owner" : "member",
                isMuted: false,
            });
        }

        return channelId;
    },
});

/**
 * Add a participant to a group DM. Caller must already be a member.
 */
export const addParticipant = mutation({
    args: {
        channelId: v.id("chatChannels"),
        userId: v.id("users"),
    },
    handler: async (ctx, { channelId, userId }) => {
        const currentUser = await requireUser(ctx);

        const channel = await ctx.db.get(channelId);
        if (!channel || channel.type !== "group_dm") throw new Error("Not a group DM");

        const myMembership = await ctx.db
            .query("chatChannelMembers")
            .withIndex("by_channel_user", (q) =>
                q.eq("channelId", channelId).eq("userId", currentUser._id)
            )
            .first();
        if (!myMembership) throw new Error("You are not in this group DM");

        const existing = await ctx.db
            .query("chatChannelMembers")
            .withIndex("by_channel_user", (q) =>
                q.eq("channelId", channelId).eq("userId", userId)
            )
            .first();
        if (existing) return existing._id;

        const newUser = await ctx.db.get(userId);
        if (!newUser) throw new Error("User not found");

        const id = await ctx.db.insert("chatChannelMembers", {
            channelId,
            userId,
            joinedAt: Date.now(),
            role: "member",
            isMuted: false,
        });

        await ctx.db.insert("chatMessages", {
            channelId,
            authorId: currentUser._id,
            body: "",
            bodyPlainText: `${currentUser.name} added ${newUser.name}`,
            isEdited: false,
            isDeleted: false,
            isPinned: false,
            isSystem: true,
            systemType: "member_added",
        });

        return id;
    },
});

/**
 * Leave a group DM. Cannot leave 1-on-1 DMs (they just become inactive).
 */
export const leaveGroupDM = mutation({
    args: { channelId: v.id("chatChannels") },
    handler: async (ctx, { channelId }) => {
        const user = await requireUser(ctx);

        const channel = await ctx.db.get(channelId);
        if (!channel || channel.type !== "group_dm") throw new Error("Not a group DM");

        const membership = await ctx.db
            .query("chatChannelMembers")
            .withIndex("by_channel_user", (q) =>
                q.eq("channelId", channelId).eq("userId", user._id)
            )
            .first();
        if (!membership) throw new Error("You are not in this group DM");

        await ctx.db.delete(membership._id);

        await ctx.db.insert("chatMessages", {
            channelId,
            authorId: user._id,
            body: "",
            bodyPlainText: `${user.name} left the conversation`,
            isEdited: false,
            isDeleted: false,
            isPinned: false,
            isSystem: true,
            systemType: "member_left",
        });
    },
});
