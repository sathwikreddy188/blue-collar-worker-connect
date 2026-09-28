import { Link } from 'react-router-dom';
import { MapPin, Briefcase } from 'lucide-react';
import StarRating from './StarRating';
import Button from './Button';

export default function WorkerCard({ worker }) {
  return (
    <div className="bg-white rounded-lg border border-concrete-300 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="p-5 flex gap-4">
        <div className="w-16 h-16 rounded-full bg-navy text-white flex items-center justify-center font-head font-bold text-xl shrink-0">
          {worker.avatar}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-head font-semibold text-lg text-navy truncate">{worker.name}</h3>
            {worker.available ? (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Available Today</span>
            ) : (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-concrete-300 text-ink/50">Busy</span>
            )}
          </div>
          <p className="text-sm text-steel font-semibold">{worker.profession}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-ink/60 flex-wrap">
            <span className="inline-flex items-center gap-1"><MapPin size={12} /> {worker.location}</span>
            <span className="inline-flex items-center gap-1"><Briefcase size={12} /> {worker.experience}+ yrs</span>
          </div>
        </div>
      </div>

      <div className="px-5 flex items-center justify-between">
        <StarRating rating={worker.rating} />
        <span className="text-xs text-ink/50">{worker.jobsDone} jobs done</span>
      </div>

      <div className="mt-auto flex items-center justify-between px-5 py-4 border-t border-concrete-300 bg-concrete-100">
        <div>
          <p className="text-[11px] text-ink/50 uppercase tracking-wide">Starting from</p>
          <p className="font-head font-bold text-navy text-lg leading-none">₹{worker.startingPrice}</p>
        </div>
        <div className="flex gap-2">
          <Button as="link" to={`/worker/${worker.id}`} variant="outline" className="!py-2 !px-3 text-sm">View Profile</Button>
          <Button as="link" to={`/worker/${worker.id}`} variant="primary" className="!py-2 !px-3 text-sm">Contact</Button>
        </div>
      </div>
    </div>
  );
}
