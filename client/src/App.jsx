import { useLayoutEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import AIChat from './pages/AIChat';
import ARDecorationBuilder from './pages/ARDecorationBuilder';
import ARViewerPage from './pages/ARViewerPage';
import { ForgotPasswordPage, LoginPage, ResetPasswordPage, SignupPage } from './pages/auth';
import BudgetPlanner from './pages/BudgetPlanner';
import CategoryProviders from './pages/CategoryProviders';
import DashboardPage from './pages/DashboardPage';
import BookingPage from './pages/BookingPage';
import Home from './pages/Home';
import ProvidersPage from './pages/ProvidersPage';

// Homepage layout — the original single-page experience
function HomePage() {
  const [arDecorationImage, setArDecorationImage] = useState(null);
  const location = useLocation();

  useLayoutEffect(() => {
    const targetId = location?.state?.scrollTarget;

    if (targetId) {
      // Wait one frame so the home sections are mounted, then scroll to the target.
      const rafId = requestAnimationFrame(() => {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'auto', block: 'start' });
        // Clear navigation state so subsequent navigations don't reuse it.
        try { window.history.replaceState({}, '', window.location.pathname); } catch (e) {}
      });

      return () => cancelAnimationFrame(rafId);
    }

    // Default: ensure top
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    const frame = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });

    return () => cancelAnimationFrame(frame);
  }, [location]);

  const handleTryInAR = (imageSrc) => {
    setArDecorationImage(imageSrc);
    setTimeout(() => {
      document.getElementById('ar-preview')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <>
      <Home />
      <AIChat onTryInAR={handleTryInAR} />
      <BudgetPlanner />
      <ARViewerPage
        externalImage={arDecorationImage}
        onClearExternal={() => setArDecorationImage(null)}
      />
    </>
  );
}

function App() {
  const location = useLocation();
  const isAuthRoute = ['/login', '/signup', '/forgot-password', '/reset-password', '/dashboard'].some((path) => location.pathname.startsWith(path));
  const isBookingRoute = location.pathname === '/booking';

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main className="page-wrapper">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/providers" element={<ProvidersPage />} />
          <Route path="/providers/:category" element={<CategoryProviders />} />
          <Route path="/ar-builder" element={<ARDecorationBuilder />} />
          <Route path="/booking" element={<BookingPage />} />
        </Routes>
      </main>
      {!isAuthRoute && <Footer />}
    </>
  );
}

export default App;
