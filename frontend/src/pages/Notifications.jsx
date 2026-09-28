import { useEffect, useState } from 'react';
import { Briefcase, CheckCircle2, XCircle, MessageCircle, CalendarCheck, Star, ClipboardCheck, Bell } from 'lucide-react';
import { api, timeAgo } from '../api';

const ICONS = {
  JOB_POSTED: Briefcase,
  JOB_APPLICATION: Briefcase,
  APPLICATION_ACCEPTED: CheckCircle2,
  APPLICATION_REJECTED: XCircle,
  BOOKING_CREATED: CalendarCheck,
  BOOKING_STATUS_CHANGED: CalendarCheck,
  NEW_MESSAGE: MessageCircle,
  JOB_COMPLETED: ClipboardCheck,
  NEW_REVIEW: Star,
};

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.notifications().then(setItems).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const unreadCount = items.filter((n) => !n.is_read).length;

  async function markRead(n) {
    if (n.is_read) return;
    setItems((its) => its.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
    api.markNotificationRead(n.id).catch(() => {});
  }

  async function markAll() {
    setItems((its) => its.map((n) => ({ ...n, is_read: true })));
    api.markAllNotificationsRead().catch((e) => setError(e.message));
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between">
        <div>
          <span className="tag-label">{unreadCount} unread</span>
          <h1 className="font-head font-bold text-3xl text-navy mt-2">Notifications</h1>
        </div>
        {unreadCount > 0 && <button onClick={markAll} className="text-sm font-semibold text-steel hover:text-amber-700">Mark all as read</button>}
      </div>

      {error && <div role="alert" className="bg-rust/10 text-rust text-sm font-semibold rounded px-3.5 py-2.5 mt-6">{error}</div>}

      {!loading && items.length === 0 ? (
        <div className="bg-white border border-concrete-300 rounded-lg p-10 text-center mt-6">
          <Bell size={28} className="mx-auto text-ink/30" />
          <p className="font-head font-semibold text-lg text-navy mt-3">You're all caught up</p>
          <p className="text-sm text-ink/60 mt-1">New activity will show up here.</p>
        </div>
      ) : (
        <div className="bg-white border border-concrete-300 rounded-lg mt-6 divide-y divide-concrete-200">
          {items.map((n) => {
            const Icon = ICONS[n.type] || Bell;
            return (
              <button key={n.id} onClick={() => markRead(n)} className={`w-full text-left flex items-start gap-4 px-5 py-4 transition-colors hover:bg-concrete-100 ${!n.is_read ? 'bg-amber/5' : ''}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${!n.is_read ? 'bg-amber text-navy-900' : 'bg-concrete-200 text-ink/50'}`}><Icon size={16} /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-navy">{n.title}</p>
                    <span className="text-xs text-ink/40 whitespace-nowrap">{timeAgo(n.created_at)}</span>
                  </div>
                  <p className="text-sm text-ink/60 mt-0.5">{n.message}</p>
                </div>
                {!n.is_read && <span className="w-2 h-2 rounded-full bg-amber mt-2 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
