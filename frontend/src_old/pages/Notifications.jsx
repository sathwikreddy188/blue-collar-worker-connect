import { notifications as initial } from '../data/notifications';
import { useState } from 'react';

export default function Notifications() {
  const [items, setItems] = useState(initial);
  const unreadCount = items.filter((n) => n.unread).length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between">
        <div>
          <span className="tag-label">{unreadCount} unread</span>
          <h1 className="font-head font-bold text-3xl text-navy mt-2">Notifications</h1>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => setItems((its) => its.map((n) => ({ ...n, unread: false })))}
            className="text-sm font-semibold text-steel hover:text-amber-700"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white border border-concrete-300 rounded-lg mt-6 divide-y divide-concrete-200">
        {items.map((n) => (
          <button
            key={n.id}
            onClick={() => setItems((its) => its.map((x) => x.id === n.id ? { ...x, unread: false } : x))}
            className={`w-full text-left flex items-start gap-4 px-5 py-4 transition-colors hover:bg-concrete-100 ${n.unread ? 'bg-amber/5' : ''}`}
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${n.unread ? 'bg-amber text-navy-900' : 'bg-concrete-200 text-ink/50'}`}>
              <n.icon size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-navy">{n.title}</p>
                <span className="text-xs text-ink/40 whitespace-nowrap">{n.time}</span>
              </div>
              <p className="text-sm text-ink/60 mt-0.5">{n.text}</p>
            </div>
            {n.unread && <span className="w-2 h-2 rounded-full bg-amber mt-2 shrink-0" />}
          </button>
        ))}
      </div>
    </div>
  );
}
