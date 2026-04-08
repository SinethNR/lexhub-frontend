import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MessageCircle, Users, BookOpen, ArrowRight, Shield, Globe, Award } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLanguage } from '../contexts/LanguageContext';
import ChatbotWidget from '../components/ChatbotWidget';

const LandingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const { t } = useLanguage();
  const navigate = useNavigate();


  const stats = [
    { number: '500+', label: 'Legal Documents' },
    { number: '50+', label: 'Verified Lawyers' },
    { number: '1000+', label: 'Users Helped' },
    { number: '24/7', label: 'AI Support' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Set a flag in sessionStorage to show toast after redirect
    sessionStorage.setItem('showSearchToast', '1');
    navigate('/auth', { state: { tab: 'signup' } });
  };

  const handleConsultationClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Set a flag in sessionStorage to show toast after redirect
    sessionStorage.setItem('showConsultToast', '1');
    navigate('/auth', { state: { tab: 'signup' } });
  };

  return (
    <div className="min-h-screen">
      <div className="absolute top-0 right-0 p-6 z-20">
        <Link
          to="/auth"
          state={{ tab: 'login' }}
          className="inline-flex items-center px-6 py-2 bg-white text-blue-900 rounded-xl shadow hover:bg-gray-100 transition-colors font-semibold text-base border border-blue-200"
        >
          Login
        </Link>
      </div>
      {/* Toast Container */}
      <ToastContainer />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-emerald-600 text-white py-20 lg:py-32">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-4xl mx-auto">
              {t('hero.subtitle')}
            </p>

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto mb-12">
              <form onSubmit={handleSearch} className="bg-white rounded-2xl p-4 shadow-2xl">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('search.placeholder')}
                      className="w-full pl-12 pr-4 py-4 text-gray-900 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 text-lg"
                      aria-label="Search legal database"
                    />
                  </div>
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="px-4 py-4 text-gray-900 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    aria-label="Filter by category"
                  >
                    <option value="all">{t('filter.all')}</option>
                    <option value="trademarks">{t('filter.trademarks')}</option>
                    <option value="copyrights">{t('filter.copyrights')}</option>
                    <option value="patents">{t('filter.patents')}</option>
                    <option value="designs">{t('filter.designs')}</option>
                  </select>
                  <button
                    type="submit"
                    className="px-8 py-4 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-semibold flex items-center justify-center space-x-2"
                    aria-label="Search"
                  >
                    <Search className="h-5 w-5" />
                    <span>Search</span>
                  </button>
                </div>
              </form>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth"
                state={{ tab: 'signup' }}
                className="inline-flex items-center px-8 py-4 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-semibold text-lg"
              >
                {t('hero.cta')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button
                onClick={handleConsultationClick}
                className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white hover:text-blue-900 transition-colors font-semibold text-lg"
              >
                {t('consultation.cta')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive IP Law Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to understand, research, and navigate intellectual property law in Sri Lanka
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* AI Legal Assistant Feature */}
            <div
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer"
              onClick={() => navigate('/auth', { state: { tab: 'signup' } })}
            >
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI Legal Assistant</h3>
              <p className="text-gray-600 mb-6">Get instant answers to your IP law questions with our intelligent chatbot</p>
              <div className="flex items-center text-blue-600 font-semibold group-hover:text-emerald-600 transition-colors cursor-pointer">
                Learn More
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            {/* Statute Database Feature */}
            <div
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer"
              onClick={() => navigate('/auth', { state: { tab: 'signup' } })}
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Statute Database</h3>
              <p className="text-gray-600 mb-6">Search comprehensive IP laws, regulations, and legal precedents</p>
              <div className="flex items-center text-blue-600 font-semibold group-hover:text-emerald-600 transition-colors cursor-pointer">
                Learn More
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            {/* Expert Consultation Feature */}
            <div
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer"
              onClick={() => navigate('/auth', { state: { tab: 'signup' } })}
            >
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Expert Consultation</h3>
              <p className="text-gray-600 mb-6">Connect with verified IP lawyers for professional legal advice</p>
              <div className="flex items-center text-blue-600 font-semibold group-hover:text-emerald-600 transition-colors cursor-pointer">
                Learn More
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by Legal Professionals
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Built in collaboration with Sri Lankan legal experts and institutions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Verified Content</h3>
              <p className="text-blue-100">All legal information verified by qualified IP lawyers</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Multilingual Support</h3>
              <p className="text-blue-100">Available in English, Sinhala, and Tamil</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Expert Network</h3>
              <p className="text-blue-100">Connected with top IP law practitioners in Sri Lanka</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-500 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Navigate IP Law with Confidence?
          </h2>
          <p className="text-xl mb-8 text-emerald-100">
            Join thousands of users who trust LexHub IP for their legal research and consultation needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/chatbot"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-900 rounded-xl hover:bg-gray-100 transition-colors font-semibold text-lg"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white hover:text-blue-900 transition-colors font-semibold text-lg"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Floating Chatbot Widget */}
      <ChatbotWidget />
    </div>
  );
};

export default LandingPage;