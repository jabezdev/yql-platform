/**
 * Single source of truth for role hierarchy.
 *
 * Ranks use a scale of 10 so that "in-between" tiers can be inserted later
 * (e.g. a T2.5 at rank 25) without renumbering existing roles.
 *
 * Importable by both Convex backend functions and the React frontend.
 */

export type Role = "Super Admin" | "T1" | "T2" | "T3" | "T4" | "T5" | "Applicant";
export type SpecialRole = "Alumni" | "Evaluator";

// ── Rank table ──────────────────────────────────────────────────────────────

export const ROLE_RANK: Record<Role, number> = {
    "Super Admin": 0,
    T1: 10,
    T2: 20,
    T3: 30,
    T4: 40,
    T5: 50,
    Applicant: 990, // large gap — Applicant is fundamentally different from staff
};

// ── Hierarchy helpers ───────────────────────────────────────────────────────

/** True when `role` is at or above `minRole` in the hierarchy. */
export function hasMinRole(role: Role, minRole: Role): boolean {
    return ROLE_RANK[role] <= ROLE_RANK[minRole];
}

/** True when `role` strictly outranks `targetRole` (not equal). */
export function outranks(role: Role, targetRole: Role): boolean {
    return ROLE_RANK[role] < ROLE_RANK[targetRole];
}

/** True when `role` is at the same tier or above `targetRole`. */
export function outranksOrEqual(role: Role, targetRole: Role): boolean {
    return ROLE_RANK[role] <= ROLE_RANK[targetRole];
}

// ── Derived checks ──────────────────────────────────────────────────────────

export function isAdmin(role: Role): boolean {
    return hasMinRole(role, "T2");
}

export function isManager(role: Role): boolean {
    return hasMinRole(role, "T3");
}

export function isStaff(role: Role): boolean {
    return hasMinRole(role, "T5");
}

// ── Relationship-based access ───────────────────────────────────────────────

/**
 * Can `managerRole` manage / evaluate down on `targetRole`?
 * True when the manager strictly outranks the target.
 */
export function canManage(managerRole: Role, targetRole: Role): boolean {
    return outranks(managerRole, targetRole);
}

/**
 * Can the user access a resource that belongs to `targetId`?
 * Granted if it is the user's own resource OR they hold at least `minRole`.
 */
export function isSelfOrHasMinRole(
    userId: string,
    targetId: string,
    role: Role,
    minRole: Role,
): boolean {
    return userId === targetId || hasMinRole(role, minRole);
}

/**
 * Can the user access a resource that belongs to `targetId`?
 * Granted if it is the user's own resource OR they outrank the target.
 */
export function isSelfOrCanManage(
    userId: string,
    targetId: string,
    userRole: Role,
    targetRole: Role,
): boolean {
    return userId === targetId || canManage(userRole, targetRole);
}

// ── Labels & display (re-exported so the frontend doesn't need a second file) ─

export const ROLE_LABELS: Record<Role, string> = {
    "Super Admin": "Super Admin",
    T1: "Tier 1 — Director",
    T2: "Tier 2 — Manager",
    T3: "Tier 3 — Senior",
    T4: "Tier 4 — Member",
    T5: "Tier 5 — Associate",
    Applicant: "Applicant",
};

export const SPECIAL_ROLE_LABELS: Record<SpecialRole, string> = {
    Alumni: "Alumni",
    Evaluator: "Evaluator",
};
