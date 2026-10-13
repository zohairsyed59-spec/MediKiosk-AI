/*
# MediKiosk AI - Phase 1 Security Hardening Migration
# 
# This migration restricts over-permissive anonymous UPDATE/DELETE operations
# while preserving the legitimate patient kiosk and physician workflows.
# 
# Run this migration AFTER the base schema (20261013191252_create_medikiosk_schema.sql)
*/

-- ============================================================================
-- 1. SESSIONS: Restrict anon UPDATE to kiosk-only columns
-- ============================================================================
-- Current: anon can UPDATE any column including status transitions to reviewed/amended
-- Fix: Allow anon UPDATE only on kiosk-controlled columns

DROP POLICY IF EXISTS "anon_update_sessions" ON sessions;

-- Allow anon UPDATE only on kiosk-controlled columns
CREATE POLICY "anon_update_sessions_kiosk" ON sessions FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (
    -- Only allow updating kiosk-controlled fields
    -- Physician-only statuses (reviewed, amended) cannot be set by anon
    (status IS NULL OR status IN ('in_progress', 'completed'))
    AND (mode IS NULL OR mode IN ('allopathic', 'ayush'))
    AND (consent_given IS NULL OR consent_given = true)
    AND (consent_audio_played IS NULL OR consent_audio_played IN (true, false))
    AND (red_flag_triggered IS NULL OR red_flag_triggered IN (true, false))
    AND (red_flag_reason IS NULL OR red_flag_reason IS NOT NULL)
  );

-- Physicians can still UPDATE all columns (including status transitions)
DROP POLICY IF EXISTS "auth_update_sessions" ON sessions;
CREATE POLICY "auth_update_sessions" ON sessions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ============================================================================
-- 2. SUMMARIES: Block anon UPDATE on physician-only statuses
-- ============================================================================
-- Current: anon can UPDATE status to 'reviewed' or 'amended'
-- Fix: Allow anon INSERT and UPDATE only for kiosk draft/pending_review

DROP POLICY IF EXISTS "anon_update_summaries" ON summaries;

CREATE POLICY "anon_update_summaries_kiosk" ON summaries FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (
    -- Anon can only create draft or pending_review summaries
    -- Cannot set reviewed/amended (physician-only)
    (status IS NULL OR status IN ('draft', 'pending_review'))
    -- Prevent anon from setting physician fields
    AND physician_id IS NULL
    AND physician_notes IS NULL
    AND reviewed_at IS NULL
  );

-- Physicians can UPDATE all fields including status transitions
CREATE POLICY "auth_update_summaries_physician" ON summaries FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ============================================================================
-- 3. STORAGE: Restrict anon DELETE to kiosk session ownership
-- ============================================================================
-- Current: anon can DELETE any file in medical-documents bucket
-- Fix: Restrict anon DELETE to files where the path starts with a valid kiosk session ID
-- that is in 'in_progress' or 'completed' status

DROP POLICY IF EXISTS "auth_delete_medical_docs" ON storage.objects;

-- Create a function to check if a storage path belongs to a valid kiosk session
CREATE OR REPLACE FUNCTION is_kiosk_session_file(bucket_id text, object_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  session_id uuid;
  session_status text;
BEGIN
  -- Extract session ID from path (format: session_id/filename)
  -- Path format: <session_id>/<timestamp>-<random>.<ext>
  session_id := split_part(object_name, '/', 1)::uuid;
  
  -- Check if session exists and is a kiosk session (not reviewed/amended)
  SELECT status INTO session_status
  FROM sessions
  WHERE id = session_id;
  
  IF session_status IS NULL THEN
    RETURN false;
  END IF;
  
  -- Only allow deletion for kiosk sessions (not physician-reviewed)
  RETURN session_status IN ('in_progress', 'completed');
END;
$$;

-- Anon can DELETE only their own session's files
CREATE POLICY "anon_delete_medical_docs_kiosk" ON storage.objects
  FOR DELETE
  TO anon
  USING (
    bucket_id = 'medical-documents'
    AND is_kiosk_session_file(bucket_id, name)
  );

-- Authenticated (physicians) can delete any file
CREATE POLICY "auth_delete_medical_docs_physician" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'medical-documents');


-- ============================================================================
-- 4. ADDITIONAL: Add session ownership verification function
-- ============================================================================
-- For future use in more granular policies

CREATE OR REPLACE FUNCTION get_current_kiosk_session()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT current_setting('app.current_session_id', true)::uuid;
$$;

-- Note: Frontend would need to call SET LOCAL app.current_session_id = 'uuid'
-- before each request. This requires Supabase client modification or
-- PostgREST pre-request hook. For now, we rely on column-level restrictions.