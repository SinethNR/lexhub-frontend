import React, { useState, useEffect } from 'react';
import { FileText, Clock, Briefcase, Heart, MessageSquare, Shield } from 'lucide-react';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const [myConsultations, setMyConsultations] = useState<any[]>([]);
  const [forumStats, setForumStats] = useState({ posts_count: 0, likes_received: 0, replies_received: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [consultData, fStats] = await Promise.all([
          api.get('/consultations/my-consultations'),
          api.get('/forum/user-stats')
        ]);
        setMyConsultations(consultData);
        setForumStats(fStats);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <ToastContainer />
      <div className="w-full px-6 lg:px-12 py-8">

        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Dashboard</h1>
          <p className="text-gray-600">Access your legal consultations, case law database, and community activity</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl shadow-lg p-6 hover:scale-[1.03] transition-all duration-300 hover:shadow-2xl group cursor-default">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">My Consultations</p>
                <p className="text-3xl font-bold text-white mt-1">{myConsultations.length}</p>
              </div>
              <div className="p-4 bg-white/20 backdrop-blur-md rounded-xl group-hover:bg-white/30 transition-colors">
                <Briefcase className="h-7 w-7 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-blue-100 text-xs font-medium">
               Active legal requests
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-teal-500 rounded-2xl shadow-lg p-6 hover:scale-[1.03] transition-all duration-300 hover:shadow-2xl group cursor-default">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Forum Posts</p>
                <p className="text-3xl font-bold text-white mt-1">{forumStats.posts_count}</p>
              </div>
              <div className="p-4 bg-white/20 backdrop-blur-md rounded-xl group-hover:bg-white/30 transition-colors">
                <MessageSquare className="h-7 w-7 text-white" />
              </div>
            </div>
            <p className="text-xs text-emerald-100 mt-4 font-medium">{forumStats.replies_received} replies received from community</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl shadow-lg p-6 hover:scale-[1.03] transition-all duration-300 hover:shadow-2xl group cursor-default">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-50 text-sm font-medium">Total Reactions</p>
                <p className="text-3xl font-bold text-white mt-1">{forumStats.likes_received}</p>
              </div>
              <div className="p-4 bg-white/20 backdrop-blur-md rounded-xl group-hover:bg-white/30 transition-colors">
                <Heart className="h-7 w-7 text-white fill-current" />
              </div>
            </div>
            <p className="text-xs text-blue-50 mt-4 font-medium">Engagement across all your activity</p>
          </div>
        </div>


        {/* Content Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 p-6">
          <div className="flex items-center space-x-2 text-blue-600 border-b-2 border-blue-600 w-fit pb-2 mb-6">
            <Briefcase className="h-5 w-5" />
            <span className="font-bold">My Consultations</span>
          </div>

          {/* User Consultations Tab Content */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Your Hired Lawyers & Requests</h2>
            {loading ? (
               <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
            ) : myConsultations.length === 0 ? (
               <div className="bg-white p-8 rounded-xl border border-gray-100 text-center shadow-sm">
                 <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                 <h3 className="text-gray-900 font-medium mb-1">No Consultations Yet</h3>
                 <p className="text-gray-500 mb-4">You haven't requested any lawyer consultations.</p>
                 <a href="/consultation-overview" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Find a Lawyer</a>
               </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myConsultations.map((consult) => (
                  <div key={consult.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative">
                    <span className={`absolute top-4 right-4 px-2.5 py-1 text-xs font-semibold rounded-full 
                      ${consult.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 
                        consult.status === 'completed' ? 'bg-gray-100 text-gray-800' : 
                        consult.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {consult.status.toUpperCase()}
                    </span>
                    <div className="flex items-center mb-4">
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                        {consult.lawyer_id}
                      </div>
                      <div className="ml-4">
                        <p className="font-semibold text-gray-900">Lawyer ID: {consult.lawyer_id}</p>
                        <p className="text-sm text-gray-500">Consultation Request</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        {new Date(consult.consultation_date).toLocaleDateString()} at {consult.consultation_time}
                      </div>
                      <div className="flex items-start text-sm text-gray-600">
                        <FileText className="w-4 h-4 mr-2 mt-0.5 min-w-[16px]" />
                        <span className="line-clamp-2">{consult.description || 'No description provided.'}</span>
                      </div>
                    </div>
                    {consult.status === 'confirmed' && (
                      <button 
                        onClick={async () => {
                          try {
                            const res = await api.post('/cases/', {
                              consultation_id: consult.id,
                              title: `Case: ${consult.lawyer_id}`
                            });
                            navigate(`/case/${res.id}`);
                          } catch (e) {
                            toast.error("Failed to enter workspace");
                          }
                        }}
                        className="w-full py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 text-sm font-bold transition-all mb-2 flex items-center justify-center gap-2"
                      >
                        <Shield className="w-4 h-4" /> Enter Case Workspace
                      </button>
                    )}
                    {consult.status === 'pending' && (
                      <button 
                        onClick={async () => {
                           try {
                             await api.put(`/consultations/${consult.id}/status?status=cancelled`, {});
                             setMyConsultations(myConsultations.map(c => c.id === consult.id ? {...c, status: 'cancelled'} : c));
                             toast.success('Consultation cancelled');
                           } catch (e) { toast.error('Error cancelling'); }
                        }}
                        className="w-full py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors">
                        Cancel Request
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;