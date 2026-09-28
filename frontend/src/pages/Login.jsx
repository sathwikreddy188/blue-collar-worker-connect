import { useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, User, Briefcase } from 'lucide-react';
import { Field, inputCls } from '../components/Field';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get('mode') === 'signup' ? 'signup' : 'login');
  const [role, setRole] = useState('CUSTOMER');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const f = Object.fromEntries(new FormData(e.target));
    try {
      const user =
        mode === 'login'
          ? await login(f.email.trim(), f.password)
          : await register({ name: f.name.trim(), email: f.email.trim(), phone: f.phone.trim(), password: f.password, role });
      const home = user.role === 'WORKER' ? '/dashboard/worker' : '/dashboard/customer';
      navigate(from || home, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const isSignup = mode === 'signup';

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="font-head font-bold text-3xl text-navy">{isSignup ? 'Create your account' : 'Welcome back'}</h1>
        <p className="text-ink/60 mt-1">{isSignup ? 'Join as a customer or a worker.' : 'Log in to manage your jobs or bookings.'}</p>
      </div>

      {isSignup && (
        <div className="grid grid-cols-2 gap-2 mb-6 bg-concrete-200 p-1 rounded-lg">
          {[
            { id: 'CUSTOMER', label: 'Customer', icon: User },
            { id: 'WORKER', label: 'Worker', icon: Briefcase },
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRole(r.id)}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-semibold transition-colors ${role === r.id ? 'bg-white text-navy shadow-sm' : 'text-ink/50'}`}
            >
              <r.icon size={15} /> {r.label}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-concrete-300 rounded-lg p-6 space-y-5">
        {error && <div role="alert" className="bg-rust/10 text-rust text-sm font-semibold rounded px-3.5 py-2.5">{error}</div>}

        {isSignup && (
          <>
            <Field label="Full name"><input name="name" required className={inputCls} placeholder="Your full name" /></Field>
            <Field label="Phone number"><input name="phone" required type="tel" className={inputCls} placeholder="+91 90000 00000" /></Field>
          </>
        )}
        <Field label="Email"><input name="email" required type="email" className={inputCls} placeholder="you@example.com" /></Field>
        <Field label="Password" hint={isSignup ? 'At least 8 characters.' : undefined}>
          <div className="relative">
            <input name="password" required minLength={isSignup ? 8 : undefined} type={showPw ? 'text' : 'password'} className={inputCls} placeholder="••••••••" />
            <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40" aria-label="Show password">
              {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </Field>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Please wait...' : isSignup ? `Sign up as ${role === 'WORKER' ? 'Worker' : 'Customer'}` : 'Login'}
        </Button>
      </form>

      <p className="text-center text-sm text-ink/60 mt-6">
        {isSignup ? 'Already have an account? ' : "Don't have an account? "}
        <button onClick={() => { setMode(isSignup ? 'login' : 'signup'); setError(''); }} className="text-steel font-semibold hover:text-amber-700">
          {isSignup ? 'Login' : 'Sign Up'}
        </button>
      </p>
      {!isSignup && <p className="text-center text-xs text-ink/40 mt-4">Demo: arun@example.com (customer) or raj@example.com (worker), password: password123</p>}
    </div>
  );
}
