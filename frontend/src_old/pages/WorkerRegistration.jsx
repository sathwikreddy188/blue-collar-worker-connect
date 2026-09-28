import { useState } from 'react';
import { Upload, CheckCircle2 } from 'lucide-react';
import { Field, inputCls } from '../components/Field';
import Button from '../components/Button';
import { categories } from '../data/categories';

export default function WorkerRegistration() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto">
          <CheckCircle2 size={32} />
        </div>
        <h1 className="font-head font-bold text-2xl text-navy mt-5">Your worker profile has been created!</h1>
        <p className="text-ink/60 mt-2">Customers in your area will now be able to find and contact you.</p>
        <Button as="link" to="/dashboard/worker" className="mt-7">Go to Worker Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <span className="tag-label">Workers</span>
      <h1 className="font-head font-bold text-3xl sm:text-4xl text-navy mt-2">Become a Worker</h1>
      <p className="text-ink/60 mt-2">Create your profile once — customers will find you by service and location.</p>

      <form onSubmit={handleSubmit} className="bg-white border border-concrete-300 rounded-lg p-6 sm:p-8 mt-8 space-y-6">
        <div className="grid sm:grid-cols-2 gap-6">
          <Field label="Full name">
            <input required className={inputCls} placeholder="Your full name" />
          </Field>
          <Field label="Phone number">
            <input required type="tel" className={inputCls} placeholder="+91 90000 00000" />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <Field label="Email">
            <input required type="email" className={inputCls} placeholder="you@example.com" />
          </Field>
          <Field label="Password">
            <input required type="password" className={inputCls} placeholder="Create a password" />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <Field label="Profession">
            <select required className={inputCls} defaultValue="">
              <option value="" disabled>Select your profession</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Experience (years)">
            <input required type="number" min="0" className={inputCls} placeholder="5" />
          </Field>
        </div>

        <Field label="Location">
          <input required className={inputCls} placeholder="Area, city" />
        </Field>

        <Field label="Services you offer" hint="Comma-separated, e.g. Wiring, Switchboard repair, Fan installation">
          <input className={inputCls} placeholder="Wiring, Switchboard repair, Fan installation" />
        </Field>

        <Field label="Skills" hint="Comma-separated">
          <input className={inputCls} placeholder="Wiring, Circuit repair, Panel installation" />
        </Field>

        <div className="grid sm:grid-cols-2 gap-6">
          <Field label="Expected starting price">
            <input required className={inputCls} placeholder="₹500" />
          </Field>
          <Field label="Availability">
            <select className={inputCls} defaultValue="Available">
              <option>Available</option>
              <option>Not available right now</option>
            </select>
          </Field>
        </div>

        <Field label="Profile photo">
          <div className="border-2 border-dashed border-concrete-300 rounded-lg py-8 flex flex-col items-center gap-2 text-ink/50 hover:border-steel cursor-pointer transition-colors">
            <Upload size={22} />
            <span className="text-sm">Click to upload a photo</span>
          </div>
        </Field>

        <Field label="Short introduction">
          <textarea rows={3} className={inputCls} placeholder="Tell customers about your experience and what makes your work reliable." />
        </Field>

        <Button type="submit" className="w-full sm:w-auto">Create Worker Profile</Button>
      </form>
    </div>
  );
}
