import { Link } from 'react-router-dom';
import { ClipboardList, Clock3, Calendar, CheckCircle2, Heart, MessageCircle, Bell } from 'lucide-react';
import JobCard from '../components/JobCard';
import Button from '../components/Button';
import { jobs } from '../data/jobs';
import { workers } from '../data/workers';

const stats = [
  { label: 'Posted Jobs', value: jobs.length, icon: ClipboardList },
  { label: 'Active Requests', value: 2, icon: Clock3 },
  { label: 'Bookings', value: 4, icon: Calendar },
  { label: 'Completed Jobs', value: 7, icon: CheckCircle2 },
];

export default function CustomerDashboard() {
  const savedWorkers = workers.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="tag-label">Customer dashboard</span>
          <h1 className="font-head font-bold text-3xl text-navy mt-2">Welcome, Priya</h1>
        </div>
        <Button as="link" to="/post-job">Post a new job</Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {stats.map((s) => (
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
          <div className="space-y-4">
            {jobs.map((j) => <JobCard key={j.id} job={j} />)}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-concrete-300 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <Heart size={16} className="text-rust" />
              <h3 className="font-head font-bold text-lg text-navy">Saved Workers</h3>
            </div>
            <ul className="space-y-3">
              {savedWorkers.map((w) => (
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
          </div>

          <Link to="/messages" className="bg-white border border-concrete-300 rounded-lg p-5 flex items-center justify-between hover:shadow-md transition-shadow">
            <span className="inline-flex items-center gap-2 font-semibold text-navy text-sm"><MessageCircle size={16} /> Messages</span>
            <span className="text-xs bg-amber text-navy-900 font-bold px-2 py-0.5 rounded-full">2 new</span>
          </Link>
          <Link to="/notifications" className="bg-white border border-concrete-300 rounded-lg p-5 flex items-center justify-between hover:shadow-md transition-shadow">
            <span className="inline-flex items-center gap-2 font-semibold text-navy text-sm"><Bell size={16} /> Notifications</span>
            <span className="text-xs bg-amber text-navy-900 font-bold px-2 py-0.5 rounded-full">3 new</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
