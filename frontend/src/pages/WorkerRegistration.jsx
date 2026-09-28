import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Field, inputCls } from '../components/Field';
import Button from '../components/Button';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function WorkerRegistration() {
  const { user, register, logout } = useAuth();
  const [services, setServices] = useState([]);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { api.services().then(setServices).catch((e) => setError(e.message)); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const f = Object.fromEntries(new FormData(e.target));
    try {
      if (!user) {
        await register({ name: f.name.trim(), email: f.email.trim(), phone: f.phone.trim(), password: f.password, role: 'WORKER' });
      }
      const service = services.find((s) => String(s.id) === f.profession);
      const rate = parseFloat(String(f.price).replace(/[^0-9.]/g, '')) || 0;
      await api.createWorkerProfile({
        profession: service.name,
        bio: f.intro || null,
        experience_years: Number(f.experience) || 0,
        location: f.location,
        hourly_rate: rate,
      });
      await api.addMyService({ service_id: service.id, price: rate });
      if (f.availability !== 'Available') await api.setAvailability(false);
      setDone(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto"><CheckCircle2 size={32} /></div>
        <h1 className="font-head font-bold text-2xl text-navy mt-5">Your worker profile has been created!</h1>
        <p className="text-ink/60 mt-2">Customers in your area can now find and contact you.</p>
        <Button as="link" to="/dashboard/worker" className="mt-7">Go to Worker Dashboard</Button>
      </div>
    );
  }

  if (user && user.role !== 'WORKER') {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <h1 className="font-head font-bold text-2xl text-navy">You're logged in as a customer</h1>
        <p className="text-ink/60 mt-2">Log out first to register a separate worker account.</p>
        <Button onClick={logout} className="mt-6">Log out</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <span className="tag-label">Workers</span>
      <h1 className="font-head font-bold text-3xl sm:text-4xl text-navy mt-2">Become a Worker</h1>
      <p className="text-ink/60 mt-2">
        {user ? `Complete your profile, ${user.name.split(' ')[0]} — customers will find you by service and location.` : 'Create your account and profile in one step.'}
      </p>

      <form onSubmit={handleSubmit} className="bg-white border border-concrete-300 rounded-lg p-6 sm:p-8 mt-8 space-y-6">
        {error && <div role="alert" className="bg-rust/10 text-rust text-sm font-semibold rounded px-3.5 py-2.5">{error}</div>}

        {!user && (
          <>
            <div className="grid sm:grid-cols-2 gap-6">
              <Field label="Full name"><input name="name" required className={inputCls} placeholder="Your full name" /></Field>
              <Field label="Phone number"><input name="phone" required type="tel" className={inputCls} placeholder="+91 90000 00000" /></Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <Field label="Email"><input name="email" required type="email" className={inputCls} placeholder="you@example.com" /></Field>
              <Field label="Password" hint="At least 8 characters."><input name="password" required minLength={8} type="password" className={inputCls} placeholder="Create a password" /></Field>
            </div>
          </>
        )}

        <div className="grid sm:grid-cols-2 gap-6">
          <Field label="Profession">
            <select name="profession" required className={inputCls} defaultValue="">
              <option value="" disabled>Select your profession</option>
              {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="Experience (years)"><input name="experience" required type="number" min="0" className={inputCls} placeholder="5" /></Field>
        </div>

        <Field label="Location"><input name="location" required className={inputCls} placeholder="Area, city" /></Field>

        <div className="grid sm:grid-cols-2 gap-6">
          <Field label="Hourly rate (₹)"><input name="price" required type="number" min="0" className={inputCls} placeholder="500" /></Field>
          <Field label="Availability">
            <select name="availability" className={inputCls} defaultValue="Available">
              <option>Available</option><option>Not available right now</option>
            </select>
          </Field>
        </div>

        <Field label="Short introduction">
          <textarea name="intro" rows={3} className={inputCls} placeholder="Tell customers about your experience and what makes your work reliable." />
        </Field>

        <Button type="submit" disabled={loading} className="w-full sm:w-auto">{loading ? 'Creating...' : 'Create Worker Profile'}</Button>
      </form>
    </div>
  );
}
