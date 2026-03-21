import type { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

if (!convexUrl) {
    throw new Error(
        "[YQL] VITE_CONVEX_URL is not set. " +
        "Pass it as a Docker build arg: --build-arg VITE_CONVEX_URL=https://your-deployment.convex.cloud"
    );
}
if (!clerkKey) {
    throw new Error(
        "[YQL] VITE_CLERK_PUBLISHABLE_KEY is not set. " +
        "Pass it as a Docker build arg: --build-arg VITE_CLERK_PUBLISHABLE_KEY=pk_..."
    );
}

const convex = new ConvexReactClient(convexUrl);
const PUBLISHABLE_KEY = clerkKey;

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
    return (
        <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                {children}
            </ConvexProviderWithClerk>
        </ClerkProvider>
    );
}
