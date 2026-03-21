import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        email: v.string(),
        name: v.string(),
        clerkId: v.optional(v.string()), // Used for syncing with Clerk
        role: v.union(
            v.literal("Super Admin"),
            v.literal("T1"),
            v.literal("T2"),
            v.literal("T3"),
            v.literal("T4"),
            v.literal("T5"),
            v.literal("Applicant")
        ),
        specialRoles: v.optional(v.array(v.union(v.literal("Alumni"), v.literal("Evaluator")))),
        recommitmentStatus: v.optional(v.union(v.literal("pending"), v.literal("accepted"), v.literal("declined"))),
        bio: v.optional(v.string()),
        profileChip: v.optional(v.id("_storage")),
        // legacy fields kept for data compat
        favoriteShape: v.optional(v.union(v.literal("circle"), v.literal("square"), v.literal("triangle"), v.literal("hexagon"))),
        favoriteColor: v.optional(v.string()),
        techStackIcon: v.optional(v.string()),
    })
        .index("by_clerkId", ["clerkId"])
        .index("by_email", ["email"])
        .index("by_role", ["role"])
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
        type: v.union(v.literal("workshop"), v.literal("interview"), v.literal("milestone"), v.literal("social"), v.literal("meeting")),
        isPrivate: v.boolean(),
        cohortId: v.optional(v.id("cohorts")),
        location: v.optional(v.string()),
        meetLink: v.optional(v.string()),
    })
        .index("by_startTime", ["startTime"])
        .index("by_cohort", ["cohortId"]),

    announcements: defineTable({
        title: v.string(),
        content: v.string(),
        authorId: v.id("users"),
        isPinned: v.boolean(),
        expiresAt: v.optional(v.number()),
    }).index("by_pinned", ["isPinned"]),

    weeklyLogs: defineTable({
        userId: v.id("users"),
        weekOf: v.number(), // Monday timestamp
        summary: v.string(),
        highlights: v.optional(v.string()),
        challenges: v.optional(v.string()),
        hoursLogged: v.optional(v.number()),
        isApproved: v.boolean(),
        isDisplayed: v.boolean(),
    })
        .index("by_user", ["userId"])
        .index("by_weekOf", ["weekOf"])
        .index("by_user_weekOf", ["userId", "weekOf"]),

    openTasks: defineTable({
        title: v.string(),
        description: v.optional(v.string()),
        status: v.union(v.literal("open"), v.literal("in_progress"), v.literal("done")),
        assignedTo: v.optional(v.id("users")),
        createdBy: v.id("users"),
        priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    })
        .index("by_status", ["status"])
        .index("by_assignedTo", ["assignedTo"]),

    weeklyMeetingRSVP: defineTable({
        userId: v.id("users"),
        meetingEventId: v.id("calendarEvents"),
        response: v.union(v.literal("yes"), v.literal("no"), v.literal("maybe")),
    })
        .index("by_event", ["meetingEventId"])
        .index("by_user_event", ["userId", "meetingEventId"]),

    hrFormSubmissions: defineTable({
        userId: v.id("users"),
        formId: v.string(), // E.g., "loa", "purchase_request"
        responses: v.any(), // JSON object of field values
        status: v.union(v.literal("pending"), v.literal("reviewed"), v.literal("archived")),
        createdAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_form", ["formId"])
        .index("by_status", ["status"]),

    personalTodos: defineTable({
        userId: v.id("users"),
        text: v.string(),
        isCompleted: v.boolean(),
        createdAt: v.number(),
    }).index("by_user", ["userId"]),

    resources: defineTable({
        title: v.string(),
        description: v.optional(v.string()),
        url: v.optional(v.string()),
        fileStorageId: v.optional(v.id("_storage")),
        type: v.union(v.literal("link"), v.literal("document"), v.literal("video"), v.literal("other")),
        tags: v.optional(v.array(v.string())),
        uploadedBy: v.id("users"),
        createdAt: v.number(),
    })
        .index("by_type", ["type"])
        .index("by_createdAt", ["createdAt"]),

    // ═══════════════════════════════════════════════════════════════
    // CHAT SYSTEM TABLES
    // ═══════════════════════════════════════════════════════════════

    chatChannels: defineTable({
        name: v.string(),
        description: v.optional(v.string()),
        type: v.union(
            v.literal("channel"),
            v.literal("subchannel"),
            v.literal("group"),
            v.literal("sidechat"),
            v.literal("dm"),
            v.literal("group_dm"),
        ),
        parentId: v.optional(v.id("chatChannels")),
        createdBy: v.id("users"),
        isArchived: v.boolean(),
        // For DMs: sorted participant IDs, prevents duplicate DM channels
        dmKey: v.optional(v.string()),
        sortOrder: v.number(),
        icon: v.optional(v.string()),
        topic: v.optional(v.string()),
    })
        .index("by_type", ["type"])
        .index("by_parentId", ["parentId"])
        .index("by_dmKey", ["dmKey"])
        .index("by_type_archived", ["type", "isArchived"]),

    chatChannelMembers: defineTable({
        channelId: v.id("chatChannels"),
        userId: v.id("users"),
        joinedAt: v.number(),
        role: v.union(
            v.literal("owner"),
            v.literal("admin"),
            v.literal("member"),
        ),
        isMuted: v.boolean(),
        lastReadMessageId: v.optional(v.id("chatMessages")),
        lastReadTimestamp: v.optional(v.number()),
        notificationLevel: v.optional(v.union(
            v.literal("all"),
            v.literal("mentions"),
            v.literal("none"),
        )),
    })
        .index("by_channelId", ["channelId"])
        .index("by_userId", ["userId"])
        .index("by_channel_user", ["channelId", "userId"]),

    chatChannelPermissions: defineTable({
        channelId: v.id("chatChannels"),
        targetUserId: v.optional(v.id("users")),
        targetRole: v.optional(v.string()),
        targetSpecialRole: v.optional(v.string()),
        permission: v.union(
            v.literal("send"),
            v.literal("manage"),
            v.literal("read_only"),
        ),
        grantedBy: v.id("users"),
    })
        .index("by_channelId", ["channelId"])
        .index("by_targetUserId", ["targetUserId"])
        .index("by_targetRole", ["channelId", "targetRole"]),

    chatMessages: defineTable({
        channelId: v.id("chatChannels"),
        authorId: v.id("users"),
        body: v.string(),
        bodyPlainText: v.string(),
        threadRootMessageId: v.optional(v.id("chatMessages")),
        threadReplyCount: v.optional(v.number()),
        threadLastReplyAt: v.optional(v.number()),
        attachments: v.optional(v.array(v.object({
            storageId: v.id("_storage"),
            filename: v.string(),
            mimeType: v.string(),
            size: v.number(),
        }))),
        urlPreviews: v.optional(v.array(v.object({
            url: v.string(),
            title: v.optional(v.string()),
            description: v.optional(v.string()),
            imageUrl: v.optional(v.string()),
            siteName: v.optional(v.string()),
        }))),
        mentions: v.optional(v.object({
            userIds: v.optional(v.array(v.id("users"))),
            roles: v.optional(v.array(v.string())),
            specialRoles: v.optional(v.array(v.string())),
            everyone: v.optional(v.boolean()),
        })),
        isEdited: v.boolean(),
        editedAt: v.optional(v.number()),
        editHistory: v.optional(v.array(v.object({
            body: v.string(),
            bodyPlainText: v.string(),
            editedAt: v.number(),
        }))),
        isDeleted: v.boolean(),
        deletedAt: v.optional(v.number()),
        deletedBy: v.optional(v.id("users")),
        isPinned: v.boolean(),
        pinnedAt: v.optional(v.number()),
        pinnedBy: v.optional(v.id("users")),
        isSystem: v.optional(v.boolean()),
        systemType: v.optional(v.string()),
    })
        .index("by_channelId", ["channelId"])
        .index("by_threadRootMessageId", ["threadRootMessageId"])
        .index("by_authorId", ["authorId"])
        .index("by_channelId_isPinned", ["channelId", "isPinned"]),

    chatReactions: defineTable({
        messageId: v.id("chatMessages"),
        userId: v.id("users"),
        emoji: v.string(),
    })
        .index("by_messageId", ["messageId"])
        .index("by_messageId_emoji", ["messageId", "emoji"])
        .index("by_userId_messageId", ["userId", "messageId"]),

    chatPolls: defineTable({
        messageId: v.id("chatMessages"),
        channelId: v.id("chatChannels"),
        question: v.string(),
        options: v.array(v.object({
            id: v.string(),
            text: v.string(),
        })),
        allowMultipleVotes: v.boolean(),
        isAnonymous: v.boolean(),
        closedAt: v.optional(v.number()),
        createdBy: v.id("users"),
    })
        .index("by_messageId", ["messageId"])
        .index("by_channelId", ["channelId"]),

    chatPollVotes: defineTable({
        pollId: v.id("chatPolls"),
        userId: v.id("users"),
        optionId: v.string(),
    })
        .index("by_pollId", ["pollId"])
        .index("by_pollId_userId", ["pollId", "userId"])
        .index("by_pollId_optionId", ["pollId", "optionId"]),

    chatMessageMoves: defineTable({
        messageId: v.id("chatMessages"),
        fromChannelId: v.id("chatChannels"),
        toChannelId: v.id("chatChannels"),
        movedBy: v.id("users"),
        movedAt: v.number(),
        reason: v.optional(v.string()),
    })
        .index("by_messageId", ["messageId"])
        .index("by_movedBy", ["movedBy"]),

    chatTypingIndicators: defineTable({
        channelId: v.id("chatChannels"),
        userId: v.id("users"),
        expiresAt: v.number(),
    })
        .index("by_channelId", ["channelId"])
        .index("by_expiresAt", ["expiresAt"]),

    chatBookmarks: defineTable({
        userId: v.id("users"),
        messageId: v.id("chatMessages"),
        note: v.optional(v.string()),
    })
        .index("by_userId", ["userId"])
        .index("by_userId_messageId", ["userId", "messageId"]),

    chatNotifications: defineTable({
        userId: v.id("users"),       // recipient
        messageId: v.id("chatMessages"),
        channelId: v.id("chatChannels"),
        mentionedBy: v.id("users"),  // sender
        isRead: v.boolean(),
    })
        .index("by_userId", ["userId"])
        .index("by_userId_isRead", ["userId", "isRead"]),
});

