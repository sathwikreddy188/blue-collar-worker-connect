import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Clock3, Calendar, CheckCircle2, Heart, MessageCircle, Bell } from 'lucide-react';
import JobCard from '../components/JobCard';
import Button from '../components/Button';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [saved, setSaved] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.customerDashboard(), api.myJobs(), api.savedWorkers()])
      .then(([s, j, w]) => { setStats(s); setJobs(j); setSaved(w); })
      .catch((e) => setError(e.message));
  }, []);

  const cards = stats && [
    { label: 'Posted Jobs', value: stats.total_jobs, icon: ClipboardList },
    { label: 'Active Jobs', value: stats.active_jobs, icon: Clock3 },
    { label: 'Bookings', value: stats.bookings, icon: Calendar },
    { label: 'Completed Jobs', value: stats.completed_jobs, icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="tag-label">Customer dashboard</span>
          <h1 className="font-head font-bold text-3xl text-navy mt-2">Welcome, {user.name}</h1>
        </div>
        <Button as="link" to="/post-job">Post a new job</Button>
      </div>

      {error && <div role="alert" className="bg-rust/10 text-rust text-sm font-semibold rounded px-3.5 py-2.5 mt-6">{error}</div>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {(cards || []).map((s) => (
          <div key={s.label} className="bg-white border border-concrete-300 rounded-lg p-5">
            <s.icon size={18} className="text-amber-700" />
            <p className="font-head font-bold text-2xl text-navy mt-2">{s.value}</p>
            <p className="text-sm text-ink/60">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mt-10">
        <div className="lg:col-span-2">
          <h2 className="font-head font-bold text-xl text-navy mb-4">Your jobs</h2>
          {jobs.length === 0 ? (
            <div className="bg-white border border-concrete-300 rounded-lg p-8 text-center">
              <p className="text-ink/60 text-sm">You haven't posted any jobs yet.</p>
              <Button as="link" to="/post-job" className="mt-4">Post your first job</Button>
            </div>
          ) : (
            <div className="space-y-4">{jobs.map((j) => <JobCard key={j.id} job={j} />)}</div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-concrete-300 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4"><Heart size={16} className="text-rust" /><h3 className="font-head font-bold text-lg text-navy">Saved Workers</h3></div>
            {saved.length === 0 ? (
              <p className="text-sm text-ink/50">No saved workers yet. Use the Save button on a worker's profile.</p>
            ) : (
              <ul className="space-y-3">
                {saved.map((w) => (
                  <li key={w.id}>
                    <Link to={`/worker/${w.id}`} className="flex items-center gap-3 group">
                      <div className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center font-head font-semibold text-xs shrink-0">{w.avatar}</div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-navy group-hover:text-amber-700 truncate">{w.name}</p>
                        <p className="text-xs text-ink/50">{w.profession}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Link to="/messages" className="bg-white border border-concrete-300 rounded-lg p-5 flex items-center justify-between hover:shadow-md transition-shadow">
            <span className="inline-flex items-center gap-2 font-semibold text-navy text-sm"><MessageCircle size={16} /> Messages</span>
            {stats?.unread_messages > 0 && <span className="text-xs bg-amber text-navy-900 font-bold px-2 py-0.5 rounded-full">{stats.unread_messages} new</span>}
          </Link>
          <Link to="/notifications" className="bg-white border border-concrete-300 rounded-lg p-5 flex items-center justify-between hover:shadow-md transition-shadow">
            <span className="inline-flex items-center gap-2 font-semibold text-navy text-sm"><Bell size={16} /> Notifications</span>
            {stats?.unread_notifications > 0 && <span className="text-xs bg-amber text-navy-900 font-bold px-2 py-0.5 rounded-full">{stats.unread_notifications} new</span>}
          </Link>
        </div>
      </div>
    </div>
  );
}
