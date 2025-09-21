import { motion, AnimatePresence } from 'motion/react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/LoginPage';
import { QuestionListPage } from './components/QuestionListPage';
import { CodeEditorPage } from './components/CodeEditorPage';
import { Navigation } from './components/Navigation';
import { FloatingTextBackground } from './components/FloatingTextBackground';
import { SparkleOverlay } from './components/SparkleOverlay';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import Leaderboard from './components/Leaderboard';

// Component to handle navigation logic
function NavigationWrapper() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleNavigate = (page: string) => {
    navigate(`/${page}`);
  };

  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/' || path === '/login') return 'login';
    if (path === '/questions') return 'questions';
    if (path.startsWith('/editor')) return 'editor';
    return 'login';
  };

  return (
    <Navigation
      currentPage={getCurrentPage()}
      onNavigate={handleNavigate}
      isLoggedIn={isAuthenticated}
    />
  );
}

// Component for the question list with router integration
function QuestionListWithRouter() {
  const navigate = useNavigate();

  const handleSelectQuestion = (questionId: string) => {
    navigate(`/editor/${questionId}`);
  };

  return <QuestionListPage onSelectQuestion={handleSelectQuestion} />;
}

// Component for the code editor with router integration
function CodeEditorWithRouter() {
  const { questionId } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/questions');
  };

  if (!questionId) {
    return <Navigate to="/questions" replace />;
  }

  // Pass questionId as string directly to match backend _id format
  return <CodeEditorPage questionId={questionId} onBack={handleBack} />;
}

// Login component with redirect on success
function LoginWithRouter() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  // Watch for authentication changes and redirect
  useEffect(() => {
    console.log('LoginWithRouter: isAuthenticated =', isAuthenticated, 'isLoading =', isLoading);
    if (isAuthenticated && !isLoading) {
      console.log('Redirecting to /questions...');
      // Use a short delay to ensure all state updates are complete
      setTimeout(() => {
        navigate('/questions', { replace: true });
      }, 50);
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Simplified callback - no logic needed here
  const handleLogin = () => {
    console.log('Login callback called - auth state will handle redirect');
  };

  // Show loading or redirect message if authenticated
  if (isAuthenticated && !isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-black">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <LoginPage onLogin={handleLogin} />;
}

function AppContent() {
  // Add Google Fonts including new animation fonts
  const fontLinks = [
    'https://fonts.googleapis.com/css2?family=Patrick+Hand:wght@400&display=swap',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap',
    'https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap'
  ];

  // Page transition variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  return (
    <Router>
      <div className="min-h-screen bg-white relative">
        {/* Add Google Fonts */}
        {fontLinks.map((href, index) => (
          <link key={index} rel="stylesheet" href={href} />
        ))}

        {/* Background Effects */}
        <FloatingTextBackground />
        <SparkleOverlay />

        {/* Navigation */}
        <NavigationWrapper />

        {/* Routes with page transitions */}
        <AnimatePresence mode="wait">
          <Routes>
            <Route
              path="/"
              element={
                <motion.div
                  key="login"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                >
                  <LoginWithRouter />
                </motion.div>
              }
            />
            <Route
              path="/login"
              element={
                <motion.div
                  key="login-alt"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                >
                  <LoginWithRouter />
                </motion.div>
              }
            />
            <Route 
            path="/leaderboard"
            element={
<Leaderboard />
            }
            ></Route>
            <Route
              path="/questions"
              element={
                <ProtectedRoute>
                  <motion.div
                    key="questions"
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                  >
                    <QuestionListWithRouter />
                  </motion.div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/editor/:questionId"
              element={
                <ProtectedRoute>
                  <motion.div
                    key="editor"
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                  >
                    <CodeEditorWithRouter />
                  </motion.div>
                </ProtectedRoute>
              }
            />
            {/* Redirect any unknown paths to login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthProvider>
  );
}