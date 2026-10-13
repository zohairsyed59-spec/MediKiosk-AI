# MediKiosk AI — Clinical History-Taking Platform

An AI-powered clinical history-taking platform for Indian hospital OPDs. Patients record their complete medical history through natural voice conversation and guided touch interaction in their preferred language, scan and digitize their existing physical medical documents, and generate a structured, physician-ready clinical history summary — all before entering the consultation room.

## Main Features

### Patient Kiosk Flow (No login required)
- **Patient identification** with ABHA ID, demographics, and language selection (8 Indian languages)
- **Multilingual consent** screen in the patient's language, compliant with DPDP Act 2023 and ABDM consent framework
- **Dual-mode history interview** — Allopathic (SOCRATES framework, 8 sections) or AYUSH (Dashavidha Pariksha, 6 sections)
- **Voice + touch input** — every question answerable by speaking or tapping
- **Adaptive questioning** with branching follow-ups and red-flag emergency detection
- **Medical document upload** — prescriptions, lab reports, discharge summaries with OCR-ready digitization
- **Structured summary generation** in standard clinical format, reviewed by patient before submission

### Physician Portal (Email/password auth)
- **Dashboard** with searchable, filterable list of patient summaries
- **Summary review** with editable sections, physician notes, and raw response viewing
- **Review workflow** — mark as reviewed or amended, with physician attribution
- **Emergency flag visibility** — red-flagged cases highlighted prominently

### Design
- Dark purple-gradient aesthetic (#0B0614, #170D2B, #7C3AED, #A78BFA)
- Glassmorphism cards, soft shadows, rounded corners
- Fully responsive (mobile, tablet, desktop)
- Loading states, empty states, error messages, toast notifications
- Smooth animations and micro-interactions

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS 3 |
| Icons | Lucide React |
| Routing | React Router DOM 7 |
| Backend/Database | Supabase (PostgreSQL + Auth + Storage) |
| Voice Input | Web Speech API (browser-native) |

## Project Structure

```
src/
├── App.tsx                    # Root component with routing
├── main.tsx                   # Entry point
├── index.css                  # Global styles + design system
├── lib/
│   ├── supabase.ts            # Supabase client singleton
│   └── summaryGenerator.ts    # AI summary generation logic
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
    ├── kiosk/                 # Patient kiosk flow (8 pages)
    └── physician/             # Physician portal (4 pages)
```

## Database Schema

| Table | Purpose |
|-------|---------|
| `patients` | Patient demographics (name, age, gender, ABHA ID, phone, language) |
| `sessions` | Kiosk session tracking (status, mode, consent, red flags) |
| `history_responses` | Individual Q&A pairs from the adaptive interview |
| `documents` | Uploaded medical document metadata with storage paths |
| `summaries` | AI-generated structured clinical summaries with review status |
| `physician_profiles` | Physician profiles linked to Supabase auth |
| `storage.buckets` | `medical-documents` bucket for file uploads |

### Row Level Security
- Patient kiosk tables: `TO anon, authenticated` (kiosk runs without login)
- Physician tables: `TO authenticated` with `auth.uid()` ownership checks
- Storage: anon can upload, authenticated can read

## Installation

```bash
# Install dependencies
npm install

# Set up environment variables (see below)
cp .env.example .env

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Environment Variables

The following environment variables are required. For local development, create a `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

> **Note:** Never expose the Supabase service role key in frontend code. It is only for server-side/edge function use.

## Database Setup

The database schema is applied via Supabase migrations. The migration file is at:
```
supabase/migrations/20261013191252_create_medikiosk_schema.sql
```

All tables, RLS policies, indexes, and storage buckets are created in a single migration. The schema is idempotent — safe to re-run.

## How to Run

1. Ensure environment variables are set (`.env` file)
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server
4. Open the browser to the displayed URL

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

Deploy the `dist/` folder to Vercel, Netlify, or any static host. Ensure the environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are set in the deployment environment.

## Known Limitations

- **Voice input** uses the browser's Web Speech API, which is best supported in Chrome/Edge. Firefox support is limited. The touch/tap interface works in all browsers.
- **OCR/document digitization** stores uploaded documents and metadata. Full OCR text extraction would require integration with an OCR service (e.g., Google Vision, Tesseract) via a Supabase Edge Function.
- **ABDM/FHIR integration** is architecturally designed but not connected to live ABDM APIs. The consent flow and ABHA ID capture are implemented; FHIR API push to HIS/EMR requires production ABDM credentials.
- **ASR for Indian languages** uses the browser's built-in speech recognition. Production deployment would integrate Bhashini/AI4Bharat models via an edge function for accurate multilingual ASR.
- **LLM-powered adaptive questioning** uses a predefined clinical question tree. A production version would integrate an LLM (e.g., via edge function) for dynamic follow-up question generation.
- The bundle size is large due to lucide-react icon imports — production deployment should configure manual chunks for better loading performance.

## Security Notes

- All patient data is protected by RLS policies at the database level
- Physician authentication uses Supabase Auth (email/password)
- No service role keys are exposed in frontend code
- Session data is associated with patient sessions and can be cleared after consultation
- File uploads go to a private Supabase storage bucket
- Input validation on both client and database levels (CHECK constraints)
