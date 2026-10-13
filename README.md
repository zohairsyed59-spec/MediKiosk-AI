# MediKiosk AI

A clinical history-taking platform for Indian hospital OPDs. Patients record their medical history through multilingual voice and touch interaction, scan physical documents, and generate structured summaries for physicians before the consultation.

## Features

### Patient Kiosk Flow (no login required)
- Patient identification with ABHA ID, demographics, and language selection (8 Indian languages)
- Multilingual consent screen compliant with DPDP Act 2023 and ABDM consent framework
- Dual-mode history interview: Allopathic (SOCRATES framework, 8 sections) or AYUSH (Dashavidha Pariksha, 6 sections)
- Voice and touch input for every question
- Adaptive questioning with branching follow-ups and red-flag emergency detection
- Medical document upload (prescriptions, lab reports, discharge summaries)
- Structured summary generation in standard clinical format, reviewed by patient before submission

### Physician Portal (email/password authentication)
- Dashboard with searchable, filterable list of patient summaries
- Summary review with editable sections, physician notes, and raw response viewing
- Review workflow: mark as reviewed or amended with physician attribution
- Emergency flag visibility for red-flagged cases

### Design
- Light clinical theme with deep teal primary color
- Fraunces display font, Plus Jakarta Sans for body text
- Responsive layout for mobile, tablet, and desktop
- Loading states, empty states, error handling, toast notifications

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS 3 |
| Icons | Lucide React |
| Routing | React Router DOM 7 |
| Backend/Database | Supabase (PostgreSQL, Auth, Storage) |
| Voice Input | Web Speech API (browser-native) |
| UI Components | Custom components with Radix UI Select |

## Project Structure

```
src/
├── App.tsx                    # Root component with routing
├── main.tsx                   # Entry point
├── index.css                  # Global styles and design system
├── lib/
│   ├── supabase.ts            # Supabase client singleton
│   ├── errors.ts              # Error handling utility
│   └── summaryGenerator.ts    # Clinical summary generation logic
├── types/
│   ├── index.ts               # Database entity types
│   └── clinical.ts            # Clinical question definitions (Allopathic + AYUSH)
├── hooks/
│   ├── useAuth.tsx            # Physician auth context
│   ├── useKiosk.tsx           # Patient kiosk session context
│   └── useVoiceInput.ts       # Web Speech API voice input hook
├── components/
│   ├── ui/                    # Reusable UI components (Button, Card, Input, etc.)
│   └── kiosk/                 # Kiosk-specific layout components
└── pages/
    ├── LandingPage.tsx        # Marketing landing page
    ├── kiosk/                 # Patient kiosk flow (7 pages)
    └── physician/             # Physician portal (4 pages)

supabase/
├── migrations/
│   ├── 20261013191252_create_medikiosk_schema.sql
│   └── 20261014000000_security_hardening.sql
├── functions/rate-limiter/    # Edge Function for rate limiting
└── config.toml
```

## Database Schema

| Table | Purpose |
|-------|---------|
| `patients` | Demographics: name, age, gender, ABHA ID, phone, language |
| `sessions` | Kiosk session tracking: status, mode, consent, red flags |
| `history_responses` | Individual Q&A pairs from the adaptive interview |
| `documents` | Uploaded medical document metadata with storage paths |
| `summaries` | Structured clinical summaries with review status |
| `physician_profiles` | Physician profiles linked to Supabase Auth |
| `storage.buckets` | `medical-documents` bucket for file uploads |

### Row Level Security
- Patient kiosk tables: anon INSERT + SELECT, authenticated SELECT + UPDATE
- Physician tables: authenticated only with `auth.uid()` ownership checks
- Storage: anon can upload, authenticated can read and delete

## Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account (free tier works for development)

## Local Setup

```bash
# Clone the repository
git clone <repository-url>
cd medikiosk-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Run development server
npm run dev
```

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project REST endpoint |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous public key |

> **Note:** Never expose the Supabase service role key in frontend code. It is only for server-side or edge function use.

## Database and Supabase Setup

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note the project URL and anon key from Settings → API

### 2. Run Migrations
In Supabase Dashboard → SQL Editor, run the migrations in order:

```sql
-- 1. Base schema
\i supabase/migrations/20261013191252_create_medikiosk_schema.sql

-- 2. Security hardening (restricts anon UPDATE/DELETE)
\i supabase/migrations/20261014000000_security_hardening.sql
```

Or use the Supabase CLI:
```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

### 3. Configure Authentication
In Supabase Dashboard → Authentication → Providers → Email:
- Enable Email provider
- Disable "Enable email confirmations" for demo purposes

### 3. Verify Storage Bucket
The migration creates a `medical-documents` bucket. Verify in Storage that:
- Bucket exists and is private
- Anon can upload, authenticated can read

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run typecheck` | TypeScript type checking |
| `npm run lint` | ESLint linting |

## Local Development

```bash
npm run dev
```

Open the displayed URL (typically `http://localhost:5173`).

### User Flows

**Patient Kiosk:**
1. Visit `/kiosk` → Begin Check-In
2. Enter patient details → Consent → Select mode (Allopathic/AYUSH)
3. Complete adaptive history interview (voice or touch)
4. Upload medical documents (optional)
5. Review and confirm summary → Sent to physician

**Physician Portal:**
1. Visit `/physician/signup` to create an account
2. Sign in at `/physician/login`
3. View dashboard with all patient summaries
4. Click a case to review, edit, and mark as reviewed/amended

## Deployment

The application is a Vite SPA that can be deployed to any static hosting provider:

```bash
npm run build    # outputs to dist/
```

Deploy the `dist/` folder to Vercel, Netlify, Cloudflare Pages, or any static host. Configure environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in the deployment environment.

For SPA routing, configure your host to redirect all routes to `index.html`:
- **Vercel/Netlify/Cloudflare Pages**: Automatic
- **Apache/Nginx**: Add fallback rule to `index.html`

## Current Limitations

- **Voice input** uses the browser's Web Speech API, best supported in Chrome/Edge. Firefox support is limited. The touch interface works in all browsers.
- **Voice language** is hardcoded to English. Non-English patients must use the touch interface.
- **OCR/document digitization** stores uploaded documents and metadata. Full OCR text extraction would require integration with an OCR service via a Supabase Edge Function.
- **ABDM/FHIR integration** is architecturally designed but not connected to live ABDM APIs. ABHA ID capture and consent flow are implemented; FHIR API push requires production ABDM credentials.
- **ASR for Indian languages** uses the browser's built-in speech recognition. Production deployment would integrate Bhashini/AI4Bharat models via an edge function.
- **Adaptive questioning** uses a predefined clinical question tree. Dynamic LLM-powered follow-up generation is not implemented.
- **Bundle size** is ~1.3 MB (gzipped ~300 KB). Production deployment should configure manual chunks for better loading performance.
- No automated test suite. Manual testing is required for critical flows.
- No CSP headers or security headers configured.

## License

MIT License - see LICENSE file if present, otherwise the project is provided as-is for educational and demonstration purposes.