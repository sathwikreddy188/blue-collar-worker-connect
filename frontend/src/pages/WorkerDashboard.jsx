import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ClipboardCheck, Wallet, Star, MessageCircle, Bell, TrendingUp, MapPin } from 'lucide-react';
import Button from '../components/Button';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applied, setApplied] = useState(new Set());
  const [available, setAvailable] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.workerDashboard(), api.openJobs(), api.myApplications()])
      .then(([s, j, apps]) => {
        setStats(s);
        setAvailable(s.availability);
        setJobs(j);
        setApplied(new Set(apps.map((a) => a.job_id)));
      })
      .catch((e) => setError(e.message));
  }, []);

  async function toggleAvailability() {
    setError('');
    try {
      await api.setAvailability(!available);
      setAvailable(!available);
    } catch (e) {
      setError(e.message === 'Worker profile not found' ? 'Create your worker profile first.' : e.message);
    }
  }

  const noProfile = stats && stats.profile_completion === 0;
  const cards = stats && [
    { label: 'Pending Applications', value: stats.new_requests, icon: Briefcase },
    { label: 'Active Jobs', value: stats.active_jobs, icon: ClipboardCheck },
    { label: 'Completed Jobs', value: stats.completed_jobs, icon: TrendingUp },
    { label: 'Total Earnings', value: `₹${Number(stats.total_earnings).toLocaleString('en-IN')}`, icon: Wallet },
    { label: 'Rating', value: stats.rating > 0 ? stats.rating.toFixed(1) : 'New', icon: Star },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="tag-label">Worker dashboard</span>
          <h1 className="font-head font-bold text-3xl text-navy mt-2">Welcome, {user.name}</h1>
        </div>
        <button
          onClick={toggleAvailability}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border font-semibold text-sm transition-colors ${available ? 'bg-green-50 border-green-200 text-green-700' : 'bg-concrete-200 border-concrete-300 text-ink/50'}`}
        >
          Available for Work: {available ? 'ON' : 'OFF'}
          <span className={`w-9 h-5 rounded-full relative transition-colors ${available ? 'bg-green-500' : 'bg-concrete-300'}`}>
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${available ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </span>
        </button>
      </div>

      {error && <div role="alert" className="bg-rust/10 text-rust text-sm font-semibold rounded px-3.5 py-2.5 mt-6">{error}</div>}

      {noProfile && (
        <div className="bg-amber/15 border border-amber/40 rounded-lg p-5 mt-6 flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-navy font-semibold">Your worker profile isn't set up yet, so customers can't find you.</p>
          <Button as="link" to="/become-a-worker">Create profile</Button>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
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
          <h2 className="font-head font-bold text-xl text-navy mb-4">Open jobs</h2>
          {jobs.length === 0 ? (
            <div className="bg-white border border-concrete-300 rounded-lg p-8 text-center text-sm text-ink/60">No open jobs right now. Check back soon.</div>
          ) : (
            <div className="space-y-4">
              {jobs.map((j) => (
                <div key={j.id} className="card-edge bg-white rounded-r-lg p-5 flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="font-head font-semibold text-navy">{j.title}</h3>
                    <p className="text-sm text-ink/60 flex items-center gap-2 flex-wrap">
                      <span>{j.category}</span><span className="inline-flex items-center gap-1"><MapPin size={12} />{j.location}</span><span>{j.budget}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button as="link" to={`/job/${j.id}`} variant="outline" className="!py-2 !px-4 text-sm">{applied.has(j.id) ? 'Applied' : 'View & Apply'}</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-concrete-300 rounded-lg p-5">
            <h3 className="font-head font-bold text-lg text-navy mb-2">Profile completion</h3>
            <div className="w-full h-2 rounded-full bg-concrete-300 overflow-hidden"><div className="h-full bg-amber" style={{ width: `${stats?.profile_completion || 0}%` }} /></div>
            <p className="text-sm text-ink/60 mt-2">{stats?.profile_completion || 0}% complete</p>
          </div>
          <Link to="/messages" className="bg-white border border-concrete-300 rounded-lg p-5 flex items-center justify-between hover:shadow-md transition-shadow">
            <span className="inline-flex items-center gap-2 font-semibold text-navy text-sm"><MessageCircle size={16} /> Messages</span>
            {stats?.unread_messages > 0 && <span className="text-xs bg-amber text-navy-900 font-bold px-2 py-0.5 rounded-full">{stats.unread_messages} new</span>}
          </Link>
          <Link to="/notifications" className="bg-white border border-concrete-300 rounded-lg p-5 flex items-center justify-between hover:shadow-md transition-shadow">
            <span className="inline-flex items-center gap-2 font-semibold text-navy text-sm"><Bell size={16} /> Notifications</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
