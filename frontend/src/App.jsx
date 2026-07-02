import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar.jsx';
import Sidebar from './components/layout/Sidebar.jsx';
import FeedbackForm from './pages/FeedbackForm.jsx';
import FeedbackList from './pages/FeedbackList.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { useAuth } from './context/AuthContext.jsx';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
}

function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-body">
        <Navbar />
        <div className="admin-content">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <main className="app-main">
        <Routes>
          {/* Public: feedback form lives at /feedback */}
          <Route path="/feedback" element={<FeedbackForm />} />

          {/* Redirect root to /feedback */}
          <Route path="/" element={<Navigate to="/feedback" replace />} />

          {/* Admin auth */}
          <Route path="/admin/login" element={<Login />} />

          {/* Admin protected routes wrapped in AdminLayout */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/feedback"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <FeedbackList />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/feedback" replace />} />
        </Routes>
      </main>
    </div>
  );
}
