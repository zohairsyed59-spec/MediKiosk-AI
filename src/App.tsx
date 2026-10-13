import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { KioskProvider } from '@/hooks/useKiosk';
import { ToastProvider } from '@/components/ui/Toast';
import { Spinner } from '@/components/ui/Spinner';
import { ConfigNotice } from '@/components/ui/ConfigNotice';
import { PageLoader } from '@/components/ui/PageLoader';

const LandingPage = lazy(() => import('@/pages/LandingPage'));

const KioskStart = lazy(() => import('@/pages/kiosk/KioskStart'));
const KioskIdentify = lazy(() => import('@/pages/kiosk/KioskIdentify'));
const KioskConsent = lazy(() => import('@/pages/kiosk/KioskConsent'));
const KioskMode = lazy(() => import('@/pages/kiosk/KioskMode'));
const KioskHistory = lazy(() => import('@/pages/kiosk/KioskHistory'));
const KioskDocuments = lazy(() => import('@/pages/kiosk/KioskDocuments'));
const KioskSummary = lazy(() => import('@/pages/kiosk/KioskSummary'));
const KioskComplete = lazy(() => import('@/pages/kiosk/KioskComplete'));

const PhysicianLogin = lazy(() => import('@/pages/physician/PhysicianLogin'));
const PhysicianSignup = lazy(() => import('@/pages/physician/PhysicianSignup'));
const PhysicianDashboard = lazy(() => import('@/pages/physician/PhysicianDashboard'));
const PhysicianReview = lazy(() => import('@/pages/physician/PhysicianReview'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  if (!user) return <Navigate to="/physician/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={
        <Suspense fallback={<PageLoader />}>
          <LandingPage />
        </Suspense>
      } />

      {/* Patient Kiosk Flow */}
      <Route path="/kiosk" element={
        <Suspense fallback={<PageLoader />}>
          <KioskStart />
        </Suspense>
      } />
      <Route path="/kiosk/identify" element={
        <Suspense fallback={<PageLoader />}>
          <KioskIdentify />
        </Suspense>
      } />
      <Route path="/kiosk/consent" element={
        <Suspense fallback={<PageLoader />}>
          <KioskConsent />
        </Suspense>
      } />
      <Route path="/kiosk/mode" element={
        <Suspense fallback={<PageLoader />}>
          <KioskMode />
        </Suspense>
      } />
      <Route path="/kiosk/history" element={
        <Suspense fallback={<PageLoader />}>
          <KioskHistory />
        </Suspense>
      } />
      <Route path="/kiosk/documents" element={
        <Suspense fallback={<PageLoader />}>
          <KioskDocuments />
        </Suspense>
      } />
      <Route path="/kiosk/summary" element={
        <Suspense fallback={<PageLoader />}>
          <KioskSummary />
        </Suspense>
      } />
      <Route path="/kiosk/complete" element={
        <Suspense fallback={<PageLoader />}>
          <KioskComplete />
        </Suspense>
      } />

      {/* Physician Flow */}
      <Route path="/physician/login" element={
        <Suspense fallback={<PageLoader />}>
          <PhysicianLogin />
        </Suspense>
      } />
      <Route path="/physician/signup" element={
        <Suspense fallback={<PageLoader />}>
          <PhysicianSignup />
        </Suspense>
      } />
      <Route path="/physician/dashboard" element={
        <ProtectedRoute>
          <Suspense fallback={<PageLoader />}>
            <PhysicianDashboard />
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/physician/review/:sessionId" element={
        <ProtectedRoute>
          <Suspense fallback={<PageLoader />}>
            <PhysicianReview />
          </Suspense>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <KioskProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <AppRoutes />
            </Suspense>
          </BrowserRouter>
          <ConfigNotice />
        </KioskProvider>
      </ToastProvider>
    </AuthProvider>
  );
}