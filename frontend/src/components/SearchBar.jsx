import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';

export default function SearchBar({ dark = false }) {
  const [service, setService] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  function handleSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (service) params.set('q', service);
    if (location) params.set('location', location);
    navigate(`/find-workers?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSearch}
      className={`w-full rounded-lg p-2 flex flex-col sm:flex-row gap-2 ${dark ? 'bg-white/10 backdrop-blur border border-white/20' : 'bg-white border border-concrete-300 shadow-sm'}`}
    >
      <div className="flex items-center gap-2 flex-1 px-3 py-2">
        <Search size={18} className={dark ? 'text-white/60' : 'text-ink/40'} />
        <input
          value={service}
          onChange={(e) => setService(e.target.value)}
          placeholder="Electrician, Plumber, Carpenter..."
          className={`w-full bg-transparent outline-none text-sm ${dark ? 'text-white placeholder:text-white/50' : 'text-ink placeholder:text-ink/40'}`}
        />
      </div>
      <div className={`hidden sm:block w-px my-1 ${dark ? 'bg-white/20' : 'bg-concrete-300'}`} />
      <div className="flex items-center gap-2 flex-1 px-3 py-2">
        <MapPin size={18} className={dark ? 'text-white/60' : 'text-ink/40'} />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter your location"
          className={`w-full bg-transparent outline-none text-sm ${dark ? 'text-white placeholder:text-white/50' : 'text-ink placeholder:text-ink/40'}`}
        />
      </div>
      <button
        type="submit"
        className="bg-amber hover:bg-amber-600 text-navy-900 font-head font-semibold px-6 py-2.5 rounded transition-colors focus-ring"
      >
        Search Workers
      </button>
    </form>
  );
}
