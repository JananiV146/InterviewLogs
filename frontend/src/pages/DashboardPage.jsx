import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { experiences } from '../utils/api';
import { useAuth } from '../hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();
  const [myExperiences, setMyExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMine = async () => {
      try {
        const { data } = await experiences.mine();
        setMyExperiences(data);
      } catch (error) {
        console.error('Error fetching my experiences:', error);
      }
      setLoading(false);
    };
    if (user) {
      fetchMine();
    }
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this experience?')) return;
    
    try {
      await experiences.delete(id);
      setMyExperiences(myExperiences.filter(exp => exp._id !== id));
    } catch (error) {
      alert('Failed to delete experience');
    }
  };

  if (!user) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-slate-500 font-medium">Please login to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your shared interview experiences.</p>
        </div>
        <Link 
          to="/submit" 
          className="inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Share New Experience
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : myExperiences.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No experiences yet</h3>
          <p className="text-slate-500 mb-6">You haven't shared any interview experiences with the community.</p>
          <Link to="/submit" className="text-blue-600 font-medium hover:text-blue-700 hover:underline">
            Get started by sharing one
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {myExperiences.map((exp) => {
            const authorName = exp.user_id?.name || user?.name || 'Anonymous User';
            const initials = authorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

            return (
              <div key={exp._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Card Header */}
                <div className="p-6 pb-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm border border-slate-100 flex-shrink-0 flex items-center justify-center">
                    {exp.user_id?.profile_pic ? (
                      <img 
                        src={`http://localhost:5000${exp.user_id.profile_pic}`} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                        {initials}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 leading-none mb-1">{authorName}</h4>
                    {exp.user_id?.headline && (
                      <p className="text-[11px] text-slate-600 font-semibold leading-tight max-w-[200px] sm:max-w-xs truncate mb-1">
                        {exp.user_id.headline}
                      </p>
                    )}
                    <span className="text-[10px] font-medium text-slate-400">
                      {new Date(exp.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                <div className="ml-auto flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                    ${exp.status === 'published' ? 'bg-green-100 text-green-700' : 
                      exp.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                      'bg-yellow-100 text-yellow-700'}`}>
                    {exp.status}
                  </span>
                  
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                    ${exp.difficulty === 'easy' ? 'bg-green-100 text-green-700' : 
                      exp.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-red-100 text-red-700'}`}>
                    {exp.difficulty}
                  </span>
                </div>
              </div>

              {/* Sub-Header: Company and Role */}
              <div className="px-6 mb-3 flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-800">
                  Interviewed at <span className="text-blue-600 font-bold">{exp.company}</span> for <span className="text-slate-900 font-bold">{exp.role_title}</span>
                </span>
              </div>

              {/* Post Content */}
              {exp.content && (
                <div className="px-6 pb-4 text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                  {exp.content}
                </div>
              )}

              {/* Media Attachments */}
              {exp.media && exp.media.length > 0 && (
                <div className="border-y border-slate-100 bg-slate-50 flex flex-col justify-center items-center">
                  {exp.media.map((url, idx) => (
                    <div key={idx} className="w-full max-h-[350px] overflow-hidden flex justify-center bg-black">
                      {url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                        <img 
                          src={`http://localhost:5000${url}`} 
                          alt="post attachment" 
                          className="max-h-[350px] w-auto object-contain" 
                        />
                      ) : (
                        <video 
                          src={`http://localhost:5000${url}`} 
                          controls 
                          className="max-h-[350px] w-auto object-contain" 
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Rejection notice if needed */}
              {exp.status === 'rejected' && exp.rejection_reason && (
                <div className="mx-6 mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                  <span className="font-semibold">Rejection Reason:</span> {exp.rejection_reason}
                </div>
              )}

              {/* Action buttons footer */}
              <div className="p-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                <div className="flex flex-wrap gap-1.5">
                  {exp.tags?.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Link 
                    to={`/edit/${exp._id}`}
                    className="px-4 py-1.5 bg-slate-50 text-slate-700 font-semibold text-sm rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                  >
                    Edit
                  </Link>
                  <button 
                    onClick={() => handleDelete(exp._id)}
                    className="px-4 py-1.5 bg-red-50 text-red-600 font-semibold text-sm rounded-lg border border-red-100 hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
}
