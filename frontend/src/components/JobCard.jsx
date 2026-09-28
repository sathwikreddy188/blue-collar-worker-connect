import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

const statusStyles = {
  'Finding Worker': 'bg-amber/20 text-amber-700',
  'In Progress': 'bg-steel/15 text-steel-600',
  'Completed': 'bg-green-100 text-green-700',
  'Cancelled': 'bg-concrete-300 text-ink/60',
};

export default function JobCard({ job }) {
  return (
    <Link to={`/job/${job.id}`} className="block card-edge bg-white rounded-r-lg p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-head font-semibold text-lg text-navy leading-tight">{job.title}</h3>
          <p className="text-sm text-steel font-semibold mt-0.5">{job.category}</p>
        </div>
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusStyles[job.status] || 'bg-concrete-300 text-ink/60'}`}>
          {job.status}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-ink/50 mt-3">
        <Clock size={12} /> Posted {job.postedAgo}
      </div>
    </Link>
  );
}
