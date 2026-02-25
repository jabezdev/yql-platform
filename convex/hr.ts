import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Fetch all Staff and Admins for the HR Directory.
 */
export const getAllStaff = query({
    args: {},
    handler: async (ctx) => {
        // Find everyone with role "Staff" or "Admin"
        const staff = await ctx.db
            .query("users")
            .withIndex("by_role", (q) => q.eq("role", "Staff"))
            .collect();
        const admins = await ctx.db
            .query("users")
            .withIndex("by_role", (q) => q.eq("role", "Admin"))
            .collect();

        return [...staff, ...admins];
    },
});

/**
 * Switch a user's role or subRole (Admin only)
 */
export const updateStaffRole = mutation({
    args: {
        userId: v.id("users"),
        role: v.optional(v.union(v.literal("Applicant"), v.literal("Staff"), v.literal("Admin"))),
        staffSubRole: v.optional(v.union(v.literal("Regular"), v.literal("Reviewer"), v.literal("Alumni"))),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const admin = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();

        if (!admin || admin.role !== "Admin") {
            throw new Error("Unauthorized");
        }

        const updates: any = {};
        if (args.role !== undefined) updates.role = args.role;
        if (args.staffSubRole !== undefined) updates.staffSubRole = args.staffSubRole;

        await ctx.db.patch(args.userId, updates);
    },
});

/**
 * Fetch users with a specific recommitment status
 */
export const getUsersByRecommitmentStatus = query({
    args: {
        status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("declined")),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_recommitmentStatus", (q) => q.eq("recommitmentStatus", args.status))
            .collect();
    },
});

/**
 * Respond to a recommitment prompt (Called by Staff)
 */
export const respondToRecommitment = mutation({
    args: {
        response: v.union(v.literal("accepted"), v.literal("declined")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();

        if (!user || user.role !== "Staff") {
            throw new Error("Unauthorized");
        }

        const updates: any = { recommitmentStatus: args.response };
        if (args.response === "declined") {
            updates.staffSubRole = "Alumni";
        }

        await ctx.db.patch(user._id, updates);
    },
});

/**
 * Trigger Recommitment Cycle (Admin only)
 * Sets all active Staff's `recommitmentStatus` to "pending",
 * minus those who are already Alumni.
 */
export const triggerRecommitmentCycle = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const admin = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();

        if (!admin || admin.role !== "Admin") {
            throw new Error("Unauthorized");
        }

        const staff = await ctx.db
            .query("users")
            .withIndex("by_role", (q) => q.eq("role", "Staff"))
            .collect();

        for (const s of staff) {
            // Only prompt those who are not already Alumni
            if (s.staffSubRole !== "Alumni") {
                await ctx.db.patch(s._id, { recommitmentStatus: "pending" });
            }
        }
    },
});

/**
 * End Recommitment Cycle (Admin only)
 * Transitions any "pending" Staff to "Alumni".
 */
export const endRecommitmentCycle = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const admin = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();

        if (!admin || admin.role !== "Admin") {
            throw new Error("Unauthorized");
        }

        const pendingStaff = await ctx.db
            .query("users")
            .withIndex("by_recommitmentStatus", (q) => q.eq("recommitmentStatus", "pending"))
            .collect();

        for (const s of pendingStaff) {
            await ctx.db.patch(s._id, {
                recommitmentStatus: "declined", // Or keep pending or cleared, but let's say "declined" implicitly
                staffSubRole: "Alumni",
            });
        }
    },
});
