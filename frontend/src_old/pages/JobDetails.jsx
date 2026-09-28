import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, Wallet } from 'lucide-react';
import Button from '../components/Button';
import { jobs } from '../data/jobs';

const statusStyles = {
  'Finding Worker': 'bg-amber/20 text-amber-700',
  'In Progress': 'bg-steel/15 text-steel-600',
  'Completed': 'bg-green-100 text-green-700',
};

export default function JobDetails() {
  const { id } = useParams();
  const job = jobs.find((j) => j.id === id);

  if (!job) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="font-head font-bold text-2xl text-navy">Job not found</h1>
        <Button as="link" to="/find-workers" className="mt-6">Back to Find Workers</Button>
      </div>
    );
  }

  const details = [
    { icon: MapPin, label: 'Location', value: job.location },
    { icon: Wallet, label: 'Budget', value: job.budget },
    { icon: Calendar, label: 'Preferred date', value: job.date },
    { icon: Clock, label: 'Preferred time', value: job.time },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white border border-concrete-300 rounded-lg p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <span className="text-sm font-semibold text-steel">{job.category}</span>
            <h1 className="font-head font-bold text-2xl sm:text-3xl text-navy mt-1">{job.title}</h1>
            <p className="text-sm text-ink/50 mt-1">Posted by Priya M. · {job.postedAgo}</p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap ${statusStyles[job.status]}`}>
            {job.status}
          </span>
        </div>

        <p className="text-sm text-ink/70 leading-relaxed mt-5">{job.description}</p>

        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          {details.map((d) => (
            <div key={d.label} className="flex items-center gap-3 bg-concrete-100 rounded-lg p-3.5">
              <d.icon size={17} className="text-amber-700 shrink-0" />
              <div>
                <p className="text-xs text-ink/50">{d.label}</p>
                <p className="text-sm font-semibold text-navy">{d.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mt-7 pt-6 border-t border-concrete-300">
          <Button variant="primary">Accept Job</Button>
          <Button variant="outline">Reject Job</Button>
          <Button variant="dark">View Applicants ({job.applicants})</Button>
        </div>
      </div>
    </div>
  );
}
