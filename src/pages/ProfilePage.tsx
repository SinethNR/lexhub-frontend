import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Briefcase, Link as LinkIcon, Phone, Star, Award, BookOpen, Clock, Edit } from 'lucide-react';
import { api } from '../utils/api';
import { useUser } from '../contexts/UserContext';
import { toast } from 'react-toastify';
import SettingsModal from './SettingsModal';

interface Publication {
  id: number;
  title: string;
  description?: string;
  image_url?: string;
  created_at: string;
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
  user_type: string;
  joined_date: string;
  profile_picture?: string;
  bio?: string;
  occupation?: string;
  linkedin_url?: string;
  phone?: string;
  lawyer_details?: {
    specialty?: string;
    cases_handled?: number;
    success_rate?: string;
    education?: string;
    hourly_rate?: number;
    rating?: number;
    reviews_count?: number;
    publications?: Publication[];
  };
}

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useUser();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const fetchProfile = async () => {
    try {
      const data = await api.get(`/users/profile/${id}`);
      setProfile(data);
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mt-20"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-gray-900 mt-20">Profile Not Found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-900 mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        {/* Profile Header (LinkedIn Style) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          {/* Cover Photo Area */}
          <div className="h-32 md:h-48 bg-gradient-to-r from-blue-900 to-emerald-800 relative">
            {isOwnProfile && (
               <button 
                 onClick={() => setShowSettings(true)}
                 className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-md p-2 rounded-lg text-white transition-colors"
                 title="Edit Profile"
               >
                 <Edit className="h-5 w-5" />
               </button>
            )}
          </div>
          
          <div className="px-6 sm:px-10 pb-8 relative">
            {/* Avatar */}
            <div className="relative -mt-16 md:-mt-24 mb-4">
              <img 
                src={profile.profile_picture || 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=300'} 
                alt={profile.name}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-md bg-white"
              />
            </div>
            
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                <p className="text-lg text-gray-700 mt-1 font-medium">
                  {profile.occupation || (profile.user_type === 'lawyer' ? 'Legal Professional' : 'LexHub User')}
                </p>
                <p className="text-gray-500 text-sm mt-1 flex items-center space-x-1">
                  <MapPin className="h-4 w-4" /> <span>Sri Lanka</span>
                </p>

                {profile.user_type === 'lawyer' && profile.lawyer_details?.specialty && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold border border-blue-100">
                      {profile.lawyer_details.specialty} Specialist
                    </span>
                  </div>
                )}
                
                {/* Contact Info Row */}
                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                  {profile.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800 font-medium">
                      <LinkIcon className="h-4 w-4 mr-1" /> LinkedIn
                    </a>
                  )}
                  {profile.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-1" /> {profile.phone}
                    </div>
                  )}
                  {profile.user_type === 'lawyer' && profile.lawyer_details?.education && (
                     <div className="flex items-center text-gray-600">
                       <Briefcase className="h-4 w-4 mr-1" /> {profile.lawyer_details.education}
                     </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 min-w-[200px]">
                {isOwnProfile ? (
                  <button 
                    onClick={() => setShowSettings(true)}
                    className="w-full px-6 py-2.5 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                  >
                    Edit Profile
                  </button>
                ) : (profile.user_type === 'lawyer' || profile.user_type === 'admin') ? (
                  <>
                    <button 
                      onClick={() => navigate('/consultation')}
                      className="w-full px-6 py-2.5 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors shadow-sm"
                    >
                      Book Appointment
                    </button>
                    <button className="w-full px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                      Message
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About / Bio */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {profile.bio || "No biography provided yet."}
              </p>
            </div>

            {/* Lawyer Specifics: Publications */}
            {(profile.user_type === 'lawyer' || profile.user_type === 'admin') && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Publications & Articles</h2>
                  {isOwnProfile && (
                     <button onClick={() => setShowSettings(true)} className="text-sm text-blue-600 hover:underline font-medium flex items-center gap-1">
                       <Edit className="h-3 w-3" /> Add New
                     </button>
                  )}
                </div>
                
                {profile.lawyer_details?.publications && profile.lawyer_details.publications.length > 0 ? (
                  <div className="space-y-6">
                    {profile.lawyer_details.publications.map(pub => (
                      <div key={pub.id} className="flex flex-col sm:flex-row gap-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                        {pub.image_url && (
                          <img 
                            src={`https://lexhub-backend.onrender.com${pub.image_url}`} 
                            alt={pub.title} 
                            className="w-full sm:w-32 h-32 sm:h-24 object-cover rounded-lg bg-gray-100 border border-gray-200"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{pub.title}</h3>
                          <p className="text-xs text-gray-500 mb-2">
                            {new Date(pub.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                          <p className="text-sm text-gray-700 line-clamp-3">{pub.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <BookOpen className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No publications added yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
             {profile.user_type === 'lawyer' && profile.lawyer_details && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Professional Overview</h3>
                <ul className="space-y-4">
                  <li className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600">
                      <Star className="h-5 w-5 text-yellow-400 mr-2" />
                      <span>Rating</span>
                    </div>
                    <span className="font-semibold">{profile.lawyer_details.rating} ({profile.lawyer_details.reviews_count} reviews)</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600">
                      <Award className="h-5 w-5 text-emerald-500 mr-2" />
                      <span>Cases Handled</span>
                    </div>
                    <span className="font-semibold">{profile.lawyer_details.cases_handled}+</span>
                  </li>
                  {profile.lawyer_details.success_rate && (
                    <li className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <Star className="h-5 w-5 text-blue-500 mr-2" />
                        <span>Success Rate</span>
                      </div>
                      <span className="font-semibold">{profile.lawyer_details.success_rate}</span>
                    </li>
                  )}
                  <li className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-5 w-5 mr-2" />
                      <span>Hourly Rate</span>
                    </div>
                    <span className="font-bold text-gray-900">LKR {profile.lawyer_details.hourly_rate?.toLocaleString()}</span>
                  </li>
                </ul>
              </div>
             )}
          </div>
        </div>
      </div>

      {showSettings && (
        <SettingsModal 
          onClose={() => {
            setShowSettings(false);
            fetchProfile(); // Refresh after edit
          }} 
        />
      )}
    </div>
  );
};

export default ProfilePage;
