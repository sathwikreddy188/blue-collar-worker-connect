import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, Wallet, Star } from 'lucide-react';
import Button from '../components/Button';
import { Field, inputCls } from '../components/Field';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const statusStyles = {
  'Finding Worker': 'bg-amber/20 text-amber-700',
  'In Progress': 'bg-steel/15 text-steel-600',
  'Completed': 'bg-green-100 text-green-700',
  'Cancelled': 'bg-concrete-300 text-ink/60',
};

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [myApplication, setMyApplication] = useState(null);
  const [booking, setBooking] = useState(null);
  const [myReview, setMyReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [rating, setRating] = useState(5);

  const isOwner = user && job && user.id === job.customerId;
  const isWorker = user?.role === 'WORKER';

  const load = useCallback(async () => {
    try {
      const j = await api.job(id);
      setJob(j);
      if (user) {
        const owner = user.id === j.customerId;
        if (owner) setApplications(await api.jobApplications(id));
        if (user.role === 'WORKER') {
          const mine = (await api.myApplications()).find((a) => String(a.job_id) === String(id));
          setMyApplication(mine || null);
        }
        const b = (await api.bookings()).filter((x) => String(x.job_id) === String(id) && x.status !== 'CANCELLED')[0] || null;
        setBooking(b);
        if (owner && b?.status === 'COMPLETED') {
          const reviews = await api.workerReviews(b.worker_id);
          setMyReview(reviews.find((r) => String(r.jobId) === String(id) && r.customerId === user.id) || null);
        }
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => { load(); }, [load]);

  async function run(action, successMsg) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await action();
      if (successMsg) setNotice(successMsg);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  function handleApply(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    run(() => api.apply(id, { message: f.message || null, proposed_price: f.price ? Number(f.price) : null }), 'Application sent!');
  }

  function handleReview(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    run(() => api.createReview({ worker_id: booking.worker_id, job_id: job.id, rating, comment: f.comment || null }), 'Thanks for your review!');
  }

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-24 text-center text-ink/50">Loading job...</div>;

  if (!job) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="font-head font-bold text-2xl text-navy">Job not found</h1>
        <p className="text-ink/60 mt-2">{error}</p>
        <Button as="link" to="/find-workers" className="mt-6">Back to Find Workers</Button>
      </div>
    );
  }

  const details = [
    { icon: MapPin, label: 'Location', value: job.location },
    { icon: Wallet, label: 'Budget', value: job.budget },
    { icon: Calendar, label: 'Preferred date', value: job.date || 'Flexible' },
    { icon: Clock, label: 'Preferred time', value: job.time || 'Flexible' },
  ];

  const isBookingWorker = booking && user?.id === booking.worker_id;
  const isBookingCustomer = booking && user?.id === booking.customer_id;
  const nextStep = { PENDING: ['CONFIRMED', 'Confirm booking'], CONFIRMED: ['IN_PROGRESS', 'Start work'], IN_PROGRESS: ['COMPLETED', 'Mark completed'] }[booking?.status];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {error && <div role="alert" className="bg-rust/10 text-rust text-sm font-semibold rounded px-3.5 py-2.5">{error}</div>}
      {notice && <div role="status" className="bg-green-100 text-green-700 text-sm font-semibold rounded px-3.5 py-2.5">{notice}</div>}

      <div className="bg-white border border-concrete-300 rounded-lg p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <span className="text-sm font-semibold text-steel">{job.category}</span>
            <h1 className="font-head font-bold text-2xl sm:text-3xl text-navy mt-1">{job.title}</h1>
            <p className="text-sm text-ink/50 mt-1">Posted by {job.customerName} · {job.postedAgo}</p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap ${statusStyles[job.status] || 'bg-concrete-300 text-ink/60'}`}>{job.status}</span>
        </div>

        <p className="text-sm text-ink/70 leading-relaxed mt-5">{job.description}</p>

        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          {details.map((d) => (
            <div key={d.label} className="flex items-center gap-3 bg-concrete-100 rounded-lg p-3.5">
              <d.icon size={17} className="text-amber-700 shrink-0" />
              <div><p className="text-xs text-ink/50">{d.label}</p><p className="text-sm font-semibold text-navy">{d.value}</p></div>
            </div>
          ))}
        </div>
      </div>

      {/* Worker: apply */}
      {isWorker && job.rawStatus === 'OPEN' && !myApplication && (
        <form onSubmit={handleApply} className="bg-white border border-concrete-300 rounded-lg p-6 space-y-4">
          <h2 className="font-head font-bold text-xl text-navy">Apply for this job</h2>
          <Field label="Your price (₹)"><input name="price" type="number" min="0" className={inputCls} placeholder="e.g. 1500" /></Field>
          <Field label="Message to customer"><textarea name="message" rows={3} className={inputCls} placeholder="Tell the customer why you're a good fit." /></Field>
          <Button type="submit" disabled={busy}>{busy ? 'Sending...' : 'Send application'}</Button>
        </form>
      )}
      {isWorker && myApplication && (
        <div className="bg-white border border-concrete-300 rounded-lg p-6 text-sm">
          <span className="font-semibold text-navy">Your application: </span>
          <span className="font-semibold text-steel">{myApplication.status}</span>
          {myApplication.proposed_price != null && <span className="text-ink/60"> · ₹{Number(myApplication.proposed_price).toLocaleString('en-IN')}</span>}
        </div>
      )}
      {!user && (
        <div className="bg-white border border-concrete-300 rounded-lg p-6 text-sm text-ink/70">
          <Link to="/login" state={{ from: `/job/${id}` }} className="font-semibold text-steel hover:text-amber-700">Log in as a worker</Link> to apply for this job.
        </div>
      )}

      {/* Customer owner: applicants */}
      {isOwner && (
        <div className="bg-white border border-concrete-300 rounded-lg p-6">
          <h2 className="font-head font-bold text-xl text-navy mb-4">Applicants ({applications.length})</h2>
          {applications.length === 0 ? (
            <p className="text-sm text-ink/50">No one has applied yet.</p>
          ) : (
            <ul className="divide-y divide-concrete-200">
              {applications.map((a) => (
                <li key={a.id} className="py-4 flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <Link to={`/worker/${a.worker_id}`} className="font-semibold text-navy hover:text-amber-700">{a.worker.name}</Link>
                    <p className="text-sm text-ink/60">
                      {a.proposed_price != null ? `₹${Number(a.proposed_price).toLocaleString('en-IN')} · ` : ''}{a.status}
                    </p>
                    {a.message && <p className="text-sm text-ink/70 mt-1">{a.message}</p>}
                  </div>
                  {a.status === 'PENDING' && job.rawStatus === 'OPEN' && (
                    <div className="flex gap-2">
                      <Button variant="outline" disabled={busy} className="!py-2 !px-3 text-sm" onClick={() => run(() => api.setApplicationStatus(a.id, 'REJECTED'))}>Reject</Button>
                      <Button disabled={busy} className="!py-2 !px-3 text-sm" onClick={() => run(() => api.setApplicationStatus(a.id, 'ACCEPTED'), 'Worker accepted — a booking was created.')}>Accept</Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Booking */}
      {booking && (isBookingWorker || isBookingCustomer) && (
        <div className="bg-white border border-concrete-300 rounded-lg p-6">
          <h2 className="font-head font-bold text-xl text-navy">Booking</h2>
          <p className="text-sm text-ink/60 mt-1">Status: <span className="font-semibold text-steel">{booking.status.replace('_', ' ')}</span> · Price ₹{Number(booking.price).toLocaleString('en-IN')}</p>
          <div className="flex gap-3 flex-wrap mt-4">
            {nextStep && (isBookingWorker || nextStep[0] === 'COMPLETED') && (
              <Button disabled={busy} onClick={() => run(() => api.setBookingStatus(booking.id, nextStep[0]))}>{nextStep[1]}</Button>
            )}
            {['PENDING', 'CONFIRMED'].includes(booking.status) && (
              <Button variant="outline" disabled={busy} onClick={() => run(() => api.setBookingStatus(booking.id, 'CANCELLED'))}>Cancel booking</Button>
            )}
          </div>
        </div>
      )}

      {/* Review */}
      {isOwner && booking?.status === 'COMPLETED' && (
        myReview ? (
          <div className="bg-white border border-concrete-300 rounded-lg p-6 text-sm text-ink/70">You reviewed this worker: {myReview.rating}/5{myReview.text ? ` — "${myReview.text}"` : ''}</div>
        ) : (
          <form onSubmit={handleReview} className="bg-white border border-concrete-300 rounded-lg p-6 space-y-4">
            <h2 className="font-head font-bold text-xl text-navy">Leave a review</h2>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`}>
                  <Star size={28} className={n <= rating ? 'fill-amber text-amber' : 'text-concrete-300'} />
                </button>
              ))}
            </div>
            <Field label="Your review"><textarea name="comment" rows={3} className={inputCls} placeholder="How was the work?" /></Field>
            <Button type="submit" disabled={busy}>Submit review</Button>
          </form>
        )
      )}
    </div>
  );
}
