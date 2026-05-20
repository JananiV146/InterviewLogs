import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/experiences');
    }
  }, [user, navigate]);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 sm:px-6 lg:px-8 text-center min-h-[80vh]">
      <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
          InterviewLog
        </span>
      </h1>
      <h2 className="text-2xl md:text-3xl text-slate-700 font-medium mb-6">
        Your Interview Experience Archive
      </h2>
      <p className="text-lg text-slate-500 max-w-2xl mb-10 leading-relaxed">
        An anonymous platform for college students to record and view real interview experiences. 
        Share your knowledge, learn from others, and build confidence for your next technical interview.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-20 justify-center">
        <Link 
          to="/experiences" 
          className="px-8 py-3.5 text-base font-semibold text-blue-700 bg-blue-100 rounded-xl hover:bg-blue-200 transition-colors shadow-sm"
        >
          Browse Experiences
        </Link>

        {!user && (
          <Link 
            to="/login" 
            className="px-8 py-3.5 text-base font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-blue-500/30"
          >
            Login to Share
          </Link>
        )}

        {user?.role === 'student' && (
          <>
            <Link 
              to="/submit" 
              className="px-8 py-3.5 text-base font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-blue-500/30"
            >
              Share Experience
            </Link>
            <Link 
              to="/dashboard" 
              className="px-8 py-3.5 text-base font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              My Dashboard
            </Link>
          </>
        )}

        {user?.role === 'admin' && (
          <Link 
            to="/admin" 
            className="px-8 py-3.5 text-base font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-indigo-500/30"
          >
            Admin Dashboard
          </Link>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl w-full text-left">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-2xl">🔍</div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Centralized Repository</h3>
          <p className="text-slate-500 text-sm leading-relaxed">Access real, unedited interview experiences from your peers across various top-tier companies.</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 text-2xl">📝</div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Detailed Breakdowns</h3>
          <p className="text-slate-500 text-sm leading-relaxed">Get round-by-round insights including actual technical questions, behavioral prompts, and preparation tips.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 text-2xl">🔐</div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Fully Anonymous</h3>
          <p className="text-slate-500 text-sm leading-relaxed">Share your successes and failures without fear. All student identities are protected to encourage honesty.</p>
        </div>
      </div>
    </div>
  );
}
