import { useState } from 'react';
import { Upload, CheckCircle2 } from 'lucide-react';
import { Field, inputCls } from '../components/Field';
import Button from '../components/Button';
import { categories } from '../data/categories';

export default function PostJob() {
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
        <h1 className="font-head font-bold text-2xl text-navy mt-5">Your job has been posted successfully!</h1>
        <p className="text-ink/60 mt-2">Nearby workers will start sending quotes shortly. You'll get a notification for each response.</p>
        <div className="flex gap-3 justify-center mt-7">
          <Button variant="outline" onClick={() => setSubmitted(false)}>Post another job</Button>
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
        <Field label="Job title">
          <input required className={inputCls} placeholder="e.g. Need an electrician for home wiring" />
        </Field>

        <div className="grid sm:grid-cols-2 gap-6">
          <Field label="Service category">
            <select required className={inputCls} defaultValue="">
              <option value="" disabled>Select a service</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Location">
            <input required className={inputCls} placeholder="Hyderabad" />
          </Field>
        </div>

        <Field label="Description" hint="Be specific — mention size of job, materials needed, and any constraints.">
          <textarea required rows={4} className={inputCls} placeholder="Need an electrician for basic home wiring work." />
        </Field>

        <div className="grid sm:grid-cols-2 gap-6">
          <Field label="Preferred date">
            <input required type="date" className={inputCls} />
          </Field>
          <Field label="Preferred time">
            <select className={inputCls} defaultValue="Morning">
              <option>Morning</option>
              <option>Afternoon</option>
              <option>Evening</option>
              <option>Flexible</option>
            </select>
          </Field>
        </div>

        <Field label="Budget">
          <input required className={inputCls} placeholder="₹1,000 - ₹2,000" />
        </Field>

        <Field label="Upload images" hint="Optional — photos help workers quote accurately.">
          <div className="border-2 border-dashed border-concrete-300 rounded-lg py-8 flex flex-col items-center gap-2 text-ink/50 hover:border-steel cursor-pointer transition-colors">
            <Upload size={22} />
            <span className="text-sm">Click to upload or drag and drop</span>
          </div>
        </Field>

        <div className="grid sm:grid-cols-2 gap-6">
          <Field label="Contact number">
            <input required type="tel" className={inputCls} placeholder="+91 90000 00000" />
          </Field>
          <Field label="Contact email">
            <input type="email" className={inputCls} placeholder="you@example.com" />
          </Field>
        </div>

        <Button type="submit" className="w-full sm:w-auto">Post Job</Button>
      </form>
    </div>
  );
}
