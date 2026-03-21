import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireStaff } from "./accessControl";

export const submitHRForm = mutation({
    args: {
        formId: v.string(),
        responses: v.any(),
    },
    handler: async (ctx, args) => {
        const user = await requireStaff(ctx);
        return await ctx.db.insert("hrFormSubmissions", {
            userId: user._id,
            formId: args.formId,
            responses: args.responses,
            status: "pending",
            createdAt: Date.now(),
        });
    },
});

export const getHRSubmissions = query({
    args: {
        status: v.optional(v.union(v.literal("pending"), v.literal("reviewed"), v.literal("archived"))),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        let submissionsQuery;
        if (args.status) {
            submissionsQuery = ctx.db
                .query("hrFormSubmissions")
                .withIndex("by_status", (q) => q.eq("status", args.status as "pending" | "reviewed" | "archived"));
        } else {
            submissionsQuery = ctx.db.query("hrFormSubmissions");
        }

        const submissions = await submissionsQuery.order("desc").collect();

        // Enrich with user info
        const enriched = await Promise.all(
            submissions.map(async (s) => {
                const user = await ctx.db.get(s.userId);
                return {
                    ...s,
                    userName: user?.name ?? "Unknown User",
                    email: user?.email ?? "Unknown Email",
                };
            })
        );

        return enriched;
    },
});

export const getMyHRSubmissions = query({
    args: {},
    handler: async (ctx) => {
        const user = await requireStaff(ctx);
        return await ctx.db
            .query("hrFormSubmissions")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .order("desc")
            .collect();
    },
});

export const updateHRSubmissionStatus = mutation({
    args: {
        submissionId: v.id("hrFormSubmissions"),
        status: v.union(v.literal("pending"), v.literal("reviewed"), v.literal("archived")),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        return await ctx.db.patch(args.submissionId, { status: args.status });
    },
});
