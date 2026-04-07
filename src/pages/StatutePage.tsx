import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Bookmark, ExternalLink, Calendar, Tag, Star, Download, FileText, Layers, Eye, Plus, X, FileUp, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { api, BASE_URL } from '../utils/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface StatuteSection {
  id: number;
  document_id: number;
  section_number: string | null;
  title: string;
  content: string;
  summary: string | null;
  document_title: string;
  created_at: string;
}

interface StatuteDocument {
  id: number;
  user_id: number;
  title: string;
  category: string;
  description: string;
  file_url: string;
  file_name: string;
  file_size: string;
  created_at: string;
  uploader_name: string;
}

const StatutePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [documentSearchQuery, setDocumentSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [documentCategory, setDocumentCategory] = useState('all');
  const [results, setResults] = useState<StatuteSection[]>([]);
  const [documentResults, setDocumentResults] = useState<StatuteDocument[]>([]);
  const [allDocuments, setAllDocuments] = useState<StatuteDocument[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDocSearching, setIsDocSearching] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [showSummaries, setShowSummaries] = useState<Set<number>>(new Set());
  const [bookmarkedStatutes, setBookmarkedStatutes] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<'search' | 'documents'>('search');
  interface UploadDocumentData {
    file: File;
    title: string;
    description: string;
    category: string;
  }
  const [downloadStatus, setDownloadStatus] = useState<{[key: string]: 'idle' | 'loading' | 'success' | 'error'}>({});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<UploadDocumentData[]>([]);
  const { t } = useLanguage();
  const { user } = useUser();



  const categories = [
    { value: 'all', label: t('filter.all') },
    { value: 'trademarks', label: t('filter.trademarks') },
    { value: 'copyrights', label: t('filter.copyrights') },
    { value: 'patents', label: t('filter.patents') },
    { value: 'designs', label: t('filter.designs') },
  ];

  const documentCategories = [
    { value: 'all', label: 'All Documents' },
    { value: 'trademarks', label: 'Trademark Laws' },
    { value: 'copyrights', label: 'Copyright Laws' },
    { value: 'patents', label: 'Patent Laws' },
    { value: 'digital', label: 'Digital IP Laws' },
    { value: 'international', label: 'International Agreements' },
    { value: 'enforcement', label: 'Enforcement Laws' },
  ];
  const fetchDocuments = async () => {
    setIsDocSearching(true);
    try {
      const data = await api.get('/statutes/');
      setAllDocuments(data);
      setDocumentResults(data);
      
      // Initialize download status
      const initialStatus: any = {};
      data.forEach((doc: any) => initialStatus[doc.id] = 'idle');
      setDownloadStatus(initialStatus);
    } catch (error) {
      toast.error("Failed to load documents");
    } finally {
      setIsDocSearching(false);
    }
  };

  useEffect(() => {
    // Check URL parameters for initial search
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    const filter = urlParams.get('filter');
    
    if (query) {
      setSearchQuery(query);
      if (filter && filter !== 'all') {
        setSelectedCategory(filter);
      }
      handleSearch(query, filter || 'all');
    }
    
    fetchDocuments();
  }, []);

  const handleSearch = async (query?: string, category?: string) => {
    const searchTerm = query || searchQuery;
    const filterCategory = category || selectedCategory;
    
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const data = await api.get(`/statutes/search?q=${encodeURIComponent(searchTerm)}&category=${filterCategory}`);
      setResults(data);
    } catch (error) {
      toast.error("Failed to search statutes");
    } finally {
      setIsSearching(false);
    }
  };

  const handleDocumentSearch = (query?: string, category?: string) => {
    const searchTerm = query !== undefined ? query : searchQuery;
    const filterCategory = category !== undefined ? category : selectedCategory;

    let filteredDocs = allDocuments.filter(doc => 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.uploader_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterCategory !== 'all') {
      filteredDocs = filteredDocs.filter(doc => doc.category === filterCategory);
    }

    setDocumentResults(filteredDocs);
  };

  const handleDocumentDownload = async (doc: StatuteDocument) => {
    try {
      setDownloadStatus(prev => ({ ...prev, [doc.id]: 'loading' }));
      
      const fullUrl = `${BASE_URL}${doc.file_url}`;
      window.open(fullUrl, '_blank');
      
      setDownloadStatus(prev => ({ ...prev, [doc.id]: 'success' }));
      toast.success(`${doc.file_name} is opening in a new tab.`);
      
      setTimeout(() => {
        setDownloadStatus(prev => ({ ...prev, [doc.id]: 'idle' }));
      }, 3000);
    } catch (error) {
      setDownloadStatus(prev => ({ ...prev, [doc.id]: 'error' }));
      toast.error(`Failed to download ${doc.file_name}`);
    }
  };

  const handleDocumentPreview = (doc: StatuteDocument) => {
    const fullUrl = `${BASE_URL}${doc.file_url}`;
    window.open(fullUrl, '_blank');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
      handleDocumentSearch();
    }
  };

  const toggleSection = (id: number) => {
    const next = new Set(expandedSections);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedSections(next);
  };

  const toggleSummary = (id: number) => {
    const next = new Set(showSummaries);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setShowSummaries(next);
  };

  const toggleBookmark = (id: number) => {
    const newBookmarks = new Set(bookmarkedStatutes);
    if (newBookmarks.has(id)) {
      newBookmarks.delete(id);
    } else {
      newBookmarks.add(id);
    }
    setBookmarkedStatutes(newBookmarks);
  };
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
      <div className="w-full px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">IP Statute Database</h1>
          <p className="text-gray-600">Search comprehensive Sri Lankan intellectual property laws and regulations</p>
        </div>
  
        
        {/* Unified Search Control Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value === '') { 
                     handleDocumentSearch('', selectedCategory); 
                  }
                }}
                onKeyPress={handleKeyPress}
                placeholder="Search IP statutes, documents, treaties, or specific clauses..."
                className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-gray-800 outline-none"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  handleDocumentSearch(searchQuery, e.target.value);
                  handleSearch(searchQuery, e.target.value);
                }}
                className="px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-gray-700 min-w-[200px] outline-none"
              >
                {documentCategories.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                handleSearch();
                handleDocumentSearch();
              }}
              disabled={isSearching}
              className="px-8 py-3.5 bg-gradient-to-r from-blue-900 to-emerald-700 text-white rounded-xl hover:from-blue-800 hover:to-emerald-600 disabled:bg-gray-300 transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm font-bold"
            >
              <Search className="h-5 w-5" />
              <span>{isSearching ? 'Searching...' : 'Search'}</span>
            </button>
          </div>
        </div>

        {/* Action Bar (Upload) */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Layers className="h-6 w-6 text-emerald-600"/> Available Documents</h2>
          {user?.user_type === 'lawyer' && (
            <button 
              onClick={() => setShowUploadModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-semibold text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Upload Statute</span>
            </button>
          )}
        </div>

        {/* Section 1: Documents (Modern Table View) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-12">
          {/* Table Header */}
          <div className="bg-gray-50 border-b border-gray-100 px-6 py-3 grid grid-cols-12 gap-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <div className="col-span-12 md:col-span-5">Document Name</div>
            <div className="hidden md:flex col-span-3">Category</div>
            <div className="hidden md:flex col-span-2">Date & Size</div>
            <div className="col-span-12 md:col-span-2 text-right justify-end flex">Actions</div>
          </div>
          
          {/* Table Body */}
          <div className="divide-y divide-gray-100">
            {isDocSearching ? (
              <div className="p-8 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : documentResults.length > 0 ? (
              documentResults.map((doc) => (
                <div key={doc.id} className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-gray-50 transition-colors group">
                  {/* Name & Desc */}
                  <div className="col-span-12 md:col-span-5 flex items-start space-x-3">
                    <div className="mt-1 flex-shrink-0">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{doc.title}</h3>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5" title={doc.description}>{doc.description}</p>
                    </div>
                  </div>
                  
                  {/* Category */}
                  <div className="hidden md:flex col-span-3 items-center">
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full">
                      {documentCategories.find(c => c.value === doc.category)?.label || doc.category}
                    </span>
                  </div>
                  
                  {/* Date & Size */}
                  <div className="hidden md:flex flex-col col-span-2 text-xs text-gray-500">
                    <span className="flex items-center space-x-1"><Calendar className="h-3 w-3"/> <span>{new Date(doc.created_at).toLocaleDateString()}</span></span>
                    <span className="flex items-center space-x-1 mt-1"><Layers className="h-3 w-3"/> <span>{doc.file_size}</span></span>
                  </div>
                  
                  {/* Actions */}
                  <div className="col-span-12 md:col-span-2 flex items-center justify-end space-x-4">
                    <button 
                      onClick={() => handleDocumentPreview(doc)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="View PDF"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDocumentDownload(doc)}
                      disabled={downloadStatus[doc.id] === 'loading'}
                      className={`transition-colors flex items-center gap-1.5 text-xs font-semibold ${
                        downloadStatus[doc.id] === 'error' ? 'text-red-500' : 
                        downloadStatus[doc.id] === 'success' ? 'text-green-500' : 'text-blue-600 hover:text-blue-800'
                      }`}
                      title="Download PDF"
                    >
                      {downloadStatus[doc.id] === 'loading' ? <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-emerald-600"></div> : <Download className="h-4 w-4" />}
                      <span className="hidden md:inline">Download</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No documents found for your search.</p>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Detailed Legal Clauses */}
        <div className="mb-6 border-t border-gray-200 pt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2"><BookOpen className="h-6 w-6 text-blue-600"/> Specific Legal Clauses</h2>
          <p className="text-gray-600 text-sm">Dive deep into the precise legal sections and human-friendly explanations.</p>
        </div>
        
        {isSearching ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex justify-center items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 text-xs"></div>
            <span className="ml-3 text-sm text-gray-600">Searching statute databases...</span>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4 mb-10">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                Found {results.length} active clause{results.length !== 1 ? 's' : ''} {searchQuery && `for "${searchQuery}"`}
              </p>
            </div>
            {results.map((section) => (
              <div key={section.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-blue-900">{section.document_title}</h3>
                        {section.section_number && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider rounded">
                            {section.section_number}
                          </span>
                        )}
                      </div>
                      <h4 className="text-md font-semibold text-gray-800 mb-3">{section.title}</h4>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Added {new Date(section.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-emerald-600 font-medium">
                          <CheckCircle className="h-3 w-3" />
                          <span>Official Recorded Clause</span>
                        </div>
                      </div>
                      
                      {/* Content or Summary */}
                      <div className={`prose prose-sm max-w-none text-gray-700 p-4 rounded-lg border transition-all ${showSummaries.has(section.id) ? 'bg-emerald-50 border-emerald-100' : 'bg-gray-50 border-gray-100'}`}>
                        {showSummaries.has(section.id) ? (
                          <div className="animate-fade-in">
                            <div className="flex items-center gap-2 mb-2 text-emerald-700 font-bold text-xs uppercase">
                              <Star className="h-3 w-3 fill-current" /> Human-Friendly Explanation
                            </div>
                            <p className="leading-relaxed italic">"{section.summary || "Summary coming soon for this section."}"</p>
                          </div>
                        ) : (
                          <p className={`leading-relaxed ${expandedSections.has(section.id) ? '' : 'line-clamp-3'}`}>
                            {section.content}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-center space-y-2 ml-6">
                      <button
                        onClick={() => toggleBookmark(section.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          bookmarkedStatutes.has(section.id)
                            ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100'
                            : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                        }`}
                      >
                        <Bookmark className={`h-5 w-5 ${bookmarkedStatutes.has(section.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-2">
                    <div className="flex space-x-4">
                      <button 
                        onClick={() => toggleSection(section.id)}
                        className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        {expandedSections.has(section.id) ? 'Show Less' : 'Read Full Clause'}
                      </button>
                      
                      <button 
                        onClick={() => toggleSummary(section.id)}
                        className={`text-xs font-bold flex items-center gap-1 transition-colors ${showSummaries.has(section.id) ? 'text-emerald-700' : 'text-emerald-600 hover:text-emerald-700'}`}
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        {showSummaries.has(section.id) ? 'View Legal Text' : 'Explain to Me'}
                      </button>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery && !isSearching ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Search className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No specific legal clauses match this search term.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <BookOpen className="h-12 w-12 text-blue-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Clause Search</h3>
            <p className="text-gray-600 text-sm max-w-sm mx-auto">Need specific legal details? Type a keyword like 'Copyright', 'Infringement', or 'Patent' into the search bar above to fetch deep clauses.</p>
          </div>
        )}

      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-900 to-emerald-800 text-white">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <FileUp className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold">Upload New Statute</h3>
              </div>
              <button 
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedDocs([]);
                }}
                className="p-2 hover:bg-white hover:bg-opacity-10 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              
              if (selectedDocs.length === 0) {
                toast.error("Please select at least one file first.");
                return;
              }

              const toastId = toast.loading(`Uploading ${selectedDocs.length} statute(s)...`);

              try {
                for (const doc of selectedDocs) {
                  // Client-side validation per file
                  if (doc.file.type !== 'application/pdf' && !doc.file.name.toLowerCase().endsWith('.pdf')) {
                    throw new Error(`Only PDF files are allowed. Skipped ${doc.file.name}.`);
                  }

                  if (doc.file.size < 1000) {
                    throw new Error(`The selected file ${doc.file.name} seems too small or corrupted.`);
                  }

                  const formData = new FormData();
                  formData.append('title', doc.title);
                  formData.append('description', doc.description);
                  formData.append('category', doc.category);
                  formData.append('file', doc.file);

                  const response = await fetch(`${BASE_URL}/statutes/upload`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                  });
                  
                  const data = await response.json();
                  if (!response.ok) {
                    throw new Error(data.detail || `Upload failed for ${doc.file.name}.`);
                  }
                }
                
                toast.update(toastId, { render: "All statutes uploaded successfully!", type: "success", isLoading: false, autoClose: 3000 });
                setShowUploadModal(false);
                setSelectedDocs([]);
                fetchDocuments();
              } catch (error: any) {
                toast.update(toastId, { render: error.message || "Failed to upload statutes.", type: "error", isLoading: false, autoClose: 4000 });
              }
            }} className="p-6 space-y-4">

              {selectedDocs.length > 0 && (
                <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2 border border-gray-100 rounded-lg p-3 bg-gray-50">
                  {selectedDocs.map((doc, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative">
                      <button 
                        type="button"
                        onClick={() => {
                          const newDocs = [...selectedDocs];
                          newDocs.splice(index, 1);
                          setSelectedDocs(newDocs);
                        }}
                        className="absolute top-3 right-3 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-full transition-colors"
                        title="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      
                      <div className="flex items-center space-x-2 mb-3 pr-8">
                        <FileText className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm font-bold text-gray-800 truncate">{doc.file.name}</span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Statute Title</label>
                          <input 
                            type="text" 
                            required 
                            value={doc.title}
                            onChange={(e) => {
                              const newDocs = [...selectedDocs];
                              newDocs[index].title = e.target.value;
                              setSelectedDocs(newDocs);
                            }}
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                          <select 
                            required
                            value={doc.category}
                            onChange={(e) => {
                              const newDocs = [...selectedDocs];
                              newDocs[index].category = e.target.value;
                              setSelectedDocs(newDocs);
                            }}
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                          >
                            {documentCategories.filter(c => c.value !== 'all').map(c => (
                              <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Short Description</label>
                          <textarea 
                            rows={2}
                            value={doc.description}
                            onChange={(e) => {
                              const newDocs = [...selectedDocs];
                              newDocs[index].description = e.target.value;
                              setSelectedDocs(newDocs);
                            }}
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className={`p-4 border-2 border-dashed rounded-xl text-center transition-colors ${selectedDocs.length > 0 ? 'border-emerald-300 bg-emerald-50/50' : 'border-gray-200 bg-gray-50'}`}>
                <input 
                  type="file" 
                  multiple
                  accept=".pdf" 
                  className="hidden" 
                  id="statute-files-bulk"
                  onChange={(e) => {
                    const guessCategory = (filename: string) => {
                      const name = filename.toLowerCase();
                      if (name.includes('trademark') || name.includes('mark') || name.includes('madrid')) return 'trademarks';
                      if (name.includes('copyright') || name.includes('berne') || name.includes('marrakesh')) return 'copyrights';
                      if (name.includes('patent')) return 'patents';
                      if (name.includes('digital') || name.includes('software')) return 'digital';
                      if (name.includes('treaty') || name.includes('convention') || name.includes('wipo') || name.includes('wto') || name.includes('hague') || name.includes('protocol') || name.includes('agreement')) return 'international';
                      if (name.includes('enforcement') || name.includes('customs') || name.includes('ordinance')) return 'enforcement';
                      return 'international'; 
                    };
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      const newDocs = files.map(file => {
                        const filenameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
                        return {
                          file,
                          title: filenameWithoutExt,
                          description: `The official document for ${filenameWithoutExt}.`,
                          category: guessCategory(filenameWithoutExt)
                        };
                      });
                      setSelectedDocs([...selectedDocs, ...newDocs]);
                    }
                    e.target.value = '';
                  }}
                />
                <label htmlFor="statute-files-bulk" className="cursor-pointer">
                  <FileUp className={`h-10 w-10 mx-auto mb-2 ${selectedDocs.length > 0 ? 'text-emerald-500' : 'text-gray-400'}`} />
                  <p className="text-sm font-medium text-gray-700">
                    {selectedDocs.length > 0 ? "Click to add more PDFs" : "Click to select multiple PDF files"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Maximum file size: 20MB per file</p>
                </label>
              </div>
              
              <div className="pt-4 flex space-x-3">
                <button 
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedDocs([]);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={selectedDocs.length === 0}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold transition-all shadow-md disabled:bg-emerald-300 disabled:cursor-not-allowed"
                >
                  Publish {selectedDocs.length > 0 ? `(${selectedDocs.length}) ` : ''}to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatutePage;