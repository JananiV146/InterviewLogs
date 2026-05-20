import { useState, useEffect } from 'react';
import { experiences } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { Link, useParams, useNavigate } from 'react-router-dom';

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

export default function SubmitPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    company: '',
    role_title: '',
    difficulty: 'medium',
    prep_tips: '',
    content: '',
    media: [],
    tags: [],
    rounds: [],
  });
  const [newTag, setNewTag] = useState('');
  const [newRound, setNewRound] = useState({
    round_type: 'phone',
    summary: '',
    questions: [],
  });
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    question_type: 'dsa',
    answer_brief: '',
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing && user) {
      const fetchExperience = async () => {
        try {
          const { data } = await experiences.detail(id);
          setForm({
            company: data.company || '',
            role_title: data.role_title || '',
            difficulty: data.difficulty || 'medium',
            prep_tips: data.prep_tips || '',
            content: data.content || '',
            media: data.media || [],
            tags: data.tags || [],
            rounds: data.rounds || [],
          });
        } catch (err) {
          setError('Failed to fetch experience details. You may not have permission to edit this.');
        }
        setInitialLoading(false);
      };
      fetchExperience();
    }
  }, [id, isEditing, user]);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Join to Share</h2>
        <p className="text-slate-500 mb-8 text-lg">Please log in with your college email to submit an interview experience.</p>
        <Link to="/login" className="px-8 py-3.5 text-base font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-lg">
          Log In
        </Link>
      </div>
    );
  }

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleMetaChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const addTag = () => {
    if (newTag.trim() && !form.tags.includes(newTag)) {
      setForm({ ...form, tags: [...form.tags, newTag] });
      setNewTag('');
    }
  };

  const removeTag = (tag) => {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });
  };

  const addQuestion = () => {
    if (newQuestion.question_text.trim()) {
      const updated = { ...newRound };
      updated.questions = [...updated.questions, newQuestion];
      setNewRound(updated);
      setNewQuestion({ question_text: '', question_type: 'dsa', answer_brief: '' });
    }
  };

  const addRound = () => {
    if (newRound.round_type && newRound.summary.trim()) {
      setForm({ ...form, rounds: [...form.rounds, { ...newRound, round_order: form.rounds.length + 1 }] });
      setNewRound({ round_type: 'phone', summary: '', questions: [] });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const { upload } = await import('../utils/api');
      const { data } = await upload.file(formData);
      setForm({ ...form, media: [...form.media, data.url] });
    } catch (err) {
      setError('Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      if (isEditing) {
        await experiences.update(id, form);
        alert('Experience updated successfully! It is now pending re-approval.');
        navigate('/dashboard');
      } else {
        await experiences.create(form);
        alert('Experience submitted! Pending admin approval.');
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit');
    }
    setLoading(false);
  };

  const Stepper = () => (
    <div className="flex items-center justify-center mb-10">
      <div className="flex items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-slate-200 text-slate-500'}`}>1</div>
        <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-slate-200 text-slate-500'}`}>2</div>
        <div className={`w-16 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-slate-200 text-slate-500'}`}>3</div>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Share Your Experience</h1>
        <p className="text-slate-500 mt-2">Help your peers by documenting your interview process.</p>
      </div>

      <Stepper />

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-10">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-1">Basic Information</h2>
              <p className="text-sm text-slate-500 mb-6">Let's start with the role and company details.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Google"
                  value={form.company}
                  onChange={(e) => handleMetaChange('company', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Role Title</label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer Intern"
                  value={form.role_title}
                  onChange={(e) => handleMetaChange('role_title', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Post Content</label>
              <textarea
                placeholder="Share your interview experience..."
                value={form.content}
                onChange={(e) => handleMetaChange('content', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all h-40"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Media & File Upload</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-3 text-slate-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                    <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Click to upload</span> any file (image, video, PDF, document, zip, etc.)</p>
                  </div>
                  <input type="file" className="hidden" onChange={handleFileUpload} disabled={loading} />
                </label>
              </div>
              {form.media.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-4">
                  {form.media.map((url, idx) => {
                    const fileType = getFileType(url);
                    const fileName = getFileName(url);
                    return (
                      <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex flex-col justify-center items-center p-1 text-center">
                        {fileType === 'image' ? (
                          <img src={`http://localhost:5000${url}`} alt="upload" className="w-full h-full object-cover rounded-md" />
                        ) : fileType === 'video' ? (
                          <video src={`http://localhost:5000${url}`} className="w-full h-full object-cover rounded-md" />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full w-full px-1">
                            <span className="text-2xl mb-1">📄</span>
                            <span className="text-[9px] text-slate-600 font-bold uppercase truncate max-w-full">{url.split('.').pop()}</span>
                            <span className="text-[8px] text-slate-400 truncate max-w-full">{fileName}</span>
                          </div>
                        )}
                        <button 
                          onClick={() => setForm({ ...form, media: form.media.filter((_, i) => i !== idx) })}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-md hover:bg-red-600 transition-colors"
                        >
                          &times;
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Overall Difficulty</label>
              <select
                value={form.difficulty}
                onChange={(e) => handleMetaChange('difficulty', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Preparation Tips</label>
              <textarea
                placeholder="What should others study for this role?"
                value={form.prep_tips}
                onChange={(e) => handleMetaChange('prep_tips', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all h-32"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tags</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="e.g. System Design, DSA"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                <button 
                  onClick={addTag}
                  className="px-6 py-3 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-900 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium flex items-center gap-2">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-blue-900 text-lg leading-none">&times;</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
            </div>

            <div className="pt-6 flex justify-end">
              <button 
                onClick={() => setStep(2)}
                disabled={!form.company || !form.role_title}
                className="px-8 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next Step →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">Interview Rounds</h2>
                <p className="text-sm text-slate-500">Add the details for each round you went through.</p>
              </div>
              <div className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                {form.rounds.length} Rounds Added
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Round Type</label>
                  <select
                    value={newRound.round_type}
                    onChange={(e) => setNewRound({ ...newRound, round_type: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="phone">Phone</option>
                    <option value="onsite">Onsite</option>
                    <option value="oa">Online Assessment</option>
                    <option value="hr">HR</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Round Summary</label>
                  <input
                    type="text"
                    placeholder="Brief description of the round"
                    value={newRound.summary}
                    onChange={(e) => setNewRound({ ...newRound, summary: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <label className="block text-sm font-semibold text-slate-700 mb-3">Add Questions (Optional)</label>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col md:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Question asked"
                      value={newQuestion.question_text}
                      onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                      className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                    <select
                      value={newQuestion.question_type}
                      onChange={(e) => setNewQuestion({ ...newQuestion, question_type: e.target.value })}
                      className="w-full md:w-40 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    >
                      <option value="dsa">DSA</option>
                      <option value="system">System Design</option>
                      <option value="behavioral">Behavioral</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="flex flex-col md:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Brief Answer / Approach"
                      value={newQuestion.answer_brief}
                      onChange={(e) => setNewQuestion({ ...newQuestion, answer_brief: e.target.value })}
                      className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                    <button 
                      onClick={addQuestion}
                      disabled={!newQuestion.question_text}
                      className="w-full md:w-40 px-4 py-2.5 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-900 transition-colors text-sm disabled:opacity-50"
                    >
                      Add Question
                    </button>
                  </div>
                </div>

                {newRound.questions.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {newRound.questions.map((q, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 text-sm flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-slate-800">{q.question_text}</span>
                          <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs uppercase">{q.question_type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button 
                  onClick={addRound}
                  disabled={!newRound.summary}
                  className="w-full py-3 bg-white border-2 border-dashed border-blue-300 text-blue-600 font-bold rounded-xl hover:bg-blue-50 hover:border-blue-400 transition-colors disabled:opacity-50"
                >
                  + Add This Round to Experience
                </button>
              </div>
            </div>

            <div className="pt-6 flex justify-between items-center border-t border-slate-100">
              <button 
                onClick={() => setStep(1)}
                className="px-6 py-3 text-slate-600 font-medium hover:text-slate-900 transition-colors"
              >
                ← Back
              </button>
              <button 
                onClick={() => setStep(3)}
                disabled={form.rounds.length === 0}
                className="px-8 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Review & Submit →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-1">Review Your Submission</h2>
              <p className="text-sm text-slate-500 mb-6">Make sure everything looks good before submitting to the admins.</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                <div>
                  <dt className="text-sm font-medium text-slate-500">Company</dt>
                  <dd className="mt-1 text-lg font-semibold text-slate-900">{form.company}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Role Title</dt>
                  <dd className="mt-1 text-lg font-semibold text-slate-900">{form.role_title}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Difficulty</dt>
                  <dd className="mt-1">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase
                      ${form.difficulty === 'easy' ? 'bg-green-100 text-green-700' : 
                        form.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'}`}>
                      {form.difficulty}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Identity</dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900">Public (as {user.name})</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-slate-500">Tags</dt>
                  <dd className="mt-1 flex gap-2 flex-wrap">
                    {form.tags.length > 0 ? form.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-white border border-slate-200 text-slate-600 rounded-md text-xs font-medium">
                        {tag}
                      </span>
                    )) : <span className="text-sm text-slate-500">None</span>}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-slate-500">Rounds Summary</dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900">{form.rounds.length} rounds documented.</dd>
                </div>
              </dl>
            </div>

            <div className="pt-6 flex justify-between items-center border-t border-slate-100">
              <button 
                onClick={() => setStep(2)}
                className="px-6 py-3 text-slate-600 font-medium hover:text-slate-900 transition-colors"
              >
                ← Edit Details
              </button>
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-md shadow-green-200 disabled:opacity-70"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    Submitting...
                  </span>
                ) : 'Submit Experience'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
