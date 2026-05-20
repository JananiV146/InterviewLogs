import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { experiences } from '../utils/api';
import { useAuth } from '../hooks/useAuth';

const getFileType = (url) => {
  if (url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i)) return 'image';
  if (url.match(/\.(mp4|webm|ogg|mov)$/i)) return 'video';
  return 'document';
};

const getFileName = (url) => {
  const parts = url.split('/');
  const name = parts[parts.length - 1];
  const dashIndex = name.indexOf('-');
  return dashIndex !== -1 ? name.substring(dashIndex + 1) : name;
};

export default function ExperiencesPage() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const search = searchParams.get('search') || '';
  const searchType = searchParams.get('type') || 'company';

  useEffect(() => {
    const fetchExperiences = async () => {
      setLoading(true);
      try {
        const { data } = await experiences.list({ search, searchType });
        setList(data.data);
      } catch (error) {
        console.error('Error fetching experiences:', error);
      }
      setLoading(false);
    };
    fetchExperiences();
  }, [search, searchType]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header Area */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {search ? `Search Results for "${search}"` : 'Professional Feed'}
        </h1>
        <p className="text-slate-500 mt-1">
          {search ? `Showing experiences matching ${searchType} name` : 'Learn from real professional experiences shared by peers.'}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        ) : list.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <p className="text-slate-500 text-lg">No experiences found matching your filters.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {list.map((exp) => (
              <div 
                key={exp._id} 
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
              >
                {/* Author Header */}
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
                        {exp.user_id?.name ? exp.user_id.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 leading-none mb-1">
                      {exp.user_id?.name || 'Anonymous User'}
                    </h4>
                    {exp.user_id?.headline && (
                      <p className="text-[11px] text-slate-600 font-semibold leading-tight max-w-[200px] sm:max-w-xs truncate mb-1">
                        {exp.user_id.headline}
                      </p>
                    )}
                    <span className="text-[10px] font-medium text-slate-400">
                      {new Date(exp.created_at || exp.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                    ${exp.difficulty === 'easy' ? 'bg-green-100 text-green-700' : 
                      exp.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-red-100 text-red-700'}`}>
                    {exp.difficulty}
                  </span>
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
                  <div className="border-y border-slate-100 bg-slate-50 p-4 flex flex-col gap-3">
                    {exp.media.map((url, idx) => {
                      const fileType = getFileType(url);
                      const fileName = getFileName(url);
                      if (fileType === 'image') {
                        return (
                          <div key={idx} className="w-full max-h-[450px] overflow-hidden flex justify-center bg-black rounded-xl">
                            <img 
                              src={`http://localhost:5000${url}`} 
                              alt="post attachment" 
                              className="max-h-[450px] w-auto object-contain" 
                            />
                          </div>
                        );
                      } else if (fileType === 'video') {
                        return (
                          <div key={idx} className="w-full max-h-[450px] overflow-hidden flex justify-center bg-black rounded-xl">
                            <video 
                              src={`http://localhost:5000${url}`} 
                              controls 
                              className="max-h-[450px] w-auto object-contain" 
                            />
                          </div>
                        );
                      } else {
                        return (
                          <div key={idx} className="w-full bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between shadow-sm hover:shadow transition-shadow">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <span className="text-3xl flex-shrink-0">📄</span>
                              <div className="overflow-hidden">
                                <p className="text-sm font-semibold text-slate-800 truncate">{fileName}</p>
                                <p className="text-xs text-slate-400 font-medium capitalize">{url.split('.').pop()} Document</p>
                              </div>
                            </div>
                            <a 
                              href={`http://localhost:5000${url}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-all shadow-sm flex-shrink-0"
                            >
                              Download / Open
                            </a>
                          </div>
                        );
                      }
                    })}
                  </div>
                )}

                {/* Prep Tips and Tag summary */}
                <div className="p-6 pt-4 border-t border-slate-50 flex flex-col gap-3">
                  {exp.prep_tips && (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Preparation Tips</h5>
                      <p className="text-sm text-slate-600">{exp.prep_tips}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-2">
                    <div className="flex flex-wrap gap-1.5">
                      {exp.tags?.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      {user && exp.user_id?._id && user._id !== exp.user_id._id && (
                        <Link
                          to={`/messaging?userId=${exp.user_id._id}`}
                          state={{ name: exp.user_id.name }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-all shadow-sm"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                          Message
                        </Link>
                      )}
                      
                      <Link 
                        to={`/experiences/${exp._id}`}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                      >
                        View Details & Rounds ({exp.rounds?.length || 0}) →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
