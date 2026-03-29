import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Authenticated, Unauthenticated } from "convex/react";
import { PageErrorBoundary } from "./components/ui/error/PageErrorBoundary";

import ConvexClientProvider from "./providers/ConvexClientProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { ToastProvider } from "./providers/ToastProvider";

import LandingPage from "./pages/public/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import BrandingPage from "./pages/tools/BrandingPage";
import PosterCreatorPage from "./pages/tools/PosterCreatorPage";

// Auth routes wrapped in providers — Clerk/Convex only load for these paths
function AuthRoutes() {
    return (
        <ConvexClientProvider>
            <AuthProvider>
                <ToastProvider>
                    <Routes>
                        <Route path="/login/*" element={
                            <>
                                <Authenticated><Navigate to="/" replace /></Authenticated>
                                <Unauthenticated><LoginPage /></Unauthenticated>
                            </>
                        } />
                        <Route path="/register/*" element={
                            <>
                                <Authenticated><Navigate to="/" replace /></Authenticated>
                                <Unauthenticated><RegisterPage /></Unauthenticated>
                            </>
                        } />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </ToastProvider>
            </AuthProvider>
        </ConvexClientProvider>
    );
}

function App() {
    return (
        <BrowserRouter>
            <PageErrorBoundary>
                <Routes>
                    {/* Public routes — render instantly, no auth provider */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/branding" element={<BrandingPage />} />
                    <Route path="/poster" element={<PosterCreatorPage />} />

                    {/* Auth routes — Clerk + Convex only initialize here */}
                    <Route path="/*" element={<AuthRoutes />} />
                </Routes>
            </PageErrorBoundary>
        </BrowserRouter>
    );
}

export default App;
