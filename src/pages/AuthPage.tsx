import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Scale, Shield, User, Mail, Lock, Phone, FileText } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../utils/api';

const AuthPage: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'lawyer'>('login');

  useEffect(() => {
    const stateTab = (location.state as any)?.tab;
    if (stateTab && (stateTab === 'login' || stateTab === 'signup' || stateTab === 'lawyer')) {
      setActiveTab(stateTab);
    }
  }, [location.state]);
  const [showPassword, setShowPassword] = useState(false);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    licenseNumber: '',
    specialty: '',
    mfaEnabled: false,
  });
  const { t } = useLanguage();
  const { login } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem('showConsultToast') === '1') {
      toast.info('For Consult a lawyer Sign Up Please', { position: 'top-center', autoClose: 3000 });
      sessionStorage.removeItem('showConsultToast');
    }
    if (sessionStorage.getItem('showSearchToast') === '1') {
      toast.info('Please Sign Up First', { position: 'top-center', autoClose: 3000 });
      sessionStorage.removeItem('showSearchToast');
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Function to parse JWT token
  const parseJwt = (token: string) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate forms
      if ((activeTab === 'signup' || activeTab === 'lawyer') &&
        formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      setIsLoading(true);

      let data;

      if (activeTab === 'login') {



        const loginData = new URLSearchParams();
        loginData.append('username', formData.email);
        loginData.append('password', formData.password);
        data = await api.postForm('/auth/login', loginData);
      } else {
        const payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          user_type: activeTab === 'signup' ? 'user' : 'lawyer',
          phone: activeTab === 'lawyer' ? formData.phone : null,
          licenseNumber: activeTab === 'lawyer' ? formData.licenseNumber : null,
          specialty: activeTab === 'lawyer' ? formData.specialty : null,
        };
        data = await api.post('/auth/register', payload);
      }

      if (activeTab === 'login') {
        // FastAPI returns access_token
        const token = data.access_token;

        // Redirect to dashboard based on user role
        const tokenPayload = parseJwt(token);
        const userRole = tokenPayload.role;

        // Update UserContext (handles localStorage and profile fetch)
        login(token, userRole);

        toast.success(t('Login successful!'));

        if (userRole === 'lawyer') {
          navigate('/lawyer-dashboard');
        } else if (userRole === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/student-dashboard');
        }
      } else {
        toast.success(activeTab === 'signup' ? t('Registration successful! Please login.') : t('Lawyer registration successful! Please login.'));
        setActiveTab('login');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // We already have parseJwt defined above, no need for a duplicate declaration

  const specialties = [
    'Trademarks',
    'Copyrights',
    'Patents',
    'Industrial Designs',
    'IP Strategy',
    'Brand Protection',
    'Technology Law',
    'Media Law',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-emerald-600 pt-16">
      <ToastContainer />
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="p-3 bg-white rounded-xl">
              <Scale className="h-8 w-8 text-blue-900" />
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-bold">LexHub IP</h1>
              <p className="text-blue-100 text-sm">Sri Lanka</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white bg-opacity-10 rounded-xl p-1 mb-6">
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => setActiveTab('login')}
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === 'login'
                ? 'bg-white text-blue-900'
                : 'text-white hover:bg-white hover:bg-opacity-20'
                }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === 'signup'
                ? 'bg-white text-blue-900'
                : 'text-white hover:bg-white hover:bg-opacity-20'
                }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => setActiveTab('lawyer')}
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === 'lawyer'
                ? 'bg-white text-blue-900'
                : 'text-white hover:bg-white hover:bg-opacity-20'
                }`}
            >
              Lawyer
            </button>
          </div>
        </div>

        {/* Forms */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Login Form */}
            {activeTab === 'login' && (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                  <p className="text-gray-600">Sign in to your account</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="john@example.com"
                      required
                      aria-label="Email address"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your password"
                      required
                      aria-label="Password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="mfaEnabled"
                      checked={formData.mfaEnabled}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Enable 2FA</span>
                  </label>
                  <button type="button" className="text-sm text-blue-600 hover:text-blue-700">
                    Forgot password?
                  </button>
                </div>
              </>
            )}

            {/* Signup Form */}
            {activeTab === 'signup' && (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h2>
                  <p className="text-gray-600">Join the LexHub IP community</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John Doe"
                      required
                      aria-label="Full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="john@example.com"
                      required
                      aria-label="Email address"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Create a strong password"
                      required
                      aria-label="Password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Confirm your password"
                      required
                      aria-label="Confirm password"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Lawyer Registration Form */}
            {activeTab === 'lawyer' && (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Lawyer Registration</h2>
                  <p className="text-gray-600">Join our verified legal professionals</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Dr. Jane Smith"
                      required
                      aria-label="Full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="jane@lawfirm.com"
                      required
                      aria-label="Email address"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+94 77 123 4567"
                      required
                      aria-label="Phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Number
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="BAR/2023/001234"
                      required
                      aria-label="License number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IP Law Specialty
                  </label>
                  <select
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    aria-label="IP law specialty"
                  >
                    <option value="">Select your specialty</option>
                    {specialties.map(specialty => (
                      <option key={specialty} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Create a strong password"
                      required
                      aria-label="Password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Confirm your password"
                      required
                      aria-label="Confirm password"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Privacy Notice */}
            {(activeTab === 'signup' || activeTab === 'lawyer') && (
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="privacy"
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  required
                />
                <label htmlFor="privacy" className="text-sm text-gray-600">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setShowPrivacyNotice(true)}
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={() => setShowPrivacyNotice(true)}
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>
            )}            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-900 to-emerald-600 text-white rounded-lg hover:from-blue-800 hover:to-emerald-500 transition-all duration-200 font-medium"
            >
              {isLoading ? 'Processing...' : activeTab === 'login' ? 'Sign In' : activeTab === 'signup' ? 'Create Account' : 'Register as Lawyer'}
            </button>
          </form>
        </div>

        {/* Privacy Notice Modal */}
        {showPrivacyNotice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Privacy Notice</h3>
              </div>
              <div className="text-sm text-gray-600 space-y-3 mb-6">
                <p>
                  LexHub IP Sri Lanka is committed to protecting your privacy and personal data in compliance with applicable data protection laws.
                </p>
                <p>
                  We collect and process your information to provide legal services, maintain our platform, and improve user experience.
                </p>
                <p>
                  Your data is securely stored and never shared with third parties without your explicit consent, except as required by law.
                </p>
                <p>
                  For complete details, please review our full Privacy Policy and Terms of Service on our website.
                </p>
              </div>
              <button
                onClick={() => setShowPrivacyNotice(false)}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                I Understand
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;