import React, { useState, useEffect } from 'react';
import { Briefcase, Search, Heart, Image as ImageIcon, X } from 'lucide-react';
import { api } from '../utils/api';
import { useUser } from '../contexts/UserContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Blog {
  id: number;
  lawyer_id: number;
  title: string;
  author_name: string;
  author_photo?: string;
  created_at: string;
  tags?: string;
  excerpt?: string;
  content: string;
  likes_count: number;
  has_liked: boolean;
}

const allTags = [
  'Intellectual Property',
  'Family Law',
  'Criminal Law',
  'Corporate Law',
  'Environmental Law',
  'Labour Law',
  'Human Rights',
  'Tax Law',
  'General',
];

const BlogsPage: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [expandedBlog, setExpandedBlog] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [showNewBlogForm, setShowNewBlogForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const { user, isLoggedIn } = useUser();

  const [newBlog, setNewBlog] = useState({
    title: '',
    tag: allTags[0] || '',
    excerpt: '',
    content: '',
  });
  const [coverImageBase64, setCoverImageBase64] = useState<string | null>(null);

  const extractCoverImage = (contentText: string) => {
    const match = contentText.match(/\[COVER_IMAGE\](.*?)\[\/COVER_IMAGE\]/);
    if (match) {
      return {
        image: match[1],
        cleanContent: contentText.replace(match[0], '').trim()
      };
    }
    return { image: null, cleanContent: contentText };
  };

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      // If logged in, provide token to get personalized has_liked status.
      // Assuming api.get sends auth automatically if configured.
      const response = await api.get('/blogs/');
      setBlogs(response);
    } catch (error) {
      toast.error('Failed to load blogs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleNewBlogChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewBlog(prev => ({ ...prev, [name]: value }));
  };

  const handleNewBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!isLoggedIn || user?.user_type !== 'lawyer') {
        toast.error("Only lawyers can publish blogs.");
        return;
      }
      
      let finalContent = newBlog.content;
      if (coverImageBase64) {
        // We compress the image and store it within the markdown/text to bypass the lack of backend CDN
        finalContent = `[COVER_IMAGE]${coverImageBase64}[/COVER_IMAGE]\n\n${finalContent}`;
      }
      
      await api.post('/blogs/', {
        title: newBlog.title,
        tags: newBlog.tag,
        excerpt: newBlog.excerpt,
        content: finalContent
      });
      
      toast.success("Blog published successfully!");
      setShowNewBlogForm(false);
      setNewBlog({ title: '', tag: allTags[0] || '', excerpt: '', content: '' });
      setCoverImageBase64(null);
      fetchBlogs(); // reload blogs
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to publish blog.");
    }
  };

  const handleLike = async (e: React.MouseEvent, blogId: number) => {
    e.stopPropagation(); // Prevent opening the blog if clicked on the heart
    if (!isLoggedIn) {
      toast.info("Please log in to react to blogs.");
      return;
    }
    
    // Optimistic UI update
    setBlogs(prevBlogs => prevBlogs.map(blog => {
      if (blog.id === blogId) {
        return {
          ...blog,
          has_liked: !blog.has_liked,
          likes_count: blog.has_liked ? blog.likes_count - 1 : blog.likes_count + 1
        };
      }
      return blog;
    }));

    try {
      await api.post(`/blogs/${blogId}/like`, {});
    } catch (error) {
      // Revert optimism on error
      toast.error("Action failed");
      fetchBlogs(); 
    }
  };

  // Safe checks for empty or undefined arrays/strings
  const filteredBlogs = blogs.filter(blog => {
    const blogTags = blog.tags ? blog.tags.split(',').map(t => t.trim()) : [];
    const matchesTag = selectedTag === 'All' || blogTags.includes(selectedTag) || (!blog.tags && selectedTag === 'General');
    const matchesSearch =
      blog.title.toLowerCase().includes(search.toLowerCase()) ||
      blog.author_name.toLowerCase().includes(search.toLowerCase()) ||
      (blog.excerpt && blog.excerpt.toLowerCase().includes(search.toLowerCase())) ||
      (blog.content && blog.content.toLowerCase().includes(search.toLowerCase()));
    return matchesTag && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Compress image slightly if large, or just read as base64 for simplicity
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full py-10 px-6 min-h-screen bg-gray-50">
      <ToastContainer />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-blue-900 mb-2 flex items-center gap-2">
            <Briefcase className="h-7 w-7 text-emerald-500" />
            Lawyer Blogs
          </h2>
          <p className="text-gray-600 mb-0">Insights, stories, and experiences from Sri Lanka’s legal professionals.</p>
        </div>
        
        {/* Only show New Blog to lawyers */}
        {isLoggedIn && user?.user_type === 'lawyer' && (
          <button
            onClick={() => setShowNewBlogForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-900 to-emerald-600 text-white rounded-lg hover:from-blue-800 hover:to-emerald-500 transition-all duration-200 shadow-md"
          >
            <span>+ New Blog</span>
          </button>
        )}
      </div>

      {showNewBlogForm && (
        <form onSubmit={handleNewBlogPost} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8 relative">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Create New Blog</h3>
          <div className="mb-4">
            {coverImageBase64 ? (
              <div className="relative mb-4 rounded-xl overflow-hidden shadow-sm border border-gray-200 group">
                <img src={coverImageBase64} alt="Cover Preview" className="w-full h-48 object-cover" />
                <button 
                  type="button" 
                  onClick={() => setCoverImageBase64(null)}
                  className="absolute top-3 right-3 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 mb-4 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 font-semibold"><span className="text-blue-600">Click to upload</span> an eye-catching cover photo</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            )}
            <input
              type="text"
              name="title"
              value={newBlog.title}
              onChange={handleNewBlogChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 font-bold text-lg"
              placeholder="Blog title..."
              required
            />
            <select
              name="tag"
              value={newBlog.tag}
              onChange={handleNewBlogChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
              required
            >
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            <input
              type="text"
              name="excerpt"
              value={newBlog.excerpt}
              onChange={handleNewBlogChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
              placeholder="Short excerpt or description highlighting the key point..."
              required
            />
            <textarea
              name="content"
              value={newBlog.content}
              onChange={handleNewBlogChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-2 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 font-serif leading-relaxed"
              placeholder="Write your blog content here..."
              rows={10}
              required
            />
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="px-8 py-2.5 bg-blue-900 text-white rounded-lg font-bold hover:bg-emerald-600 transition-colors shadow-md"
            >
              Publish Post
            </button>
            <button
              type="button"
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              onClick={() => setShowNewBlogForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-2">
          <label htmlFor="tag-filter" className="text-sm font-medium text-gray-700 whitespace-nowrap">Category:</label>
          <select
            id="tag-filter"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-gray-50 min-w-[150px]"
            value={selectedTag}
            onChange={e => setSelectedTag(e.target.value)}
          >
            <option value="All">All</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 flex-1">
          <label htmlFor="blog-search" className="sr-only">Search</label>
          <div className="relative w-full">
            <input
              id="blog-search"
              type="text"
              className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-gray-50"
              placeholder="Search blogs by keyword, author, or title..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {expandedBlog !== null ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 md:p-12 relative animate-fade-in max-w-4xl mx-auto">
          {(() => {
            const blog = blogs.find(b => b.id === expandedBlog);
            if (!blog) return null;
            const { image, cleanContent } = extractCoverImage(blog.content);
            const blogTags = blog.tags ? blog.tags.split(',').map(t => t.trim()) : [];
            
            return (
              <>
                <button
                  className="absolute top-6 left-6 text-gray-500 hover:text-blue-900 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                  onClick={() => setExpandedBlog(null)}
                >
                  ← Back to Articles
                </button>

                <div className="mt-12 mb-8 text-center max-w-3xl mx-auto">
                  {blogTags.length > 0 && (
                    <div className="flex justify-center flex-wrap gap-2 mb-4">
                      {blogTags.map(tag => (
                        <span key={tag} className="text-emerald-600 uppercase tracking-widest text-xs font-bold">{tag}</span>
                      ))}
                    </div>
                  )}
                  <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-6 font-serif">{blog.title}</h1>
                  {blog.excerpt && (
                    <p className="text-xl text-gray-500 font-serif italic">{blog.excerpt}</p>
                  )}
                </div>

                <div className="flex items-center justify-center gap-4 mb-10 pb-10 border-b border-gray-100">
                  <img
                    src={blog.author_photo || "https://ui-avatars.com/api/?name=" + encodeURIComponent(blog.author_name)}
                    alt={blog.author_name}
                    className="w-14 h-14 rounded-full object-cover shadow-sm"
                  />
                  <div className="text-left">
                    <span className="block font-bold text-gray-900">{blog.author_name}</span>
                    <span className="block text-sm text-gray-500">{formatDate(blog.created_at)} • {Math.max(1, Math.ceil(cleanContent.length / 1000))} min read</span>
                  </div>
                </div>

                {image && (
                  <div className="mb-12 rounded-2xl overflow-hidden shadow-lg border border-gray-100 max-h-[500px]">
                    <img src={image} alt={blog.title} className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div className="prose max-w-3xl mx-auto text-gray-800 whitespace-pre-wrap leading-relaxed font-serif text-lg md:text-xl">
                  {cleanContent}
                </div>

                <div className="mt-16 pt-8 border-t border-gray-100 flex justify-center">
                  <button 
                    onClick={(e) => handleLike(e, blog.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 transition-all ${blog.has_liked ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300'}`}
                  >
                    <Heart className={`w-6 h-6 ${blog.has_liked ? 'fill-current text-red-500' : ''}`} />
                    <span className="font-bold">{blog.likes_count} {blog.likes_count === 1 ? 'Like' : 'Likes'}</span>
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <div className="col-span-full text-center text-gray-500 py-10 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              <span className="ml-3">Loading blogs...</span>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-10 bg-white rounded-xl shadow-sm border border-gray-100">
               No blogs found for your search or filter.
            </div>
          ) : (
            filteredBlogs.map(blog => {
              const blogTags = blog.tags ? blog.tags.split(',').map(t => t.trim()) : [];
              const { image } = extractCoverImage(blog.content);
              
              // Fallback gradients based on ID for consistent aesthetics when no image exists
              const fallbackGradients = [
                'from-blue-100 to-indigo-100',
                'from-emerald-100 to-teal-100',
                'from-amber-100 to-orange-100',
                'from-rose-100 to-pink-100',
                'from-purple-100 to-fuchsia-100'
              ];
              const gradient = fallbackGradients[blog.id % fallbackGradients.length];
              
              return (
                <div
                  key={blog.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group border border-gray-100 cursor-pointer"
                  onClick={() => setExpandedBlog(blog.id)}
                >
                  {/* Card Image Wrapper */}
                  <div className={`relative h-56 w-full overflow-hidden ${!image ? `bg-gradient-to-br ${gradient}` : 'bg-gray-100'}`}>
                    {image ? (
                      <img src={image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center opacity-30">
                         <Briefcase className="w-20 h-20 text-gray-500 mix-blend-multiply" />
                      </div>
                    )}
                    <button 
                      onClick={(e) => handleLike(e, blog.id)}
                      className={`absolute top-3 right-3 flex items-center justify-center p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${blog.has_liked ? 'bg-white/90 text-red-500' : 'bg-black/30 text-white hover:bg-black/50'}`}
                    >
                      <Heart className={`w-4 h-4 ${blog.has_liked ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Card Content Wrapper */}
                  <div className="p-6 flex flex-col flex-grow">
                    {blogTags.length > 0 && (
                      <div className="mb-3">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">{blogTags[0]}</span>
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors mb-2 leading-tight font-serif line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-gray-500 line-clamp-3 text-sm leading-relaxed mb-6 font-serif">
                      {blog.excerpt || extractCoverImage(blog.content).cleanContent.substring(0, 150) + "..."}
                    </p>
                    
                    {/* Author Row pushed to bottom */}
                    <div className="mt-auto pt-4 flex items-center gap-3">
                      <img
                        src={blog.author_photo || "https://ui-avatars.com/api/?name=" + encodeURIComponent(blog.author_name)}
                        alt={blog.author_name}
                        className="w-8 h-8 rounded-full object-cover border border-gray-100 shadow-sm"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-900">{blog.author_name}</span>
                        <span className="text-[10px] text-gray-500">{formatDate(blog.created_at)}</span>
                      </div>
                      <div className="ml-auto flex items-center text-gray-400 text-xs gap-1">
                         <span className="font-semibold">{blog.likes_count}</span> <Heart className="w-3 h-3 fill-current opacity-50" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default BlogsPage;
