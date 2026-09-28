import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ClipboardCheck, Wallet, Star, MessageCircle, Bell, TrendingUp } from 'lucide-react';

const stats = [
  { label: 'New Requests', value: 5, icon: Briefcase },
  { label: 'Active Jobs', value: 3, icon: ClipboardCheck },
  { label: 'Completed Jobs', value: 42, icon: TrendingUp },
  { label: 'Total Earnings', value: '₹28,500', icon: Wallet },
  { label: 'Rating', value: '4.8', icon: Star },
];

const requests = [
  { id: 1, title: 'Home wiring repair', customer: 'Priya M.', location: 'Ameerpet', budget: '₹1,000 - ₹2,000' },
  { id: 2, title: 'Ceiling fan installation', customer: 'Arjun R.', location: 'Kukatpally', budget: '₹500 - ₹800' },
];

export default function WorkerDashboard() {
  const [available, setAvailable] = useState(true);
  const profileCompletion = 82;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="tag-label">Worker dashboard</span>
          <h1 className="font-head font-bold text-3xl text-navy mt-2">Welcome, Raj Kumar</h1>
        </div>
        <button
          onClick={() => setAvailable((a) => !a)}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border font-semibold text-sm transition-colors ${
            available ? 'bg-green-50 border-green-200 text-green-700' : 'bg-concrete-200 border-concrete-300 text-ink/50'
          }`}
        >
          Available for Work: {available ? 'ON' : 'OFF'}
          <span className={`w-9 h-5 rounded-full relative transition-colors ${available ? 'bg-green-500' : 'bg-concrete-300'}`}>
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${available ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </span>
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
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
          <h2 className="font-head font-bold text-xl text-navy mb-4">New job requests</h2>
          <div className="space-y-4">
            {requests.map((r) => (
              <div key={r.id} className="card-edge bg-white rounded-r-lg p-5 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-head font-semibold text-navy">{r.title}</h3>
                  <p className="text-sm text-ink/60">{r.customer} · {r.location} · {r.budget}</p>
                </div>
                <div className="flex gap-2">
                  <button className="text-sm font-semibold px-4 py-2 rounded border border-concrete-300 text-ink/70 hover:bg-concrete-200">Reject</button>
                  <button className="text-sm font-semibold px-4 py-2 rounded bg-amber hover:bg-amber-600 text-navy-900">Accept</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-concrete-300 rounded-lg p-5">
            <h3 className="font-head font-bold text-lg text-navy mb-2">Profile completion</h3>
            <div className="w-full h-2 rounded-full bg-concrete-300 overflow-hidden">
              <div className="h-full bg-amber" style={{ width: `${profileCompletion}%` }} />
            </div>
            <p className="text-sm text-ink/60 mt-2">{profileCompletion}% complete — add more work photos to reach 100%.</p>
          </div>
          <Link to="/messages" className="bg-white border border-concrete-300 rounded-lg p-5 flex items-center justify-between hover:shadow-md transition-shadow">
            <span className="inline-flex items-center gap-2 font-semibold text-navy text-sm"><MessageCircle size={16} /> Messages</span>
            <span className="text-xs bg-amber text-navy-900 font-bold px-2 py-0.5 rounded-full">1 new</span>
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
