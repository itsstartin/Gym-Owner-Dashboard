# Gym Admin App

A full-stack gym-management application for member records, payments, attendance, and owner reporting. The frontend is a React/Vite single-page app and the API is Django REST Framework.

> **Database:** PostgreSQL is the supported database. The Django settings use PostgreSQL by default and accept a `DATABASE_URL` override. SQLite is not a supported local or deployment target for this project.

## Features

- JWT sign-up and login with isolated gym-owner data
- Owner, trainer, and front-desk roles
- Member profiles, membership plans, payment history, overdue calculations, and health status
- Staff attendance management plus member self-service check-in links
- Expiring public attendance links with regeneration, revocation, owner resend/copy controls, and public endpoint rate limiting
- Dashboard metrics, attendance/revenue reports, notifications, and audit history
- Brevo email delivery for attendance links and overdue-payment reminders

## Architecture

```mermaid
flowchart LR
  Browser[React + Vite frontend] -->|JWT-protected REST calls| API[Django REST Framework]
  Public[Public attendance link] -->|short-lived link| API
  API --> Domain[Members, payments, attendance, reporting services]
  Domain --> DB[(PostgreSQL)]
  API --> Mail[Brevo email API]
  CI[GitHub Actions] -->|lint and build| Browser
  CI -->|Django tests| API
```

## Screenshots

| Area | Placeholder |
| --- | --- |
| Dashboard | _Add a dashboard screenshot here_ |
| Members and attendance | _Add a member-management screenshot here_ |
| Settings: attendance links | _Add an owner link-controls screenshot here_ |

## Tech stack

- Frontend: React, Vite, Redux Toolkit, Tailwind CSS, Material UI, Axios, Chart.js
- Backend: Python, Django, Django REST Framework, Simple JWT
- Database: PostgreSQL
- Containers: Docker and Docker Compose
- CI: GitHub Actions

## Environment variables

Copy the safe template before local development. Never commit `.env` files or production credentials.

```bash
cp .env.example .env
```

| Variable | Required | Purpose |
| --- | --- | --- |
| `SECRET_KEY` | Yes outside local experiments | Django secret key; use a unique, high-entropy value in each environment. |
| `DEBUG` | No | `True` only for local development; defaults to `False`. |
| `DATABASE_URL` | Recommended | PostgreSQL connection URL. It overrides the individual PostgreSQL settings. |
| `POSTGRES_PASSWORD` | When not using `DATABASE_URL` | Password for the default local PostgreSQL configuration. |
| `ALLOWED_HOSTS` | Yes in deployment | Comma-separated Django host names. |
| `CORS_ALLOWED_ORIGINS` | Yes in deployment | Comma-separated browser origins allowed to call the API. |
| `PUBLIC_APP_URL` | Recommended | Public frontend origin used when creating attendance-link URLs. |
| `VITE_API_URL` | Yes for frontend | API base URL exposed to the Vite client. |
| `BREVO_API_KEY` | Only for email delivery | Brevo API credential; store only in deployment secrets. |
| `EMAIL_SENDER` | Only for email delivery | Verified sender address for Brevo messages. |
| `EMAIL_HOST_USER` | Optional | Default Django sender setting. |
| `MEMBER_ACCESS_LINK_LIFETIME_DAYS` | No | Public attendance-link lifetime in days; defaults to `7`. |
| `PUBLIC_MEMBER_ACCESS_RATE_LIMIT` | No | Requests allowed per public link/IP window; defaults to `30`. |
| `PUBLIC_MEMBER_ACCESS_RATE_WINDOW` | No | Public-link rate-limit window in seconds; defaults to `60`. |

Example values in documentation should always be placeholders such as `postgresql://USER:PASSWORD@HOST:5432/DB_NAME`; do not use a production URL, API key, or email credential.

## Local setup

Prerequisites: Node.js 22+, Python 3.12+, and PostgreSQL 15+.

1. Create a PostgreSQL database and user for local development.
2. Copy `.env.example` to `.env`, set `DATABASE_URL`, `SECRET_KEY`, `VITE_API_URL`, and the host/origin values for your machine.
3. Install frontend dependencies and start Vite:

   ```bash
   npm ci
   npm run dev
   ```

4. In another shell, create a virtual environment, install backend dependencies, migrate, and run Django:

   ```bash
   cd gym_admin_backend
   python -m venv .venv
   source .venv/bin/activate
   python -m pip install --upgrade pip
   python -m pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

The Vite app reads `VITE_API_URL`; point it to the Django server, for example `http://localhost:8000/` if that matches the local API routing.

## Docker setup

The root `docker-compose.yml` runs PostgreSQL and the Django backend. It intentionally requires a local `POSTGRES_PASSWORD` value instead of containing one.

```bash
export POSTGRES_PASSWORD=choose-a-local-development-password
export SECRET_KEY=choose-a-local-development-secret
export ALLOWED_HOSTS=localhost,127.0.0.1
export CORS_ALLOWED_ORIGINS=http://localhost:5173
export PUBLIC_APP_URL=http://localhost:5173
docker compose up --build
```

The database is published on host port `5433` and the backend on `8000`. Run migrations from the backend container after it starts:

```bash
docker compose exec backend python manage.py migrate
```

The frontend is not included in the root Compose stack; run it locally with `npm run dev` or build/deploy it separately.

## Tests and quality checks

```bash
# Frontend
npm ci
npm run lint
npm run build

# Backend
cd gym_admin_backend
source .venv/bin/activate
python manage.py test
```

GitHub Actions runs these same frontend checks and Django tests against a disposable PostgreSQL service on pushes to `main` and pull requests.

## Deployment notes

- Provision PostgreSQL and set `DATABASE_URL` in the backend hosting provider.
- Set a unique `SECRET_KEY`, `DEBUG=False`, explicit `ALLOWED_HOSTS`, and the deployed frontend origin in `CORS_ALLOWED_ORIGINS` and `PUBLIC_APP_URL`.
- Store `BREVO_API_KEY` and all other credentials in the host secret manager, never source control.
- Run `python manage.py migrate` as part of each backend release before serving traffic.
- Build the frontend with the production `VITE_API_URL`, then serve the static build from your frontend host.
- Configure HTTPS for both frontend and API. Public attendance links are bearer credentials and should only be delivered over HTTPS.
- The public-link rate limiter uses Django cache. Use a shared cache backend in multi-instance production deployments if you need the limit enforced across every application instance.
