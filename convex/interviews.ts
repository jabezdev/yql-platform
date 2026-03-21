import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireReviewer, requireUser } from "./accessControl";
import { isAdmin as checkAdmin, isStaff as checkStaff } from "./roleHierarchy";
import type { Role } from "./roleHierarchy";

export const getInterviewsForApplication = query({
    args: { applicationId: v.id("applications") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("interviews")
            .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
            .collect();
    },
});

export const getInterviewsForReviewer = query({
    args: { reviewerId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("interviews")
            .withIndex("by_reviewer", (q) => q.eq("reviewerId", args.reviewerId))
            .collect();
    },
});

export const scheduleInterview = mutation({
    args: {
        applicationId: v.id("applications"),
        reviewerId: v.id("users"),
        startTime: v.number(),
        endTime: v.number(),
    },
    handler: async (ctx, args) => {
        await requireReviewer(ctx);

        return await ctx.db.insert("interviews", {
            applicationId: args.applicationId,
            reviewerId: args.reviewerId,
            startTime: args.startTime,
            endTime: args.endTime,
            status: "scheduled",
        });
    },
});

export const updateInterviewNotes = mutation({
    args: {
        interviewId: v.id("interviews"),
        notes: v.string(),
    },
    handler: async (ctx, args) => {
        await requireReviewer(ctx);

        return await ctx.db.patch(args.interviewId, {
            notes: args.notes,
        });
    },
});

export const updateInterviewStatus = mutation({
    args: {
        interviewId: v.id("interviews"),
        status: v.union(v.literal("scheduled"), v.literal("completed"), v.literal("cancelled")),
    },
    handler: async (ctx, args) => {
        await requireReviewer(ctx);

        return await ctx.db.patch(args.interviewId, {
            status: args.status,
        });
    },
});

export const addAvailability = mutation({
    args: {
        reviewerId: v.id("users"),
        startTime: v.number(),
        endTime: v.number(),
    },
    handler: async (ctx, args) => {
        const user = await requireReviewer(ctx);

        const isAdminUser = checkAdmin(user.role as Role);
        if (args.reviewerId !== user._id && !isAdminUser) {
            throw new Error("Unauthorized: Cannot add availability for another reviewer");
        }

        return await ctx.db.insert("reviewerAvailabilities", {
            reviewerId: args.reviewerId,
            startTime: args.startTime,
            endTime: args.endTime,
            isBooked: false,
        });
    },
});

export const removeAvailability = mutation({
    args: {
        availabilityId: v.id("reviewerAvailabilities"),
    },
    handler: async (ctx, args) => {
        const user = await requireReviewer(ctx);

        const slot = await ctx.db.get(args.availabilityId);
        if (slot) {
            const isAdminUser = checkAdmin(user.role as Role);
            if (slot.reviewerId !== user._id && !isAdminUser) {
                throw new Error("Unauthorized");
            }
            if (!slot.isBooked) {
                await ctx.db.delete(args.availabilityId);
            }
        }
    },
});

export const getAvailabilitiesForReviewer = query({
    args: { reviewerId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("reviewerAvailabilities")
            .withIndex("by_reviewer", (q) => q.eq("reviewerId", args.reviewerId))
            .collect();
    },
});

export const getAllAvailableSlots = query({
    args: {},
    handler: async (ctx) => {
        // get all slots that are not booked and in the future
        const now = Date.now();
        const slots = await ctx.db
            .query("reviewerAvailabilities")
            .withIndex("by_startTime")
            .filter((q) => q.eq(q.field("isBooked"), false))
            .collect();

        return slots.filter(slot => slot.startTime > now);
    }
});

export const bookInterviewSlot = mutation({
    args: {
        applicationId: v.id("applications"),
        availabilityId: v.id("reviewerAvailabilities"),
    },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);

        const application = await ctx.db.get(args.applicationId);
        if (!application || (!checkStaff(user.role as Role) && application.userId !== user._id)) {
            throw new Error("Unauthorized");
        }

        const slot = await ctx.db.get(args.availabilityId);
        if (!slot || slot.isBooked) {
            throw new Error("Slot is no longer available.");
        }

        // Mark slot as booked
        await ctx.db.patch(slot._id, { isBooked: true });

        // Create the interview
        return await ctx.db.insert("interviews", {
            applicationId: args.applicationId,
            reviewerId: slot.reviewerId,
            startTime: slot.startTime,
            endTime: slot.endTime,
            status: "scheduled",
        });
    },
});
