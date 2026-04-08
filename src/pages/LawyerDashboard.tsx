import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, TrendingUp, Clock, Star, Settings, CheckCircle, XCircle, MessageSquare, FileText, ExternalLink, Heart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { api } from '../utils/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const LawyerDashboard: React.FC = () => {
  const { user, updateUser } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'profile' | 'blogs' | 'statutes'>('overview');
  const [consultations, setConsultations] = useState<any[]>([]);
  const [myBlogs, setMyBlogs] = useState<any[]>([]);
  const [myStatutes, setMyStatutes] = useState<any[]>([]);
  const [totalHearts, setTotalHearts] = useState(0);
  const [forumStats, setForumStats] = useState({ posts_count: 0, likes_received: 0, replies_received: 0 });
  const [isLoading, setIsLoading] = useState(true);
  useLanguage(); 

  // Settings State
  const [hourlyRate, setHourlyRate] = useState(20000);
  const [bio, setBio] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchConsultations();
    if (user) {
      setHourlyRate(user.lawyer_details?.hourly_rate || 20000);
      setBio(user.bio || '');
      setSpecialty(user.lawyer_details?.specialty || '');
    }
  }, [user]);

  const fetchConsultations = async () => {
    try {
      setIsLoading(true);
      const data = await api.get('/consultations/my-consultations');
      setConsultations(data);
      
      const blogsRes = await api.get('/blogs/me');
      setMyBlogs(blogsRes);
      const hearts = blogsRes.reduce((acc: number, blog: any) => acc + (blog.likes_count || 0), 0);
      setTotalHearts(hearts);

      const fStats = await api.get('/forum/user-stats');
      setForumStats(fStats);

      const statutesRes = await api.get('/statutes/my-uploads');
      setMyStatutes(statutesRes);

    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const pendingConsultations = consultations.filter(c => c.status === 'pending');
  const activeConsultations = consultations.filter(c => c.status === 'confirmed');

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/consultations/${id}/status?status=${status}`, {});
      toast.success(`Consultation ${status}`);
      fetchConsultations();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteStatute = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this statute? This cannot be undone.')) return;
    try {
      await api.delete(`/statutes/${id}`);
      toast.success('Statute deleted');
      fetchConsultations();
    } catch (e) {
      toast.error('Failed to delete statute');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updates = {
        bio,
        lawyer_details: {
          ...user?.lawyer_details,
          hourly_rate: Number(hourlyRate),
          specialty: specialty
        }
      };
      
      // Update DB directly
      await api.put(`/users/profile/${user.id}`, updates);
      
      // Update Local Context
      if (updateUser) {
         await updateUser(updates);
      }
      
      toast.success('Profile and Fees updated successfully. This is now live for users!');
    } catch (error) {
      toast.error('Failed to update Settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <ToastContainer />
      <div className="w-full px-6 lg:px-12 py-8">

        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user?.name || 'Lawyer'}</h1>
            <p className="text-gray-600">Manage your consultations, active cases, and profile settings.</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-4">
            <button onClick={() => setActiveTab('profile')} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 font-medium transition shadow-sm">
              <Settings className="w-5 h-5"/> Profile Setup
            </button>
          </div>
        </div>

        {/* Stats Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="bg-gradient-to-br from-yellow-500 to-orange-400 rounded-2xl shadow-lg p-6 hover:scale-[1.03] transition-all duration-300 hover:shadow-2xl group cursor-default">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-50 text-sm font-medium">Rating</p>
                <p className="text-3xl font-bold text-white mt-1">{user?.lawyer_details?.rating || 4.8}</p>
              </div>
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl group-hover:bg-white/30 transition-colors">
                <Star className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <Star className="h-4 w-4 text-yellow-200 fill-current" />
              <span className="text-yellow-50 text-xs font-medium ml-1">{user?.lawyer_details?.reviews_count || 50} total reviews</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-600 to-rose-500 rounded-2xl shadow-lg p-6 hover:scale-[1.03] transition-all duration-300 hover:shadow-2xl group cursor-default">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-50 text-sm font-medium">Pending Requests</p>
                <p className="text-3xl font-bold text-white mt-1">{pendingConsultations.length}</p>
              </div>
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl group-hover:bg-white/30 transition-colors">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-xs font-medium text-red-50">
              Requires attention
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-500 rounded-2xl shadow-lg p-6 hover:scale-[1.03] transition-all duration-300 hover:shadow-2xl group cursor-default">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-50 text-sm font-medium">Active Cases</p>
                <p className="text-3xl font-bold text-white mt-1">{activeConsultations.length}</p>
              </div>
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl group-hover:bg-white/30 transition-colors">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 text-xs font-medium text-blue-50">
              Confirmed engagements
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-teal-500 rounded-2xl shadow-lg p-6 hover:scale-[1.03] transition-all duration-300 hover:shadow-2xl group cursor-default">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-50 text-sm font-medium">Forum Activity</p>
                <p className="text-3xl font-bold text-white mt-1">{forumStats.replies_received + forumStats.likes_received}</p>
              </div>
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl group-hover:bg-white/30 transition-colors">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 text-xs font-medium text-emerald-50">
              {forumStats.replies_received} replies • {forumStats.likes_received} likes
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-600 to-rose-500 rounded-2xl shadow-lg p-6 hover:scale-[1.03] transition-all duration-300 hover:shadow-2xl group cursor-default">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-50 text-sm font-medium">Blog Hearts</p>
                <p className="text-3xl font-bold text-white mt-1">{totalHearts}</p>
              </div>
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl group-hover:bg-white/30 transition-colors">
                <Heart className="h-6 w-6 text-white fill-current" />
              </div>
            </div>
            <div className="mt-4 text-xs font-medium text-pink-50">
              Likes on your publications
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-purple-500 rounded-2xl shadow-lg p-6 hover:scale-[1.03] transition-all duration-300 hover:shadow-2xl group cursor-default">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-50 text-sm font-medium">Statutes Shared</p>
                <p className="text-3xl font-bold text-white mt-1">{myStatutes.length}</p>
              </div>
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl group-hover:bg-white/30 transition-colors">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 text-xs font-medium text-indigo-50 cursor-pointer hover:underline" onClick={() => setActiveTab('statutes')}>
              Docs contributed
            </div>
          </div>
        </div>


        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
          <div className="flex flex-wrap border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 font-medium text-sm transition-colors flex-1 md:flex-none text-center ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Overview & Pending
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-6 py-4 font-medium text-sm transition-colors flex-1 md:flex-none text-center ${activeTab === 'schedule' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Confirmed Schedule
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-4 font-medium text-sm transition-colors flex-1 md:flex-none text-center ${activeTab === 'profile' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Profile & Fees Setting
            </button>
            <button
              onClick={() => setActiveTab('blogs')}
              className={`px-6 py-4 font-medium text-sm transition-colors flex-1 md:flex-none text-center ${activeTab === 'blogs' ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50' : 'text-gray-600 hover:text-gray-900'}`}
            >
              My Publications
            </button>
            <button
              onClick={() => setActiveTab('statutes')}
              className={`px-6 py-4 font-medium text-sm transition-colors flex-1 md:flex-none text-center ${activeTab === 'statutes' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Statute Contributions
            </button>
          </div>
        </div>

        {/* Overview Tab (Pending Actions) */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">New Appointment Requests</h2>
            {isLoading ? (
              <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
            ) : pendingConsultations.length === 0 ? (
              <div className="bg-white border rounded-xl p-12 text-center text-gray-500">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4 opacity-50" />
                <p className="text-lg">You are all caught up! No pending requests.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {pendingConsultations.map((consult) => (
                  <div key={consult.id} className="bg-white rounded-xl shadow-sm border border-orange-200 p-6 flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold uppercase tracking-wide">New Request</span>
                        <Link to={`/profile/${consult.user_id}`} className="hover:underline hover:text-blue-600 transition-colors">
                          <h3 className="text-lg font-bold text-gray-900">{consult.user?.name || 'Client'}</h3>
                        </Link>
                      </div>
                      <div className="text-gray-600 text-sm space-y-1 mt-3">
                        <p className="flex items-center gap-2"><Calendar className="w-4 h-4"/> <strong>Proposed Date:</strong> {consult.consultation_date} at {consult.consultation_time}</p>
                        <p className="flex items-start gap-2 mt-2"><MessageSquare className="w-4 h-4 mt-1 flex-shrink-0"/> <span className="italic">"{consult.description || 'No specific description provided'}"</span></p>
                      </div>
                    </div>
                    <div className="flex flex-row md:flex-col gap-3 justify-center md:items-end">
                      <button 
                        onClick={() => handleUpdateStatus(consult.id, 'confirmed')}
                        className="flex-1 md:flex-none px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition"
                      >
                        Accept Case
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(consult.id, 'cancelled')}
                        className="flex-1 md:flex-none px-6 py-2.5 bg-gray-100 text-red-600 font-medium rounded-lg hover:bg-red-50 hover:text-red-700 transition"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" /> Active Schedule
            </h2>

            {activeConsultations.length === 0 ? (
               <p className="text-center text-gray-500 py-12">No upcoming confirmed appointments.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-left text-sm font-medium text-gray-500">
                    <tr>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Client Name</th>
                      <th className="px-6 py-4">Date & Time</th>
                      <th className="px-6 py-4">Notes</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {activeConsultations.map((consult) => (
                      <tr key={consult.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4"><span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">Confirmed</span></td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          <Link to={`/profile/${consult.user_id}`} className="hover:underline hover:text-blue-600 transition-colors">
                            {consult.user?.name || 'Client'}
                          </Link>
                        </td>
                        <td className="px-6 py-4 font-medium text-blue-600">{consult.consultation_date} • {consult.consultation_time}</td>
                        <td className="px-6 py-4 max-w-[200px] truncate text-gray-600" title={consult.description}>{consult.description}</td>
                        <td className="px-6 py-4 flex flex-col gap-2">
                          <button 
                            onClick={async () => {
                              try {
                                const res = await api.post('/cases/', {
                                  consultation_id: consult.id,
                                  title: `Case: ${consult.user?.name || 'Client'}`
                                });
                                navigate(`/case/${res.id}`);
                              } catch (e) {
                                toast.error("Failed to start workspace");
                              }
                            }}
                            className="bg-blue-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-800 transition flex items-center gap-1 justify-center"
                          >
                            Enter Workspace
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(consult.id, 'completed')}
                            className="text-emerald-600 hover:text-emerald-800 text-xs font-medium flex items-center gap-1 justify-center"
                          >
                            <CheckCircle className="w-3.5 h-3.5"/> Mark Done
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Profile Setting Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Public Profile Setup</h2>
            <p className="text-gray-600 mb-8 border-b pb-6">Update how you appear to users on the Consultation hiring page.</p>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">My Hourly Rate (LKR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rs</span>
                  <input
                    type="number"
                    min="1000"
                    required
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg font-bold text-gray-900"
                    placeholder="20000"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">This dictates how much users are quoted when booking you.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Primary Specialty</label>
                <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="">Select Specialty</option>
                    <option value="Trademarks">Trademarks</option>
                    <option value="Copyrights">Copyrights</option>
                    <option value="Patents">Patents</option>
                    <option value="Industrial Designs">Industrial Designs</option>
                    <option value="IP Strategy">IP Strategy</option>
                  </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Professional Bio</label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Tell clients about your expertise..."
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isSaving ? 'Updating Network...' : 'Save & Publish Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* My Publications Tab */}
        {activeTab === 'blogs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Heart className="w-6 h-6 text-emerald-600" /> My Published Blogs
              </h2>
              <button 
                onClick={() => window.location.href='/blogs'} 
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-medium shadow-sm"
              >
                + Write New Blog
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myBlogs.length === 0 ? (
                <div className="col-span-full bg-white border rounded-xl p-12 text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg">You haven't published any blogs yet.</p>
                  <p className="text-sm">Sharing your expertise helps build trust with potential clients.</p>
                </div>
              ) : (
                myBlogs.map((blog) => (
                  <div key={blog.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
                        {blog.tags || 'General'}
                      </span>
                      <div className="flex items-center gap-1 text-pink-500">
                        <Heart className="w-4 h-4 fill-current" />
                        <span className="text-sm font-bold">{blog.likes_count}</span>
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2" title={blog.title}>{blog.title}</h3>
                    <p className="text-gray-500 text-sm mb-6 line-clamp-3">{blog.excerpt || blog.content.substring(0, 100) + "..."}</p>
                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-50">
                      <span className="text-xs text-gray-400">{new Date(blog.created_at).toLocaleDateString()}</span>
                      <button onClick={() => window.location.href='/blogs'} className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center gap-1 transition-colors">
                        View <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Statutes Management Tab */}
        {activeTab === 'statutes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-indigo-600" /> Contributed Statutes
              </h2>
              <button 
                onClick={() => window.location.href='/statutes'} 
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium flex items-center gap-2 shadow-sm"
              >
                + Add New Statute
              </button>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {myStatutes.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg">You haven't uploaded any statutes yet.</p>
                  <p className="text-sm">Contributing official documents builds your reputation as a reliable IP expert.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 text-left text-sm font-medium text-gray-500">
                      <tr>
                        <th className="px-6 py-4">Title</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">File Name</th>
                        <th className="px-6 py-4">Size</th>
                        <th className="px-6 py-4">Uploaded On</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {myStatutes.map((doc: any) => (
                        <tr key={doc.id} className="hover:bg-gray-50 group">
                          <td className="px-6 py-4 font-bold text-gray-900">{doc.title}</td>
                          <td className="px-6 py-4 uppercase text-[10px] font-bold tracking-wider text-blue-600">{doc.category}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-[200px]">{doc.file_name}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{doc.file_size}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{new Date(doc.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleDeleteStatute(doc.id)}
                              className="text-red-400 hover:text-red-600 transition-colors p-2"
                              title="Delete Statute"
                            >
                              <XCircle className="w-5 h-5"/>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default LawyerDashboard;