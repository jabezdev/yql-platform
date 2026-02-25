import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Authenticated, Unauthenticated } from "convex/react";

// Auth & Pages
import LoginPage from "./core/pages/LoginPage";
import RegisterPage from "./core/pages/RegisterPage";
import LandingPage from "./core/pages/LandingPage";

import { AuthProvider, useAuthContext } from "./core/providers/AuthProvider";
import { RoleGuard } from "./core/components/ui/RoleGuard";

import WorkspaceLayout from "./core/layouts/WorkspaceLayout";
import { getPrimaryWorkspacePath } from "./core/constants/navigation";

import AdmissionsPortal from "./core/pages/AdmissionsPortal";
import RecruitmentDesk from "./core/pages/RecruitmentDesk";
import OperationsHQ from "./core/pages/OperationsHQ";
import AdminControlRoom from "./core/pages/AdminControlRoom";
import StaffOnboardingPage from "./core/pages/StaffOnboardingPage";
import GlobalCalendarPage from "./core/pages/GlobalCalendarPage";
import DirectoryPage from "./core/pages/DirectoryPage";

function RootRedirector() {
  const { user } = useAuthContext();
  if (!user) return <Navigate to="/login" replace />;
  const target = getPrimaryWorkspacePath(user.role, user.staffSubRole);
  return <Navigate to={target} replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
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

          {/* Root Redirectors */}
          <Route path="/dashboard" element={<RootRedirector />} />
          <Route path="/workspace" element={<RootRedirector />} />

          {/* Admissions Workspace - Applicants Only */}
          <Route path="/admissions" element={<RoleGuard allowedRoles={["Applicant"]}><WorkspaceLayout /></RoleGuard>}>
            <Route index element={<AdmissionsPortal />} />
          </Route>

          {/* Recruitment Workspace - Staff(Reviewer) & Admins */}
          <Route path="/recruitment" element={<RoleGuard allowedRoles={["Staff", "Admin"]} disallowedSubRoles={["Alumni"]}><WorkspaceLayout /></RoleGuard>}>
            <Route index element={<RecruitmentDesk />} />
          </Route>

          {/* Operations Workspace - Staff & Admins (No Alumni) */}
          <Route path="/operations" element={<RoleGuard allowedRoles={["Staff", "Admin"]} disallowedSubRoles={["Alumni"]}><WorkspaceLayout /></RoleGuard>}>
            <Route index element={<OperationsHQ />} />
            <Route path="hq" element={<OperationsHQ />} />
            <Route path="calendar" element={<GlobalCalendarPage />} />
            <Route path="onboarding" element={<StaffOnboardingPage />} />
          </Route>

          {/* Network Workspace - Accessible by all authenticated users */}
          <Route path="/network" element={<RoleGuard><WorkspaceLayout /></RoleGuard>}>
            <Route index element={<DirectoryPage />} />
            <Route path="directory" element={<DirectoryPage />} />
          </Route>

          {/* Admin Control Room - Admins Only */}
          <Route path="/admin" element={<RoleGuard allowedRoles={["Admin"]}><WorkspaceLayout /></RoleGuard>}>
            <Route index element={<AdminControlRoom />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
