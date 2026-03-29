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
        // Phase 3: Group Tags (for @group mentions)
        groupTags: v.optional(v.array(v.string())), // e.g., ["marketing", "leadership"]
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
        staffOnly: v.optional(v.boolean()), // Phase 1: Staff-only vs Public
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
        status: v.union(v.literal("open"), v.literal("in_progress"), v.literal("done"), v.literal("archived")),
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
        // Phase 1: Private/Gated Channels
        isPrivate: v.optional(v.boolean()), // default false; only owners/invited members can see/join
        requiresApproval: v.optional(v.boolean()), // default false; join requests queue for owner approval
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
        // Phase 1: Read State Polish
        lastSeenAt: v.optional(v.number()), // timestamp when user last appeared in channel
        lastSeenMessageId: v.optional(v.id("chatMessages")), // last message user scrolled past
        // Phase 2: Moderation
        isHidden: v.optional(v.boolean()), // user cannot see/post, invisible to others
        softBanUntil: v.optional(v.number()), // temporary mute until unix timestamp
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
            groupNames: v.optional(v.array(v.string())), // Phase 3: @group mentions
            everyone: v.optional(v.boolean()), // @everyone
            channel: v.optional(v.boolean()), // @channel (last 7 days)
            here: v.optional(v.boolean()), // @here (last 5 minutes)
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
        // Phase 1: Silent Messages
        isSilent: v.optional(v.boolean()), // default false; send without notifications
        // Phase 2: Search with Tokens
        searchTokens: v.optional(v.array(v.string())), // pre-computed tokens for fast search
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

    // Phase 1: Channel Join Requests (for gated/approval-required channels)
    chatChannelJoinRequests: defineTable({
        channelId: v.id("chatChannels"),
        userId: v.id("users"),
        status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
        requestedAt: v.number(),
        respondedAt: v.optional(v.number()),
        respondedBy: v.optional(v.id("users")),
        reason: v.optional(v.string()),
    })
        .index("by_channelId", ["channelId"])
        .index("by_userId", ["userId"])
        .index("by_channelId_status", ["channelId", "status"])
        .index("by_channelId_userId", ["channelId", "userId"]),

    // ═══════════════════════════════════════════════════════════════
    // PHASE 2: Notification Pipeline, Search, Rich Content, Moderation
    // ═══════════════════════════════════════════════════════════════

    // Phase 2: Notification Preferences (external delivery configuration)
    chatNotificationPreferences: defineTable({
        userId: v.id("users"),
        emailDigestFrequency: v.union(v.literal("never"), v.literal("daily"), v.literal("weekly")),
        pushNotificationsEnabled: v.boolean(),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_userId", ["userId"]),

    // Phase 2: Media Items (images, videos, links extracted from messages)
    chatMediaItems: defineTable({
        messageId: v.id("chatMessages"),
        channelId: v.id("chatChannels"),
        type: v.union(v.literal("image"), v.literal("video"), v.literal("link"), v.literal("file")),
        url: v.string(),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        previewUrl: v.optional(v.string()),
        uploadedBy: v.id("users"),
        uploadedAt: v.number(),
    })
        .index("by_channelId", ["channelId"])
        .index("by_messageId", ["messageId"])
        .index("by_type", ["type"])
        .index("by_channelId_type", ["channelId", "type"]),

    // Phase 2: Rate Limits (track message rate per user/channel)
    chatRateLimits: defineTable({
        userId: v.id("users"),
        channelId: v.optional(v.id("chatChannels")),
        messageType: v.string(), // "text", "attachment", "reaction", etc.
        limit: v.number(), // max messages in window
        windowMs: v.number(), // time window in milliseconds
        createdAt: v.number(),
    })
        .index("by_userId", ["userId"])
        .index("by_userId_channelId", ["userId", "channelId"])
        .index("by_userId_messageType", ["userId", "messageType"]),

    // Phase 2: Abuse Reports (user-flagged content)
    chatAbuseReports: defineTable({
        messageId: v.id("chatMessages"),
        reportedBy: v.id("users"),
        reason: v.string(),
        status: v.union(v.literal("open"), v.literal("reviewed"), v.literal("resolved")),
        reviewedBy: v.optional(v.id("users")),
        notes: v.optional(v.string()),
        reportedAt: v.number(),
        reviewedAt: v.optional(v.number()),
    })
        .index("by_messageId", ["messageId"])
        .index("by_reportedBy", ["reportedBy"])
        .index("by_status", ["status"]),

    // Phase 2: Audit Log (moderation actions)
    chatAuditLog: defineTable({
        type: v.string(), // "message_deleted", "user_muted", "user_hidden", etc.
        actor: v.id("users"),
        targetUserId: v.optional(v.id("users")),
        targetMessageId: v.optional(v.id("chatMessages")),
        channelId: v.optional(v.id("chatChannels")),
        reason: v.optional(v.string()),
        metadata: v.optional(v.any()), // additional context
        createdAt: v.number(),
    })
        .index("by_type", ["type"])
        .index("by_actor", ["actor"])
        .index("by_channelId", ["channelId"])
        .index("by_targetUserId", ["targetUserId"])
        .index("by_createdAt", ["createdAt"]),

    // ═══════════════════════════════════════════════════════════════
    // PHASE 3: Scheduled Messages, Thread Subscriptions, Groups
    // ═══════════════════════════════════════════════════════════════

    chatScheduledMessages: defineTable({
        channelId: v.id("chatChannels"),
        authorId: v.id("users"),
        body: v.string(),
        bodyPlainText: v.string(),
        mentions: v.optional(v.object({
            userIds: v.optional(v.array(v.id("users"))),
            roles: v.optional(v.array(v.string())),
            specialRoles: v.optional(v.array(v.string())),
            groupNames: v.optional(v.array(v.string())),
            everyone: v.optional(v.boolean()),
            channel: v.optional(v.boolean()),
            here: v.optional(v.boolean()),
        })),
        attachments: v.optional(v.array(v.object({
            storageId: v.id("_storage"),
            filename: v.string(),
            mimeType: v.string(),
            size: v.number(),
        }))),
        sendAt: v.number(), // Unix timestamp when to send
        status: v.union(v.literal("queued"), v.literal("sent"), v.literal("cancelled")),
        createdAt: v.number(),
        sentAt: v.optional(v.number()),
        cancelledAt: v.optional(v.number()),
    })
        .index("by_authorId", ["authorId"])
        .index("by_channelId", ["channelId"])
        .index("by_sendAt", ["sendAt"])
        .index("by_status", ["status"])
        .index("by_sendAt_status", ["sendAt", "status"]),

    chatThreadSubscriptions: defineTable({
        userId: v.id("users"),
        threadRootMessageId: v.id("chatMessages"),
        channelId: v.id("chatChannels"),
        subscribedAt: v.number(),
        lastReadReplyId: v.optional(v.id("chatMessages")),
        lastReadAt: v.optional(v.number()),
    })
        .index("by_userId", ["userId"])
        .index("by_threadRootMessageId", ["threadRootMessageId"])
        .index("by_userId_threadRootMessageId", ["userId", "threadRootMessageId"])
        .index("by_channelId", ["channelId"]),

    // ═══════════════════════════════════════════════════════════════
    // NEW: RECRUITMENT HISTORY & AUDIT
    // ═══════════════════════════════════════════════════════════════

    applicationStatusHistory: defineTable({
        applicationId: v.id("applications"),
        oldStatus: v.optional(v.string()),
        newStatus: v.string(),
        changedBy: v.id("users"),
        reason: v.optional(v.string()),
        timestamp: v.number(),
    })
        .index("by_application", ["applicationId"])
        .index("by_changedBy", ["changedBy"]),
});



