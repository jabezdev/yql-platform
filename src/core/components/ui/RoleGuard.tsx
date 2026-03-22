import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../../providers/AuthProvider";
import type { Role, SpecialRole } from "../../../../convex/roleHierarchy";
import { hasMinRole } from "../../../../convex/roleHierarchy";
import { Loader2 } from "lucide-react";
import UnauthorizedPage from "../../pages/UnauthorizedPage";

interface RoleGuardProps {
    children: React.ReactNode;
    /** Minimum primary role required (hierarchy-based). */
    minRole?: Role;
    allowedSpecialRoles?: SpecialRole[];
    disallowedSpecialRoles?: SpecialRole[];
}

export function RoleGuard({
    children,
    minRole,
    allowedSpecialRoles,
    disallowedSpecialRoles,
}: RoleGuardProps) {
    const { user, isLoading, isAuthenticated } = useAuthContext();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <Loader2 className="animate-spin text-brand-lightBlue" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check primary role via hierarchy
    if (minRole && !hasMinRole(user.role as Role, minRole)) {
        return <UnauthorizedPage />;
    }

    // Check special roles — user must have at least one of the allowed special roles
    if (allowedSpecialRoles) {
        const hasAllowed = allowedSpecialRoles.some((r) => user.specialRoles?.includes(r));
        if (!hasAllowed) {
            return <UnauthorizedPage />;
        }
    }

    // Deny if user holds any of the disallowed special roles
    if (disallowedSpecialRoles) {
        const hasDisallowed = disallowedSpecialRoles.some((r) => user.specialRoles?.includes(r));
        if (hasDisallowed) {
            return <UnauthorizedPage />;
        }
    }

    return <>{children}</>;
}
