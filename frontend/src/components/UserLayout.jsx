import { Outlet, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AIChatWidget from './AIChatWidget';
import { useState, useEffect } from 'react';

export default function UserLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [searchType, setSearchType] = useState(searchParams.get('type') || 'company');
  const [showDropdown, setShowDropdown] = useState(false);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClose = () => setShowDropdown(false);
    if (showDropdown) {
      window.addEventListener('click', handleClose);
    }
    return () => window.removeEventListener('click', handleClose);
  }, [showDropdown]);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  // Sync inputs with URL changes
  useEffect(() => {
    setSearchInput(searchParams.get('search') || '');
    setSearchType(searchParams.get('type') || 'company');
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/experiences?search=${encodeURIComponent(searchInput.trim())}&type=${searchType}`);
    } else {
      navigate(`/experiences`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                📚 InterviewLog
              </Link>
            </div>

            {/* Search Form in Navbar */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center bg-slate-100 rounded-full px-3 py-1.5 border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500 transition-all max-w-xs lg:max-w-md w-full mx-4">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-600 outline-none border-r border-slate-200 pr-2 mr-2 cursor-pointer"
              >
                <option value="company">Company</option>
                <option value="author">Author</option>
              </select>
              <input
                type="text"
                placeholder={`Search by ${searchType}...`}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="bg-transparent text-xs text-slate-700 outline-none flex-1 placeholder:text-slate-400"
              />
              <button type="submit" className="text-slate-400 hover:text-blue-600 transition-colors pl-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </form>
            
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {user && (
                <Link to="/messaging" className="text-slate-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                  Chat
                </Link>
              )}
              {user?.role === 'student' && (
                <>
                  <Link to="/submit" className="text-slate-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                    Share Experience
                  </Link>
                  <Link to="/dashboard" className="text-slate-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                    My Dashboard
                  </Link>
                </>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin" className="text-slate-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                  Admin Dashboard
                </Link>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="relative">
                    <button
                      onClick={toggleDropdown}
                      className="flex items-center focus:outline-none"
                    >
                      {user.profile_pic ? (
                        <img 
                          src={`http://localhost:5000${user.profile_pic}`} 
                          alt="Avatar" 
                          className="w-9 h-9 rounded-full object-cover shadow-sm border border-slate-200"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm border border-slate-100">
                          {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                        </div>
                      )}
                    </button>

                    {showDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                        <div className="px-4 py-2 border-b border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Signed in as</p>
                          <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 transition-colors"
                        >
                          👤 View Profile
                        </Link>
                        <button
                          onClick={() => {
                            setShowDropdown(false);
                            logout();
                          }}
                          className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50/50 transition-colors border-t border-slate-100"
                        >
                          🚪 Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link to="/login" className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors shadow-sm">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* AI Chat Assistant available on all user-facing pages */}
      <AIChatWidget />
    </div>
  );
}
