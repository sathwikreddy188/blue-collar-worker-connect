import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, MessageCircle, CheckCircle2, Heart } from 'lucide-react';
import StarRating from '../components/StarRating';
import ReviewCard from '../components/ReviewCard';
import Button from '../components/Button';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function WorkerProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([api.worker(id), api.workerReviews(id)])
      .then(([w, r]) => { setWorker(w); setReviews(r); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user?.role === 'CUSTOMER') {
      api.savedWorkers().then((list) => setSaved(list.some((w) => String(w.id) === String(id)))).catch(() => {});
    }
  }, [user, id]);

  function requireLogin() {
    if (!user) {
      navigate('/login', { state: { from: `/worker/${id}` } });
      return false;
    }
    return true;
  }

  async function handleMessage() {
    if (!requireLogin()) return;
    setActionError('');
    try {
      const convo = await api.startConversation(worker.id);
      navigate(`/messages?c=${convo.id}`);
    } catch (e) { setActionError(e.message); }
  }

  function handleRequest() {
    if (!requireLogin()) return;
    if (user.role !== 'CUSTOMER') { setActionError('Only customer accounts can request a service.'); return; }
    navigate('/post-job');
  }

  async function toggleSave() {
    if (!requireLogin()) return;
    setActionError('');
    try {
      if (saved) await api.unsaveWorker(worker.id); else await api.saveWorker(worker.id);
      setSaved(!saved);
    } catch (e) { setActionError(e.message); }
  }

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-24 text-center text-ink/50">Loading profile...</div>;

  if (error || !worker) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="font-head font-bold text-2xl text-navy">Worker not found</h1>
        <p className="text-ink/60 mt-2">{error || 'This profile may have been removed.'}</p>
        <Button as="link" to="/find-workers" className="mt-6">Back to Find Workers</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white border border-concrete-300 rounded-lg p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="w-24 h-24 rounded-full bg-navy text-white flex items-center justify-center font-head font-bold text-3xl shrink-0">{worker.avatar}</div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-head font-bold text-2xl sm:text-3xl text-navy">{worker.name}</h1>
              {worker.available ? (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">Available Now</span>
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
              <Button variant="primary" onClick={handleRequest}><Briefcase size={15} /> Request Service</Button>
              <Button variant="dark" onClick={handleMessage}><MessageCircle size={15} /> Message</Button>
              {(!user || user.role === 'CUSTOMER') && (
                <Button variant="outline" onClick={toggleSave}>
                  <Heart size={15} className={saved ? 'fill-rust text-rust' : ''} /> {saved ? 'Saved' : 'Save'}
                </Button>
              )}
            </div>
            {actionError && <p role="alert" className="text-sm text-rust font-semibold mt-3">{actionError}</p>}
          </div>
          <div className="sm:text-right shrink-0">
            <p className="text-xs text-ink/50 uppercase tracking-wide">Starting from</p>
            <p className="font-head font-bold text-navy text-3xl">₹{worker.startingPrice}<span className="text-sm font-semibold text-ink/50">/hr</span></p>
            <Button variant="primary" className="mt-3 w-full sm:w-auto" onClick={handleRequest}>Book Service</Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 space-y-8">
          {worker.about && (
            <section className="bg-white border border-concrete-300 rounded-lg p-6">
              <h2 className="font-head font-bold text-xl text-navy mb-3">About</h2>
              <p className="text-sm text-ink/70 leading-relaxed">{worker.about}</p>
            </section>
          )}

          <section className="bg-white border border-concrete-300 rounded-lg p-6">
            <h2 className="font-head font-bold text-xl text-navy mb-4">Services offered</h2>
            {worker.services.length === 0 ? (
              <p className="text-sm text-ink/50">No services listed yet.</p>
            ) : (
              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
                {worker.services.map((s) => (
                  <li key={s} className="flex items-center gap-2 text-sm text-ink/80"><CheckCircle2 size={15} className="text-steel shrink-0" /> {s}</li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="font-head font-bold text-xl text-navy mb-4">Reviews ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <div className="bg-white border border-concrete-300 rounded-lg p-6 text-sm text-ink/50">No reviews yet.</div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">{reviews.map((r) => <ReviewCard key={r.id} review={r} />)}</div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-concrete-300 rounded-lg p-6">
            <h3 className="font-head font-bold text-lg text-navy mb-4">Pricing</h3>
            <div className="flex items-baseline justify-between border-b border-concrete-300 pb-3 mb-3">
              <span className="text-sm text-ink/60">Hourly rate</span>
              <span className="font-head font-bold text-navy text-xl">₹{worker.startingPrice}</span>
            </div>
            <p className="text-xs text-ink/50">Final pricing depends on job size and materials. Post a job to get quotes.</p>
          </div>
          <div className="bg-white border border-concrete-300 rounded-lg p-6">
            <h3 className="font-head font-bold text-lg text-navy mb-3">Availability</h3>
            <p className={`text-sm font-semibold ${worker.available ? 'text-green-700' : 'text-ink/50'}`}>{worker.available ? 'Available now' : 'Not available right now'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
