import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Store or update the user in the Convex database.
 * This should be called by the client upon authentication.
 */
export const storeUser = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Called storeUser without authentication present");
        }

        // Check if we've already stored this identity before.
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();

        if (user !== null) {
            // If the user exists in Clerk but their info changed, we update our copy
            if (user.name !== identity.name || user.email !== identity.email) {
                await ctx.db.patch(user._id, {
                    name: identity.name ?? "Anonymous",
                    email: identity.email ?? "no-email@example.com",
                });
            }
            return user._id;
        }

        // Try finding by email
        if (identity.email) {
            const userByEmail = await ctx.db
                .query("users")
                .withIndex("by_email", (q) => q.eq("email", identity.email!))
                .first();

            if (userByEmail !== null) {
                // Link clerkId to existing user
                await ctx.db.patch(userByEmail._id, {
                    clerkId: identity.subject,
                    name: identity.name ?? userByEmail.name,
                });
                return userByEmail._id;
            }
        }

        // If it's a new identity, create a new `User`.
        return await ctx.db.insert("users", {
            clerkId: identity.subject,
            name: identity.name ?? "Anonymous",
            email: identity.email ?? "no-email@example.com",
            role: "Applicant", // Default Role
        });
    },
});

/**
 * Fetch the currently authenticated user's profile from the database.
 */
export const getCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            return null;
        }

        const clerkId = identity.subject;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
            .first();

        if (!user) return null;

        const profileChipUrl = user.profileChip
            ? await ctx.storage.getUrl(user.profileChip)
            : null;

        return { ...user, profileChipUrl };
    },
});

/**
 * Generate a short-lived upload URL for uploading a profile chip image.
 */
export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");
        return await ctx.storage.generateUploadUrl();
    },
});

/**
 * Save a newly uploaded profile chip storage ID to the current user.
 */
export const saveProfileChip = mutation({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, { storageId }) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();
        if (!user) throw new Error("User not found");
        await ctx.db.patch(user._id, { profileChip: storageId });
    },
});

/**
 * Update the current user's profile bio.
 */
export const updateProfile = mutation({
    args: { bio: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();
        if (!user) throw new Error("User not found");
        await ctx.db.patch(user._id, { bio: args.bio ?? "" });
    },
});

/**
 * Fetch all non-Applicant users with resolved profile chip URLs for the directory.
 */
export const getDirectory = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const users = await ctx.db.query("users").collect();
        const staff = users.filter((u) => u.role !== "Applicant");

        return await Promise.all(
            staff.map(async (u) => ({
                ...u,
                profileChipUrl: u.profileChip
                    ? await ctx.storage.getUrl(u.profileChip)
                    : null,
            }))
        );
    },
});
