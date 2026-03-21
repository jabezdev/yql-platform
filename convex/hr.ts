import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, requireUser } from "./accessControl";
import { isStaff as checkStaff } from "./roleHierarchy";
import type { Role } from "./roleHierarchy";

/**
 * Fetch all Staff and Admins for the HR Directory.
 */
export const getAllStaff = query({
    args: {},
    handler: async (ctx) => {
        // Fetch all users and filter in-memory as Convex doesn't support $ne index yet
        const users = await ctx.db.query("users").collect();
        return users.filter(u => u.role !== "Applicant");
    },
});

/**
 * Switch a user's role or subRole (Admin only)
 */
export const updateStaffRole = mutation({
    args: {
        userId: v.id("users"),
        role: v.optional(v.union(v.literal("Super Admin"), v.literal("T1"), v.literal("T2"), v.literal("T3"), v.literal("T4"), v.literal("T5"), v.literal("Applicant"))),
        specialRoles: v.optional(v.array(v.union(v.literal("Alumni"), v.literal("Evaluator")))),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);

        const updates: any = {};
        if (args.role !== undefined) updates.role = args.role;
        if (args.specialRoles !== undefined) updates.specialRoles = args.specialRoles;

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
        const user = await requireUser(ctx);
        if (!checkStaff(user.role as Role)) throw new Error("Unauthorized");

        const updates: any = { recommitmentStatus: args.response };
        if (args.response === "declined") {
            const currentRoles = user.specialRoles || [];
            if (!currentRoles.includes("Alumni")) {
                updates.specialRoles = [...currentRoles, "Alumni"];
            }
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
        await requireAdmin(ctx);

        const users = await ctx.db.query("users").collect();
        const staff = users.filter(u => u.role !== "Applicant");

        for (const s of staff) {
            // Only prompt those who are not already Alumni
            if (!s.specialRoles?.includes("Alumni")) {
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
        await requireAdmin(ctx);

        const pendingStaff = await ctx.db
            .query("users")
            .withIndex("by_recommitmentStatus", (q) => q.eq("recommitmentStatus", "pending"))
            .collect();

        for (const s of pendingStaff) {
            const currentRoles = s.specialRoles || [];
            const updates: any = { recommitmentStatus: "declined" };
            if (!currentRoles.includes("Alumni")) {
                updates.specialRoles = [...currentRoles, "Alumni"];
            }
            await ctx.db.patch(s._id, updates);
        }
    },
});
