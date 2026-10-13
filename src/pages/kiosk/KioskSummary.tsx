import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, FileText, Sparkles, Check, AlertTriangle,
  Pill, FlaskConical, Users, User, ListChecks, Heart, FileSpreadsheet,
  Salad,
} from 'lucide-react';
import { KioskLayout } from '@/components/kiosk/KioskLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { useKiosk } from '@/hooks/useKiosk';
import { supabase } from '@/lib/supabase';
import { errorMessage } from '@/lib/errors';
import { generateSummary } from '@/lib/summaryGenerator';
import type { HistoryResponse, DocumentRecord, Summary } from '@/types';

export default function KioskSummary() {
  const navigate = useNavigate();
  const toast = useToast();
  const { session, patient, mode } = useKiosk();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [summaryData, setSummaryData] = useState<ReturnType<typeof generateSummary> | null>(null);
  const [responses, setResponses] = useState<HistoryResponse[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);

  if (!session || !patient) {
    navigate('/kiosk/mode');
    return null;
  }

  useEffect(() => {
    (async () => {
      try {
        const [respRes, docRes] = await Promise.all([
          supabase.from('history_responses').select('*').eq('session_id', session.id),
          supabase.from('documents').select('*').eq('session_id', session.id),
        ]);

        if (respRes.error) throw respRes.error;
        if (docRes.error) throw docRes.error;

        setResponses(respRes.data || []);
        setDocuments(docRes.data || []);

        const data = generateSummary(respRes.data || [], docRes.data || [], session, patient);
        setSummaryData(data);
        setLoading(false);
      } catch (err) {
        toast.error('Failed to load summary', errorMessage(err));
        setLoading(false);
      }
    })();
  }, [session, patient]);

  const handleSubmit = async () => {
    if (!summaryData || !session) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('summaries')
        .insert({
          session_id: session.id,
          chief_complaint: summaryData.chief_complaint,
          hpi: summaryData.hpi,
          past_medical_history: summaryData.past_medical_history,
          drug_allergy_history: summaryData.drug_allergy_history,
          family_history: summaryData.family_history,
          personal_history: summaryData.personal_history,
          review_of_systems: summaryData.review_of_systems,
          prior_investigations: summaryData.prior_investigations,
          ayush_assessment: summaryData.ayush_assessment,
          full_summary: summaryData.full_summary,
          status: 'pending_review',
        })
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('sessions')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', session.id);

      setSummary(data);
      toast.success('Summary submitted', 'Your doctor will see it on their screen.');
      setTimeout(() => navigate('/kiosk/complete'), 1500);
    } catch (err) {
      toast.error('Failed to submit summary', errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <KioskLayout step={6} backLink="/kiosk/documents" title="Generating Summary" subtitle="AI is synthesizing your history...">
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" />
          <p className="text-muted-foreground text-sm mt-4">Structuring your clinical history...</p>
        </div>
      </KioskLayout>
    );
  }

  const sections = mode === 'ayush'
    ? [
        { icon: AlertTriangle, label: 'Chief Complaint', content: summaryData?.chief_complaint },
        { icon: FileText, label: 'Nidana (Causative Factors)', content: summaryData?.hpi },
        { icon: Sparkles, label: 'Ayush Assessment', content: summaryData?.ayush_assessment },
        { icon: Salad, label: 'Ahara-Vihara (Diet & Lifestyle)', content: summaryData?.personal_history },
        { icon: FileSpreadsheet, label: 'Prior Documents', content: summaryData?.prior_investigations },
      ]
    : [
        { icon: AlertTriangle, label: 'Chief Complaint', content: summaryData?.chief_complaint },
        { icon: FileText, label: 'History of Present Illness', content: summaryData?.hpi },
        { icon: Heart, label: 'Past Medical History', content: summaryData?.past_medical_history },
        { icon: Pill, label: 'Drug & Allergy History', content: summaryData?.drug_allergy_history },
        { icon: Users, label: 'Family History', content: summaryData?.family_history },
        { icon: User, label: 'Personal History', content: summaryData?.personal_history },
        { icon: ListChecks, label: 'Review of Systems', content: summaryData?.review_of_systems },
        { icon: FileSpreadsheet, label: 'Prior Investigations & Documents', content: summaryData?.prior_investigations },
      ];

  return (
    <KioskLayout step={6} backLink="/kiosk/documents" title="Your Clinical Summary" subtitle="Please review your summary before sending it to your doctor">
      <div className="space-y-4 animate-slide-up">
        {/* Red flag warning */}
        {session.red_flag_triggered && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">
              <strong>Emergency symptom detected.</strong> Triage staff have been notified. {session.red_flag_reason}
            </p>
          </div>
        )}

        {/* Patient info card */}
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <User className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">{patient.name}</p>
            <p className="text-sm text-muted-foreground">{patient.age}y, {patient.gender} · {mode === 'ayush' ? 'Ayurvedic' : 'Allopathic'}</p>
          </div>
          <Badge variant="secondary">{responses.length} responses</Badge>
        </Card>

        {/* Summary sections */}
        <div className="space-y-3">
          {sections.map((section, i) => {
            const Icon = section.icon;
            return (
              <Card key={i} className="animate-slide-up">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground mb-1">{section.label}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{section.content || 'Not reported'}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Info note */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
          <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            This summary is a draft for your doctor to review, edit, and confirm. The physician retains full control — this is not an autonomous diagnosis.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/kiosk/documents')} icon={<ArrowLeft className="w-5 h-5" />}>
            Back
          </Button>
          <Button fullWidth size="lg" loading={submitting} onClick={handleSubmit} icon={<Check className="w-5 h-5" />}>
            Confirm & Send to Doctor
          </Button>
        </div>
      </div>
    </KioskLayout>
  );
}