import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FarmerDashboard from './pages/FarmerDashboard';
import SubmitActivity from './pages/SubmitActivity';
import AIRecommendation from './pages/AIRecommendation';
import LeaderboardPage from './pages/LeaderboardPage';
import ChallengesPage from './pages/ChallengesPage';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-400"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
}

function AppLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><AppLayout><FarmerDashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/submit-activity" element={<ProtectedRoute><AppLayout><SubmitActivity /></AppLayout></ProtectedRoute>} />
      <Route path="/ai-recommendation" element={<ProtectedRoute><AppLayout><AIRecommendation /></AppLayout></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute><AppLayout><LeaderboardPage /></AppLayout></ProtectedRoute>} />
      <Route path="/challenges" element={<ProtectedRoute><AppLayout><ChallengesPage /></AppLayout></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute adminOnly><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.1)' },
          success: { iconTheme: { primary: '#10b981', secondary: '#f1f5f9' } }
        }} />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
