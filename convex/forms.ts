import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getFormForCohort = query({
    args: { cohortId: v.id("cohorts") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("applicationForms")
            .withIndex("by_cohort", (q) => q.eq("cohortId", args.cohortId))
            .first(); // Assuming one primary application form per cohort for now
    },
});

export const createOrUpdateForm = mutation({
    args: {
        formId: v.optional(v.id("applicationForms")),
        cohortId: v.id("cohorts"),
        title: v.string(),
        description: v.optional(v.string()),
        fields: v.array(
            v.object({
                id: v.string(),
                type: v.union(v.literal("text"), v.literal("textarea"), v.literal("file"), v.literal("select"), v.literal("multiselect")),
                label: v.string(),
                required: v.boolean(),
                options: v.optional(v.array(v.string())),
            })
        ),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();

        if (!user || user.role !== "Admin") {
            throw new Error("Unauthorized: Only Admins can manage forms");
        }

        if (args.formId) {
            return await ctx.db.patch(args.formId, {
                title: args.title,
                description: args.description,
                fields: args.fields,
            });
        } else {
            return await ctx.db.insert("applicationForms", {
                cohortId: args.cohortId,
                title: args.title,
                description: args.description,
                fields: args.fields,
            });
        }
    },
});

export const submitResponse = mutation({
    args: {
        applicationId: v.id("applications"),
        formId: v.id("applicationForms"),
        responses: v.array(
            v.object({
                fieldId: v.string(),
                value: v.union(v.string(), v.array(v.string()), v.id("_storage")),
            })
        ),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first();

        if (!user) throw new Error("Unauthorized");

        const application = await ctx.db.get(args.applicationId);
        if (!application) throw new Error("Application not found");

        if (user.role === "Applicant" && application.userId !== user._id) {
            throw new Error("Unauthorized: Cannot submit response for another user's application");
        }

        // Check for existing response
        const existingResponse = await ctx.db
            .query("formResponses")
            .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
            .filter((q) => q.eq(q.field("formId"), args.formId))
            .first();

        if (existingResponse) {
            return await ctx.db.patch(existingResponse._id, {
                responses: args.responses,
            });
        }

        return await ctx.db.insert("formResponses", {
            applicationId: args.applicationId,
            formId: args.formId,
            responses: args.responses,
        });
    },
});

export const getResponseForApplication = query({
    args: { applicationId: v.id("applications"), formId: v.id("applicationForms") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("formResponses")
            .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
            .filter((q) => q.eq(q.field("formId"), args.formId))
            .first();
    },
});
