import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, HardHat, Bell, MessageCircle } from 'lucide-react';
import Button from './Button';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/find-workers', label: 'Find Workers' },
  { to: '/post-job', label: 'Post a Job' },
  { to: '/become-a-worker', label: 'Become a Worker' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dashboard = user?.role === 'WORKER' ? '/dashboard/worker' : '/dashboard/customer';

  function handleLogout() {
    logout();
    setOpen(false);
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-40 bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-head font-bold text-xl tracking-tight" onClick={() => setOpen(false)}>
            <span className="bg-amber text-navy-900 rounded p-1.5 flex items-center justify-center">
              <HardHat size={20} strokeWidth={2.5} />
            </span>
            <span>Blue Collar Worker Connect</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-semibold rounded transition-colors ${isActive ? 'text-amber' : 'text-white/80 hover:text-white'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/messages" className="p-2 text-white/80 hover:text-white" aria-label="Messages"><MessageCircle size={18} /></Link>
                <Link to="/notifications" className="p-2 text-white/80 hover:text-white" aria-label="Notifications"><Bell size={18} /></Link>
                <Link to={dashboard} className="text-sm font-semibold text-amber hover:text-white px-2">{user.name.split(' ')[0]}</Link>
                <button onClick={handleLogout} className="text-sm font-semibold text-white/80 hover:text-white px-2">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-white/90 hover:text-white px-2">Login</Link>
                <Button to="/login?mode=signup" variant="primary" className="!py-2 !px-4 text-sm">Sign Up</Button>
              </>
            )}
          </div>

          <button
            className="lg:hidden p-2 -mr-2 focus-ring rounded"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-white/10 bg-navy-800 px-4 pb-4 pt-2">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `block py-2.5 text-[0.95rem] font-semibold border-b border-white/5 ${isActive ? 'text-amber' : 'text-white/85'}`}
            >
              {l.label}
            </NavLink>
          ))}
          {user ? (
            <>
              <Link to={dashboard} onClick={() => setOpen(false)} className="block py-2.5 text-[0.95rem] font-semibold text-amber border-b border-white/5">My Dashboard</Link>
              <Link to="/messages" onClick={() => setOpen(false)} className="block py-2.5 text-[0.95rem] font-semibold text-white/85 border-b border-white/5">Messages</Link>
              <Link to="/notifications" onClick={() => setOpen(false)} className="block py-2.5 text-[0.95rem] font-semibold text-white/85 border-b border-white/5">Notifications</Link>
              <button onClick={handleLogout} className="mt-4 w-full border-2 border-white text-white font-head font-semibold py-2.5 rounded">Logout</button>
            </>
          ) : (
            <div className="flex gap-3 mt-4">
              <Button as="link" to="/login" variant="outline" className="flex-1 !border-white !text-white text-sm" onClick={() => setOpen(false)}>Login</Button>
              <Button as="link" to="/login?mode=signup" variant="primary" className="flex-1 text-sm" onClick={() => setOpen(false)}>Sign Up</Button>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
