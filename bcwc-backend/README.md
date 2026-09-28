# Blue Collar Worker Connect — Backend API

FastAPI + SQLAlchemy 2.0 + Pydantic v2 + JWT auth. Serves the React frontend in `bcwc` (the Vite project).

## Quick start (Windows PowerShell)

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
python seed.py --reset
uvicorn app.main:app --reload --port 8000
```

Then open http://localhost:8000/docs (Swagger) or http://localhost:8000/redoc.

Seed accounts (password `password123`): customer `arun@example.com`; workers `raj@`, `suresh@`, `ravi@`, `mahesh@example.com`.

Run tests: `python -m pytest tests -q` (37 tests).

## Configuration (`.env`)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | `sqlite:///./app.db` (default) or `postgresql://user:pass@localhost:5432/bcwc` |
| `JWT_SECRET_KEY` | Long random string. **Change before deploying.** |
| `JWT_ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime (default 1440) |
| `FRONTEND_URL` | Allowed CORS origin (default `http://localhost:5173`) |

## Database & migrations

Tables are auto-created on startup for local convenience. For real deployments use Alembic:

```powershell
alembic upgrade head                            # apply migrations
alembic revision --autogenerate -m "message"    # after changing models
```

Note: the initial migration was generated and applied against SQLite. If you switch to PostgreSQL,
delete `alembic/versions/*.py` and regenerate it against your Postgres database
(`alembic revision --autogenerate -m "initial schema"`).

## Project layout

```
app/
  main.py            App setup, CORS, error handlers, router registration
  core/              config.py (env settings), security.py (bcrypt + JWT), dependencies.py (auth + role guards)
  database/          engine/session (database.py), declarative Base (base.py)
  models/            SQLAlchemy tables
  schemas/           Pydantic request/response models + validation
  routers/           HTTP endpoints, one file per resource
  services/          Shared business logic (ratings, earnings, notifications)
alembic/             Migrations
tests/               pytest suite
seed.py              Sample data
```

How a request flows: **router** (auth + role check via `dependencies.py`) → **schema** validates input →
router/service logic touches **models** via the SQLAlchemy session → response serialized through a **schema**
(so `password_hash` can never leak).

## Key concepts

- **`worker_id` everywhere means the worker's `User.id`** (not `worker_profiles.id`). `GET /api/workers/{id}` uses it too.
- **Workflow:** customer posts job → workers apply (job stays `OPEN` so many can apply) → customer sets an
  application to `ACCEPTED` → job becomes `ACCEPTED`, other pending applications are auto-`REJECTED`, and a
  `PENDING` booking is created → either party updates booking status → `COMPLETED` also completes the job →
  customer can review (one review per job, only after completion).
- **Ratings** are computed from reviews on the fly (no cached column to go stale).
- **Errors** always look like `{"success": false, "message": "..."}` (422s add an `errors` list).

## Endpoints

Auth: `POST /api/auth/register|login|logout`, `GET /api/auth/me`
Users: `GET|PUT /api/users/me`
Services: `GET|POST /api/services`
Workers: `POST|GET|PUT /api/workers/profile`, `PUT /api/workers/availability`, `GET /api/workers` (filters:
`service, location, min_experience, min_rating, availability, minimum_price, maximum_price`),
`GET /api/workers/{id}`, `GET /api/workers/{id}/services`, `POST /api/workers/services`,
`DELETE /api/workers/services/{worker_service_id}`
Jobs: `POST|GET /api/jobs`, `GET /api/jobs/mine`, `GET|PUT|DELETE /api/jobs/{id}`
Applications: `POST /api/jobs/{id}/apply`, `GET /api/jobs/{id}/applications`, `GET /api/worker/applications`,
`PUT /api/applications/{id}`
Bookings: `POST|GET /api/bookings`, `GET /api/bookings/{id}`, `PUT /api/bookings/{id}/status`
Reviews: `POST /api/reviews`, `GET /api/workers/{id}/reviews`, `PUT|DELETE /api/reviews/{id}`
Messaging: `POST|GET /api/conversations`, `GET|POST /api/conversations/{id}/messages`
Notifications: `GET /api/notifications`, `PUT /api/notifications/{id}/read`, `PUT /api/notifications/read-all`
Saved workers: `POST|DELETE /api/saved-workers/{worker_id}`, `GET /api/saved-workers`
Dashboards: `GET /api/customer/dashboard`, `GET /api/worker/dashboard`

## Connecting the React frontend

1. Add `VITE_API_URL=http://localhost:8000` to the frontend's `.env`.
2. Log in with `POST /api/auth/login`, store `access_token` (e.g. localStorage).
3. Send `Authorization: Bearer <token>` on protected requests.
4. Replace the mock imports in `src/data/` with `fetch` calls. Field names differ slightly from the mock data
   (e.g. `hourly_rate` instead of `startingPrice`, `jobs_completed` instead of `jobsDone`), so map them in one
   place (an `api.js` helper) rather than throughout the pages.

## Known limitations / before production

- `POST /api/services` is open to any logged-in user — there is no ADMIN role yet. Restrict it before launch.
- `POST /api/auth/logout` is a no-op (JWTs are stateless). Add a token blacklist if you need server-side revocation.
- Messaging is REST-only (no WebSocket); `messages.py` is structured so a WebSocket layer can be added.
- Tested on SQLite. The models use no SQLite-specific features, but run the test suite against PostgreSQL
  before relying on it.
- Search filters run rating filtering in Python after the query; fine for thousands of workers, revisit for more.
- No rate limiting on login; add it (e.g. slowapi) before exposing publicly.
