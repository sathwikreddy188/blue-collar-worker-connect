import { useState } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { conversations } from '../data/messages';

export default function Messages() {
  const [activeId, setActiveId] = useState(conversations[0].id);
  const [draft, setDraft] = useState('');
  const active = conversations.find((c) => c.id === activeId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <span className="tag-label">Inbox</span>
      <h1 className="font-head font-bold text-3xl text-navy mt-2 mb-6">Messages</h1>

      <div className="bg-white border border-concrete-300 rounded-lg overflow-hidden grid md:grid-cols-[280px_1fr] h-[600px]">
        <div className="border-r border-concrete-300 overflow-y-auto">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`w-full text-left px-4 py-3.5 flex items-center gap-3 border-b border-concrete-200 transition-colors ${
                c.id === activeId ? 'bg-concrete-100' : 'hover:bg-concrete-100'
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center font-head font-semibold text-sm">
                  {c.name.split(' ').map((n) => n[0]).join('')}
                </div>
                {c.online && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-navy truncate">{c.name}</p>
                <p className="text-xs text-ink/50 truncate">{c.messages[c.messages.length - 1].text}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-col">
          <div className="px-5 py-3.5 border-b border-concrete-300 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center font-head font-semibold text-xs">
              {active.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <p className="text-sm font-semibold text-navy">{active.name}</p>
              <p className="text-xs text-ink/50">{active.profession} · {active.online ? 'Online' : 'Offline'}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-concrete-100">
            {active.messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'customer' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-lg px-4 py-2.5 text-sm ${
                  m.from === 'customer' ? 'bg-navy text-white rounded-br-none' : 'bg-white border border-concrete-300 text-ink rounded-bl-none'
                }`}>
                  {m.text}
                  <p className={`text-[10px] mt-1 ${m.from === 'customer' ? 'text-white/50' : 'text-ink/40'}`}>{m.time}</p>
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); setDraft(''); }}
            className="border-t border-concrete-300 p-3 flex items-center gap-2"
          >
            <button type="button" className="p-2 text-ink/40 hover:text-navy"><Paperclip size={18} /></button>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-concrete-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-amber"
            />
            <button type="submit" className="bg-amber hover:bg-amber-600 text-navy-900 p-2.5 rounded-full transition-colors">
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
