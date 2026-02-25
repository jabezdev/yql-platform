import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();

        if (!user || user.role === "Applicant" || (user.role === "Staff" && user.staffSubRole !== "Reviewer")) {
            throw new Error("Unauthorized");
        }

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
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();

        if (!user || user.role === "Applicant" || (user.role === "Staff" && user.staffSubRole !== "Reviewer")) {
            throw new Error("Unauthorized");
        }

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
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();

        if (!user || user.role === "Applicant" || (user.role === "Staff" && user.staffSubRole !== "Reviewer")) {
            throw new Error("Unauthorized");
        }

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
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();

        if (!user || user.role === "Applicant" || (user.role === "Staff" && user.staffSubRole !== "Reviewer")) {
            throw new Error("Unauthorized");
        }

        if (args.reviewerId !== user._id && user.role !== "Admin") {
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
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();

        if (!user || user.role === "Applicant" || (user.role === "Staff" && user.staffSubRole !== "Reviewer")) {
            throw new Error("Unauthorized");
        }

        const slot = await ctx.db.get(args.availabilityId);
        if (slot) {
            if (slot.reviewerId !== user._id && user.role !== "Admin") {
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
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();

        if (!user) {
            throw new Error("Unauthorized");
        }

        const application = await ctx.db.get(args.applicationId);
        if (!application || (user.role === "Applicant" && application.userId !== user._id)) {
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
