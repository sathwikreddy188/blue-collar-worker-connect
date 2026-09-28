# Blue Collar Worker Connect — Frontend

A React + Vite frontend for a local skilled-worker marketplace, built with mock data (no backend yet).

## Stack
- React 19 + Vite
- React Router (client-side routing across all pages)
- Tailwind CSS (custom theme — see `tailwind.config.js`)
- lucide-react (icons)

## Run it

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually http://localhost:5173).

To build for production:
```bash
npm run build
npm run preview
```

## Structure

```
src/
├── components/   # Navbar, Footer, WorkerCard, ServiceCard, JobCard, ReviewCard, SearchBar, Button, StarRating, Field
├── pages/        # One file per route (Home, FindWorkers, WorkerProfile, PostJob, WorkerRegistration,
│                 #   Login, CustomerDashboard, WorkerDashboard, JobDetails, Messages, Notifications,
│                 #   About, Contact, Legal, NotFound)
├── data/         # Mock data: categories, workers, jobs, reviews, messages, notifications
├── App.jsx       # Route definitions
└── main.jsx      # Entry point
```

## Pages included
Landing page, service categories, Find Workers (with filters: category, availability, rating, price),
Worker Profile, Post a Job (with success state), Become a Worker registration, Login (customer/worker toggle),
Customer Dashboard, Worker Dashboard (with availability toggle), Job Details, Messages (chat UI),
Notifications, About, Contact, Privacy Policy, Terms.

## Swapping in a real backend later
All data currently comes from plain JS objects in `src/data/`. To connect a backend (e.g. your existing
Mana-Pani Node/Express/Prisma API), replace the imports in each page with API calls (fetch/axios) to endpoints
like `GET /api/workers`, `POST /api/jobs`, etc. The component props and shapes were kept close to what a
typical REST response would look like to make that swap straightforward.

## Notes
- Forms currently just show a success state on submit rather than calling an API.
- Login is a role picker (customer/worker) for demo purposes — no real auth yet.
- Mock data lives entirely client-side; refreshing the page resets any in-session state (e.g. toggled notifications).
