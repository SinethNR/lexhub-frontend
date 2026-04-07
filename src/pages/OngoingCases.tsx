import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Clock, Shield, Scale } from 'lucide-react';
import { api } from '../utils/api';
import { toast, ToastContainer } from 'react-toastify';

const OngoingCases: React.FC = () => {
  const [cases, setCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setIsLoading(true);
      const data = await api.get('/cases/me');
      setCases(data);
    } catch (error) {
      toast.error("Failed to load ongoing cases");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-12 pb-20">
      <ToastContainer />
      <div className="w-full px-6 lg:px-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Ongoing Cases</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your active legal consultations and secure workspaces.</p>
        </div>

        {cases.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Scale className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No active cases found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Once a lawyer accepts your consultation, a secure workspace will be created here.
            </p>
            <Link to="/consultation-overview" className="inline-flex items-center gap-2 bg-blue-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-800 transition">
              Find a Lawyer
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {cases.map((c) => (
              <Link 
                key={c.id} 
                to={`/case/${c.id}`}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900 transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl group-hover:bg-blue-900 group-hover:text-white transition-colors text-blue-900 dark:text-blue-400">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 uppercase tracking-tight">{c.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        {c.status.toUpperCase()}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" /> Initiated {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                  Enter Workspace <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OngoingCases;
