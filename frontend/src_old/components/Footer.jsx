import { Link } from 'react-router-dom';
import { HardHat, Mail, Phone, MapPin } from 'lucide-react';

const columns = [
  { title: 'Platform', links: [
    { label: 'About', to: '/about' },
    { label: 'Find Workers', to: '/find-workers' },
    { label: 'Post a Job', to: '/post-job' },
    { label: 'Become a Worker', to: '/become-a-worker' },
  ]},
  { title: 'Support', links: [
    { label: 'Contact', to: '/contact' },
    { label: 'Privacy Policy', to: '/privacy-policy' },
    { label: 'Terms & Conditions', to: '/terms' },
  ]},
];

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-white/80 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-2 font-head font-bold text-xl text-white">
            <span className="bg-amber text-navy-900 rounded p-1.5 flex items-center justify-center">
              <HardHat size={20} strokeWidth={2.5} />
            </span>
            Blue Collar Worker Connect
          </Link>
          <p className="mt-4 text-sm max-w-sm leading-relaxed">
            Connecting local skilled workers with the customers who need them — built for trust, speed, and fair pricing.
          </p>
          <div className="mt-5 space-y-2 text-sm">
            <div className="flex items-center gap-2"><Mail size={15} className="text-amber" /> support@bcwconnect.in</div>
            <div className="flex items-center gap-2"><Phone size={15} className="text-amber" /> +91 90000 12345</div>
            <div className="flex items-center gap-2"><MapPin size={15} className="text-amber" /> Hyderabad, Telangana</div>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="font-head text-sm font-semibold tracking-wide text-white uppercase mb-4">{col.title}</h4>
            <ul className="space-y-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="hover:text-amber transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/50">
          <span>© 2026 Blue Collar Worker Connect. All rights reserved.</span>
          <div className="flex gap-4">
            <Link to="/privacy-policy" className="hover:text-white/80">Privacy</Link>
            <Link to="/terms" className="hover:text-white/80">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
