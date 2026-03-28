import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireUser, requireMinRole } from "./accessControl";
import type { Role } from "./roleHierarchy";
import { hasMinRole } from "./roleHierarchy";
import type { Doc, Id } from "./_generated/dataModel";
import { assertCanReadChannel, getVisibleChannels } from "./chat/lib/access";

const channelTypes = v.union(
    v.literal("channel"),
    v.literal("subchannel"),
    v.literal("group"),
    v.literal("sidechat"),
);

// ── Queries ──────────────────────────────────────────────────────────────────

export const listTopLevelChannels = query({
    args: {},
    handler: async (ctx) => {
        const user = await requireUser(ctx);
        const channels = await getVisibleChannels(ctx, user._id);
        return channels
            .filter((c) => c.type === "channel")
            .sort((a, b) => a.sortOrder - b.sortOrder);
    },
});

export const listChildren = query({
    args: { parentId: v.id("chatChannels") },
    handler: async (ctx, { parentId }) => {
        const user = await requireUser(ctx);
        await assertCanReadChannel(ctx, user, parentId);
        const visibleChannels = await getVisibleChannels(ctx, user._id);
        const visibleIds = new Set(visibleChannels.map((c) => c._id));

        return ctx.db
            .query("chatChannels")
            .withIndex("by_parentId", (q) => q.eq("parentId", parentId))
            .collect()
            .then((channels) =>
                channels
                    .filter((c) => !c.isArchived && visibleIds.has(c._id))
                    .sort((a, b) => a.sortOrder - b.sortOrder)
            );
    },
});

export const getChannel = query({
    args: { channelId: v.id("chatChannels") },
    handler: async (ctx, { channelId }) => {
        const user = await requireUser(ctx);
        await assertCanReadChannel(ctx, user, channelId);
        const channel = await ctx.db.get(channelId);
        if (!channel) return null;

        const members = await ctx.db
            .query("chatChannelMembers")
            .withIndex("by_channelId", (q) => q.eq("channelId", channelId))
            .collect();

        return { ...channel, memberCount: members.length };
    },
});

export const getChannelTree = query({
    args: {},
    handler: async (ctx) => {
        const user = await requireUser(ctx);

        type ChannelNode = Doc<"chatChannels"> & { children: ChannelNode[] };

        const allChannels = await getVisibleChannels(ctx, user._id);

        // Build tree: top-level channels with nested children
        const topLevel = allChannels
            .filter((c) => c.type === "channel")
            .sort((a, b) => a.sortOrder - b.sortOrder);

        function getChildren(parentId: Id<"chatChannels">): ChannelNode[] {
            return allChannels
                .filter((c) => c.parentId === parentId)
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((child) => ({
                    ...child,
                    children: getChildren(child._id),
                }));
        }

        return topLevel.map((channel) => ({
            ...channel,
            children: getChildren(channel._id),
        }));
    },
});

// ── Mutations ────────────────────────────────────────────────────────────────

export const createChannel = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        type: channelTypes,
        parentId: v.optional(v.id("chatChannels")),
        icon: v.optional(v.string()),
        // Phase 1: Private/gated channels
        isPrivate: v.optional(v.boolean()),
        requiresApproval: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);

        // Only T3+ can create channels/subchannels/groups; anyone staff can create sidechats
        if (args.type === "sidechat") {
            if (!hasMinRole(user.role as Role, "T5")) {
                throw new Error("Staff access required to create sidechats");
            }
        } else {
            if (!hasMinRole(user.role as Role, "T3")) {
                throw new Error("Manager access required to create channels");
            }
        }

        // Validate parent hierarchy
        if (args.parentId) {
            const parent = await ctx.db.get(args.parentId);
            if (!parent) throw new Error("Parent channel not found");
            if (parent.isArchived) throw new Error("Cannot create under archived channel");
        } else if (args.type !== "channel") {
            throw new Error("Only top-level channels can omit parentId");
        }

        // Determine sort order
        const siblings = args.parentId
            ? await ctx.db
                .query("chatChannels")
                .withIndex("by_parentId", (q) => q.eq("parentId", args.parentId!))
                .collect()
            : await ctx.db
                .query("chatChannels")
                .withIndex("by_type", (q) => q.eq("type", "channel"))
                .collect();

        const maxOrder = siblings.reduce((max, c) => Math.max(max, c.sortOrder), -1);

        const channelId = await ctx.db.insert("chatChannels", {
            name: args.name,
            description: args.description,
            type: args.type,
            parentId: args.parentId,
            createdBy: user._id,
            isArchived: false,
            sortOrder: maxOrder + 1,
            icon: args.icon,
            isPrivate: args.isPrivate ?? false,
            requiresApproval: args.requiresApproval ?? false,
        });

        // Creator becomes owner
        await ctx.db.insert("chatChannelMembers", {
            channelId,
            userId: user._id,
            joinedAt: Date.now(),
            role: "owner",
            isMuted: false,
        });

        return channelId;
    },
});

export const updateChannel = mutation({
    args: {
        channelId: v.id("chatChannels"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        topic: v.optional(v.string()),
        icon: v.optional(v.string()),
    },
    handler: async (ctx, { channelId, ...updates }) => {
        const user = await requireMinRole(ctx, "T3");
        const channel = await ctx.db.get(channelId);
        if (!channel) throw new Error("Channel not found");

        const patch: Record<string, any> = {};
        if (updates.name !== undefined) patch.name = updates.name;
        if (updates.description !== undefined) patch.description = updates.description;
        if (updates.topic !== undefined) patch.topic = updates.topic;
        if (updates.icon !== undefined) patch.icon = updates.icon;

        await ctx.db.patch(channelId, patch);

        // System message for topic changes
        if (updates.topic !== undefined && updates.topic !== channel.topic) {
            await ctx.db.insert("chatMessages", {
                channelId,
                authorId: user._id,
                body: "",
                bodyPlainText: `${user.name} changed the topic to: ${updates.topic}`,
                isEdited: false,
                isDeleted: false,
                isPinned: false,
                isSystem: true,
                systemType: "topic_changed",
            });
        }
    },
});

export const archiveChannel = mutation({
    args: { channelId: v.id("chatChannels") },
    handler: async (ctx, { channelId }) => {
        await requireMinRole(ctx, "T3");
        const channel = await ctx.db.get(channelId);
        if (!channel) throw new Error("Channel not found");
        await ctx.db.patch(channelId, { isArchived: true });
    },
});

export const reorderChannels = mutation({
    args: {
        updates: v.array(v.object({
            channelId: v.id("chatChannels"),
            sortOrder: v.number(),
        })),
    },
    handler: async (ctx, { updates }) => {
        await requireMinRole(ctx, "T3");
        for (const { channelId, sortOrder } of updates) {
            await ctx.db.patch(channelId, { sortOrder });
        }
    },
});

// ═════════════════════════════════════════════════════════════════════════
// PHASE 1: Lazy-Load Channel Tree (Performance)
// ═════════════════════════════════════════════════════════════════════════

/**
 * Get channel tree as flat list with parent pointers (for lazy-loading).
 * Returns: flat list of channels + parent relationships, not nested tree.
 * This avoids O(n²) tree building on first load; UI can build tree client-side.
 */
export const getChannelTreeFlat = query({
    args: {},
    handler: async (ctx) => {
        const user = await requireUser(ctx);
        const channels = await getVisibleChannels(ctx, user._id);

        // Sort by sortOrder for each level
        return channels.sort((a, b) => a.sortOrder - b.sortOrder);
    },
});

/**
 * List top-level channels with pagination support.
 * Useful when many channels exist (>50).
 */
export const listTopLevelChannelsPaginated = query({
    args: { paginationOpts: v.optional(v.object({ maxItems: v.number(), cursor: v.optional(v.string()) })) },
    handler: async (ctx, { paginationOpts }) => {
        const user = await requireUser(ctx);

        const opts = paginationOpts || { maxItems: 20 };

        const allChannels = (await getVisibleChannels(ctx, user._id))
            .filter((c) => c.type === "channel")
            .sort((a, b) => a.sortOrder - b.sortOrder);

        // Simple pagination: use cursor as offset index
        const cursor = opts.cursor ? parseInt(opts.cursor, 10) : 0;
        const page = allChannels.slice(cursor, cursor + opts.maxItems);
        const nextCursor = cursor + opts.maxItems < allChannels.length ? (cursor + opts.maxItems).toString() : null;

        return { page, cursor: nextCursor };
    },
});

// ═════════════════════════════════════════════════════════════════════════
// PHASE 1: Private & Gated Channels
// ═════════════════════════════════════════════════════════════════════════

/**
 * Create a private channel (only owners/invited can see/join).
 */
export const createPrivateChannel = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        requiresApproval: v.optional(v.boolean()),
        icon: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await requireMinRole(ctx, "T3");

        // Determine sort order
        const siblings = await ctx.db
            .query("chatChannels")
            .withIndex("by_type", (q) => q.eq("type", "channel"))
            .collect();
        const maxOrder = siblings.reduce((max, c) => Math.max(max, c.sortOrder), -1);

        const channelId = await ctx.db.insert("chatChannels", {
            name: args.name,
            description: args.description,
            type: "channel",
            createdBy: user._id,
            isArchived: false,
            sortOrder: maxOrder + 1,
            icon: args.icon,
            isPrivate: true,
            requiresApproval: args.requiresApproval ?? false,
        });

        // Creator becomes owner
        await ctx.db.insert("chatChannelMembers", {
            channelId,
            userId: user._id,
            joinedAt: Date.now(),
            role: "owner",
            isMuted: false,
        });

        return channelId;
    },
});

/**
 * Request to join a gated channel (for channels with requiresApproval=true).
 */
export const requestJoinChannel = mutation({
    args: {
        channelId: v.id("chatChannels"),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, { channelId, reason }) => {
        const user = await requireUser(ctx);
        const channel = await ctx.db.get(channelId);

        if (!channel) throw new Error("Channel not found");

        // Check if already a member
        const existing = await ctx.db
            .query("chatChannelMembers")
            .withIndex("by_channel_user", (q) => q.eq("channelId", channelId).eq("userId", user._id))
            .first();

        if (existing) throw new Error("Already a member of this channel");

        // Check if already has a pending request
        const existingRequest = await ctx.db
            .query("chatChannelJoinRequests")
            .withIndex("by_channelId_userId", (q) => q.eq("channelId", channelId).eq("userId", user._id))
            .first();

        if (existingRequest && existingRequest.status === "pending") {
            throw new Error("Request already pending");
        }

        // Create join request
        const requestId = await ctx.db.insert("chatChannelJoinRequests", {
            channelId,
            userId: user._id,
            status: "pending",
            requestedAt: Date.now(),
            reason,
        });

        return requestId;
    },
});

/**
 * List pending join requests for a channel (owner-gated).
 */
export const listJoinRequests = query({
    args: { channelId: v.id("chatChannels") },
    handler: async (ctx, { channelId }) => {
        const user = await requireUser(ctx);

        // Verify user is owner/admin
        const membership = await ctx.db
            .query("chatChannelMembers")
            .withIndex("by_channel_user", (q) => q.eq("channelId", channelId).eq("userId", user._id))
            .first();

        if (!membership || !["owner", "admin"].includes(membership.role)) {
            throw new Error("Only channel owners/admins can view join requests");
        }

        const requests = await ctx.db
            .query("chatChannelJoinRequests")
            .withIndex("by_channelId_status", (q) =>
                q.eq("channelId", channelId).eq("status", "pending")
            )
            .collect();

        // Enrich with user info
        return Promise.all(
            requests.map(async (req) => {
                const u = await ctx.db.get(req.userId);
                return {
                    ...req,
                    user: u ? { _id: u._id, name: u.name, email: u.email, role: u.role } : null,
                };
            })
        );
    },
});

/**
 * Approve a join request (owner-gated).
 */
export const approveJoinRequest = mutation({
    args: { requestId: v.id("chatChannelJoinRequests") },
    handler: async (ctx, { requestId }) => {
        const user = await requireUser(ctx);
        const request = await ctx.db.get(requestId);

        if (!request) throw new Error("Request not found");

        // Verify user is owner/admin
        const membership = await ctx.db
            .query("chatChannelMembers")
            .withIndex("by_channel_user", (q) =>
                q.eq("channelId", request.channelId).eq("userId", user._id)
            )
            .first();

        if (!membership || !["owner", "admin"].includes(membership.role)) {
            throw new Error("Only channel owners/admins can approve requests");
        }

        // Update request status
        await ctx.db.patch(requestId, {
            status: "approved",
            respondedAt: Date.now(),
            respondedBy: user._id,
        });

        // Add user to channel
        await ctx.db.insert("chatChannelMembers", {
            channelId: request.channelId,
            userId: request.userId,
            joinedAt: Date.now(),
            role: "member",
            isMuted: false,
        });
    },
});

/**
 * Reject a join request (owner-gated).
 */
export const rejectJoinRequest = mutation({
    args: { requestId: v.id("chatChannelJoinRequests"), reason: v.optional(v.string()) },
    handler: async (ctx, { requestId, reason }) => {
        const user = await requireUser(ctx);
        const request = await ctx.db.get(requestId);

        if (!request) throw new Error("Request not found");

        // Verify user is owner/admin
        const membership = await ctx.db
            .query("chatChannelMembers")
            .withIndex("by_channel_user", (q) =>
                q.eq("channelId", request.channelId).eq("userId", user._id)
            )
            .first();

        if (!membership || !["owner", "admin"].includes(membership.role)) {
            throw new Error("Only channel owners/admins can reject requests");
        }

        // Update request status
        await ctx.db.patch(requestId, {
            status: "rejected",
            respondedAt: Date.now(),
            respondedBy: user._id,
            reason,
        });
    },
});
