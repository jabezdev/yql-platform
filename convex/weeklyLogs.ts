import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireStaff } from "./accessControl";

/** Get Monday of the week containing the given timestamp */
function getMondayOf(ts: number): number {
    const d = new Date(ts);
    const day = d.getUTCDay(); // 0 = Sunday
    const diff = (day === 0 ? -6 : 1 - day);
    d.setUTCDate(d.getUTCDate() + diff);
    d.setUTCHours(0, 0, 0, 0);
    return d.getTime();
}

export const getMyLog = query({
    args: { weekOf: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const user = await requireStaff(ctx);
        const weekOf = args.weekOf ?? getMondayOf(Date.now());
        return await ctx.db
            .query("weeklyLogs")
            .withIndex("by_user_weekOf", (q) =>
                q.eq("userId", user._id).eq("weekOf", weekOf)
            )
            .first();
    },
});

export const getMyLogsHistory = query({
    args: {},
    handler: async (ctx) => {
        const user = await requireStaff(ctx);
        const logs = await ctx.db
            .query("weeklyLogs")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();
        // Sort by weekOf descending
        return logs.sort((a, b) => b.weekOf - a.weekOf);
    },
});

export const getLogsForReview = query({
    args: { weekOf: v.optional(v.number()) },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        const weekOf = args.weekOf ?? getMondayOf(Date.now());
        const logs = await ctx.db
            .query("weeklyLogs")
            .withIndex("by_weekOf", (q) => q.eq("weekOf", weekOf))
            .collect();

        // Enrich with user info
        const enriched = await Promise.all(
            logs.map(async (log) => {
                const logUser = await ctx.db.get(log.userId);
                return { ...log, userName: logUser?.name ?? "Unknown" };
            })
        );
        return enriched;
    },
});

export const getAllDisplayedLogs = query({
    args: {},
    handler: async (ctx) => {
        await requireStaff(ctx);
        const logs = await ctx.db.query("weeklyLogs").collect();
        const displayed = logs.filter((l) => l.isDisplayed);
        const enriched = await Promise.all(
            displayed.map(async (log) => {
                const logUser = await ctx.db.get(log.userId);
                return { ...log, userName: logUser?.name ?? "Unknown" };
            })
        );
        enriched.sort((a, b) => b.weekOf - a.weekOf);
        return enriched;
    },
});

export const submitLog = mutation({
    args: {
        weekOf: v.optional(v.number()),
        summary: v.string(),
        highlights: v.optional(v.string()),
        challenges: v.optional(v.string()),
        hoursLogged: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const user = await requireStaff(ctx);
        const weekOf = args.weekOf ?? getMondayOf(Date.now());

        const existing = await ctx.db
            .query("weeklyLogs")
            .withIndex("by_user_weekOf", (q) =>
                q.eq("userId", user._id).eq("weekOf", weekOf)
            )
            .first();

        const data = {
            userId: user._id,
            weekOf,
            summary: args.summary,
            highlights: args.highlights,
            challenges: args.challenges,
            hoursLogged: args.hoursLogged,
            isApproved: false,
            isDisplayed: false,
        };

        if (existing) {
            return await ctx.db.patch(existing._id, data);
        }
        return await ctx.db.insert("weeklyLogs", data);
    },
});

export const reviewLog = mutation({
    args: {
        logId: v.id("weeklyLogs"),
        isApproved: v.boolean(),
        isDisplayed: v.boolean(),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        const { logId, ...updates } = args;
        return await ctx.db.patch(logId, updates);
    },
});
