import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="h-16 flex items-center px-6 bg-slate-950">
          <span className="text-lg font-bold text-blue-400">InterviewLog Admin</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link to="/admin" className="block px-4 py-3 rounded-lg bg-blue-600 text-white font-medium shadow-sm transition-colors">
            Moderation Queue
          </Link>
          <Link to="/" className="block px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
            View Public Site
          </Link>
        </nav>

        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <p className="text-slate-400 truncate">{user?.email}</p>
              <p className="text-xs text-slate-500 font-medium">Administrator</p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-800">Dashboard</h1>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
