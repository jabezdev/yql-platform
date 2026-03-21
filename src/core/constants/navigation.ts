import {
    LayoutDashboard,
    Calendar,
    Users,
    UserPlus,
    CheckSquare,
    BookOpen,
    Globe,
    Info,
    Database,
    Settings,
    ShieldCheck,
    Activity,
    ClipboardList,
    CalendarCog,
    GraduationCap,
    ClipboardCheck,
    Layers,
    SlidersHorizontal,
    CalendarPlus,
    FormInput,
    MessageSquare,
} from "lucide-react";
import type { Role, SpecialRole } from "../../../convex/roleHierarchy";
import { hasMinRole, isStaff } from "../../../convex/roleHierarchy";

export interface NavigationItem {
    id: string;
    title: string;
    href: string;
    icon: any;
    /** Minimum primary role required to see this item. */
    minRole: Role;
    specialRoles?: SpecialRole[];
    disallowedSpecialRoles?: SpecialRole[];
}

export interface NavigationGroup {
    id: string;
    title: string;
    items: NavigationItem[];
}

export const navigationGroups: NavigationGroup[] = [
    {
        id: "workspace",
        title: "WORKSPACE",
        items: [
            {
                id: "dashboard",
                title: "Dashboard",
                href: "/dashboard",
                icon: LayoutDashboard,
                minRole: "T5",
            },
            {
                id: "chat",
                title: "Chat",
                href: "/chat",
                icon: MessageSquare,
                minRole: "T5",
            },
            {
                id: "weekly-hub",
                title: "Weekly Hub",
                href: "/weekly-hub",
                icon: ClipboardList,
                minRole: "T5",
            },
            {
                id: "hr-forms",
                title: "HR Forms",
                href: "/hr",
                icon: ClipboardCheck,
                minRole: "T5",
            },
            {
                id: "calendar",
                title: "Calendar",
                href: "/calendar",
                icon: Calendar,
                minRole: "Applicant",
            }
        ]
    },
    {
        id: "recruitment",
        title: "RECRUITMENT",
        items: [
            {
                id: "admissions",
                title: "Admissions",
                href: "/admissions",
                icon: UserPlus,
                minRole: "Applicant",
            },
            {
                id: "evaluations",
                title: "Applicant Evaluation",
                href: "/evaluations",
                icon: CheckSquare,
                minRole: "T5",
            },
            {
                id: "my-availability",
                title: "My Availability",
                href: "/availability",
                icon: CalendarPlus,
                minRole: "T5",
                specialRoles: ["Evaluator"],
            }
        ]
    },
    {
        id: "learning",
        title: "LEARNING",
        items: [
            {
                id: "onboarding-modules",
                title: "Onboarding",
                href: "/onboarding",
                icon: BookOpen,
                minRole: "T5",
            },
            {
                id: "resource-library",
                title: "Resource Library",
                href: "/resources",
                icon: Globe,
                minRole: "T5",
            },
            {
                id: "quantum-101",
                title: "Quantum 101",
                href: "/quantum-101",
                icon: Database,
                minRole: "T5",
            }
        ]
    },
    {
        id: "qcsp",
        title: "QCSP",
        items: [
            {
                id: "about",
                title: "About the Org",
                href: "/about",
                icon: Info,
                minRole: "Applicant",
            },
            {
                id: "volunteer-matrix",
                title: "Volunteer Matrix",
                href: "/matrix",
                icon: Activity,
                minRole: "T5",
            },
            {
                id: "volunteer-directory",
                title: "Volunteer Directory",
                href: "/directory",
                icon: Users,
                minRole: "T5",
            }
        ]
    },
    {
        id: "management",
        title: "MANAGEMENT",
        items: [
            {
                id: "team-management",
                title: "Team Management",
                href: "/team",
                icon: Settings,
                minRole: "T3",
            },
            {
                id: "admin-cohorts",
                title: "Manage Cohorts",
                href: "/admin/cohorts",
                icon: Layers,
                minRole: "T2",
            },
            {
                id: "admin-rubrics",
                title: "Rubric Builder",
                href: "/admin/rubrics",
                icon: SlidersHorizontal,
                minRole: "T2",
            },
            {
                id: "admin-app-forms",
                title: "Application Forms",
                href: "/admin/app-forms",
                icon: FormInput,
                minRole: "T2",
            },
            {
                id: "admin-calendar",
                title: "Manage Calendar",
                href: "/admin/calendar",
                icon: CalendarCog,
                minRole: "T2",
            },
            {
                id: "admin-onboarding",
                title: "Manage Onboarding",
                href: "/admin/onboarding",
                icon: GraduationCap,
                minRole: "T2",
            },
            {
                id: "roles-permissions",
                title: "Roles & Permissions",
                href: "/roles",
                icon: ShieldCheck,
                minRole: "Super Admin",
            }
        ]
    }
];

export interface NavigationGroupResolved extends NavigationGroup {
    /** Items the user can fully access and navigate to. */
    accessibleItems: NavigationItem[];
    /**
     * Items the user cannot access due to `minRole` but should still see.
     * Rendered as locked/disabled in the sidebar.
     * Only populated for staff users; Applicants never see locked items.
     * Items gated by `specialRoles` are always hidden (not locked) because
     * special roles are granted, not earned by promotion.
     */
    lockedItems: NavigationItem[];
}

/** Returns groups with items split into accessible and locked. */
export function getAccessibleGroups(
    userRole: Role,
    userSpecialRoles?: SpecialRole[],
): NavigationGroupResolved[] {
    const userIsStaff = isStaff(userRole);

    return navigationGroups
        .map(group => {
            const accessibleItems: NavigationItem[] = [];
            const lockedItems: NavigationItem[] = [];

            for (const item of group.items) {
                const meetsMinRole = hasMinRole(userRole, item.minRole);
                const isSpecialRoleGated = !!item.specialRoles;
                const hasSpecialRole = isSpecialRoleGated
                    ? userSpecialRoles?.some(sr => item.specialRoles!.includes(sr))
                    : true;
                const isDisallowed = item.disallowedSpecialRoles
                    ? userSpecialRoles?.some(sr => item.disallowedSpecialRoles!.includes(sr))
                    : false;

                // Always hide disallowed or special-role-gated items the user doesn't hold.
                if (isDisallowed || (isSpecialRoleGated && !hasSpecialRole)) continue;

                if (meetsMinRole) {
                    accessibleItems.push(item);
                } else if (userIsStaff && !isSpecialRoleGated) {
                    // Show as locked to staff who don't yet meet the role threshold.
                    lockedItems.push(item);
                }
                // Applicants and items gated purely by special role → hidden entirely.
            }

            return { ...group, accessibleItems, lockedItems };
        })
        .filter(g => g.accessibleItems.length > 0 || g.lockedItems.length > 0);
}

export function getPrimaryWorkspacePath(role: Role): string {
    if (hasMinRole(role, "T2")) return "/dashboard";
    if (role === "Applicant") return "/admissions";
    return "/dashboard";
}
