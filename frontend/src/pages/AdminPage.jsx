import { useState, useEffect } from 'react';
import { admin } from '../utils/api';
import { useAuth } from '../hooks/useAuth';

export default function AdminPage() {
  const { user } = useAuth();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') return;
    const fetchPending = async () => {
      setLoading(true);
      try {
        const { data } = await admin.pending();
        setPending(data);
      } catch (error) {
        console.error('Error fetching pending:', error);
      }
      setLoading(false);
    };
    fetchPending();
  }, [user]);

  const handleApprove = async (id) => {
    try {
      await admin.approve(id);
      setPending(pending.filter((p) => p._id !== id));
    } catch (error) {
      alert('Error approving');
    }
  };

  const handleReject = async (id) => {
    try {
      await admin.reject(id, rejectReason);
      setPending(pending.filter((p) => p._id !== id));
      setSelectedId(null);
      setRejectReason('');
    } catch (error) {
      alert('Error rejecting');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-500 font-medium">Admin access only</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Moderation Queue</h2>
        <p className="text-slate-500">Review and approve pending interview experiences.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : pending.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">All Caught Up!</h3>
          <p className="text-slate-500">There are no pending experiences to review.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-lg px-4 py-3 shadow-sm border border-slate-200 text-sm font-medium text-slate-700">
            Total Pending: <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full ml-1">{pending.length}</span>
          </div>
          
          <div className="grid gap-6">
            {pending.map((exp) => (
              <div key={exp._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      {exp.company} <span className="text-slate-400 font-normal">in</span> {exp.role_title}
                    </h3>
                    <div className="flex gap-2 mt-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize
                        ${exp.difficulty === 'easy' ? 'bg-green-100 text-green-700' : 
                          exp.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-red-100 text-red-700'}`}>
                        {exp.difficulty}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {exp.rounds?.length || 0} Rounds
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(exp._id)}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setSelectedId(exp._id)}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                    >
                      Reject
                    </button>
                  </div>
                </div>
                
                <div className="px-6 py-5 bg-slate-50">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Preparation Tips</h4>
                  <p className="text-sm text-slate-700">{exp.prep_tips}</p>
                </div>

                {selectedId === exp._id && (
                  <div className="px-6 py-5 bg-red-50 border-t border-red-100 animate-fade-in">
                    <label className="block text-sm font-medium text-red-800 mb-2">Rejection Reason</label>
                    <textarea
                      placeholder="Explain why this experience was rejected..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full px-3 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-3"
                      rows="3"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReject(exp._id)}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Confirm Rejection
                      </button>
                      <button
                        onClick={() => setSelectedId(null)}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
