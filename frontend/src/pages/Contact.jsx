import { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { Field, inputCls } from '../components/Field';
import Button from '../components/Button';

const info = [
  { icon: Mail, label: 'Email', value: 'support@bcwconnect.in' },
  { icon: Phone, label: 'Phone', value: '+91 90000 12345' },
  { icon: MapPin, label: 'Location', value: 'Hyderabad, Telangana' },
];

export default function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <span className="tag-label">Get in touch</span>
      <h1 className="font-head font-bold text-3xl sm:text-4xl text-navy mt-2 mb-10">Contact Us</h1>

      <div className="grid lg:grid-cols-[1fr_1.3fr] gap-10">
        <div className="space-y-5">
          {info.map((i) => (
            <div key={i.label} className="flex items-center gap-4 bg-white border border-concrete-300 rounded-lg p-5">
              <div className="w-10 h-10 rounded bg-amber/15 text-amber-700 flex items-center justify-center shrink-0">
                <i.icon size={18} />
              </div>
              <div>
                <p className="text-xs text-ink/50">{i.label}</p>
                <p className="text-sm font-semibold text-navy">{i.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-concrete-300 rounded-lg p-6 sm:p-8">
          {sent ? (
            <div className="text-center py-10">
              <CheckCircle2 size={40} className="text-green-600 mx-auto" />
              <h3 className="font-head font-bold text-xl text-navy mt-4">Message sent!</h3>
              <p className="text-ink/60 mt-1">We'll get back to you within one business day.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Name"><input required className={inputCls} placeholder="Your name" /></Field>
                <Field label="Email"><input required type="email" className={inputCls} placeholder="you@example.com" /></Field>
              </div>
              <Field label="Phone"><input type="tel" className={inputCls} placeholder="+91 90000 00000" /></Field>
              <Field label="Message"><textarea required rows={5} className={inputCls} placeholder="How can we help?" /></Field>
              <Button type="submit" className="w-full sm:w-auto">Send Message</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
