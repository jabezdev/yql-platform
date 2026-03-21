import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireStaff, requireUser, requireMinRole } from "./accessControl";
import type { Doc } from "./_generated/dataModel";
import { isManager, hasMinRole } from "./roleHierarchy";
import type { Role } from "./roleHierarchy";

const canManageTask = async (ctx: any) => {
    return await requireMinRole(ctx, "T3");
};

export const getOpenTasks = query({
    args: { status: v.optional(v.union(v.literal("open"), v.literal("in_progress"), v.literal("done"))) },
    handler: async (ctx, args) => {
        await requireStaff(ctx);
        let tasksQuery;
        if (args.status) {
            tasksQuery = ctx.db
                .query("openTasks")
                .withIndex("by_status", (q: any) => q.eq("status", args.status));
        } else {
            tasksQuery = ctx.db.query("openTasks");
        }
        const tasks = await tasksQuery.collect();

        // Enrich with assignee info
        const enriched = await Promise.all(
            tasks.map(async (task: any) => {
                const assignee = task.assignedTo ? (await ctx.db.get(task.assignedTo) as Doc<"users"> | null) : null;
                const creator = (await ctx.db.get(task.createdBy) as Doc<"users"> | null);
                return {
                    ...task,
                    assigneeName: assignee?.name ?? null,
                    creatorName: creator?.name ?? "Unknown",
                };
            })
        );

        // Sort by priority (high > medium > low), then by creation time
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        enriched.sort((a, b) => {
            const pa = priorityOrder[a.priority as keyof typeof priorityOrder];
            const pb = priorityOrder[b.priority as keyof typeof priorityOrder];
            if (pa !== pb) return pa - pb;
            return b._creationTime - a._creationTime;
        });

        return enriched;
    },
});

export const createTask = mutation({
    args: {
        title: v.string(),
        description: v.optional(v.string()),
        priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    },
    handler: async (ctx, args) => {
        const user = await canManageTask(ctx);
        return await ctx.db.insert("openTasks", {
            ...args,
            status: "open",
            createdBy: user._id,
        });
    },
});

export const updateTask = mutation({
    args: {
        taskId: v.id("openTasks"),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        status: v.optional(v.union(v.literal("open"), v.literal("in_progress"), v.literal("done"))),
        priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
        assignedTo: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        const user = await requireStaff(ctx);
        const task = await ctx.db.get(args.taskId);
        if (!task) throw new Error("Task not found");

        const isMgr = isManager(user.role as Role);
        const isAssignee = task.assignedTo?.toString() === user._id.toString();

        if (!isMgr && !isAssignee) {
            throw new Error("Insufficient permissions to update this task");
        }

        const { taskId, ...updates } = args;
        // Only managers can change title/description/priority/assignee
        if (!isMgr && (updates.title || updates.description || updates.priority || updates.assignedTo)) {
            throw new Error("Only managers can edit task details");
        }

        return await ctx.db.patch(taskId, updates);
    },
});

export const claimTask = mutation({
    args: { taskId: v.id("openTasks") },
    handler: async (ctx, args) => {
        const user = await requireStaff(ctx);
        const task = await ctx.db.get(args.taskId);
        if (!task) throw new Error("Task not found");
        if (task.assignedTo) throw new Error("Task already claimed");

        await ctx.db.insert("personalTodos", {
            userId: user._id,
            text: `Open Task: ${task.title}`,
            isCompleted: false,
            createdAt: Date.now(),
        });

        return await ctx.db.patch(args.taskId, {
            assignedTo: user._id,
            status: "in_progress",
        });
    },
});

export const unclaimTask = mutation({
    args: { taskId: v.id("openTasks") },
    handler: async (ctx, args) => {
        const user = await requireStaff(ctx);
        const task = await ctx.db.get(args.taskId);
        if (!task) throw new Error("Task not found");
        // Only the assignee or a manager can unclaim
        const canManage = isManager(user.role as Role);
        if (task.assignedTo?.toString() !== user._id.toString() && !canManage) {
            throw new Error("Cannot unclaim a task you didn't claim");
        }
        return await ctx.db.patch(args.taskId, {
            assignedTo: undefined,
            status: "open",
        });
    },
});

export const deleteTask = mutation({
    args: { taskId: v.id("openTasks") },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);
        if (!hasMinRole(user.role as Role, "T1")) {
            throw new Error("Only Super Admins or T1s can delete tasks");
        }
        return await ctx.db.delete(args.taskId);
    },
});
