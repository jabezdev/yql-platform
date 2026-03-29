import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Authenticated, Unauthenticated } from "convex/react";
import { PageErrorBoundary } from "./core/components/ui/error/PageErrorBoundary";

import { AuthProvider } from "./core/providers/AuthProvider";
import { ToastProvider } from "./core/providers/ToastProvider";

import LandingPage from "./core/pages/public/LandingPage";
import LoginPage from "./core/pages/auth/LoginPage";
import RegisterPage from "./core/pages/auth/RegisterPage";
import BrandingPage from "./core/pages/tools/BrandingPage";
import PosterCreatorPage from "./core/pages/tools/PosterCreatorPage";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <PageErrorBoundary>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/branding" element={<BrandingPage />} />
              <Route path="/poster" element={<PosterCreatorPage />} />

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
          </PageErrorBoundary>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
