# SwimShark – Vite + React

Multi-page swimming school website with forms for lessons and summer camp.

## Pages
- Home – introduction and program overview
- About Us – school details
- Swimming Lessons – inquiry form
- Summer Camp – registration request form
- Contact – contact information

## Development
1. Install dependencies
2. Start the dev server

```powershell
npm install
npm run dev
```

Then open the shown local URL.

## Build
```powershell
npm run build
npm run preview
```

## Supabase integration
1. Create a project at supabase.com and get your Project URL and anon key.
2. Copy `.env.example` to `.env` and fill values:

```
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. In Supabase SQL editor, create tables (or use UI):

```sql
create table if not exists lesson_inquiries (
	id uuid primary key default gen_random_uuid(),
	first_name text not null,
	last_name text not null,
	email text not null,
	phone text,
	student_name text not null, -- legacy aggregate full name
	-- New: separate child name columns
	student_first_name text,
	student_last_name text,
	student_dob date not null,
	-- New: store selected timeslots as text[]
	timeslots text[],
	level text not null,
	preferences text,
	-- New: optional health issues description
	health_issues text,
	submitted_at timestamptz not null default now()
);

create table if not exists camp_registrations (
	id uuid primary key default gen_random_uuid(),
	parent_name text not null,
	email text not null,
	camper_name text not null,
	camper_dob date not null,
	preferred_week text not null,
	notes text,
	submitted_at timestamptz not null default now()
);

-- Lesson terms (single-row config)
create table if not exists lesson_terms (
	id int primary key check (id = 1),
	start_date date,
	end_date date,
	updated_at timestamptz default now()
);
```

4. Ensure Row Level Security (RLS) is configured to allow inserts from anon key, e.g. temporary open insert policy while testing:

```sql
alter table lesson_inquiries enable row level security;
create policy "Allow inserts for anon" on lesson_inquiries for insert to anon using (true) with check (true);

alter table camp_registrations enable row level security;
create policy "Allow inserts for anon" on camp_registrations for insert to anon using (true) with check (true);
```

For production, tighten policies to specific columns or use an Edge Function.

### Migration for existing projects
If you already created the tables, add the new column to `lesson_inquiries`:

```sql
alter table lesson_inquiries add column if not exists timeslots text[];
alter table lesson_inquiries add column if not exists health_issues text;
-- New: split child name into first/last (keep existing student_name for back-compat)
alter table lesson_inquiries add column if not exists student_first_name text;
alter table lesson_inquiries add column if not exists student_last_name text;

-- New: create the lesson_terms table if missing
create table if not exists lesson_terms (
	id int primary key check (id = 1),
	start_date date,
	end_date date,
	updated_at timestamptz default now()
);
insert into lesson_terms (id, start_date, end_date)
	values (1, '2025-09-22', '2026-01-23')
	on conflict (id) do nothing;
```

### Admin page
- Route: `/admin`
- Lists lesson inquiries and camp registrations with CSV export.

To enable reading data with the anon key (for testing), add SELECT policies:

```sql
create policy "Allow selects for anon" on lesson_inquiries for select to anon using (true);
create policy "Allow selects for anon" on camp_registrations for select to anon using (true);
```

For production, protect the admin page (e.g., with Supabase Auth), or run it behind a protected network. You can also remove the route entirely when deploying.

For the `lesson_terms` table (to edit dates from Admin during testing):

```sql
alter table lesson_terms enable row level security;
create policy "Allow selects for anon" on lesson_terms for select to anon using (true);
create policy "Allow upserts for anon" on lesson_terms for insert to anon with check (true);
create policy "Allow updates for anon" on lesson_terms for update to anon using (true) with check (true);
```

### Protecting `/admin` with Supabase Auth
- The app uses Supabase Email+Password sign-in.
- Create a user in Supabase Authentication > Users.
- Set `.env` as usual; no extra keys are needed for Auth.
- Navigate to `/admin/prihlasenie` to log in; the guard (`RequireAuth`) redirects to the login page when not authenticated.

## Email confirmations
This project includes a tiny Node/Express mail API (server/index.ts) used to send confirmation emails after form submission via Nodemailer.

Setup:
1. Fill SMTP credentials in `.env` (see `.env.example`):

```
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
MAIL_FROM=
```

2. Start dev servers (Vite + mail API run together):

```powershell
npm run dev
```

Vite proxies `/api/*` requests to the mail API on port 5179 during development.
