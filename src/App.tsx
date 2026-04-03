import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Authenticated, Unauthenticated, useConvexAuth } from "convex/react";
import { PageErrorBoundary } from "./components/ui/error/PageErrorBoundary";

import ConvexClientProvider from "./providers/ConvexClientProvider";
import { AuthProvider, useAuthContext } from "./providers/AuthProvider";
import { ToastProvider } from "./providers/ToastProvider";
import { ThemeProvider } from "./providers/ThemeProvider";

import LandingPage from "./pages/public/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import BrandingPage from "./pages/tools/BrandingPage";
import DesignDashboard from "./pages/design/DesignDashboard";
import DesignStudio from "./pages/design/DesignStudio";
import DesignSharePage from "./pages/design/DesignSharePage";
import ChatPage from "./pages/chat/ChatPage";

import GlobalLayout from "./components/layout/GlobalLayout";
import MeDashboard from "./pages/me/MeDashboard";
import AcademyDashboard from "./pages/academy/AcademyDashboard";
import WorkspaceDashboard from "./pages/workspace/WorkspaceDashboard";
import HQDashboard from "./pages/hq/HQDashboard";
import { EmptyState } from "./design";
import { 
    Construction, 
    FileText, 
    CheckSquare, 
    Users, 
    Calendar, 
    ShieldAlert, 
    Zap,
    Briefcase
} from "lucide-react";

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
    const { isAuthenticated, isLoading } = useConvexAuth();
    const { user, isLoading: isUserLoading } = useAuthContext();
    
    if (isLoading || isUserLoading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-[#0d1825]">
                <div className="w-6 h-6 border-2 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
            </div>
        );
    }
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    
    if (allowedRoles && user && !allowedRoles.includes(user.role as string)) {
        return <Navigate to="/me" replace />;
    }
    
    return <>{children}</>;
}

// Auth routes — Clerk/Convex only load for these paths
// Authentication routes — now only contains specialized routes for logged in users
function AuthRoutes() {
    return (
        <Routes>
            <Route path="/login/*" element={
                <>
                    <Authenticated><Navigate to="/me" replace /></Authenticated>
                    <Unauthenticated><LoginPage /></Unauthenticated>
                </>
            } />
            <Route path="/register/*" element={
                <>
                    <Authenticated><Navigate to="/me" replace /></Authenticated>
                    <Unauthenticated><RegisterPage /></Unauthenticated>
                </>
            } />
            {/* Public share page — must come before /design/* wildcard */}
            <Route path="/design/s/:slug" element={<DesignSharePage />} />
            {/* Chat */}
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            
            {/* Domain App Architecture nested under GlobalLayout */}
            <Route element={<ProtectedRoute><GlobalLayout /></ProtectedRoute>}>
                <Route path="/me">
                    <Route index element={<Navigate to="/me/dashboard" replace />} />
                    <Route path="dashboard" element={<MeDashboard />} />
                    <Route path="application" element={<EmptyState icon={FileText} title="My Application" description="Track your YQL Cohort journey and status here." />} />
                    <Route path="tasks" element={<EmptyState icon={CheckSquare} title="Personal Tasks" description="Manage your individual action items and goals." />} />
                    <Route path="hr" element={<EmptyState icon={Briefcase} title="HR Hub" description="Access your employment forms and personal records." />} />
                </Route>

                <Route path="/academy">
                    <Route index element={<Navigate to="/academy/dashboard" replace />} />
                    <Route path="dashboard" element={<AcademyDashboard />} />
                    <Route path="onboarding" element={<EmptyState icon={Zap} title="Onboarding Modules" description="Your step-by-step guide to mastering the platform." />} />
                    <Route path="resources" element={<EmptyState icon={FileText} title="Resource Vault" description="Templates, assets, and documentation library." />} />
                </Route>

                <Route path="/workspace">
                    <Route index element={<Navigate to="/workspace/dashboard" replace />} />
                    <Route 
                        path="*" 
                        element={
                            <ProtectedRoute allowedRoles={["Super Admin", "T1", "T2", "T3", "T4", "T5"]}>
                                <Routes>
                                    <Route path="dashboard" element={<WorkspaceDashboard />} />
                                    <Route path="tasks" element={<EmptyState icon={CheckSquare} title="Global Task Board" description="Collaborative project management for the entire team." />} />
                                    <Route path="calendar" element={<EmptyState icon={Calendar} title="Global Calendar" description="Sync hybrid sessions and platform-wide events." />} />
                                    <Route path="posters" element={<Navigate to="/design" replace />} />
                                    <Route path="directory" element={<EmptyState icon={Users} title="Staff Directory" description="Connect with every member of the YQL collective." />} />
                                    <Route path="hr" element={<EmptyState icon={Briefcase} title="Weekly Logs Portal" description="Submit and review weekly professional logs." />} />
                                </Routes>
                            </ProtectedRoute>
                        } 
                    />
                </Route>

                <Route path="/hq">
                    <Route index element={<Navigate to="/hq/dashboard" replace />} />
                    <Route 
                        path="*" 
                        element={
                            <ProtectedRoute allowedRoles={["Super Admin", "T1", "T2", "T3"]}>
                                <Routes>
                                    <Route path="dashboard" element={<HQDashboard />} />
                                    <Route path="recruitment" element={<EmptyState icon={Users} title="Recruitment Command" description="Manage the applicant funnel and interview pipeline." />} />
                                    <Route path="staff" element={<EmptyState icon={Construction} title="Staff Command" description="Administrative oversight and performance metrics." />} />
                                    <Route path="access" element={<EmptyState icon={ShieldAlert} title="Access Control" description="Manage elevated permissions and security logs." />} />
                                </Routes>
                            </ProtectedRoute>
                        } 
                    />
                </Route>
            </Route>

            {/* Design Studio — requires auth */}
            <Route path="/design" element={<ProtectedRoute><DesignDashboard /></ProtectedRoute>} />
            <Route path="/design/new" element={<ProtectedRoute><DesignStudio /></ProtectedRoute>} />
            <Route path="/design/edit/:id" element={<ProtectedRoute><DesignStudio /></ProtectedRoute>} />
            {/* Legacy redirect */}
            <Route path="/poster/*" element={<Navigate to="/design" replace />} />
            <Route path="*" element={<Navigate to="/me" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <ThemeProvider>
            <ConvexClientProvider>
                <AuthProvider>
                    <ToastProvider>
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
                    </ToastProvider>
                </AuthProvider>
            </ConvexClientProvider>
        </ThemeProvider>
    );
}

export default App;
