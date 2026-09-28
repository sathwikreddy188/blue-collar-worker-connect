// Central API client. All backend calls go through here so pages stay simple.
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const TOKEN_KEY = 'bcwc_token';
const USER_KEY = 'bcwc_user';

export const session = {
  get token() { return localStorage.getItem(TOKEN_KEY); },
  get user() {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  },
  save(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && session.token) headers.Authorization = `Bearer ${session.token}`;

  let res;
  try {
    res = await fetch(BASE + path, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?');
  }
  if (res.status === 204) return null;

  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }

  if (!res.ok) {
    if (res.status === 401 && auth) {
      session.clear();
      window.dispatchEvent(new Event('bcwc-logout'));
    }
    let msg = data?.message || 'Something went wrong';
    if (data?.errors?.length) msg = data.errors.map((e) => String(e.msg).replace(/^Value error, /, '')).join('. ');
    throw new Error(msg);
  }
  return data;
}

// ---------- helpers ----------
export function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join('');
}

function parseUTC(iso) {
  if (!iso) return null;
  return new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(iso) ? iso : iso + 'Z');
}

export function timeAgo(iso) {
  const d = parseUTC(iso);
  if (!d) return '';
  const s = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hours ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)} days ago`;
  return d.toLocaleDateString('en-IN');
}

const inr = (n) => Number(n).toLocaleString('en-IN');

// Frontend category ids -> backend service slugs
const SLUG_FIX = { other: 'other-services' };
export const categorySlug = (id) => SLUG_FIX[id] || id;

// ---------- mappers (backend shape -> shape the UI components expect) ----------
export function mapWorker(w) {
  return {
    id: w.id,
    name: w.name,
    profession: w.profession,
    location: w.location,
    experience: w.experience_years,
    rating: w.rating,
    jobsDone: w.jobs_completed,
    startingPrice: Math.round(w.hourly_rate),
    available: w.availability,
    avatar: initials(w.name),
    about: w.bio || '',
    services: (w.services || []).map((s) => s.service.name),
    isVerified: w.is_verified,
  };
}

const STATUS_LABEL = {
  OPEN: 'Finding Worker',
  REQUESTED: 'Finding Worker',
  ACCEPTED: 'In Progress',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

let servicesCache = null;
export async function getServices() {
  if (!servicesCache) servicesCache = await request('/api/services', { auth: false });
  return servicesCache;
}

function mapJob(j, names) {
  return {
    id: j.id,
    title: j.title,
    category: names[j.service_id] || 'Other',
    serviceId: j.service_id,
    description: j.description,
    location: j.location,
    budget: `₹${inr(j.budget_min)} - ₹${inr(j.budget_max)}`,
    date: j.preferred_date,
    time: j.preferred_time,
    status: STATUS_LABEL[j.status] || j.status,
    rawStatus: j.status,
    postedAgo: timeAgo(j.created_at),
    applicants: j.applicant_count ?? 0,
    customerId: j.customer_id,
    customerName: j.customer?.name,
  };
}

async function mapJobs(list) {
  const services = await getServices();
  const names = Object.fromEntries(services.map((s) => [s.id, s.name]));
  return list.map((j) => mapJob(j, names));
}

// ---------- API ----------
export const api = {
  // auth
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  register: (payload) => request('/api/auth/register', { method: 'POST', body: payload, auth: false }),

  // services
  services: getServices,

  // workers
  workers: async (query = {}) => {
    const qs = new URLSearchParams(Object.entries(query).filter(([, v]) => v !== undefined && v !== '' && v !== null)).toString();
    const list = await request(`/api/workers${qs ? `?${qs}` : ''}`, { auth: false });
    return list.map(mapWorker);
  },
  worker: async (id) => mapWorker(await request(`/api/workers/${id}`, { auth: false })),
  workerReviews: async (id) => {
    const list = await request(`/api/workers/${id}/reviews`, { auth: false });
    return list.map((r) => ({
      id: r.id, jobId: r.job_id, customerId: r.customer_id,
      customer: r.customer?.name || 'Customer', rating: r.rating, text: r.comment || '',
    }));
  },
  createWorkerProfile: (payload) => request('/api/workers/profile', { method: 'POST', body: payload }),
  addMyService: (payload) => request('/api/workers/services', { method: 'POST', body: payload }),
  setAvailability: (available) => request('/api/workers/availability', { method: 'PUT', body: { available } }),

  // jobs
  postJob: (payload) => request('/api/jobs', { method: 'POST', body: payload }),
  openJobs: async () => mapJobs(await request('/api/jobs', { auth: false })),
  myJobs: async () => mapJobs(await request('/api/jobs/mine')),
  job: async (id) => (await mapJobs([await request(`/api/jobs/${id}`, { auth: false })]))[0],

  // applications
  apply: (jobId, payload) => request(`/api/jobs/${jobId}/apply`, { method: 'POST', body: payload }),
  jobApplications: (jobId) => request(`/api/jobs/${jobId}/applications`),
  myApplications: () => request('/api/worker/applications'),
  setApplicationStatus: (id, status) => request(`/api/applications/${id}`, { method: 'PUT', body: { status } }),

  // bookings & reviews
  bookings: () => request('/api/bookings'),
  setBookingStatus: (id, status) => request(`/api/bookings/${id}/status`, { method: 'PUT', body: { status } }),
  createReview: (payload) => request('/api/reviews', { method: 'POST', body: payload }),

  // dashboards
  customerDashboard: () => request('/api/customer/dashboard'),
  workerDashboard: () => request('/api/worker/dashboard'),

  // saved workers
  savedWorkers: async () => (await request('/api/saved-workers')).map((s) => mapWorker(s.worker)),
  saveWorker: (id) => request(`/api/saved-workers/${id}`, { method: 'POST' }),
  unsaveWorker: (id) => request(`/api/saved-workers/${id}`, { method: 'DELETE' }),

  // messaging
  startConversation: (otherUserId, jobId) => request('/api/conversations', { method: 'POST', body: { other_user_id: otherUserId, job_id: jobId ?? null } }),
  conversations: () => request('/api/conversations'),
  messages: (id) => request(`/api/conversations/${id}/messages`),
  sendMessage: (id, message) => request(`/api/conversations/${id}/messages`, { method: 'POST', body: { message } }),

  // notifications
  notifications: () => request('/api/notifications'),
  markNotificationRead: (id) => request(`/api/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request('/api/notifications/read-all', { method: 'PUT' }),
};
