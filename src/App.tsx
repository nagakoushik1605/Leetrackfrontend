import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Problems from './pages/Problems';
import Contests from './pages/Contests';
import Navbar from './components/Navbar';
import { Spinner } from './components/Loader';
import { useUsername } from './hooks/useUsernameContext';
import { useAuth } from './hooks/useAuthContext';

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner label="Loading..." />
    </div>
  );
}

/** Requires a logged-in Supabase session. Used to gate everything past the auth wall. */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenLoader />;
  if (!session) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return <>{children}</>;
}

/** Requires auth AND a LeetCode username to have been entered/verified. */
function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { username } = useUsername();

  return (
    <RequireAuth>
      {!username ? (
        <Navigate to="/" replace />
      ) : (
        <div className="min-h-screen">
          <Navbar />
          <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      )}
    </RequireAuth>
  );
}

export default function App() {
  const location = useLocation();
  const { session, loading } = useAuth();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/login"
          element={loading ? <FullScreenLoader /> : session ? <Navigate to="/" replace /> : <Auth />}
        />
        <Route
          path="/"
          element={
            <RequireAuth>
              <Landing />
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedLayout>
              <Leaderboard />
            </ProtectedLayout>
          }
        />
        <Route
          path="/problems"
          element={
            <ProtectedLayout>
              <Problems />
            </ProtectedLayout>
          }
        />
        <Route
          path="/contests"
          element={
            <ProtectedLayout>
              <Contests />
            </ProtectedLayout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
