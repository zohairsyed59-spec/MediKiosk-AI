import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { KioskProvider } from '@/hooks/useKiosk';
import { ToastProvider } from '@/components/ui/Toast';
import { Spinner } from '@/components/ui/Spinner';
import { ConfigNotice } from '@/components/ui/ConfigNotice';

import LandingPage from '@/pages/LandingPage';
import KioskStart from '@/pages/kiosk/KioskStart';
import KioskIdentify from '@/pages/kiosk/KioskIdentify';
import KioskConsent from '@/pages/kiosk/KioskConsent';
import KioskMode from '@/pages/kiosk/KioskMode';
import KioskHistory from '@/pages/kiosk/KioskHistory';
import KioskDocuments from '@/pages/kiosk/KioskDocuments';
import KioskSummary from '@/pages/kiosk/KioskSummary';
import KioskComplete from '@/pages/kiosk/KioskComplete';

import PhysicianLogin from '@/pages/physician/PhysicianLogin';
import PhysicianSignup from '@/pages/physician/PhysicianSignup';
import PhysicianDashboard from '@/pages/physician/PhysicianDashboard';
import PhysicianReview from '@/pages/physician/PhysicianReview';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  if (!user) return <Navigate to="/physician/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      {/* Patient Kiosk Flow */}
      <Route path="/kiosk" element={<KioskStart />} />
      <Route path="/kiosk/identify" element={<KioskIdentify />} />
      <Route path="/kiosk/consent" element={<KioskConsent />} />
      <Route path="/kiosk/mode" element={<KioskMode />} />
      <Route path="/kiosk/history" element={<KioskHistory />} />
      <Route path="/kiosk/documents" element={<KioskDocuments />} />
      <Route path="/kiosk/summary" element={<KioskSummary />} />
      <Route path="/kiosk/complete" element={<KioskComplete />} />

      {/* Physician Flow */}
      <Route path="/physician/login" element={<PhysicianLogin />} />
      <Route path="/physician/signup" element={<PhysicianSignup />} />
      <Route path="/physician/dashboard" element={<ProtectedRoute><PhysicianDashboard /></ProtectedRoute>} />
      <Route path="/physician/review/:sessionId" element={<ProtectedRoute><PhysicianReview /></ProtectedRoute>} />

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
            <AppRoutes />
          </BrowserRouter>
          <ConfigNotice />
        </KioskProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
