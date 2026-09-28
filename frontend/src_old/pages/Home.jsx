import { Link } from 'react-router-dom';
import { ShieldCheck, Clock, Wallet, ArrowRight } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import ServiceCard from '../components/ServiceCard';
import WorkerCard from '../components/WorkerCard';
import ReviewCard from '../components/ReviewCard';
import Button from '../components/Button';
import { categories } from '../data/categories';
import { workers } from '../data/workers';
import { featuredReviews } from '../data/reviews';

const trustPoints = [
  { icon: ShieldCheck, title: 'Verified workers', text: 'Every profile is checked before it goes live on the platform.' },
  { icon: Clock, title: 'Fast response', text: 'Most requests get a reply from a nearby worker within the hour.' },
  { icon: Wallet, title: 'Fair, upfront pricing', text: 'See starting prices before you contact anyone — no surprises.' },
];

export default function Home() {
  const featured = workers.slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-navy text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #F2A71B 0, #F2A71B 2px, transparent 2px, transparent 18px)' }}
          aria-hidden="true"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28 grid lg:grid-cols-5 gap-12 items-center">
          <div className="lg:col-span-3">
            <span className="tag-label text-amber">Trusted local help</span>
            <h1 className="font-head font-bold text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.05] mt-4">
              Find Trusted Local Workers Near You
            </h1>
            <p className="mt-5 text-white/70 text-lg max-w-xl leading-relaxed">
              Connect with skilled electricians, plumbers, carpenters, painters, mechanics, cleaners and other local professionals — vetted, rated, and ready to work.
            </p>
            <div className="flex flex-wrap gap-3 mt-7">
              <Button as="link" to="/find-workers" variant="primary">Find a Worker</Button>
              <Button as="link" to="/post-job" variant="outline" className="!border-white !text-white hover:!bg-white hover:!text-navy">Post a Job</Button>
            </div>
            <div className="mt-9">
              <SearchBar dark />
            </div>
          </div>

          <div className="lg:col-span-2 hidden lg:block">
            <div className="relative aspect-square max-w-sm mx-auto">
              <div className="absolute inset-0 rounded-lg bg-white/5 border border-white/10 rotate-3" />
              <div className="absolute inset-0 rounded-lg bg-navy-700 border border-white/10 -rotate-2 flex flex-col justify-end p-6">
                <p className="font-head text-5xl font-bold text-amber">4,600+</p>
                <p className="text-white/70 text-sm mt-1">skilled workers registered across Hyderabad</p>
                <div className="grid grid-cols-3 gap-2 mt-6">
                  {['RK', 'SK', 'LD', 'MK', 'AK', 'RS'].map((i) => (
                    <div key={i} className="aspect-square rounded bg-white/10 border border-white/10 flex items-center justify-center font-head font-semibold text-sm text-white/80">
                      {i}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-concrete-300 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid sm:grid-cols-3 gap-6">
          {trustPoints.map((t) => (
            <div key={t.title} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded bg-amber/15 text-amber-700 flex items-center justify-center shrink-0">
                <t.icon size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-navy text-sm">{t.title}</h3>
                <p className="text-sm text-ink/60 mt-0.5">{t.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
          <div>
            <span className="tag-label">Services</span>
            <h2 className="font-head font-bold text-3xl text-navy mt-2">What service do you need?</h2>
          </div>
          <Link to="/find-workers" className="text-steel font-semibold text-sm inline-flex items-center gap-1 hover:text-amber-700">
            Browse all workers <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((c) => (
            <ServiceCard key={c.id} category={c} />
          ))}
        </div>
      </section>

      {/* Featured workers */}
      <section className="bg-concrete-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="tag-label">Top rated</span>
          <h2 className="font-head font-bold text-3xl text-navy mt-2 mb-8">Workers near Hyderabad</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((w) => (
              <WorkerCard key={w.id} worker={w} />
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <span className="tag-label">Customer stories</span>
        <h2 className="font-head font-bold text-3xl text-navy mt-2 mb-8">What customers are saying</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredReviews.map((r, i) => (
            <ReviewCard key={i} review={r} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-head font-bold text-2xl sm:text-3xl">Have a skill? Start earning from local jobs.</h2>
            <p className="text-white/60 mt-1">Registration takes less than five minutes.</p>
          </div>
          <Button as="link" to="/become-a-worker" variant="primary">Become a Worker</Button>
        </div>
      </section>
    </div>
  );
}
