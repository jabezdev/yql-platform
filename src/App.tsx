import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Authenticated, Unauthenticated, useConvexAuth } from "convex/react";
import { PageErrorBoundary } from "./components/ui/error/PageErrorBoundary";

import ConvexClientProvider from "./providers/ConvexClientProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { ToastProvider } from "./providers/ToastProvider";

import LandingPage from "./pages/public/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import BrandingPage from "./pages/tools/BrandingPage";
import DesignDashboard from "./pages/design/DesignDashboard";
import DesignStudio from "./pages/design/DesignStudio";
import DesignSharePage from "./pages/design/DesignSharePage";

function DesignRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useConvexAuth();
    if (isLoading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-[#0d1825]">
                <div className="w-6 h-6 border-2 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
            </div>
        );
    }
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return <>{children}</>;
}

// Auth routes — Clerk/Convex only load for these paths
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
                        {/* Public share page — must come before /design/* wildcard */}
                        <Route path="/design/s/:slug" element={<DesignSharePage />} />
                        {/* Design Studio — requires auth */}
                        <Route path="/design" element={<DesignRoute><DesignDashboard /></DesignRoute>} />
                        <Route path="/design/new" element={<DesignRoute><DesignStudio /></DesignRoute>} />
                        <Route path="/design/edit/:id" element={<DesignRoute><DesignStudio /></DesignRoute>} />
                        {/* Legacy redirect */}
                        <Route path="/poster/*" element={<Navigate to="/design" replace />} />
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

                    {/* Auth routes — Clerk + Convex only initialize here */}
                    <Route path="/*" element={<AuthRoutes />} />
                </Routes>
            </PageErrorBoundary>
        </BrowserRouter>
    );
}

export default App;
