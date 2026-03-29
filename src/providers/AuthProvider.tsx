import { createContext, useContext, useEffect, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import type { Role, SpecialRole } from "../../convex/org/roleHierarchy";

/* eslint-disable react-refresh/only-export-components */
export type { Role, SpecialRole };

export interface UserProfile {
    _id: Id<"users">;
    _creationTime: number;
    clerkId?: string;
    email: string;
    name: string;
    role: Role;
    specialRoles?: SpecialRole[];
    bio?: string;
    profileChip?: string;
    profileChipUrl?: string | null;
    recommitmentStatus?: "pending" | "accepted" | "declined";
}

interface AuthContextType {
    user: UserProfile | null | undefined; // undefined means loading
    isLoading: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: undefined,
    isLoading: true,
    isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading: isConvexAuthLoading } = useConvexAuth();
    const storeUser = useMutation(api.users.storeUser);
    const currentUser = useQuery(api.users.getCurrentUser);
    const [hasStored, setHasStored] = useState(false);

    useEffect(() => {
        if (isAuthenticated && !hasStored) {
            storeUser().then(() => {
                setHasStored(true);
            }).catch(err => {
                console.error("Failed to store user:", err);
            });
        }
    }, [isAuthenticated, hasStored, storeUser]);

    const isLoading = isConvexAuthLoading || (isAuthenticated && currentUser === undefined);

    return (
        <AuthContext.Provider
            value={{
                user: currentUser as UserProfile | null | undefined,
                isLoading,
                isAuthenticated,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    return useContext(AuthContext);
}
