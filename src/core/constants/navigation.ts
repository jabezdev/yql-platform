import { FileText, Users, Settings, Activity, Globe } from "lucide-react";
import type { Role, StaffSubRole } from "../providers/AuthProvider";

export interface WorkspaceItem {
    id: string;
    title: string;
    href: string;
    icon: any;
    roles: Role[];
    disallowedSubRoles?: StaffSubRole[];
}

export const workspaces: WorkspaceItem[] = [
    {
        id: "admissions",
        title: "Admissions",
        href: "/admissions",
        icon: FileText,
        roles: ["Applicant"],
    },
    {
        id: "recruitment",
        title: "Recruitment",
        href: "/recruitment",
        icon: Users,
        roles: ["Staff", "Admin"],
        disallowedSubRoles: ["Alumni"],
    },
    {
        id: "operations",
        title: "Operations",
        href: "/operations",
        icon: Activity,
        roles: ["Staff", "Admin"],
    },
    {
        id: "network",
        title: "Network",
        href: "/network",
        icon: Globe,
        roles: ["Applicant", "Staff", "Admin"],
    },
    {
        id: "admin",
        title: "Admin",
        href: "/admin",
        icon: Settings,
        roles: ["Admin"],
    }
];

export function getPrimaryWorkspacePath(role: Role, subRole?: StaffSubRole): string {
    if (role === "Admin") return "/admin";
    if (role === "Staff") {
        if (subRole === "Reviewer") return "/recruitment";
        if (subRole === "Alumni") return "/network";
        return "/operations";
    }
    return "/admissions";
}
