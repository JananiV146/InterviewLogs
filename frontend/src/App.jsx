import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import UserLayout from './components/UserLayout';
import AdminLayout from './components/AdminLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ExperiencesPage from './pages/ExperiencesPage';
import ExperienceDetailPage from './pages/ExperienceDetailPage';
import SubmitPage from './pages/SubmitPage';
import DashboardPage from './pages/DashboardPage';
import MessagingPage from './pages/MessagingPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import { useAuth } from './hooks/useAuth';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* User Routes */}
          <Route element={<UserLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/experiences" element={<ExperiencesPage />} />
            <Route path="/experiences/:id" element={<ExperienceDetailPage />} />
            <Route
              path="/submit"
              element={
                <ProtectedRoute>
                  <SubmitPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit/:id"
              element={
                <ProtectedRoute>
                  <SubmitPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messaging"
              element={
                <ProtectedRoute>
                  <MessagingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminLayout />}>
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
