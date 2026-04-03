import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'react-toastify';
import { BASE_URL } from '../utils/api';
import 'react-toastify/dist/ReactToastify.css';

const TABS = [
  { key: 'profile', label: 'Profile' },
  { key: 'account', label: 'Account' },
  { key: 'theme', label: 'Theme' },
];

const SettingsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const context = useContext(UserContext);
  const user = context?.user;
  const updateUser = context?.updateUser;
  const { theme, toggleTheme, currentTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [occupation, setOccupation] = useState(user?.occupation || '');
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedin_url || '');
  
  // Lawyer specific states
  const [specialty, setSpecialty] = useState(user?.lawyer_details?.specialty || '');
  const [casesHandled, setCasesHandled] = useState(user?.lawyer_details?.cases_handled || 0);
  const [successRate, setSuccessRate] = useState(user?.lawyer_details?.success_rate || '');
  const [education, setEducation] = useState(user?.lawyer_details?.education || '');
  const [hourlyRate, setHourlyRate] = useState(user?.lawyer_details?.hourly_rate || 20000);

  const [saving, setSaving] = useState(false);
  const [showPhotoActions, setShowPhotoActions] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [autoTheme, setAutoTheme] = useState(() => localStorage.getItem('autoTheme') === 'true');

  const tabs = [...TABS];
  if (user?.user_type === 'lawyer') {
     tabs.splice(1, 0, { key: 'publications', label: 'Publications' });
  }

  const handleSave = async () => {
    setSaving(true);
    if (updateUser) {
      const updates: any = { 
        name: displayName, 
        bio,
        occupation,
        linkedin_url: linkedinUrl
      };
      
      if (user?.user_type === 'lawyer') {
        updates.lawyer_details = {
          ...user.lawyer_details,
          specialty,
          cases_handled: Number(casesHandled),
          success_rate: successRate,
          education,
          hourly_rate: Number(hourlyRate)
        };
      }
      await updateUser(updates);
    }
    setSaving(false);
    onClose();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        setSaving(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/users/profile-picture`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        if (!response.ok) throw new Error('Upload failed');
        
        const data = await response.json();
        const newPhotoUrl = `${BASE_URL}${data.profile_picture}`;
        
        if (updateUser) {
           // We only need to update the local state here since the DB is already updated by the POST
           // But calling updateUser with just the picture will sync everything
           await updateUser({ profile_picture: newPhotoUrl });
        }
        toast.success("Profile picture updated!");
      } catch (error) {
        toast.error("Failed to upload photo");
        console.error(error);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDeletePhoto = () => {
    if (updateUser) updateUser({ profile_picture: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=300' });
  };
  useEffect(() => {
    localStorage.setItem('autoTheme', autoTheme ? 'true' : 'false');
    if (autoTheme) {
      const hour = new Date().getHours();
      // Instead of directly setting theme, we'll add a schedule check to ThemeContext
      localStorage.setItem('scheduledTheme', hour >= 19 || hour < 7 ? 'dark' : 'light');
      // Trigger a theme check by toggling and toggling back
      if (theme !== 'system') {
        toggleTheme();
      }
    }
  }, [autoTheme]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 dark:bg-opacity-80">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xl p-8 relative">
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-2xl transition-colors"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">Settings</h2>
        <div className="flex justify-center flex-wrap gap-4 md:gap-8 border-b border-gray-200 dark:border-gray-700 mb-6">          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`pb-2 px-2 text-sm md:text-base font-medium focus:outline-none transition-colors ${activeTab === tab.key ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>        {activeTab === 'profile' && (
          <div>
            <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 text-center mb-1">Profile Settings</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6 text-sm">Customize your profile information and appearance</p>
            <div className="flex flex-col items-center mb-6">
              <div
                className="relative group"
                onMouseEnter={() => setShowPhotoActions(true)}
                onMouseLeave={() => setShowPhotoActions(false)}
                onClick={() => setShowPhotoActions(true)}
                style={{ width: 120, height: 120 }}
              >                <img
                  src={user?.profile_picture || '/default-avatar.png'}
                  alt="Profile"
                  className="w-28 h-28 rounded-full border-4 border-blue-200 dark:border-blue-800 shadow object-cover transition-all duration-200"
                  style={{ width: 120, height: 120 }}
                />
                {(showPhotoActions) && (
                  <>
                    <button
                      type="button"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 border-2 border-blue-400 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 rounded-full p-2 shadow-lg transition-all"
                      style={{ zIndex: 2 }}
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Upload photo"
                    >
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 16v-8m0 0l-3 3m3-3l3 3"/><rect x="4" y="4" width="16" height="16" rx="4"/></svg>
                    </button>
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 border-2 border-blue-400 text-blue-600 dark:text-blue-400 hover:text-red-500 dark:hover:text-red-400 rounded-full p-2 shadow-lg transition-all"
                      style={{ zIndex: 2 }}
                      onClick={handleDeletePhoto}
                      aria-label="Delete photo"
                    >                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6"/></svg>
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </>
                )}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6">
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-1">Display Name</label>
                <input
                  type="text"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  maxLength={40}
                />              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-1">Bio</label>
                <textarea
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  maxLength={500}
                  rows={3}
                />
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-1">Occupation</label>
                  <input
                    type="text"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={occupation}
                    onChange={e => setOccupation(e.target.value)}
                    placeholder="e.g. Corporate Lawyer, Student"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={linkedinUrl}
                    onChange={e => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>
              
              {user?.user_type === 'lawyer' && (
                <>
                  <hr className="my-6 border-gray-200 dark:border-gray-700" />
                  <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-4">Professional Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-1 text-sm">Specialty</label>
                      <input type="text" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 text-sm" value={specialty} onChange={e => setSpecialty(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-1 text-sm">Education</label>
                      <input type="text" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 text-sm" value={education} onChange={e => setEducation(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-1 text-sm">Cases Handled</label>
                      <input type="number" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 text-sm" value={casesHandled} onChange={e => setCasesHandled(Number(e.target.value))} />
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-1 text-sm">Success Rate (e.g. 98%)</label>
                      <input type="text" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 text-sm" value={successRate} onChange={e => setSuccessRate(e.target.value)} />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-1 text-sm">Hourly Rate (LKR)</label>
                      <input type="number" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 text-sm" value={hourlyRate} onChange={e => setHourlyRate(Number(e.target.value))} />
                    </div>
                  </div>
                </>
              )}
            </div>
            <button
              className="w-full bg-gradient-to-r from-blue-500 to-blue-400 text-white font-semibold py-2 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-500 transition disabled:opacity-60"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        )}
        
        {activeTab === 'publications' && user?.user_type === 'lawyer' && (
          <div>
            <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 text-center mb-1">Publications & Articles</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6 text-sm">Add your published articles, papers, or case studies</p>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8">
              <form onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
                const originalText = submitBtn.innerText;
                
                try {
                   submitBtn.disabled = true;
                   submitBtn.innerText = "Uploading...";
                   const token = localStorage.getItem('token');
                   const res = await fetch(`${BASE_URL}/lawyers/publications`, {
                     method: 'POST',
                     headers: { 'Authorization': `Bearer ${token}` },
                     body: formData
                   });
                   if (!res.ok) throw new Error("Failed to upload");
                   form.reset();
                   alert("Publication added successfully! It will appear on your profile.");
                } catch(err) {
                   alert("Error adding publication. Please check your connection.");
                } finally {
                   submitBtn.disabled = false;
                   submitBtn.innerText = originalText;
                }
              }}>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-1">Title</label>
                  <input name="title" required type="text" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-400" placeholder="e.g. Modern Land Law Precedents" />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-1">Description</label>
                  <textarea name="description" rows={3} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-400" placeholder="Brief abstract or link to full article..."></textarea>
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-1">Cover Image (Optional)</label>
                  <input name="image" type="file" accept="image/*" className="w-full text-gray-700 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg shadow-md hover:bg-blue-700 transition disabled:opacity-50">
                  Upload Publication
                </button>
              </form>
            </div>
          </div>
        )}
        
        {activeTab === 'account' && (
          <div>
            <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 text-center mb-1">Account Settings</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6 text-sm">Manage your account information and security</p>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8">
              <h4 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2">
                <span className="inline-block align-middle">Contact Information</span>
              </h4>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-1 flex items-center gap-2">
                  <span className="material-icons text-blue-600 dark:text-blue-400">phone</span> Phone Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={user?.phone || ''}
                    onChange={e => updateUser && updateUser({ phone: e.target.value })}
                    maxLength={20}
                  />
                  <button
                    className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-800 transition"
                    onClick={() => {}} // Optionally show a toast or feedback
                    type="button"
                  >
                    Update Phone
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-1 flex items-center gap-2">
                  <span className="material-icons text-blue-600 dark:text-blue-400">email</span> Email Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={user?.email || ''}
                    onChange={e => updateUser && updateUser({ email: e.target.value })}
                    maxLength={40}
                  />
                  <button
                    className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-800 transition"
                    onClick={() => {}} // Optionally show a toast or feedback
                    type="button"
                  >
                    Update Email
                  </button>
                </div>
              </div>
            </div>            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2">
                <span className="material-icons text-blue-600 dark:text-blue-400">lock</span> Security Settings
              </h4>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  // Optionally show a toast or feedback
                }}
              >
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-1">Current Password</label>
                  <input
                    type="password"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter your current password"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-1">New Password</label>
                  <input
                    type="password"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter your new password"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Confirm your new password"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 dark:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow-md hover:bg-blue-700 dark:hover:bg-blue-800 transition"
                >
                  Change Password
                </button>
              </form>
            </div>
          </div>
        )}        {activeTab === 'theme' && (
          <div>
            <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 text-center mb-1">Appearance Settings</h3>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8 flex flex-col md:flex-row gap-6 items-center justify-between relative">
              <div className="flex-1 flex flex-col items-center justify-center">                <div
                  className="flex flex-col items-center justify-center w-64 h-32 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  onClick={() => toggleTheme()}
                >
                  <span className="text-3xl mb-2 text-gray-800 dark:text-gray-200">
                    {theme === 'light' && <span className="material-icons">dark_mode</span>}
                    {theme === 'dark' && <span className="material-icons">light_mode</span>}
                    {theme === 'system' && <span className="material-icons">computer</span>}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">Click to toggle theme</span>
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center">                <div className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
                  <div className="text-gray-600 dark:text-gray-400 mb-2">Current Status:</div>
                  <div className="font-semibold text-lg text-gray-800 dark:text-white">
                    {theme === 'system' ? 'System preference' : `Manual: ${currentTheme === 'dark' ? 'Dark mode' : 'Light mode'}`}
                  </div>
                </div>
              </div>
              <span className="absolute top-4 right-4 bg-blue-600 dark:bg-blue-700 text-white text-xs px-3 py-1 rounded-full font-bold">
                {theme === 'system' ? 'System' : currentTheme === 'dark' ? 'Dark' : 'Light'}
              </span>
            </div>            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mt-6">
              <h4 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-4 flex items-center gap-2">
                <span className="material-icons text-green-600 dark:text-green-400">schedule</span> Automatic Theme Scheduling
              </h4>
              <div className="flex items-center gap-4 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoTheme}
                    onChange={e => setAutoTheme(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-green-500 rounded focus:ring-green-400"
                  />
                  <span className="text-gray-800 dark:text-white font-medium">Enable automatic theme scheduling</span>
                </label>
                <span className={`ml-4 px-3 py-1 rounded-full text-xs font-bold ${autoTheme ? 'bg-green-600 dark:bg-green-700 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>{autoTheme ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm ml-7">Automatically switch between light and dark themes based on time of day</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsModal;
