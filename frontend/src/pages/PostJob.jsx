import { useEffect, useState } from 'react';
import { Upload, CheckCircle2 } from 'lucide-react';
import { Field, inputCls } from '../components/Field';
import Button from '../components/Button';
import { api } from '../api';

export default function PostJob() {
  const [services, setServices] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [posted, setPosted] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { api.services().then(setServices).catch((e) => setError(e.message)); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const f = Object.fromEntries(new FormData(e.target));
    const min = Number(f.budget_min);
    const max = Number(f.budget_max);
    if (max < min) {
      setError('Maximum budget cannot be less than minimum budget.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    try {
      const job = await api.postJob({
        title: f.title,
        service_id: Number(f.service_id),
        description: f.description,
        location: f.location,
        budget_min: min,
        budget_max: max,
        preferred_date: f.preferred_date || null,
        preferred_time: f.preferred_time || null,
      });
      setPosted(job);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto"><CheckCircle2 size={32} /></div>
        <h1 className="font-head font-bold text-2xl text-navy mt-5">Your job has been posted successfully!</h1>
        <p className="text-ink/60 mt-2">Nearby workers can now apply. You'll get a notification for each application.</p>
        <div className="flex gap-3 justify-center mt-7 flex-wrap">
          <Button variant="outline" onClick={() => setSubmitted(false)}>Post another job</Button>
          <Button as="link" to={`/job/${posted.id}`} variant="dark">View this job</Button>
          <Button as="link" to="/dashboard/customer">Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <span className="tag-label">Customers</span>
      <h1 className="font-head font-bold text-3xl sm:text-4xl text-navy mt-2">Post a Job</h1>
      <p className="text-ink/60 mt-2">Describe what you need and nearby workers will reach out with quotes.</p>

      <form onSubmit={handleSubmit} className="bg-white border border-concrete-300 rounded-lg p-6 sm:p-8 mt-8 space-y-6">
        {error && <div role="alert" className="bg-rust/10 text-rust text-sm font-semibold rounded px-3.5 py-2.5">{error}</div>}

        <Field label="Job title"><input name="title" required className={inputCls} placeholder="e.g. Need an electrician for home wiring" /></Field>

        <div className="grid sm:grid-cols-2 gap-6">
          <Field label="Service category">
            <select name="service_id" required className={inputCls} defaultValue="">
              <option value="" disabled>Select a service</option>
              {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="Location"><input name="location" required className={inputCls} placeholder="Hyderabad" /></Field>
        </div>

        <Field label="Description" hint="Be specific — mention size of job, materials needed, and any constraints.">
          <textarea name="description" required rows={4} className={inputCls} placeholder="Need an electrician for basic home wiring work." />
        </Field>

        <div className="grid sm:grid-cols-2 gap-6">
          <Field label="Preferred date"><input name="preferred_date" type="date" className={inputCls} /></Field>
          <Field label="Preferred time">
            <select name="preferred_time" className={inputCls} defaultValue="Morning">
              <option>Morning</option><option>Afternoon</option><option>Evening</option><option>Flexible</option>
            </select>
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <Field label="Minimum budget (₹)"><input name="budget_min" required type="number" min="0" className={inputCls} placeholder="1000" /></Field>
          <Field label="Maximum budget (₹)"><input name="budget_max" required type="number" min="0" className={inputCls} placeholder="2000" /></Field>
        </div>

        <Field label="Upload images" hint="Image upload is coming soon.">
          <div className="border-2 border-dashed border-concrete-300 rounded-lg py-8 flex flex-col items-center gap-2 text-ink/40">
            <Upload size={22} /><span className="text-sm">Not available yet</span>
          </div>
        </Field>

        <p className="text-xs text-ink/50">Workers will contact you using the phone number and email on your account.</p>
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">{loading ? 'Posting...' : 'Post Job'}</Button>
      </form>
    </div>
  );
}
