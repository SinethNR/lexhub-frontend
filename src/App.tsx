import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import React, { useEffect } from 'react';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ChatbotPage from './pages/ChatbotPage';
import StatutePage from './pages/StatutePage';
import ForumPage from './pages/ForumPage';
import ConsultationPage from './pages/ConsultationPage';
import StudentDashboard from './pages/StudentDashboard';
import LawyerDashboard from './pages/LawyerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AuthPage from './pages/AuthPage';
import AboutPage from './pages/AboutPage';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import LandingPage from './pages/LandingPage';
import AIAssistantOverview from './pages/AIAssistantOverview';
import StatuteOverview from './pages/StatuteOverview';
import ConsultationOverview from './pages/ConsultationOverview';
import { UserProvider } from './contexts/UserContext';
import BlogsPage from './pages/BlogsPage';
import ProfilePage from './pages/ProfilePage';
import CaseWorkspace from './pages/CaseWorkspace';
import OngoingCases from './pages/OngoingCases';
import ReportsPage from './pages/ReportsPage';

function AppContent() {
  const location = useLocation();
  const { currentTheme } = useTheme();  // Remove header for overview pages, auth page, and admin dashboard
  const noHeaderRoutes = ['/', '/ai-assistant', '/statute-overview', '/consultation-overview', '/auth', '/admin-dashboard'];
  const hideHeader = noHeaderRoutes.includes(location.pathname);
  
  // Update document metadata based on theme
  useEffect(() => {
    // Set color-scheme meta tag
    let metaColorScheme = document.querySelector('meta[name="color-scheme"]');
    if (!metaColorScheme) {
      metaColorScheme = document.createElement('meta');
      metaColorScheme.setAttribute('name', 'color-scheme');
      document.head.appendChild(metaColorScheme);
    }
    metaColorScheme.setAttribute('content', currentTheme);
    
    // Set theme-color meta tag for mobile browsers
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', currentTheme === 'dark' ? '#111827' : '#ffffff');
    
  }, [currentTheme]);
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      {!hideHeader && <Header />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/chatbot" element={<ChatbotPage />} />
        <Route path="/statutes" element={<StatutePage />} />
        <Route path="/statute-overview" element={<StatuteOverview />} />
        <Route path="/forum" element={<ForumPage />} />
        <Route path="/consultation" element={<ConsultationPage />} />
        <Route path="/consultation-overview" element={<ConsultationOverview />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/lawyer-dashboard" element={<LawyerDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/ai-assistant" element={<AIAssistantOverview />} />
        <Route path="/blogs" element={<BlogsPage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/case/:id" element={<CaseWorkspace />} />
        <Route path="/ongoing-cases" element={<OngoingCases />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <UserProvider>
        <ThemeProvider>
          <Router>
            <AppContent />
          </Router>
        </ThemeProvider>
      </UserProvider>
    </LanguageProvider>
  );
}

export default App;