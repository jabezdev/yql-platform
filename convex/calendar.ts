import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireReviewer, requireStaff } from "./accessControl";

export const getEvents = query({
    args: {
        cohortId: v.optional(v.id("cohorts")),
        includePrivate: v.boolean(),
    },
    handler: async (ctx, args) => {
        let eventsQuery = ctx.db.query("calendarEvents").withIndex("by_startTime");

        if (args.cohortId) {
            eventsQuery = eventsQuery.filter((q) => q.eq(q.field("cohortId"), args.cohortId));
        }

        const events = await eventsQuery.collect();

        if (args.includePrivate) {
            await requireReviewer(ctx);
            return events;
        } else {
            return events.filter((e) => !e.isPrivate);
        }
    },
});

export const createEvent = mutation({
    args: {
        title: v.string(),
        description: v.optional(v.string()),
        startTime: v.number(),
        endTime: v.number(),
        type: v.union(v.literal("workshop"), v.literal("interview"), v.literal("milestone"), v.literal("social"), v.literal("meeting")),
        isPrivate: v.boolean(),
        cohortId: v.optional(v.id("cohorts")),
        location: v.optional(v.string()),
        meetLink: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await requireStaff(ctx);
        return await ctx.db.insert("calendarEvents", args);
    },
});

export const updateEvent = mutation({
    args: {
        eventId: v.id("calendarEvents"),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        startTime: v.optional(v.number()),
        endTime: v.optional(v.number()),
        type: v.optional(v.union(v.literal("workshop"), v.literal("interview"), v.literal("milestone"), v.literal("social"), v.literal("meeting"))),
        isPrivate: v.optional(v.boolean()),
        cohortId: v.optional(v.id("cohorts")),
        location: v.optional(v.string()),
        meetLink: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await requireStaff(ctx);
        const { eventId, ...updates } = args;
        return await ctx.db.patch(eventId, updates);
    },
});

export const deleteEvent = mutation({
    args: { eventId: v.id("calendarEvents") },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        return await ctx.db.delete(args.eventId);
    },
});

export const getNextMeeting = query({
    args: {},
    handler: async (ctx) => {
        await requireStaff(ctx);
        const now = Date.now();
        const events = await ctx.db
            .query("calendarEvents")
            .withIndex("by_startTime")
            .collect();
        const upcoming = events
            .filter((e) => e.type === "meeting" && e.startTime > now)
            .sort((a, b) => a.startTime - b.startTime);
        return upcoming[0] ?? null;
    },
});

export const getRSVPs = query({
    args: { meetingEventId: v.id("calendarEvents") },
    handler: async (ctx, args) => {
        await requireStaff(ctx);
        const rsvps = await ctx.db
            .query("weeklyMeetingRSVP")
            .withIndex("by_event", (q) => q.eq("meetingEventId", args.meetingEventId))
            .collect();
        const enriched = await Promise.all(
            rsvps.map(async (r) => {
                const u = await ctx.db.get(r.userId);
                return { ...r, userName: u?.name ?? "Unknown" };
            })
        );
        return enriched;
    },
});

export const submitRSVP = mutation({
    args: {
        meetingEventId: v.id("calendarEvents"),
        response: v.union(v.literal("yes"), v.literal("no"), v.literal("maybe")),
    },
    handler: async (ctx, args) => {
        const user = await requireStaff(ctx);
        const existing = await ctx.db
            .query("weeklyMeetingRSVP")
            .withIndex("by_user_event", (q) =>
                q.eq("userId", user._id).eq("meetingEventId", args.meetingEventId)
            )
            .first();
        if (existing) {
            return await ctx.db.patch(existing._id, { response: args.response });
        }
        return await ctx.db.insert("weeklyMeetingRSVP", {
            userId: user._id,
            meetingEventId: args.meetingEventId,
            response: args.response,
        });
    },
});

export const getMyRSVP = query({
    args: { meetingEventId: v.id("calendarEvents") },
    handler: async (ctx, args) => {
        const user = await requireStaff(ctx);
        return await ctx.db
            .query("weeklyMeetingRSVP")
            .withIndex("by_user_event", (q) =>
                q.eq("userId", user._id).eq("meetingEventId", args.meetingEventId)
            )
            .first();
    },
});
