import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send } from 'lucide-react';
import { api, initials, timeAgo } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Messages() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [convos, setConvos] = useState([]);
  const [activeId, setActiveId] = useState(params.get('c') ? Number(params.get('c')) : null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    api.conversations()
      .then((list) => {
        setConvos(list);
        setActiveId((cur) => cur ?? list[0]?.id ?? null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // load messages for the open conversation and poll for new ones
  useEffect(() => {
    if (!activeId) return undefined;
    let stop = false;
    const fetchMessages = () => api.messages(activeId).then((m) => { if (!stop) setMessages(m); }).catch(() => {});
    fetchMessages();
    const timer = setInterval(fetchMessages, 5000);
    return () => { stop = true; clearInterval(timer); };
  }, [activeId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !activeId) return;
    setDraft('');
    try {
      const sent = await api.sendMessage(activeId, text);
      setMessages((m) => [...m, sent]);
    } catch (err) {
      setError(err.message);
      setDraft(text);
    }
  }

  const active = convos.find((c) => c.id === activeId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <span className="tag-label">Inbox</span>
      <h1 className="font-head font-bold text-3xl text-navy mt-2 mb-6">Messages</h1>

      {error && <div role="alert" className="bg-rust/10 text-rust text-sm font-semibold rounded px-3.5 py-2.5 mb-4">{error}</div>}

      {!loading && convos.length === 0 ? (
        <div className="bg-white border border-concrete-300 rounded-lg p-10 text-center">
          <p className="font-head font-semibold text-lg text-navy">No conversations yet</p>
          <p className="text-sm text-ink/60 mt-1">Open a worker's profile and press Message to start one.</p>
        </div>
      ) : (
        <div className="bg-white border border-concrete-300 rounded-lg overflow-hidden grid md:grid-cols-[280px_1fr] h-[600px]">
          <div className="border-r border-concrete-300 overflow-y-auto">
            {convos.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`w-full text-left px-4 py-3.5 flex items-center gap-3 border-b border-concrete-200 transition-colors ${c.id === activeId ? 'bg-concrete-100' : 'hover:bg-concrete-100'}`}
              >
                <div className="w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center font-head font-semibold text-sm shrink-0">{initials(c.other_participant.name)}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-navy truncate">{c.other_participant.name}</p>
                  <p className="text-xs text-ink/50 truncate">{c.last_message || 'No messages yet'}</p>
                </div>
                {c.unread_count > 0 && c.id !== activeId && <span className="text-xs bg-amber text-navy-900 font-bold px-2 py-0.5 rounded-full">{c.unread_count}</span>}
              </button>
            ))}
          </div>

          <div className="flex flex-col min-h-0">
            {active && (
              <div className="px-5 py-3.5 border-b border-concrete-300 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center font-head font-semibold text-xs">{initials(active.other_participant.name)}</div>
                <div>
                  <p className="text-sm font-semibold text-navy">{active.other_participant.name}</p>
                  <p className="text-xs text-ink/50 capitalize">{active.other_participant.role.toLowerCase()}</p>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-concrete-100">
              {messages.length === 0 && <p className="text-sm text-ink/40 text-center mt-10">Say hello 👋</p>}
              {messages.map((m) => {
                const mine = m.sender_id === user.id;
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-lg px-4 py-2.5 text-sm ${mine ? 'bg-navy text-white rounded-br-none' : 'bg-white border border-concrete-300 text-ink rounded-bl-none'}`}>
                      {m.message}
                      <p className={`text-[10px] mt-1 ${mine ? 'text-white/50' : 'text-ink/40'}`}>{timeAgo(m.created_at)}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className="border-t border-concrete-300 p-3 flex items-center gap-2">
              <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message..." className="flex-1 bg-concrete-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-amber" />
              <button type="submit" disabled={!draft.trim()} className="bg-amber hover:bg-amber-600 disabled:opacity-50 text-navy-900 p-2.5 rounded-full transition-colors" aria-label="Send"><Send size={16} /></button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
