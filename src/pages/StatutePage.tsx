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
  const [downloadStatus, setDownloadStatus] = useState<{[key: string]: 'idle' | 'loading' | 'success' | 'error'}>({});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
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

  const handleDocumentSearch = () => {
    let filteredDocs = allDocuments.filter(doc => 
      doc.title.toLowerCase().includes(documentSearchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(documentSearchQuery.toLowerCase()) ||
      doc.uploader_name.toLowerCase().includes(documentSearchQuery.toLowerCase())
    );

    if (documentCategory !== 'all') {
      filteredDocs = filteredDocs.filter(doc => doc.category === documentCategory);
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
      if (activeTab === 'search') {
        handleSearch();
      } else {
        handleDocumentSearch();
      }
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
  
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('search')}
            className={`py-3 px-6 border-b-2 font-medium text-sm ${
              activeTab === 'search'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Statute Search</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3 px-6 border-b-2 font-medium text-sm ${
              activeTab === 'documents'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Downloadable Documents</span>
            </div>
          </button>
        </div>

        {activeTab === 'search' ? (
          <>
            {/* Search Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={t('search.placeholder')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-label="Search statutes"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-5 w-5 text-gray-500" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-label="Filter by category"
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => handleSearch()}
                    disabled={!searchQuery.trim() || isSearching}
                    className="px-6 py-3 bg-gradient-to-r from-blue-900 to-emerald-600 text-white rounded-lg hover:from-blue-800 hover:to-emerald-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                    aria-label="Search"
                  >
                    <Search className="h-5 w-5" />
                    <span>{isSearching ? 'Searching...' : 'Search'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Results */}
            {isSearching ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Searching statute sections...</span>
                </div>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-gray-600">Found {results.length} legal clause{results.length !== 1 ? 's' : ''}</p>
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-700 text-sm font-medium">
                      <Bookmark className="h-4 w-4" />
                      <span>Saved Items ({bookmarkedStatutes.size})</span>
                    </button>
                  </div>
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
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No matching legal clauses found</h3>
                <p className="text-gray-600 max-w-xs mx-auto">Try searching for broader terms like "Copyright", "Trademark", or "Protection".</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <BookOpen className="h-12 w-12 text-blue-200 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Statute Search</h3>
                <p className="text-gray-600 max-w-sm mx-auto">Search through the text of Sri Lankan IP laws to find specific rights, penalties, and procedures instantly.</p>
                <div className="mt-8 flex flex-wrap justify-center gap-2">
                  {['Duration', 'Infringement', 'Registration', 'Fair Use'].map(tag => (
                    <button 
                      key={tag}
                      onClick={() => {
                        setSearchQuery(tag);
                        handleSearch(tag);
                      }}
                      className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold hover:bg-blue-100 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Documents Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Downloadable Statute Documents</h2>
                    <p className="text-gray-600">Search and download official IP statutes, treaties, and legal documents</p>
                  </div>
                  {user?.user_type === 'lawyer' && (
                    <button 
                      onClick={() => setShowUploadModal(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Upload Statute</span>
                    </button>
                  )}
                </div>
                
                {/* Document Search Bar */}
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={documentSearchQuery}
                      onChange={(e) => setDocumentSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Search for statute documents, treaties, or agreements..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-label="Search statute documents"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-5 w-5 text-gray-500" />
                    <select
                      value={documentCategory}
                      onChange={(e) => setDocumentCategory(e.target.value)}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-label="Filter by document category"
                    >
                      {documentCategories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => handleDocumentSearch()}
                    disabled={isDocSearching}
                    className="px-6 py-3 bg-gradient-to-r from-blue-900 to-emerald-600 text-white rounded-lg hover:from-blue-800 hover:to-emerald-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                    aria-label="Search documents"
                  >
                    <Search className="h-5 w-5" />
                    <span>{isDocSearching ? 'Searching...' : 'Search'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Document Results */}
            {isDocSearching ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Searching documents...</span>
                </div>
              </div>
            ) : documentResults.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-600">Found {documentResults.length} document{documentResults.length !== 1 ? 's' : ''}</p>
                  <div className="text-sm text-gray-500">Click any document to download</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documentResults.map((doc) => (
                    <div 
                      key={doc.id} 
                      className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-5 flex flex-col"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-700" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">{doc.title}</h3>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 flex-grow">{doc.description}</p>
                      
                      <div className="flex items-center space-x-2 mb-4 bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center text-[10px] font-bold text-blue-700">
                          {doc.uploader_name.charAt(0)}
                        </div>
                        <span className="text-xs text-gray-600">Uploaded by <span className="font-medium text-gray-900">{doc.uploader_name}</span></span>
                      </div>

                      <div className="flex items-center text-xs text-gray-500 space-x-4 mb-4">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3"/> {new Date(doc.created_at).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Layers className="h-3 w-3"/> {doc.file_size}</span>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex justify-between">
                        {/* Preview Button */}
                        <button 
                          onClick={() => handleDocumentPreview(doc)}
                          className="flex items-center space-x-2 text-gray-600 hover:text-blue-800 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View PDF</span>
                        </button>
                        
                        {/* Download Button */}
                        <button 
                          onClick={() => handleDocumentDownload(doc)}
                          disabled={downloadStatus[doc.id] === 'loading'}
                          className={`flex items-center space-x-2 transition-colors ${
                            downloadStatus[doc.id] === 'error' 
                              ? 'text-red-600 hover:text-red-800' 
                              : downloadStatus[doc.id] === 'success'
                                ? 'text-green-600 hover:text-green-800'
                                : 'text-blue-600 hover:text-blue-800'
                          }`}
                        >
                          {downloadStatus[doc.id] === 'loading' ? (
                            <>
                              <span className="animate-pulse text-xs">Opening...</span>
                            </>
                          ) : downloadStatus[doc.id] === 'error' ? (
                            <>
                              <span className="text-xs">Error - Retry</span>
                            </>
                          ) : downloadStatus[doc.id] === 'success' ? (
                            <>
                              <span className="text-xs">Done</span>
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4" />
                              <span className="text-xs">Download</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No matching documents found</h3>
                <p className="text-gray-600">Try adjusting your search terms or filters</p>
              </div>
            )}
          </>
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
                  setSelectedFileName(null);
                }}
                className="p-2 hover:bg-white hover:bg-opacity-10 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const formData = new FormData(form);
              
              const toastId = toast.loading("Uploading statute...");
              
              try {
                // Client-side validation
                const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement;
                const file = fileInput?.files?.[0];
                
                if (!file) {
                  toast.update(toastId, { render: "Please select a file first.", type: "error", isLoading: false, autoClose: 3000 });
                  return;
                }
                
                if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                  toast.update(toastId, { render: "Only PDF files are allowed.", type: "error", isLoading: false, autoClose: 3000 });
                  return;
                }

                if (file.size < 1000) {
                  toast.update(toastId, { render: "The selected file seems too small or corrupted. Please check the file.", type: "error", isLoading: false, autoClose: 3000 });
                  return;
                }

                const response = await fetch(`${BASE_URL}/statutes/upload`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  },
                  body: formData
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                  throw new Error(data.detail || "Upload failed. Your connection might have been intercepted by a local proxy.");
                }
                
                toast.update(toastId, { render: "Statute uploaded successfully!", type: "success", isLoading: false, autoClose: 3000 });
                setShowUploadModal(false);
                setSelectedFileName(null);
                fetchDocuments();
              } catch (error: any) {
                toast.update(toastId, { render: error.message || "Failed to upload statute.", type: "error", isLoading: false, autoClose: 3000 });
              }
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Statute Title</label>
                <input 
                  type="text" 
                  name="title" 
                  required 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. Intellectual Property Act 2024"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                <select 
                  name="category" 
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {documentCategories.filter(c => c.value !== 'all').map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Short Description</label>
                <textarea 
                  name="description" 
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Briefly explain what this document covers..."
                />
              </div>
              
              <div className={`p-4 border-2 border-dashed rounded-xl text-center transition-colors ${selectedFileName ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-gray-50'}`}>
                <input 
                  type="file" 
                  name="file" 
                  accept=".pdf" 
                  required
                  className="hidden" 
                  id="statute-file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setSelectedFileName(file.name);
                  }}
                />
                <label htmlFor="statute-file" className="cursor-pointer">
                  <FileUp className={`h-10 w-10 mx-auto mb-2 ${selectedFileName ? 'text-emerald-600' : 'text-gray-400'}`} />
                  <p className="text-sm font-medium text-gray-700">
                    {selectedFileName ? `Selected: ${selectedFileName}` : "Click to select PDF file"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Maximum file size: 20MB</p>
                </label>
              </div>
              
              <div className="pt-4 flex space-x-3">
                <button 
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFileName(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold transition-all shadow-md"
                >
                  Publish to Database
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