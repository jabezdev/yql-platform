import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

export const recordStatusChange = internalMutation({
    args: {
        applicationId: v.id("applications"),
        oldStatus: v.optional(v.string()),
        newStatus: v.string(),
        changedBy: v.id("users"),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("applicationStatusHistory", {
            ...args,
            timestamp: Date.now(),
        });
    },
});
