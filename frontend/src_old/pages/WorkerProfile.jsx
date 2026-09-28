import { useParams, Link } from 'react-router-dom';
import { MapPin, Briefcase, Phone, MessageCircle, CheckCircle2 } from 'lucide-react';
import StarRating from '../components/StarRating';
import ReviewCard from '../components/ReviewCard';
import Button from '../components/Button';
import { getWorkerById } from '../data/workers';

export default function WorkerProfile() {
  const { id } = useParams();
  const worker = getWorkerById(id);

  if (!worker) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="font-head font-bold text-2xl text-navy">Worker not found</h1>
        <p className="text-ink/60 mt-2">This profile may have been removed.</p>
        <Button as="link" to="/find-workers" className="mt-6">Back to Find Workers</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white border border-concrete-300 rounded-lg p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="w-24 h-24 rounded-full bg-navy text-white flex items-center justify-center font-head font-bold text-3xl shrink-0">
            {worker.avatar}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-head font-bold text-2xl sm:text-3xl text-navy">{worker.name}</h1>
              {worker.available ? (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">Available Today</span>
              ) : (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-concrete-300 text-ink/50">Currently Busy</span>
              )}
            </div>
            <p className="text-steel font-semibold mt-1">{worker.profession}</p>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-ink/60">
              <span className="inline-flex items-center gap-1"><MapPin size={14} /> {worker.location}</span>
              <span className="inline-flex items-center gap-1"><Briefcase size={14} /> {worker.experience}+ years experience</span>
              <StarRating rating={worker.rating} />
              <span>{worker.jobsDone} jobs done</span>
            </div>
            <div className="flex flex-wrap gap-3 mt-5">
              <Button variant="primary"><Briefcase size={15} /> Request Service</Button>
              <Button variant="dark"><MessageCircle size={15} /> Message</Button>
              <Button variant="outline"><Phone size={15} /> Call</Button>
            </div>
          </div>
          <div className="sm:text-right shrink-0">
            <p className="text-xs text-ink/50 uppercase tracking-wide">Starting from</p>
            <p className="font-head font-bold text-navy text-3xl">₹{worker.startingPrice}</p>
            <Button variant="primary" className="mt-3 w-full sm:w-auto">Book Service</Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white border border-concrete-300 rounded-lg p-6">
            <h2 className="font-head font-bold text-xl text-navy mb-3">About</h2>
            <p className="text-sm text-ink/70 leading-relaxed">{worker.about}</p>
          </section>

          <section className="bg-white border border-concrete-300 rounded-lg p-6">
            <h2 className="font-head font-bold text-xl text-navy mb-4">Services offered</h2>
            <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
              {worker.services.map((s) => (
                <li key={s} className="flex items-center gap-2 text-sm text-ink/80">
                  <CheckCircle2 size={15} className="text-steel shrink-0" /> {s}
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white border border-concrete-300 rounded-lg p-6">
            <h2 className="font-head font-bold text-xl text-navy mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {worker.skills.map((s) => (
                <span key={s} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-concrete-200 text-navy">{s}</span>
              ))}
            </div>
          </section>

          <section className="bg-white border border-concrete-300 rounded-lg p-6">
            <h2 className="font-head font-bold text-xl text-navy mb-4">Work photos</h2>
            <div className="grid grid-cols-3 gap-3">
              {worker.photos.map((p) => (
                <div key={p} className="aspect-square rounded bg-concrete-200 flex items-center justify-center text-ink/30 text-xs font-semibold">
                  Photo {p}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-head font-bold text-xl text-navy mb-4">Reviews ({worker.reviews.length})</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {worker.reviews.map((r, i) => <ReviewCard key={i} review={r} />)}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-concrete-300 rounded-lg p-6">
            <h3 className="font-head font-bold text-lg text-navy mb-4">Pricing</h3>
            <div className="flex items-baseline justify-between border-b border-concrete-300 pb-3 mb-3">
              <span className="text-sm text-ink/60">Starting price</span>
              <span className="font-head font-bold text-navy text-xl">₹{worker.startingPrice}</span>
            </div>
            <p className="text-xs text-ink/50">Final pricing depends on job size and materials. Get a quote after describing your job.</p>
          </div>
          <div className="bg-white border border-concrete-300 rounded-lg p-6">
            <h3 className="font-head font-bold text-lg text-navy mb-3">Availability</h3>
            <p className={`text-sm font-semibold ${worker.available ? 'text-green-700' : 'text-ink/50'}`}>
              {worker.available ? 'Available today' : 'Not available right now'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
