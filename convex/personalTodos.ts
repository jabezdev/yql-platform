import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./accessControl";

export const listPersonalTodos = query({
    args: {},
    handler: async (ctx) => {
        const user = await requireUser(ctx);
        return await ctx.db
            .query("personalTodos")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .order("desc")
            .collect();
    },
});

export const createPersonalTodo = mutation({
    args: { text: v.string() },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);
        return await ctx.db.insert("personalTodos", {
            userId: user._id,
            text: args.text,
            isCompleted: false,
            createdAt: Date.now(),
        });
    },
});

export const togglePersonalTodo = mutation({
    args: { todoId: v.id("personalTodos") },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);
        const todo = await ctx.db.get(args.todoId);
        if (!todo || todo.userId.toString() !== user._id.toString()) {
            throw new Error("Todo not found or unauthorized");
        }
        return await ctx.db.patch(args.todoId, {
            isCompleted: !todo.isCompleted,
        });
    },
});

export const deletePersonalTodo = mutation({
    args: { todoId: v.id("personalTodos") },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);
        const todo = await ctx.db.get(args.todoId);
        if (!todo || todo.userId.toString() !== user._id.toString()) {
            throw new Error("Todo not found or unauthorized");
        }
        return await ctx.db.delete(args.todoId);
    },
});
