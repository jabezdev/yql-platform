import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../../providers/AuthProvider";
import type { Role, StaffSubRole } from "../../providers/AuthProvider";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles?: Role[];
    allowedSubRoles?: StaffSubRole[];
    disallowedSubRoles?: StaffSubRole[];
    fallbackUrl?: string;
}

export function RoleGuard({
    children,
    allowedRoles,
    allowedSubRoles,
    disallowedSubRoles,
    fallbackUrl = "/dashboard"
}: RoleGuardProps) {
    const { user, isLoading, isAuthenticated } = useAuthContext();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <Loader2 className="animate-spin text-brand-blue" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!user) {
        // Edge case if user profile failed to load despite being authenticated
        return <Navigate to="/login" replace />;
    }

    // Check generic role
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to={fallbackUrl} replace />;
    }

    // Check subRole if specified (usually applies to Staff)
    if (allowedSubRoles) {
        if (!user.staffSubRole || !allowedSubRoles.includes(user.staffSubRole)) {
            return <Navigate to={fallbackUrl} replace />;
        }
    }

    if (disallowedSubRoles && user.staffSubRole) {
        if (disallowedSubRoles.includes(user.staffSubRole)) {
            return <Navigate to={fallbackUrl} replace />;
        }
    }

    return <>{children}</>;
}
