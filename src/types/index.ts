export type Gender = 'male' | 'female' | 'other';
export type Language = 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'bn' | 'mr' | 'gu';
export type SessionStatus = 'in_progress' | 'completed' | 'reviewed' | 'amended';
export type SessionMode = 'allopathic' | 'ayush';
export type AnswerMode = 'voice' | 'touch' | 'text';
export type DocType = 'prescription' | 'lab_report' | 'discharge_summary' | 'imaging' | 'other';
export type SummaryStatus = 'draft' | 'pending_review' | 'reviewed' | 'amended';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  abha_id: string | null;
  phone: string | null;
  language: Language;
  created_at: string;
}

export interface Session {
  id: string;
  patient_id: string;
  status: SessionStatus;
  language: Language;
  mode: SessionMode;
  consent_given: boolean;
  consent_audio_played: boolean;
  red_flag_triggered: boolean;
  red_flag_reason: string | null;
  created_at: string;
  completed_at: string | null;
  patient?: Patient;
}

export interface HistoryResponse {
  id: string;
  session_id: string;
  section: string;
  question_key: string;
  question_text: string;
  answer: string | null;
  answer_mode: AnswerMode | null;
  created_at: string;
}

export interface DocumentRecord {
  id: string;
  session_id: string;
  filename: string;
  doc_type: DocType;
  file_size: number | null;
  mime_type: string | null;
  storage_path: string | null;
  extracted_text: string | null;
  structured_data: Record<string, unknown>;
  doc_date: string | null;
  upload_order: number;
  created_at: string;
}

export interface Summary {
  id: string;
  session_id: string;
  chief_complaint: string | null;
  hpi: string | null;
  past_medical_history: string | null;
  drug_allergy_history: string | null;
  family_history: string | null;
  personal_history: string | null;
  review_of_systems: string | null;
  prior_investigations: string | null;
  ayush_assessment: string | null;
  full_summary: string | null;
  status: SummaryStatus;
  physician_id: string | null;
  physician_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface PhysicianProfile {
  id: string;
  user_id: string;
  name: string;
  department: string;
  role: string;
  created_at: string;
}
