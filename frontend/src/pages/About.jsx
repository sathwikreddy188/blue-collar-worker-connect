import { Users, Briefcase, Award, TrendingUp } from 'lucide-react';

const points = [
  { icon: Users, title: 'Customers find local skilled workers', text: 'Search by service and location to find vetted professionals nearby, with transparent pricing and ratings.' },
  { icon: Briefcase, title: 'Workers find new job opportunities', text: 'Skilled workers get discovered by customers actively looking for their trade, without relying on word of mouth alone.' },
  { icon: Award, title: 'Local professionals build their reputation', text: "Every completed job adds to a worker's public rating and review history, building trust over time." },
  { icon: TrendingUp, title: 'Customers compare services and reviews', text: 'Side-by-side ratings, pricing, and experience make it easy to choose the right person for the job.' },
];

export default function About() {
  return (
    <div>
      <section className="bg-navy text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <span className="tag-label text-amber">About us</span>
          <h1 className="font-head font-bold text-4xl sm:text-5xl mt-4">Connecting Skills With Opportunities</h1>
          <p className="text-white/70 max-w-2xl mx-auto mt-5 leading-relaxed">
            Blue Collar Worker Connect exists to close the gap between skilled local workers and the people who need their help — with trust, transparency, and speed at the center.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid sm:grid-cols-2 gap-6">
        {points.map((p) => (
          <div key={p.title} className="card-edge bg-white rounded-r-lg p-6">
            <div className="w-10 h-10 rounded bg-amber/15 text-amber-700 flex items-center justify-center mb-4">
              <p.icon size={19} />
            </div>
            <h3 className="font-head font-semibold text-lg text-navy">{p.title}</h3>
            <p className="text-sm text-ink/60 mt-2 leading-relaxed">{p.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
