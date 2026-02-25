import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getEvents = query({
    args: {
        cohortId: v.optional(v.id("cohorts")),
        includePrivate: v.boolean(),
    },
    handler: async (ctx, args) => {
        let eventsQuery = ctx.db.query("calendarEvents").withIndex("by_startTime");

        if (args.cohortId) {
            // Need to filter by cohortId if provided. The index won't perfectly do both, 
            // so we'll just filter after fetching or filter the query.
            eventsQuery = eventsQuery.filter((q) => q.eq(q.field("cohortId"), args.cohortId));
        }

        const events = await eventsQuery.collect();

        if (args.includePrivate) {
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
        type: v.union(v.literal("workshop"), v.literal("interview"), v.literal("milestone"), v.literal("social")),
        isPrivate: v.boolean(),
        cohortId: v.optional(v.id("cohorts")),
    },
    handler: async (ctx, args) => {
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
        type: v.optional(v.union(v.literal("workshop"), v.literal("interview"), v.literal("milestone"), v.literal("social"))),
        isPrivate: v.optional(v.boolean()),
        cohortId: v.optional(v.id("cohorts")),
    },
    handler: async (ctx, args) => {
        const { eventId, ...updates } = args;
        return await ctx.db.patch(eventId, updates);
    },
});

export const deleteEvent = mutation({
    args: { eventId: v.id("calendarEvents") },
    handler: async (ctx, args) => {
        return await ctx.db.delete(args.eventId);
    },
});
