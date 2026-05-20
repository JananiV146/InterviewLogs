import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { directMessages } from '../utils/api';
import { useAuth } from '../hooks/useAuth';

export default function MessagingPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [inputText, setInputText] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);

  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const queryUserId = searchParams.get('userId');
  const queryUserName = location.state?.name || 'New Connection';

  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversations list
  const fetchConversations = async (selectUserId = null) => {
    try {
      const { data } = await directMessages.list();
      setConversations(data);

      if (data.length > 0) {
        // If a query userId is specified, try to find their active conversation
        if (selectUserId) {
          const found = data.find(c => 
            c.participants.some(p => String(p._id || p.id) === String(selectUserId))
          );
          if (found) {
            setActiveConv(found);
          } else {
            // Create a mock conversation to display in the list
            const mockParticipant = {
              _id: selectUserId,
              name: queryUserName,
            };
            const mockConv = {
              _id: 'temp_conv',
              participants: [user, mockParticipant],
              mock: true,
              targetUser: mockParticipant
            };
            setConversations(prev => [mockConv, ...prev]);
            setActiveConv(mockConv);
          }
        } else if (!activeConv) {
          // Default to first conversation
          setActiveConv(data[0]);
        }
      } else if (selectUserId) {
        // No conversations exist, but we have a direct message intent
        const mockParticipant = {
          _id: selectUserId,
          name: queryUserName,
        };
        const mockConv = {
          _id: 'temp_conv',
          participants: [user, mockParticipant],
          mock: true,
          targetUser: mockParticipant
        };
        setConversations([mockConv]);
        setActiveConv(mockConv);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
    setLoadingConvs(false);
  };

  // Initial load
  useEffect(() => {
    fetchConversations(queryUserId);
  }, [queryUserId]);

  // Load message history when activeConv changes
  useEffect(() => {
    if (!activeConv) return;

    // Clear messages for transition
    if (activeConv._id === 'temp_conv') {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      setLoadingMessages(true);
      try {
        const { data } = await directMessages.messages(activeConv._id);
        setMessages(data);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
      setLoadingMessages(false);
    };

    loadMessages();

    // Setup polling for new messages every 3 seconds
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const { data } = await directMessages.messages(activeConv._id);
        setMessages(data);
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [activeConv]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;

    // Target receiver is the other participant in the conversation
    const otherUser = activeConv.targetUser || activeConv.participants.find(p => String(p._id || p.id) !== String(user?.id || user?._id));
    if (!otherUser) return;

    const tempText = inputText;
    setInputText('');

    try {
      const { data } = await directMessages.send(otherUser._id, tempText);
      
      // If it was a mock conversation, refresh conversation list to get actual ID
      if (activeConv.mock) {
        // Clear temp query params so that list reload selects the actual conv
        navigate('/messaging', { replace: true });
        await fetchConversations(otherUser._id);
      } else {
        setMessages(prev => [...prev, data]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Helper to get conversation title & initials
  const getConversationMeta = (conv) => {
    const otherUser = conv.targetUser || conv.participants.find(p => String(p._id || p.id) !== String(user?.id || user?._id));
    const name = otherUser?.name || 'Anonymous User';
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return { name, initials, otherUser };
  };

  if (loadingConvs) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-[calc(100vh-140px)] min-h-[500px]">
      <div className="flex h-full">
        {/* Left Side: Conversations List */}
        <div className={`w-full md:w-80 flex-shrink-0 border-r border-slate-200 flex flex-col ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Messaging</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {conversations.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-400 italic">No conversations yet.</p>
            ) : (
              conversations.map((conv) => {
                const { name, initials, otherUser } = getConversationMeta(conv);
                const isActive = activeConv?._id === conv._id;
                const isUnread = conv.last_message && String(conv.last_message.sender_id?._id || conv.last_message.sender_id) !== String(user?.id || user?._id) && !conv.last_message.is_read;

                return (
                  <button
                    key={conv._id}
                    onClick={() => {
                      setActiveConv(conv);
                      setShowMobileChat(true);
                    }}
                    className={`w-full text-left p-4 flex items-start gap-3 transition-colors ${isActive ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                      {initials}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className={`text-sm font-semibold truncate block ${isUnread ? 'text-slate-900 font-extrabold' : 'text-slate-800'}`}>
                          {name}
                        </span>
                        {conv.updated_at && (
                          <span className="text-[10px] text-slate-400">
                            {new Date(conv.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs truncate ${isUnread ? 'text-blue-600 font-medium' : 'text-slate-500'}`}>
                        {conv.last_message ? `${String(conv.last_message.sender_id?._id || conv.last_message.sender_id) === String(user?.id || user?._id) ? 'You: ' : ''}${conv.last_message.text}` : 'Started a conversation'}
                      </p>
                    </div>

                    {isUnread && (
                      <span className="w-2.5 h-2.5 bg-blue-600 rounded-full flex-shrink-0 mt-2"></span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Active Chat Window */}
        <div className={`flex-1 flex flex-col h-full bg-slate-50 ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center gap-3">
                <button 
                  onClick={() => setShowMobileChat(false)} 
                  className="md:hidden p-1 -ml-2 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {getConversationMeta(activeConv).initials}
                </div>
                
                <div>
                  <h3 className="font-bold text-slate-800 leading-tight">
                    {getConversationMeta(activeConv).name}
                  </h3>
                  <span className="text-xs text-green-500 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Active Thread
                  </span>
                </div>
              </div>

              {/* Messages Box */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loadingMessages ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4 text-3xl">💬</div>
                    <h4 className="font-bold text-slate-700 mb-1">Start a Conversation</h4>
                    <p className="text-xs max-w-xs leading-relaxed">Send a direct message to begin your conversation. Keep it professional and polite!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = String(msg.sender_id?._id || msg.sender_id) === String(user?.id || user?._id);
                    return (
                      <div key={msg._id} className={`flex items-end gap-2.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        {!isOwn && (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold text-[10px] shadow-sm flex-shrink-0">
                            {getConversationMeta(activeConv).initials}
                          </div>
                        )}
                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed ${isOwn ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'}`}>
                          <p>{msg.text}</p>
                          <span className={`text-[9px] block text-right mt-1 ${isOwn ? 'text-white/70' : 'text-slate-400'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Input Area */}
              <div className="bg-white p-4 border-t border-slate-200">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-2xl transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 h-full">
              <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              <h3 className="text-lg font-bold text-slate-700 mb-1">No Active Chat Selected</h3>
              <p className="text-sm max-w-xs leading-relaxed">Choose an ongoing conversation from the left sidebar, or start a new chat directly from a student's shared experience post.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
