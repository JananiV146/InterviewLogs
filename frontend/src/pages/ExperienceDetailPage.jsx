import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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

export default function ExperienceDetailPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const { data } = await experiences.detail(id);
        setExperience(data);
      } catch (error) {
        console.error('Error fetching experience:', error);
      }
      setLoading(false);
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Experience Not Found</h2>
        <p className="text-slate-500 mb-6">The interview experience you're looking for doesn't exist or has been removed.</p>
        <Link to="/experiences" className="text-blue-600 hover:underline font-medium">
          ← Back to Experiences
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Link to="/experiences" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-8">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to list
      </Link>

      {/* Header Section */}
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
              ${experience.difficulty === 'easy' ? 'bg-green-100 text-green-700' : 
                experience.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : 
                'bg-red-100 text-red-700'}`}>
              {experience.difficulty}
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
              {experience.rounds?.length || 0} Rounds
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-2">
            {experience.company}
          </h1>
          <h2 className="text-2xl text-slate-600 font-medium mb-6">
            {experience.role_title}
          </h2>

          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                {experience.user_id?.name ? experience.user_id.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
              </div>
              <span className="font-semibold text-slate-700">
                {experience.user_id?.name || 'Anonymous User'}
              </span>
              {user && experience.user_id?._id && user._id !== experience.user_id._id && (
                <Link
                  to={`/messaging?userId=${experience.user_id._id}`}
                  state={{ name: experience.user_id.name }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-all shadow-sm ml-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  Message
                </Link>
              )}
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Posted {new Date(experience.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Post Text Content */}
      {experience.content && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 mb-8">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Post Content</h3>
          <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
            {experience.content}
          </p>
        </div>
      )}

      {/* Media Attachments */}
      {experience.media && experience.media.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-8">
          <h3 className="text-lg font-bold text-slate-800 p-6 border-b border-slate-100">Media & Document Attachments</h3>
          <div className="bg-slate-50 p-6 flex flex-col gap-4">
            {experience.media.map((url, idx) => {
              const fileType = getFileType(url);
              const fileName = getFileName(url);
              if (fileType === 'image') {
                return (
                  <div key={idx} className="w-full max-h-[500px] overflow-hidden flex justify-center bg-black rounded-xl">
                    <img 
                      src={`http://localhost:5000${url}`} 
                      alt="attachment" 
                      className="max-h-[500px] w-auto object-contain" 
                    />
                  </div>
                );
              } else if (fileType === 'video') {
                return (
                  <div key={idx} className="w-full max-h-[500px] overflow-hidden flex justify-center bg-black rounded-xl">
                    <video 
                      src={`http://localhost:5000${url}`} 
                      controls 
                      className="max-h-[500px] w-auto object-contain" 
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
        </div>
      )}

      {/* Tags */}
      {experience.tags?.length > 0 && (
        <div className="mb-10">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {experience.tags.map(tag => (
              <span key={tag} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium shadow-sm">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Preparation Tips */}
      {experience.prep_tips && (
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-8 mb-10">
          <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2 mb-4">
            <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            Preparation Tips
          </h3>
          <p className="text-indigo-900/80 leading-relaxed whitespace-pre-wrap">
            {experience.prep_tips}
          </p>
        </div>
      )}

      {/* Rounds */}
      <div>
        <h3 className="text-2xl font-bold text-slate-900 mb-6">Interview Rounds</h3>
        <div className="space-y-8">
          {experience.rounds?.map((round, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-blue-500"></div>
              <div className="p-8 pl-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                    {round.round_order}
                  </span>
                  <h4 className="text-xl font-bold text-slate-800 capitalize">
                    {round.round_type} Round
                  </h4>
                </div>
                
                <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                  {round.summary}
                </p>

                {round.questions?.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Questions Asked</h5>
                    <div className="space-y-4">
                      {round.questions.map((q, qidx) => (
                        <div key={qidx} className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                          <div className="flex items-start gap-3 mb-2">
                            <span className="text-slate-400 font-bold mt-0.5">Q.</span>
                            <div className="flex-1">
                              <p className="font-semibold text-slate-900 text-lg leading-snug">
                                {q.question_text}
                              </p>
                            </div>
                            <span className="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-500 capitalize whitespace-nowrap">
                              {q.question_type}
                            </span>
                          </div>
                          
                          {q.answer_brief && (
                            <div className="flex items-start gap-3 mt-3 ml-6 pl-4 border-l-2 border-slate-200">
                              <p className="text-slate-600 leading-relaxed text-sm">
                                {q.answer_brief}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {(!experience.rounds || experience.rounds.length === 0) && (
            <p className="text-slate-500 italic">No rounds detailed for this experience.</p>
          )}
        </div>
      </div>
    </div>
  );
}
