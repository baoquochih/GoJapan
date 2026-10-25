import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import React, { Suspense } from 'react';
import MainLayout from "./components/layout/MainLayout";
import { useAuth } from "./context/AuthContext";
import GlobalEffects from "./components/effects/GlobalEffects";

// Lazy Loaded Pages
const HomePage = React.lazy(() => import("./pages/Home"));
const Kana = React.lazy(() => import("./pages/Kana"));
const Vocab = React.lazy(() => import("./pages/Vocab"));
const Kanji = React.lazy(() => import("./pages/Kanji"));
const ProgressPage = React.lazy(() => import('./pages/Progress/index.jsx'));
const LoginPage = React.lazy(() => import("./pages/Authentication/LoginPage"));
const SignUpPage = React.lazy(() => import("./pages/Authentication/SignUpPage"));
const PreferencesPage = React.lazy(() => import("./pages/Preferences/PreferencesPage"));
const FeedbackPage = React.lazy(() => import("./pages/Feedback/FeedbackPage"));
const TrainingSetup = React.lazy(() => import("./pages/Training/TrainingSetup"));
const TrainingPlay = React.lazy(() => import("./pages/Training/TrainingPlay"));
const TrainingStats = React.lazy(() => import("./pages/Training/TrainingStats"));

const SuspenseFallback = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
  </div>
);

// Route wrapper: redirect to login if not authenticated
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Route wrapper: redirect to app if already authenticated
function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppContent() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isAuth = location.pathname === "/login" || location.pathname === "/register";

  // Training routes: full-screen, no sidebar, no mobile topbar
  const isTraining = location.pathname.startsWith("/training/");

  if (isHome) {
    return (
      <Suspense fallback={<SuspenseFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </Suspense>
    );
  }

  if (isAuth) {
    return (
      <Suspense fallback={<SuspenseFallback />}>
        <Routes>
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><SignUpPage /></GuestRoute>} />
        </Routes>
      </Suspense>
    );
  }

  // Training pages: protected but rendered WITHOUT MainLayout
  if (isTraining) {
    return (
      <ProtectedRoute>
        <Suspense fallback={<SuspenseFallback />}>
          <Routes>
            <Route path="/training/setup" element={<TrainingSetup />} />
            <Route path="/training/play" element={<TrainingPlay />} />
            <Route path="/training/stats" element={<TrainingStats />} />
          </Routes>
        </Suspense>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <Suspense fallback={<SuspenseFallback />}>
          <Routes>
            <Route path="/kana" element={<Kana />} />
            <Route path="/vocab" element={<Vocab />} />
            <Route path="/kanji" element={<Kanji />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/preferences" element={<PreferencesPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
          </Routes>
        </Suspense>
      </MainLayout>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <>
      <GlobalEffects />
      <AppContent />
    </>
  );
}

export default App;