import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireAdmin, requireReviewer } from "../accessControl";
import { isAdmin as checkAdmin } from "../org/roleHierarchy";
import type { Role } from "../org/roleHierarchy";

export const getRubric = query({
    args: {
        cohortId: v.id("cohorts"),
        round: v.union(v.literal("round1"), v.literal("round2"), v.literal("round3"), v.literal("round4")),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("rubrics")
            .withIndex("by_cohort_round", (q) => q.eq("cohortId", args.cohortId).eq("round", args.round))
            .first();
    },
});

export const saveRubric = mutation({
    args: {
        rubricId: v.optional(v.id("rubrics")),
        cohortId: v.id("cohorts"),
        round: v.union(v.literal("round1"), v.literal("round2"), v.literal("round3"), v.literal("round4")),
        criteria: v.array(
            v.object({
                name: v.string(),
                description: v.string(),
                maxScore: v.number(),
            })
        ),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);

        if (args.rubricId) {
            return await ctx.db.patch(args.rubricId, {
                criteria: args.criteria,
            });
        }
        return await ctx.db.insert("rubrics", {
            cohortId: args.cohortId,
            round: args.round,
            criteria: args.criteria,
        });
    },
});

export const saveEvaluation = mutation({
    args: {
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
    },
    handler: async (ctx, args) => {
        const user = await requireReviewer(ctx);

        if (args.reviewerId !== user._id && !checkAdmin(user.role as Role)) {
            throw new Error("Unauthorized: Cannot save evaluation for another reviewer");
        }

        // Check for existing evaluation
        const existing = await ctx.db
            .query("evaluations")
            .withIndex("by_application_round", (q) => q.eq("applicationId", args.applicationId).eq("round", args.round))
            .filter((q) => q.eq(q.field("reviewerId"), args.reviewerId))
            .first();

        if (existing) {
            return await ctx.db.patch(existing._id, {
                scores: args.scores,
                feedback: args.feedback,
            });
        }

        return await ctx.db.insert("evaluations", {
            applicationId: args.applicationId,
            reviewerId: args.reviewerId,
            round: args.round,
            scores: args.scores,
            feedback: args.feedback,
        });
    },
});

export const getEvaluations = query({
    args: {
        applicationId: v.id("applications"),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("evaluations")
            .withIndex("by_application_round", (q) => q.eq("applicationId", args.applicationId))
            .collect();
    },
});

/**
 * Get a ranked list of applicants for a cohort based on average rubric scores.
 * Useful for automated shortlisting or ranking.
 */
export const getAutomatedShortlist = query({
    args: {
        cohortId: v.id("cohorts"),
        round: v.union(v.literal("round1"), v.literal("round2"), v.literal("round3"), v.literal("round4")),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await requireReviewer(ctx);

        // 1. Fetch all applications for the cohort in the current round
        const applications = await ctx.db
            .query("applications")
            .withIndex("by_cohort", (q) => q.eq("cohortId", args.cohortId))
            .filter((q) => q.eq(q.field("status"), args.round))
            .collect();

        // 2. Fetch all evaluations for these applications in this round
        const shortlistingData = await Promise.all(
            applications.map(async (app) => {
                const evals = await ctx.db
                    .query("evaluations")
                    .withIndex("by_application_round", (q) =>
                        q.eq("applicationId", app._id).eq("round", args.round)
                    )
                    .collect();

                if (evals.length === 0) return null;

                // Calculate average score across all reviewers and criteria
                let totalScore = 0;
                let criteriaCount = 0;

                evals.forEach((e) => {
                    e.scores.forEach((s) => {
                        totalScore += s.score;
                        criteriaCount++;
                    });
                });

                const averageScore = criteriaCount > 0 ? totalScore / criteriaCount : 0;
                const user = await ctx.db.get(app.userId);

                return {
                    applicationId: app._id,
                    userId: app.userId,
                    userName: user?.name ?? "Unknown",
                    averageScore,
                    evaluationCount: evals.length,
                };
            })
        );

        // 3. Filter out those with no evaluations and sort by average score (desc)
        const ranked = shortlistingData
            .filter((d): d is NonNullable<typeof d> => d !== null)
            .sort((a, b) => b.averageScore - a.averageScore);

        return args.limit ? ranked.slice(0, args.limit) : ranked;
    },
});

