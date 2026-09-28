import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function ServiceCard({ category }) {
  const Icon = category.icon;
  return (
    <Link
      to={`/find-workers?category=${category.id}`}
      className="group card-edge bg-white rounded-r-lg p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
    >
      <div className="w-11 h-11 rounded bg-navy/5 flex items-center justify-center text-navy group-hover:bg-amber group-hover:text-navy-900 transition-colors">
        <Icon size={22} strokeWidth={2} />
      </div>
      <div>
        <h3 className="font-head text-lg font-semibold text-navy leading-tight">{category.name}</h3>
        <p className="text-sm text-ink/60 mt-0.5">{category.desc}</p>
      </div>
      <div className="flex items-center justify-between mt-1 pt-3 border-t border-concrete-300">
        <span className="text-xs text-ink/50">{category.workers} workers nearby</span>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-steel group-hover:text-amber-700">
          View <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  );
}
