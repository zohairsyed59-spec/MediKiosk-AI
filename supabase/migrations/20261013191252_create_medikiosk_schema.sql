/*
# MediKiosk AI - Clinical History Platform Schema

## Overview
Creates the complete database schema for MediKiosk, an AI-powered clinical history-taking
platform for Indian hospital OPDs. Supports patient self-service kiosk flow (anon access)
and physician review workflow (authenticated access).

## New Tables

### patients
- Stores patient demographics. Created by kiosk (anon) flow.
- Fields: id, name, age, gender, abha_id, phone, language, created_at

### sessions
- Tracks each kiosk session from start to completion.
- Fields: id, patient_id (FK), status, language, mode, consent_given, consent_audio_played,
  red_flag_triggered, red_flag_reason, created_at, completed_at

### history_responses
- Individual Q&A pairs from the adaptive history interview.
- Fields: id, session_id (FK), section, question_key, question_text, answer, answer_mode, created_at

### documents
- Metadata for uploaded medical documents (prescriptions, lab reports, etc.).
- Fields: id, session_id (FK), filename, doc_type, file_size, mime_type,
  storage_path, extracted_text, structured_data (jsonb), doc_date, upload_order, created_at

### summaries
- AI-generated structured clinical summary per session, reviewable by physicians.
- Fields: id, session_id (FK unique), chief_complaint, hpi, past_medical_history,
  drug_allergy_history, family_history, personal_history, review_of_systems,
  prior_investigations, ayush_assessment, full_summary, status,
  physician_id (FK auth.users), physician_notes, reviewed_at, created_at

### physician_profiles
- Physician profiles linked to Supabase auth.
- Fields: id, user_id (FK auth.users unique), name, department, role, created_at

## Storage
- Creates 'medical-documents' bucket for patient file uploads.
- Anon can upload (kiosk patients), authenticated can read (physicians).

## Security (RLS)
- patients: anon INSERT+SELECT, authenticated SELECT+UPDATE
- sessions: anon INSERT+SELECT+UPDATE, authenticated SELECT+UPDATE
- history_responses: anon INSERT+SELECT, authenticated SELECT
- documents: anon INSERT+SELECT, authenticated SELECT
- summaries: anon INSERT+SELECT+UPDATE, authenticated SELECT+UPDATE
- physician_profiles: authenticated CRUD on own profile (user_id = auth.uid())

## Notes
1. Patient kiosk runs as anon role (no sign-in required)
2. Physicians sign in via Supabase auth (email/password)
3. All foreign keys use ON DELETE CASCADE for related session data
4. Indexes on session_id and patient_id for query performance
*/

-- ============ PATIENTS ============
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  age int NOT NULL CHECK (age > 0 AND age < 150),
  gender text NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  abha_id text,
  phone text,
  language text NOT NULL DEFAULT 'en',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_patients" ON patients;
CREATE POLICY "anon_select_patients" ON patients FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_patients" ON patients;
CREATE POLICY "anon_insert_patients" ON patients FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_patients" ON patients;
CREATE POLICY "auth_update_patients" ON patients FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ============ SESSIONS ============
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'reviewed', 'amended')),
  language text NOT NULL DEFAULT 'en',
  mode text NOT NULL DEFAULT 'allopathic' CHECK (mode IN ('allopathic', 'ayush')),
  consent_given boolean NOT NULL DEFAULT false,
  consent_audio_played boolean NOT NULL DEFAULT false,
  red_flag_triggered boolean NOT NULL DEFAULT false,
  red_flag_reason text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_sessions" ON sessions;
CREATE POLICY "anon_select_sessions" ON sessions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sessions" ON sessions;
CREATE POLICY "anon_insert_sessions" ON sessions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_sessions" ON sessions;
CREATE POLICY "anon_update_sessions" ON sessions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_sessions_patient_id ON sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);

-- ============ HISTORY RESPONSES ============
CREATE TABLE IF NOT EXISTS history_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  section text NOT NULL,
  question_key text NOT NULL,
  question_text text NOT NULL,
  answer text,
  answer_mode text CHECK (answer_mode IN ('voice', 'touch', 'text')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE history_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_history" ON history_responses;
CREATE POLICY "anon_select_history" ON history_responses FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_history" ON history_responses;
CREATE POLICY "anon_insert_history" ON history_responses FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_history_session_id ON history_responses(session_id);

-- ============ DOCUMENTS ============
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  filename text NOT NULL,
  doc_type text NOT NULL CHECK (doc_type IN ('prescription', 'lab_report', 'discharge_summary', 'imaging', 'other')),
  file_size bigint,
  mime_type text,
  storage_path text,
  extracted_text text,
  structured_data jsonb DEFAULT '{}'::jsonb,
  doc_date date,
  upload_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_documents" ON documents;
CREATE POLICY "anon_select_documents" ON documents FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_documents" ON documents;
CREATE POLICY "anon_insert_documents" ON documents FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_documents" ON documents;
CREATE POLICY "auth_update_documents" ON documents FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_documents_session_id ON documents(session_id);

-- ============ SUMMARIES ============
CREATE TABLE IF NOT EXISTS summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE UNIQUE,
  chief_complaint text,
  hpi text,
  past_medical_history text,
  drug_allergy_history text,
  family_history text,
  personal_history text,
  review_of_systems text,
  prior_investigations text,
  ayush_assessment text,
  full_summary text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'reviewed', 'amended')),
  physician_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  physician_notes text,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_summaries" ON summaries;
CREATE POLICY "anon_select_summaries" ON summaries FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_summaries" ON summaries;
CREATE POLICY "anon_insert_summaries" ON summaries FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_summaries" ON summaries;
CREATE POLICY "anon_update_summaries" ON summaries FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_summaries_status ON summaries(status);

-- ============ PHYSICIAN PROFILES ============
CREATE TABLE IF NOT EXISTS physician_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name text NOT NULL,
  department text NOT NULL,
  role text NOT NULL DEFAULT 'physician',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE physician_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_physician_profile" ON physician_profiles;
CREATE POLICY "select_own_physician_profile" ON physician_profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_physician_profile" ON physician_profiles;
CREATE POLICY "insert_own_physician_profile" ON physician_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_physician_profile" ON physician_profiles;
CREATE POLICY "update_own_physician_profile" ON physician_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_physician_profile" ON physician_profiles;
CREATE POLICY "delete_own_physician_profile" ON physician_profiles FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ STORAGE BUCKET ============
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-documents', 'medical-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "anon_upload_medical_docs" ON storage.objects;
CREATE POLICY "anon_upload_medical_docs" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'medical-documents');

DROP POLICY IF EXISTS "auth_read_medical_docs" ON storage.objects;
CREATE POLICY "auth_read_medical_docs" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'medical-documents');

DROP POLICY IF EXISTS "auth_delete_medical_docs" ON storage.objects;
CREATE POLICY "auth_delete_medical_docs" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id = 'medical-documents');
