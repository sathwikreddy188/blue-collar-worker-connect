import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, User, Briefcase } from 'lucide-react';
import { Field, inputCls } from '../components/Field';
import Button from '../components/Button';

export default function Login() {
  const [role, setRole] = useState('customer');
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    navigate(role === 'worker' ? '/dashboard/worker' : '/dashboard/customer');
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="font-head font-bold text-3xl text-navy">Welcome back</h1>
        <p className="text-ink/60 mt-1">Log in to manage your jobs or bookings.</p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-6 bg-concrete-200 p-1 rounded-lg">
        {[
          { id: 'customer', label: 'Customer', icon: User },
          { id: 'worker', label: 'Worker', icon: Briefcase },
        ].map((r) => (
          <button
            key={r.id}
            onClick={() => setRole(r.id)}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-semibold transition-colors ${
              role === r.id ? 'bg-white text-navy shadow-sm' : 'text-ink/50'
            }`}
          >
            <r.icon size={15} /> {r.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-concrete-300 rounded-lg p-6 space-y-5">
        <Field label="Phone or email">
          <input required className={inputCls} placeholder="you@example.com" />
        </Field>
        <Field label="Password">
          <div className="relative">
            <input required type={showPw ? 'text' : 'password'} className={inputCls} placeholder="••••••••" />
            <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40">
              {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </Field>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-ink/70">
            <input type="checkbox" className="accent-amber" /> Remember me
          </label>
          <a href="#" className="text-steel font-semibold hover:text-amber-700">Forgot password?</a>
        </div>
        <Button type="submit" className="w-full">Login as {role === 'worker' ? 'Worker' : 'Customer'}</Button>
      </form>

      <p className="text-center text-sm text-ink/60 mt-6">
        Don't have an account? <Link to="/become-a-worker" className="text-steel font-semibold hover:text-amber-700">Sign Up</Link>
      </p>
    </div>
  );
}
