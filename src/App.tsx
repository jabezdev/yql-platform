import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Authenticated, Unauthenticated, useConvexAuth } from "convex/react";
import { PageErrorBoundary } from "./core/components/ui/PageErrorBoundary";

// Auth & Pages
import LoginPage from "./core/pages/LoginPage";
import RegisterPage from "./core/pages/RegisterPage";
import LandingPage from "./core/pages/LandingPage";

import { AuthProvider, useAuthContext } from "./core/providers/AuthProvider";
import { ToastProvider } from "./core/providers/ToastProvider";
import { RoleGuard } from "./core/components/ui/RoleGuard";

import WorkspaceLayout from "./core/layouts/WorkspaceLayout";
import ChatLayout from "./core/layouts/ChatLayout";
import { getPrimaryWorkspacePath } from "./core/constants/navigation";

import AdmissionsPortal from "./core/pages/AdmissionsPortal";
import DashboardPage from "./core/pages/DashboardPage";
import WeeklyHubPage from "./core/pages/WeeklyHubPage";
import AdminControlRoom from "./core/pages/AdminControlRoom";
import AdminRolesPage from "./core/pages/AdminRolesPage";
import AdminFormsPage from "./core/pages/AdminFormsPage";
import AdminCalendarPage from "./core/pages/AdminCalendarPage";
import AdminOnboardingPage from "./core/pages/AdminOnboardingPage";
import AdminCohortsPage from "./core/pages/AdminCohortsPage";
import AdminRubricPage from "./core/pages/AdminRubricPage";
import AdminFormBuilderPage from "./core/pages/AdminFormBuilderPage";
import MyAvailabilityPage from "./core/pages/MyAvailabilityPage";
import StaffOnboardingPage from "./core/pages/StaffOnboardingPage";
import GlobalCalendarPage from "./core/pages/GlobalCalendarPage";
import DirectoryPage from "./core/pages/DirectoryPage";
import ResourceLibraryPage from "./core/pages/ResourceLibraryPage";
import Quantum101Page from "./core/pages/Quantum101Page";
import AboutPage from "./core/pages/AboutPage";
import VolunteerMatrixPage from "./core/pages/VolunteerMatrixPage";
import ChatPage from "./core/pages/ChatPage";
import BrandingPage from "./core/pages/BrandingPage";

function RootRedirector() {
  const { user } = useAuthContext();
  if (!user) return <Navigate to="/login" replace />;
  const target = getPrimaryWorkspacePath(user.role);
  return <Navigate to={target} replace />;
}

function AuthLoadingScreen() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-brand-bgLight">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-tl-2xl rounded-br-2xl bg-brand-lightBlue border-4 border-brand-blue animate-pulse" />
        <p className="text-sm font-semibold text-brand-blue/50 tracking-wide">Loading…</p>
      </div>
    </div>
  );
}

// Blocks the entire route tree while Convex/Clerk auth is resolving.
// Times out after 5 s so non-localhost dev access (phone on LAN)
// doesn't hang when Clerk cookies are scoped to localhost.
function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoading } = useConvexAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoading) return;
    const id = setTimeout(() => setTimedOut(true), 5000);
    return () => clearTimeout(id);
  }, [isLoading]);

  if (isLoading && !timedOut) return <AuthLoadingScreen />;
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <PageErrorBoundary>
            <AuthGate>
              <Routes>
                {/* Public routes */}
                <Route path="/login/*" element={
                  <>
                    <Authenticated><RootRedirector /></Authenticated>
                    <Unauthenticated><LoginPage /></Unauthenticated>
                  </>
                } />
                <Route path="/register/*" element={
                  <>
                    <Authenticated><RootRedirector /></Authenticated>
                    <Unauthenticated><RegisterPage /></Unauthenticated>
                  </>
                } />
                <Route path="/" element={<LandingPage />} />
                <Route path="/branding" element={<BrandingPage />} />

                {/* Chat — own full-screen layout, staff+ */}
                <Route path="/chat" element={
                  <Authenticated><RoleGuard minRole="T5"><ChatLayout /></RoleGuard></Authenticated>
                }>
                  <Route index element={<ChatPage />} />
                  <Route path=":channelId" element={<ChatPage />} />
                  <Route path=":channelId/thread/:messageId" element={<ChatPage />} />
                </Route>

                {/* Dashboard workspace — single WorkspaceLayout, per-page role gates */}
                <Route path="/dashboard" element={
                  <Authenticated><WorkspaceLayout /></Authenticated>
                }>
                  <Route index element={<Navigate to="overview" replace />} />

                  {/* All authenticated users */}
                  <Route path="calendar" element={<GlobalCalendarPage />} />
                  <Route path="admissions" element={<AdmissionsPortal />} />
                  <Route path="directory" element={<DirectoryPage />} />
                  <Route path="about" element={<AboutPage />} />

                  {/* Staff (T5+) */}
                  <Route path="overview" element={<RoleGuard minRole="T5"><DashboardPage /></RoleGuard>} />
                  <Route path="weekly-hub" element={<RoleGuard minRole="T5"><WeeklyHubPage /></RoleGuard>} />
                  <Route path="hr" element={<RoleGuard minRole="T5"><AdminFormsPage /></RoleGuard>} />
                  <Route path="resources" element={<RoleGuard minRole="T5"><ResourceLibraryPage /></RoleGuard>} />
                  <Route path="quantum-101" element={<RoleGuard minRole="T5"><Quantum101Page /></RoleGuard>} />
                  <Route path="matrix" element={<RoleGuard minRole="T5"><VolunteerMatrixPage /></RoleGuard>} />
                  <Route path="onboarding" element={<RoleGuard minRole="T5"><StaffOnboardingPage /></RoleGuard>} />
                  <Route path="evaluations" element={<RoleGuard minRole="T5"><AdminControlRoom /></RoleGuard>} />
                  <Route path="availability" element={<RoleGuard minRole="T5"><MyAvailabilityPage /></RoleGuard>} />

                  {/* Management (T3+) */}
                  <Route path="team" element={<RoleGuard minRole="T3"><AdminRolesPage /></RoleGuard>} />
                  <Route path="roles" element={<RoleGuard minRole="T3"><AdminRolesPage /></RoleGuard>} />

                  {/* Admin (T2+) */}
                  <Route path="admin/calendar" element={<RoleGuard minRole="T2"><AdminCalendarPage /></RoleGuard>} />
                  <Route path="admin/onboarding" element={<RoleGuard minRole="T2"><AdminOnboardingPage /></RoleGuard>} />
                  <Route path="admin/cohorts" element={<RoleGuard minRole="T2"><AdminCohortsPage /></RoleGuard>} />
                  <Route path="admin/rubrics" element={<RoleGuard minRole="T2"><AdminRubricPage /></RoleGuard>} />
                  <Route path="admin/app-forms" element={<RoleGuard minRole="T2"><AdminFormBuilderPage /></RoleGuard>} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AuthGate>
          </PageErrorBoundary>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
