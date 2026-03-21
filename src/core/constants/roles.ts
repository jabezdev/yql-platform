/**
 * Frontend role utilities — all derived from the shared hierarchy.
 */
import {
    ROLE_RANK,
    ROLE_LABELS,
    SPECIAL_ROLE_LABELS,
    hasMinRole,
    isAdmin,
    isManager,
    isStaff,
} from "../../../convex/roleHierarchy";
import type { Role, SpecialRole } from "../../../convex/roleHierarchy";

// Re-export everything the rest of the frontend needs
export { ROLE_LABELS, SPECIAL_ROLE_LABELS, hasMinRole, isAdmin, isManager, isStaff };
export type { Role, SpecialRole };

/** Staff roles ordered by rank (for display: org chart, matrices, etc.) */
export const STAFF_ROLES: Role[] = (Object.entries(ROLE_RANK) as [Role, number][])
    .filter(([role]) => isStaff(role) && role !== "Applicant")
    .sort(([, a], [, b]) => a - b)
    .map(([role]) => role);

export const ROLE_BADGE_COLORS: Record<Role, string> = {
    "Super Admin": "bg-brand-wine/10 text-brand-wine border-brand-wine/30",
    T1: "bg-brand-yellow/20 text-brand-blueDark border-brand-yellow/40",
    T2: "bg-brand-blue/10 text-brand-blueDark border-brand-blue/30",
    T3: "bg-brand-green/10 text-brand-blueDark border-brand-green/30",
    T4: "bg-brand-bgLight text-brand-blueDark border-brand-blueDark/20",
    T5: "bg-brand-bgLight text-brand-blueDark/60 border-brand-blueDark/10",
    Applicant: "bg-gray-100 text-gray-600 border-gray-200",
};
