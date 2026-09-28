import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import WorkerCard from '../components/WorkerCard';
import { api, categorySlug } from '../api';
import { categories } from '../data/categories';

const labelCls = 'text-xs font-semibold uppercase tracking-wide text-ink/50';
const selectCls = 'mt-2 w-full border border-concrete-300 rounded px-3 py-2 text-sm bg-white focus-ring';

export default function FindWorkers() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [availability, setAvailability] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(2000);
  const [experience, setExperience] = useState(0);
  const [sort, setSort] = useState('rating');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    const timer = setTimeout(() => {
      api
        .workers({
          service: category !== 'all' ? categorySlug(category) : q,
          location: location.trim(),
          availability: availability === 'available' ? 'true' : '',
          min_rating: minRating > 0 ? minRating : '',
          maximum_price: maxPrice < 2000 ? maxPrice : '',
          min_experience: experience > 0 ? experience : '',
        })
        .then((list) => { if (!cancelled) setWorkers(list); })
        .catch((e) => { if (!cancelled) setError(e.message); })
        .finally(() => { if (!cancelled) setLoading(false); });
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [category, location, availability, minRating, maxPrice, experience, q]);

  const sorted = [...workers].sort((a, b) => {
    if (sort === 'price') return a.startingPrice - b.startingPrice;
    if (sort === 'experience') return b.experience - a.experience;
    return b.rating - a.rating;
  });

  const FilterPanel = (
    <div className="space-y-6">
      <div>
        <label className={labelCls}>Service category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className={labelCls}>Location</label>
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Hyderabad" className={selectCls} />
      </div>
      <div>
        <label className={labelCls}>Availability</label>
        <div className="flex gap-2 mt-2">
          {['all', 'available'].map((v) => (
            <button
              key={v}
              onClick={() => setAvailability(v)}
              className={`flex-1 text-sm py-2 rounded border font-medium transition-colors ${availability === v ? 'bg-navy text-white border-navy' : 'border-concrete-300 text-ink/70'}`}
            >
              {v === 'all' ? 'Any' : 'Available now'}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className={labelCls}>Minimum rating: {minRating > 0 ? `${minRating.toFixed(1)}+` : 'Any'}</label>
        <input type="range" min="0" max="5" step="0.5" value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className="w-full mt-2 accent-amber" />
      </div>
      <div>
        <label className={labelCls}>Max price per hour: {maxPrice >= 2000 ? 'Any' : `₹${maxPrice}`}</label>
        <input type="range" min="200" max="2000" step="100" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full mt-2 accent-amber" />
      </div>
      <div>
        <label className={labelCls}>Experience</label>
        <select value={experience} onChange={(e) => setExperience(Number(e.target.value))} className={selectCls}>
          <option value={0}>Any experience</option>
          <option value={1}>1+ years</option>
          <option value={5}>5+ years</option>
          <option value={10}>10+ years</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <span className="tag-label">{loading ? 'Searching...' : `${sorted.length} workers found`}</span>
      <h1 className="font-head font-bold text-3xl sm:text-4xl text-navy mt-2">Find a Skilled Worker</h1>

      <div className="flex items-center justify-between mt-6 lg:hidden">
        <button onClick={() => setFiltersOpen(true)} className="inline-flex items-center gap-2 border border-concrete-300 rounded px-4 py-2 text-sm font-semibold">
          <SlidersHorizontal size={15} /> Filters
        </button>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="border border-concrete-300 rounded px-3 py-2 text-sm bg-white">
          <option value="rating">Sort: Rating</option>
          <option value="price">Sort: Price</option>
          <option value="experience">Sort: Experience</option>
        </select>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-8 mt-6">
        <aside className="hidden lg:block bg-white border border-concrete-300 rounded-lg p-5 h-fit sticky top-20">{FilterPanel}</aside>

        {filtersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white p-5 overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-head font-bold text-lg text-navy">Filters</h3>
                <button onClick={() => setFiltersOpen(false)} className="p-1"><X size={20} /></button>
              </div>
              {FilterPanel}
            </div>
          </div>
        )}

        <div>
          <div className="hidden lg:flex items-center justify-end mb-4">
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="border border-concrete-300 rounded px-3 py-2 text-sm bg-white focus-ring">
              <option value="rating">Sort: Rating</option>
              <option value="price">Sort: Price</option>
              <option value="experience">Sort: Experience</option>
            </select>
          </div>

          {error ? (
            <div role="alert" className="bg-rust/10 text-rust rounded-lg p-6 text-sm font-semibold">{error}</div>
          ) : !loading && sorted.length === 0 ? (
            <div className="bg-white border border-concrete-300 rounded-lg p-10 text-center">
              <p className="font-head font-semibold text-lg text-navy">No workers match these filters</p>
              <p className="text-sm text-ink/60 mt-1">Try widening your price range or removing the category filter.</p>
            </div>
          ) : (
            <div className={`grid md:grid-cols-2 gap-6 transition-opacity ${loading ? 'opacity-50' : ''}`}>
              {sorted.map((w) => <WorkerCard key={w.id} worker={w} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
