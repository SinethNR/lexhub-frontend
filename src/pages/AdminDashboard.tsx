import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Briefcase, Trash2, Activity, UserPlus, X } from 'lucide-react';
import { api } from '../utils/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminDashboard: React.FC = () => {
  const { role, isLoggedIn } = useUser();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_users: 0, total_lawyers: 0, total_consultations: 0, total_admins: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'lawyers' | 'admins'>('users');
  const [loading, setLoading] = useState(true);

  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    user_type: 'user',
    phone: '',
    licenseNumber: '',
    specialty: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/auth');
    } else if (role !== 'admin') {
      toast.error('Unauthorized Access');
      navigate('/');
    } else {
      fetchAdminData();
    }
  }, [isLoggedIn, role, navigate]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      const [statsData, usersData, lawyersData, adminsData] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/lawyers'),
        api.get('/admin/admins')
      ]);
      
      setStats({ ...statsData, total_admins: adminsData.length });
      setUsers(usersData);
      setLawyers(lawyersData);
      setAdmins(adminsData);

    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number, role: string) => {
    if (!window.confirm(`Are you sure you want to delete this ${role}? This action cannot be undone.`)) return;
    
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success(`${role} deleted successfully`);
      fetchAdminData(); // Refresh lists
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      


      await api.post('/admin/users', newUser);
      toast.success(`${newUser.user_type} created successfully`);
      setShowAddModal(false);
      setNewUser({ name: '', email: '', password: '', user_type: 'user', phone: '', licenseNumber: '', specialty: '' });
      fetchAdminData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActiveData = () => {
    if (activeTab === 'users') return users;
    if (activeTab === 'lawyers') return lawyers;
    return admins;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row pt-16">
      <ToastContainer />
      
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white shadow-lg sticky top-0 h-auto md:h-screen p-6 hidden md:block z-10">
        <div className="flex items-center space-x-3 mb-8">
          <Shield className="h-8 w-8 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Admin Control</h2>
        </div>
        
        <nav className="space-y-4">
          <button
            onClick={() => setActiveTab('admins')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'admins' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Shield className="h-5 w-5" />
            <span>Manage Admins</span>
          </button>
          
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'users' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Users className="h-5 w-5" />
            <span>Manage Users</span>
          </button>
          
          <button
            onClick={() => setActiveTab('lawyers')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'lawyers' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Briefcase className="h-5 w-5" />
            <span>Manage Lawyers</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Overview and management of the LexHub platform</p>
          </div>
          


          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <UserPlus className="h-5 w-5" />
            <span>Add New Account</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="h-12 w-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Admins</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.total_admins}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Users</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.total_users}</h3>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Lawyers</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.total_lawyers}</h3>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Consultations</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.total_consultations}</h3>
            </div>
          </div>
        </div>

        {/* Tables */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                {activeTab === 'users' ? 'Registered Users' : activeTab === 'lawyers' ? 'Registered Lawyers' : 'Platform Admins'}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-left text-sm font-medium text-gray-500">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Status</th>
                    {activeTab === 'lawyers' && <th className="px-6 py-4">Specialty</th>}
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {getActiveData().map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{u.name}</td>
                      <td className="px-6 py-4 text-gray-600">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          Active
                        </span>
                      </td>
                      {activeTab === 'lawyers' && (
                        <td className="px-6 py-4 text-gray-600">{u.lawyer_details?.specialty || 'N/A'}</td>
                      )}
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDeleteUser(u.id, activeTab.replace(/s$/, ''))}
                          className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors" title="Delete User">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {getActiveData().length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Add Platform Account</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-800">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Account Role</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500"
                  value={newUser.user_type}
                  onChange={e => setNewUser({...newUser, user_type: e.target.value})}
                >
                  <option value="user">Standard User</option>
                  <option value="lawyer">Lawyer</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              
              <div><label className="block text-sm font-medium mb-1">Full Name</label><input required className="w-full border rounded-lg p-3" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-1">Email</label><input required type="email" className="w-full border rounded-lg p-3" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-1">Password</label><input required type="password" minLength={6} className="w-full border rounded-lg p-3" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} /></div>

              {newUser.user_type === 'lawyer' && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-sm">Lawyer Details</h3>
                  <div><label className="block text-sm font-medium mb-1">Phone</label><input required className="w-full border rounded-lg p-3" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} /></div>
                  <div><label className="block text-sm font-medium mb-1">License Number</label><input required className="w-full border rounded-lg p-3" value={newUser.licenseNumber} onChange={e => setNewUser({...newUser, licenseNumber: e.target.value})} /></div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Specialty</label>
                    <select required className="w-full border rounded-lg p-3" value={newUser.specialty} onChange={e => setNewUser({...newUser, specialty: e.target.value})}>
                      <option value="">Select Specialty</option>
                      <option value="Trademarks">Trademarks</option>
                      <option value="Copyrights">Copyrights</option>
                      <option value="Patents">Patents</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 font-medium transition">
                  {isSubmitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default AdminDashboard;
