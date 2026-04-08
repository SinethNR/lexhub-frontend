import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, MapPin, Phone, Mail, Video, MessageSquare, User, Award, Calendar, Clock, Filter } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../utils/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUser } from '../contexts/UserContext';
import PaymentModal from '../components/PaymentModal';

interface Lawyer {
  id: number;
  name: string;
  user_type: string;
  profile_picture?: string;
  bio?: string;
  lawyer_details?: {
    phone?: string;
    license_number?: string;
    specialty?: string;
    cases_handled?: number;
    success_rate?: string;
    education?: string;
    hourly_rate?: number;
    rating?: number;
    reviews_count?: number;
  };
}

const ConsultationPage: React.FC = () => {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
  const [consultationType, setConsultationType] = useState<'video' | 'phone' | 'inperson'>('video');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [description, setDescription] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const { t } = useLanguage();
  const { user, isLoggedIn } = useUser();

  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const data = await api.get('/lawyers');
        setLawyers(data);
      } catch (error) {
        toast.error('Failed to fetch lawyers');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLawyers();
  }, [isLoggedIn, user]);

  useEffect(() => {
    const fetchBookedSlots = async () => {
      setSelectedTime(''); // Reset selected time when date changes
      if (selectedLawyer && selectedDate) {
        try {
          const slots = await api.get(`/consultations/booked-slots?lawyer_user_id=${selectedLawyer.id}&date=${selectedDate}`);
          setBookedSlots(slots);
        } catch (error) {
          console.error('Failed to fetch booked slots');
        }
      } else {
        setBookedSlots([]);
      }
    };
    fetchBookedSlots();
  }, [selectedLawyer, selectedDate]);

  useEffect(() => {
    if (isLoggedIn && user) {
      setContactEmail(user.email || '');
    }
  }, [isLoggedIn, user]);

  const specialties = ['all', 'Trademarks', 'Patents', 'Copyrights', 'Industrial Designs', 'IP Strategy'];
  const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];

  const filteredLawyers = lawyers.filter(lawyer => {
    const matchesSearch = lawyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lawyer.lawyer_details?.specialty?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || lawyer.lawyer_details?.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  }).sort((a, b) => {
    // If a lawyer or admin is viewing this page, make their card pin to the top
    if (isLoggedIn && (user?.user_type === 'lawyer' || user?.user_type === 'admin')) {
      if (a.id === user.id) return -1;
      if (b.id === user.id) return 1;
    }
    return 0; // Maintain original order for others
  });

  const handleProceedToPayment = () => {
    if (!description || description.trim() === '') {
       toast.error("Please provide a brief description of your issue");
       return;
    }
    setIsPaymentModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (selectedLawyer && selectedDate && selectedTime) {
      try {
        await api.post('/consultations/', {
          lawyer_id: selectedLawyer.id,
          consultation_date: selectedDate,
          consultation_time: selectedTime,
          description: description,
          contact_phone: contactPhone,
          contact_email: contactEmail,
          is_paid: true
        });
        toast.success(`Payment verified! Consultation booked with ${selectedLawyer.name}!`);
        setIsPaymentModalOpen(false);
        setSelectedLawyer(null);
        setSelectedDate('');
        setSelectedTime('');
        setDescription('');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Booking failed');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <ToastContainer />
      <div className="w-full px-6 py-8">
        {!selectedLawyer ? (
          <>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Lawyer Consultation</h1>
              <p className="text-gray-600">Connect with verified IP lawyers for professional legal advice</p>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search lawyers by name or specialty..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Search lawyers"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-gray-500" />
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Filter by specialty"
                  >
                    {specialties.map(specialty => (
                      <option key={specialty} value={specialty}>
                        {specialty === 'all' ? 'All Specialties' : specialty}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Free Consultation Banner */}
            <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl p-6 mb-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold mb-2">Free First Consultation Available!</h2>
                  <p className="text-emerald-100">Many of our lawyers offer a complimentary initial consultation to discuss your IP needs.</p>
                </div>
                <div className="text-4xl">🎯</div>
              </div>
            </div>

            <div className="space-y-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading lawyers...</p>
                </div>
              ) : filteredLawyers.map((lawyer) => (
                <div key={lawyer.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-start space-y-4 lg:space-y-0 lg:space-x-6">
                    <Link to={`/profile/${lawyer.id}`}>
                      <img 
                        src={lawyer.profile_picture || 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=300'} 
                        alt={lawyer.name}
                        className="w-24 h-24 rounded-full object-cover mx-auto lg:mx-0 hover:ring-4 hover:ring-blue-100 transition-all cursor-pointer"
                      />
                    </Link>
                    <div className="flex-1">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                        <div className="mb-4 lg:mb-0">
                          <Link to={`/profile/${lawyer.id}`} className="flex items-center space-x-3 mb-2 hover:text-blue-600 transition-colors">
                            <h3 className="text-xl font-semibold text-gray-900 hover:underline">{lawyer.name} {user?.id === lawyer.id ? '(You)' : ''}</h3>
                          </Link>
                          <p className="text-blue-600 font-medium mb-2">{lawyer.lawyer_details?.specialty || 'General Practitioner'}</p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center space-x-1">
                              <Award className="h-4 w-4" />
                              <span>{lawyer.lawyer_details?.cases_handled || 0} cases handled</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>Colombo, Sri Lanka</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-center lg:text-right">
                          <div className="text-2xl font-bold text-gray-900">LKR {lawyer.lawyer_details?.hourly_rate ? lawyer.lawyer_details.hourly_rate.toLocaleString() : '20,000'}</div>
                          <div className="text-sm text-gray-600">per hour</div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">{lawyer.lawyer_details?.rating || '4.8'}</span>
                          <span className="text-sm text-gray-600">({lawyer.lawyer_details?.reviews_count || 50} reviews)</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {lawyer.lawyer_details?.specialty && (
                            <span
                              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                            >
                              {lawyer.lawyer_details.specialty}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-700 mb-4">{lawyer.bio || 'Experienced IP lawyer ready to assist with your legal needs.'}</p>
                        
                        <div className="flex flex-wrap gap-3">
                          {user?.id === lawyer.id ? (
                            <button disabled className="px-6 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed">
                              This is your profile
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedLawyer(lawyer)}
                              className="px-6 py-2 bg-gradient-to-r from-blue-900 to-emerald-600 text-white rounded-lg hover:from-blue-800 hover:to-emerald-500 transition-all duration-200"
                            >
                              Book Consultation
                            </button>
                          )}
                          <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                            <MessageSquare className="h-4 w-4" />
                            <span>Message</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredLawyers.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No lawyers found</h3>
                <p className="text-gray-600">Try adjusting your search terms or filters</p>
              </div>
            )}
          </>
        ) : (
          /* Booking Form */
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="mb-6">
                <button
                  onClick={() => setSelectedLawyer(null)}
                  className="text-blue-600 hover:text-blue-700 mb-4"
                >
                  ← Back to lawyers
                </button>
                <div className="flex items-center space-x-4">
                  <img 
                    src={selectedLawyer.profile_picture || 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=300'} 
                    alt={selectedLawyer.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedLawyer.name}</h2>
                    <p className="text-blue-600">{selectedLawyer.lawyer_details?.specialty || 'General Practitioner'}</p>
                    <p className="text-gray-600">LKR {selectedLawyer.lawyer_details?.hourly_rate ? selectedLawyer.lawyer_details.hourly_rate.toLocaleString() : '20,000'} per hour</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Consultation Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Consultation Type
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setConsultationType('video')}
                      className={`p-4 border rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                        consultationType === 'video'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Video className="h-6 w-6" />
                      <span className="text-sm font-medium">Video Call</span>
                    </button>
                    <button
                      onClick={() => setConsultationType('phone')}
                      className={`p-4 border rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                        consultationType === 'phone'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Phone className="h-6 w-6" />
                      <span className="text-sm font-medium">Phone Call</span>
                    </button>
                    <button
                      onClick={() => setConsultationType('inperson')}
                      className={`p-4 border rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                        consultationType === 'inperson'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <User className="h-6 w-6" />
                      <span className="text-sm font-medium">In Person</span>
                    </button>
                  </div>
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Time Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Available Times
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {timeSlots.map((time) => {
                      const isBooked = bookedSlots.includes(time);
                      return (
                      <button
                        key={time}
                        disabled={isBooked}
                        onClick={() => setSelectedTime(time)}
                        className={`p-3 border rounded-lg text-center transition-colors shadow-sm ${
                          isBooked 
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                            : selectedTime === time
                              ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold'
                              : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <span className={isBooked ? 'line-through' : ''}>{time}</span>
                        {isBooked && <span className="block mt-1 text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-50 py-0.5 rounded">Booked</span>}
                      </button>
                    )})}
                  </div>
                </div>

                {/* Legal Issue Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Brief Description of Legal Issue
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Please provide a brief overview of your IP matter..."
                  />
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+94 77 123 4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                {/* Booking Summary */}
                {selectedDate && selectedTime && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Consultation Summary</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p>Lawyer: {selectedLawyer.name}</p>
                      <p>Type: {consultationType === 'video' ? 'Video Call' : consultationType === 'phone' ? 'Phone Call' : 'In Person'}</p>
                      <p>Date: {selectedDate}</p>
                      <p>Time: {selectedTime}</p>
                      <p>Rate: LKR {selectedLawyer.lawyer_details?.hourly_rate ? selectedLawyer.lawyer_details.hourly_rate.toLocaleString() : '20,000'}/hour</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleProceedToPayment}
                  disabled={!selectedDate || !selectedTime}
                  className="w-full px-6 py-4 mt-2 bg-gradient-to-r from-blue-900 to-emerald-600 text-white rounded-xl hover:from-blue-800 hover:to-emerald-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 font-bold text-lg shadow-lg flex justify-center items-center gap-2"
                >
                  Proceed to Payment (Rs {selectedLawyer.lawyer_details?.hourly_rate ? selectedLawyer.lawyer_details.hourly_rate.toLocaleString() : '20,000'})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isPaymentModalOpen && selectedLawyer && (
        <PaymentModal 
          amount={selectedLawyer.lawyer_details?.hourly_rate || 20000}
          lawyerName={selectedLawyer.name}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={handleConfirmBooking}
        />
      )}
    </div>
  );
};

export default ConsultationPage;