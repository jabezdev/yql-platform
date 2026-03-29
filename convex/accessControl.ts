import { ConvexError } from "convex/values";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import {
    hasMinRole,
    canManage,
    isSelfOrHasMinRole,
    isSelfOrCanManage,
    isAdmin as checkAdmin,
    isStaff as checkStaff,
} from "./org/roleHierarchy";
import type { Role } from "./org/roleHierarchy";

type Ctx = QueryCtx | MutationCtx;

// ── Core auth ───────────────────────────────────────────────────────────────

/**
 * Returns the currently authenticated user from the database.
 * Throws a structured ConvexError if not authenticated.
 */
export async function requireUser(ctx: Ctx): Promise<Doc<"users">> {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        throw new ConvexError({
            code: "UNAUTHENTICATED",
            message: "You must be logged in to perform this action",
        });
    }

    const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
        .first();

    if (!user) {
        throw new ConvexError({
            code: "USER_NOT_FOUND",
            message: "User profile not found in database",
        });
    }

    return user;
}

// ── Hierarchy-based guards ──────────────────────────────────────────────────

/**
 * Generic guard: ensures the user holds at least `minRole`.
 */
export async function requireMinRole(ctx: Ctx, minRole: Role): Promise<Doc<"users">> {
    const user = await requireUser(ctx);
    if (!hasMinRole(user.role as Role, minRole)) {
        throw new ConvexError({
            code: "UNAUTHORIZED",
            message: `Requires at least ${minRole} privileges`,
        });
    }
    return user;
}

export async function requireAdmin(ctx: Ctx): Promise<Doc<"users">> {
    return requireMinRole(ctx, "T2");
}

export async function requireStaff(ctx: Ctx): Promise<Doc<"users">> {
    return requireMinRole(ctx, "T5");
}

// ── Special-role guards ─────────────────────────────────────────────────────

/**
 * Ensures the user is an Admin OR holds the Evaluator special role.
 */
export async function requireReviewer(ctx: Ctx): Promise<Doc<"users">> {
    const user = await requireUser(ctx);
    const isEvaluator = user.specialRoles?.includes("Evaluator");

    if (!isEvaluator && !checkAdmin(user.role as Role)) {
        throw new ConvexError({
            code: "UNAUTHORIZED",
            message: "Evaluator or Admin privileges required",
        });
    }
    return user;
}

/**
 * Ensures the user is active staff (not Alumni).
 */
export async function requireActiveStaff(ctx: Ctx): Promise<Doc<"users">> {
    const user = await requireUser(ctx);
    const isAlumni = user.specialRoles?.includes("Alumni");

    if (!checkStaff(user.role as Role) || isAlumni) {
        throw new ConvexError({
            code: "UNAUTHORIZED",
            message: "Active Staff or Admin privileges required",
        });
    }
    return user;
}

// ── Relationship-based guards ───────────────────────────────────────────────

/**
 * Ensures the user can manage the target (strictly outranks).
 * Use for manager evaluations, approving subordinate reports, etc.
 */
export async function requireCanManage(
    ctx: Ctx,
    targetUserId: Id<"users">,
): Promise<{ user: Doc<"users">; target: Doc<"users"> }> {
    const user = await requireUser(ctx);
    const target = await ctx.db.get(targetUserId);

    if (!target) {
        throw new ConvexError({ code: "NOT_FOUND", message: "Target user not found" });
    }

    if (!canManage(user.role as Role, target.role as Role)) {
        throw new ConvexError({
            code: "UNAUTHORIZED",
            message: "You do not have permission to manage this user",
        });
    }

    return { user, target };
}

/**
 * Grants access if the user is accessing their own resource
 * OR holds at least `minRole`.
 * Use for self-evaluations, viewing own reports, etc.
 */
export async function requireSelfOrMinRole(
    ctx: Ctx,
    targetUserId: Id<"users">,
    minRole: Role,
): Promise<Doc<"users">> {
    const user = await requireUser(ctx);

    if (!isSelfOrHasMinRole(user._id.toString(), targetUserId.toString(), user.role as Role, minRole)) {
        throw new ConvexError({
            code: "UNAUTHORIZED",
            message: "You can only access your own data, or need higher privileges",
        });
    }

    return user;
}

/**
 * Grants access if the user is accessing their own resource
 * OR strictly outranks the target user.
 * Use for viewing/editing subordinate evaluations & reports.
 */
export async function requireSelfOrCanManage(
    ctx: Ctx,
    targetUserId: Id<"users">,
): Promise<{ user: Doc<"users">; target: Doc<"users"> }> {
    const user = await requireUser(ctx);
    const target = await ctx.db.get(targetUserId);

    if (!target) {
        throw new ConvexError({ code: "NOT_FOUND", message: "Target user not found" });
    }

    if (!isSelfOrCanManage(user._id.toString(), targetUserId.toString(), user.role as Role, target.role as Role)) {
        throw new ConvexError({
            code: "UNAUTHORIZED",
            message: "You can only access your own data or that of users you manage",
        });
    }

    return { user, target };
}
