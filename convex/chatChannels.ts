import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireUser, requireMinRole } from "./accessControl";
import type { Role } from "./roleHierarchy";
import { hasMinRole } from "./roleHierarchy";
import type { Doc, Id } from "./_generated/dataModel";

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
        await requireUser(ctx);
        return ctx.db
            .query("chatChannels")
            .withIndex("by_type", (q) => q.eq("type", "channel"))
            .collect()
            .then((channels) =>
                channels
                    .filter((c) => !c.isArchived)
                    .sort((a, b) => a.sortOrder - b.sortOrder)
            );
    },
});

export const listChildren = query({
    args: { parentId: v.id("chatChannels") },
    handler: async (ctx, { parentId }) => {
        await requireUser(ctx);
        return ctx.db
            .query("chatChannels")
            .withIndex("by_parentId", (q) => q.eq("parentId", parentId))
            .collect()
            .then((channels) =>
                channels
                    .filter((c) => !c.isArchived)
                    .sort((a, b) => a.sortOrder - b.sortOrder)
            );
    },
});

export const getChannel = query({
    args: { channelId: v.id("chatChannels") },
    handler: async (ctx, { channelId }) => {
        await requireUser(ctx);
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
        await requireUser(ctx);

        type ChannelNode = Doc<"chatChannels"> & { children: ChannelNode[] };

        const allChannels = await ctx.db
            .query("chatChannels")
            .collect()
            .then((channels) => channels.filter((c) => !c.isArchived && c.type !== "dm" && c.type !== "group_dm"));

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
