import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const updateProfile = mutation({
    args: {
        bio: v.optional(v.string()),
        favoriteShape: v.optional(v.union(v.literal("circle"), v.literal("square"), v.literal("triangle"), v.literal("hexagon"))),
        favoriteColor: v.optional(v.string()),
        techStackIcon: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated call to updateProfile");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) {
            throw new Error("User not found in database");
        }

        await ctx.db.patch(user._id, {
            ...(args.bio !== undefined && { bio: args.bio }),
            ...(args.favoriteShape !== undefined && { favoriteShape: args.favoriteShape }),
            ...(args.favoriteColor !== undefined && { favoriteColor: args.favoriteColor }),
            ...(args.techStackIcon !== undefined && { techStackIcon: args.techStackIcon }),
        });

        return true;
    },
});

export const getMyProfile = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        return user;
    },
});
