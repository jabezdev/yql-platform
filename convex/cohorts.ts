import { query } from "./_generated/server";

export const getAll = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("cohorts").collect();
    }
});

export const getAvailable = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("cohorts")
            .withIndex("by_status", (q) => q.eq("status", "upcoming"))
            .collect();
    }
});
