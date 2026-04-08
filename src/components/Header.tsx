import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scale, Menu, X, Globe, BarChart, User, Bell } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import DashboardSwitcher from './DashboardSwitcher';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { logout, user, role, perspective } = useUser();
  const navigate = useNavigate();
  const [hasActiveCases, setHasActiveCases] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  React.useEffect(() => {
    if (user) {
      const checkCases = async () => {
        try {
          const { api } = await import('../utils/api');
          const cases = await api.get('/cases/me');
          setHasActiveCases(cases.length > 0);
        } catch (e) {
          console.error("Error checking cases", e);
        }
      };
      checkCases();
    }
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const { api } = await import('../utils/api');
      const data = await api.get('/notifications/');
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.is_read).length);
    } catch (e) {
      console.error('Error fetching notifications', e);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleNotifClick = async (notif: any) => {
    try {
      const { api } = await import('../utils/api');
      await api.put(`/notifications/${notif.id}/read`, {});
    } catch (e) { }
    setIsNotifOpen(false);
    switch (notif.type) {
      case 'appointment_booked':
      case 'appointment_status':
        navigate(role === 'lawyer' ? '/lawyer-dashboard' : '/student-dashboard');
        break;
      case 'new_message':
        navigate(`/case/${notif.reference_id}`);
        break;
      case 'forum_reply':
      case 'forum_reaction':
        navigate('/forum');
        break;
      case 'blog_reaction':
        navigate('/blogs');
        break;
      default:
        navigate('/student-dashboard');
    }
    fetchNotifications();
  };

  const getNotifIcon = (type: string) => {
    if (type.includes('appointment')) return '';
    if (type.includes('message')) return '';
    if (type.includes('forum')) return '';
    if (type.includes('blog')) return '';
    return '';
  };
  
  const getDashboardPath = () => {
    if (role === 'admin') {
      if (perspective === 'lawyer') return '/lawyer-dashboard';
      if (perspective === 'user') return '/student-dashboard';
      return '/admin-dashboard';
    }
    if (role === 'lawyer') return '/lawyer-dashboard';
    return '/student-dashboard';
  };

  const navItems = [
    { path: getDashboardPath(), label: t('nav.home') || 'Dashboard' },
    { path: '/chatbot', label: t('nav.chatbot') },
    { path: '/statutes', label: t('nav.statutes') },
    { path: '/forum', label: t('nav.forum') },
    { path: '/blogs', label: 'Blogs' },
    { path: '/consultation', label: t('nav.consultation') },
    { path: '/about', label: t('nav.about') },
  ];

  if (hasActiveCases) {
    navItems.push({ path: '/ongoing-cases', label: 'Ongoing Cases' });
  }
  const languages = [
    { code: 'en', name: 'English', flag: '' },
    { code: 'si', name: 'සහල', flag: '' },
    { code: 'ta', name: 'தமழ', flag: '' },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 w-full">
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
            <div className="p-2 bg-blue-900 rounded-lg">
              <Scale className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-900">LexHub IP</h1>
              <p className="text-xs text-gray-600">Sri Lanka</p>
            </div>
          </Link>
          <nav className="hidden md:flex flex-1 items-center justify-center mx-8 gap-8">
            {navItems.map((item) => {
              const currentDashboardPath = getDashboardPath();
              const isActive = (location.pathname === item.path) || 
                               (item.path === '/ongoing-cases' && location.pathname.startsWith('/case/')) ||
                               (item.path === currentDashboardPath && location.pathname === currentDashboardPath && item.path !== '/');
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-base font-semibold transition-colors hover:text-blue-900 ${
                    isActive
                      ? 'text-blue-900 border-b-2 border-emerald-500 pb-1'
                      : 'text-gray-600'
                  }`}
                  aria-label={item.label}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center space-x-4 flex-shrink-0">
            <DashboardSwitcher />
            <div className="relative">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-900 transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {languages.find(lang => lang.code === language)?.name}
                </span>
              </button>
              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as 'en' | 'si' | 'ta');
                        setIsLanguageOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-3 ${
                        language === lang.code ? 'bg-blue-50 text-blue-900' : 'text-gray-700'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-2 text-gray-600 hover:text-blue-900 transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center bg-gray-50">
                      <span className="text-sm font-bold text-gray-800">Notifications</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-gray-400 font-medium">No notifications yet</div>
                      ) : (
                        notifications.map((notif: any) => (
                          <button
                            key={notif.id}
                            onClick={() => handleNotifClick(notif)}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3 ${!notif.is_read ? 'bg-blue-50/50' : ''}`}
                          >
                            <span className="text-lg mt-0.5 flex-shrink-0">{getNotifIcon(notif.type)}</span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-bold truncate ${!notif.is_read ? 'text-gray-900' : 'text-gray-600'}`}>{notif.title}</p>
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="relative flex items-center bg-gray-100 rounded-full px-2 py-1 flex-grow min-w-0">
              <button
                className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center focus:outline-none"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <img src={user?.profile_picture || '/default-avatar.png'} alt="Profile" className="w-8 h-8 rounded-full object-cover border-2 border-white" />
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 top-12 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <Link to={user?.id ? `/profile/${user.id}` : '#'} className="px-4 py-3 border-b block hover:bg-gray-50">
                    <div className="font-semibold text-gray-900">{user?.name || 'Guest'}</div>
                    <div className="text-xs text-gray-50">{user?.email || ''}</div>
                  </Link>
                  <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50" onClick={() => logout()}>Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;
