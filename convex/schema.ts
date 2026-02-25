import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        email: v.string(),
        name: v.string(),
        clerkId: v.optional(v.string()), // Used for syncing with Clerk
        role: v.union(v.literal("Applicant"), v.literal("Staff"), v.literal("Admin")),
        staffSubRole: v.optional(v.union(v.literal("Regular"), v.literal("Reviewer"), v.literal("Alumni"))),
        recommitmentStatus: v.optional(v.union(v.literal("pending"), v.literal("accepted"), v.literal("declined"))),
        bio: v.optional(v.string()),
        favoriteShape: v.optional(v.union(v.literal("circle"), v.literal("square"), v.literal("triangle"), v.literal("hexagon"))),
        favoriteColor: v.optional(v.string()),
        techStackIcon: v.optional(v.string()),
    })
        .index("by_clerkId", ["clerkId"])
        .index("by_email", ["email"])
        .index("by_role", ["role"])
        .index("by_staffSubRole", ["staffSubRole"])
        .index("by_recommitmentStatus", ["recommitmentStatus"]),

    cohorts: defineTable({
        name: v.string(), // E.g., "Season 10", "Winter 2026"
        applicationStartDate: v.number(), // Unix timestamp
        applicationEndDate: v.number(), // Unix timestamp
        termStartDate: v.number(), // Unix timestamp
        termEndDate: v.number(), // Unix timestamp
        status: v.union(v.literal("upcoming"), v.literal("active"), v.literal("past")),
    }).index("by_status", ["status"]),

    applications: defineTable({
        userId: v.id("users"),
        cohortId: v.id("cohorts"),
        status: v.union(
            v.literal("round1"),
            v.literal("round2"),
            v.literal("round3"),
            v.literal("round4"),
            v.literal("round5"),
            v.literal("round6"),
            v.literal("rejected"),
            v.literal("withdrawn"),
            v.literal("accepted")
        ),
        assignedReviewerId: v.optional(v.id("users")),
    })
        .index("by_user", ["userId"])
        .index("by_cohort", ["cohortId"])
        .index("by_status", ["status"])
        .index("by_reviewer", ["assignedReviewerId"]),

    applicationForms: defineTable({
        cohortId: v.id("cohorts"),
        title: v.string(),
        description: v.optional(v.string()),
        fields: v.array(
            v.object({
                id: v.string(), // unique id for the field
                type: v.union(v.literal("text"), v.literal("textarea"), v.literal("file"), v.literal("select"), v.literal("multiselect")),
                label: v.string(),
                required: v.boolean(),
                options: v.optional(v.array(v.string())), // for select/multiselect
            })
        ),
    }).index("by_cohort", ["cohortId"]),

    formResponses: defineTable({
        applicationId: v.id("applications"),
        formId: v.id("applicationForms"),
        responses: v.array(
            v.object({
                fieldId: v.string(),
                value: v.union(v.string(), v.array(v.string()), v.id("_storage")), // string, array of strings for multiselect, or storage ID for files
            })
        ),
    })
        .index("by_application", ["applicationId"])
        .index("by_form", ["formId"]),

    interviews: defineTable({
        applicationId: v.id("applications"),
        reviewerId: v.id("users"),
        startTime: v.number(), // Unix timestamp
        endTime: v.number(), // Unix timestamp
        notes: v.optional(v.string()),
        status: v.union(v.literal("scheduled"), v.literal("completed"), v.literal("cancelled")),
    })
        .index("by_application", ["applicationId"])
        .index("by_reviewer", ["reviewerId"]),

    reviewerAvailabilities: defineTable({
        reviewerId: v.id("users"),
        startTime: v.number(),
        endTime: v.number(),
        isBooked: v.boolean(),
    })
        .index("by_reviewer", ["reviewerId"])
        .index("by_startTime", ["startTime"]),

    rubrics: defineTable({
        cohortId: v.id("cohorts"),
        round: v.union(v.literal("round1"), v.literal("round2"), v.literal("round3"), v.literal("round4")),
        criteria: v.array(
            v.object({
                name: v.string(),
                description: v.string(),
                maxScore: v.number(),
            })
        ),
    }).index("by_cohort_round", ["cohortId", "round"]),

    evaluations: defineTable({
        applicationId: v.id("applications"),
        reviewerId: v.id("users"),
        round: v.union(v.literal("round1"), v.literal("round2"), v.literal("round3"), v.literal("round4")),
        scores: v.array(
            v.object({
                criterionName: v.string(),
                score: v.number(),
            })
        ),
        feedback: v.optional(v.string()),
    })
        .index("by_application_round", ["applicationId", "round"])
        .index("by_reviewer", ["reviewerId"]),

    onboardingModules: defineTable({
        title: v.string(),
        description: v.optional(v.string()),
        content: v.string(),
        order: v.number(),
        isRequired: v.boolean(),
    }).index("by_order", ["order"]),

    onboardingProgress: defineTable({
        userId: v.id("users"),
        moduleId: v.id("onboardingModules"),
        completedAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_user_module", ["userId", "moduleId"]),

    calendarEvents: defineTable({
        title: v.string(),
        description: v.optional(v.string()),
        startTime: v.number(),
        endTime: v.number(),
        type: v.union(v.literal("workshop"), v.literal("interview"), v.literal("milestone"), v.literal("social")),
        isPrivate: v.boolean(),
        cohortId: v.optional(v.id("cohorts")),
    })
        .index("by_startTime", ["startTime"])
        .index("by_cohort", ["cohortId"]),
});

