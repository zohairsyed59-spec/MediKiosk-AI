import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Heart, ArrowLeft, AlertTriangle, AlertCircle, CheckCircle2, Save, Edit3,
  User, Clock, FileText, Pill, Users, ListChecks, FlaskConical,
  Sparkles, Salad, Shield, X, Check, Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Textarea } from '@/components/ui/Textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase';
import type { Summary, Session, Patient, HistoryResponse, DocumentRecord } from '@/types';

interface ReviewData {
  summary: Summary | null;
  session: Session | null;
  patient: Patient | null;
  responses: HistoryResponse[];
  documents: DocumentRecord[];
}

const filterOptions = [
  { key: 'all' as const, label: 'All' },
  { key: 'pending' as const, label: 'Awaiting Review' },
  { key: 'in_progress' as const, label: 'In Progress' },
  { key: 'completed' as const, label: 'Completed' },
] as const;

export default function PhysicianReview() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const toast = useToast();

  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedFields, setEditedFields] = useState<Partial<Summary>>({});

  const fetchData = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const [sessionRes, summaryRes, responsesRes, documentsRes] = await Promise.all([
        supabase.from('sessions').select('*, patient:patients(*)').eq('id', sessionId).maybeSingle(),
        supabase.from('summaries').select('*').eq('session_id', sessionId).maybeSingle(),
        supabase.from('history_responses').select('*').eq('session_id', sessionId).order('created_at'),
        supabase.from('documents').select('*').eq('session_id', sessionId).order('upload_order'),
      ]);

      if (sessionRes.error) throw sessionRes.error;

      setData({
        summary: summaryRes.data,
        session: sessionRes.data,
        patient: (sessionRes.data as any)?.patient,
        responses: responsesRes.data || [],
        documents: documentsRes.data || [],
      });
    } catch {
      toast.error('Failed to load case', 'Please try again.');
    } finally {
      setLoading(false);
    }
  }, [sessionId, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    if (!data?.summary || !user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('summaries')
        .update({
          ...editedFields,
          status: 'reviewed',
          physician_id: user.id,
          physician_notes: editedFields.physician_notes ?? data.summary.physician_notes,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', data.summary.id);

      if (error) throw error;

      await supabase
        .from('sessions')
        .update({ status: 'reviewed' })
        .eq('id', sessionId);

      toast.success('Summary reviewed', 'The case has been marked as reviewed.');
      setEditing(false);
      fetchData();
    } catch {
      toast.error('Failed to save', 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAmend = async () => {
    if (!data?.summary || !user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('summaries')
        .update({
          ...editedFields,
          status: 'amended',
          physician_id: user.id,
          physician_notes: editedFields.physician_notes ?? data.summary.physician_notes,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', data.summary.id);

      if (error) throw error;

      await supabase
        .from('sessions')
        .update({ status: 'amended' })
        .eq('id', sessionId);

      toast.success('Summary amended', 'Your changes have been saved.');
      setEditing(false);
      fetchData();
    } catch {
      toast.error('Failed to save', 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data?.summary || !data?.session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <EmptyState
          icon={AlertCircle}
          title="Case not found"
          description="This session may not have a summary yet."
          action={<Button onClick={() => navigate('/physician/dashboard')}>Back to Dashboard</Button>}
        />
      </div>
    );
  }

  const { summary, session, patient, responses, documents } = data;
  const isAyush = session.mode === 'ayush';

  const summarySections = isAyush
    ? [
        { icon: AlertTriangle, label: 'Chief Complaint', field: 'chief_complaint' as const },
        { icon: FileText, label: 'Nidana (Causative Factors)', field: 'hpi' as const },
        { icon: Sparkles, label: 'Ayush Assessment', field: 'ayush_assessment' as const },
        { icon: Salad, label: 'Ahara-Vihara (Diet & Lifestyle)', field: 'personal_history' as const },
        { icon: FlaskConical, label: 'Prior Documents', field: 'prior_investigations' as const },
      ]
    : [
        { icon: AlertTriangle, label: 'Chief Complaint', field: 'chief_complaint' as const },
        { icon: FileText, label: 'History of Present Illness', field: 'hpi' as const },
        { icon: Heart, label: 'Past Medical History', field: 'past_medical_history' as const },
        { icon: Pill, label: 'Drug & Allergy History', field: 'drug_allergy_history' as const },
        { icon: Users, label: 'Family History', field: 'family_history' as const },
        { icon: User, label: 'Personal History', field: 'personal_history' as const },
        { icon: ListChecks, label: 'Review of Systems', field: 'review_of_systems' as const },
        { icon: FlaskConical, label: 'Prior Investigations', field: 'prior_investigations' as const },
      ];

  const currentValue = (field: keyof Summary): string => {
    if (field in editedFields) return editedFields[field] as string ?? '';
    return (summary[field] as string) ?? '';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: Summary['status']) => {
    switch (status) {
      case 'pending_review':
        return <Badge variant="warning"><Clock className="w-3 h-3" /> Pending Review</Badge>;
      case 'reviewed':
        return <Badge variant="success"><CheckCircle2 className="w-3 h-3" /> Reviewed</Badge>;
      case 'amended':
        return <Badge variant="info"><FileText className="w-3 h-3" /> Amended</Badge>;
      case 'draft':
        return <Badge variant="secondary"><Clock className="w-3 h-3" /> In Progress</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/physician/dashboard')}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </button>
            <div className="flex items-center gap-3">
              {editing ? (
                <>
                  <Button variant="ghost" size="sm" onClick={() => { setEditing(false); setEditedFields({}); }} icon={<X className="w-4 h-4" />}>
                    Cancel
                  </Button>
                  <Button variant="outline" size="sm" loading={saving} onClick={handleAmend} icon={<Save className="w-4 h-4" />}>
                    Save as Amended
                  </Button>
                  <Button size="sm" loading={saving} onClick={handleSave} icon={<Check className="w-4 h-4" />}>
                    Mark Reviewed
                  </Button>
                </>
              ) : (
                <>
                  {getStatusBadge(summary.status)}
                  <Button size="sm" onClick={() => setEditing(true)} icon={<Edit3 className="w-4 h-4" />}>
                    Edit & Review
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Patient header card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <CardTitle className="text-xl">{patient?.name || 'Unknown Patient'}</CardTitle>
                  {patient && (
                    <span className="text-sm text-muted-foreground px-2 py-0.5 rounded bg-muted">
                      {patient.age}y, {patient.gender}
                    </span>
                  )}
                  {isAyush ? (
                    <Badge variant="priority"><Sparkles className="w-3 h-3" /> AYUSH</Badge>
                  ) : (
                    <Badge variant="secondary"><Heart className="w-3 h-3" /> Allopathic</Badge>
                  )}
                  {session.red_flag_triggered && (
                    <Badge variant="emergency"><AlertTriangle className="w-3 h-3" /> Emergency Flag</Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  {patient?.abha_id && <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> ABHA: {patient.abha_id}</span>}
                  {patient?.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {patient.phone}</span>}
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(session.created_at)}</span>
                  <span className="flex items-center gap-1"><ListChecks className="w-3 h-3" /> {responses.length} responses</span>
                  <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {documents.length} documents</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Red flag alert */}
        {session.red_flag_triggered && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 mb-6" role="alert">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
            <div>
              <p className="font-medium text-destructive">Emergency Symptom Flagged</p>
              <p className="text-sm text-muted-foreground">{session.red_flag_reason}</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Summary sections */}
          <div className="lg:col-span-2 space-y-4">
            {summarySections.map((section) => {
              const Icon = section.icon;
              const value = currentValue(section.field);
              return (
                <Card key={section.field}>
                  <CardContent className="pt-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground mb-2">{section.label}</p>
                        {editing ? (
                          <Textarea
                            className="min-h-[100px] resize-y"
                            value={value}
                            onChange={(e) => setEditedFields((prev) => ({ ...prev, [section.field]: e.target.value }))}
                            placeholder={`Enter ${section.label.toLowerCase()}...`}
                          />
                        ) : (
                          <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap break-words">
                            {value || 'Not reported'}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Physician notes */}
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Edit3 className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground mb-2">Physician Notes</p>
                    {editing ? (
                      <Textarea
                        className="min-h-[100px] resize-y"
                        placeholder="Add your clinical notes, assessment, or plan..."
                        value={editedFields.physician_notes ?? summary.physician_notes ?? ''}
                        onChange={(e) => setEditedFields((prev) => ({ ...prev, physician_notes: e.target.value }))}
                      />
                    ) : (
                      <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap break-words">
                        {summary.physician_notes || 'No notes added yet.'}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: documents, raw responses, review status */}
          <div className="space-y-4">
            {/* Documents */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <CardTitle className="text-sm">Documents ({documents.length})</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No documents uploaded.</p>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="truncate flex-1 text-sm text-foreground">{doc.filename}</span>
                        <Badge variant="secondary" className="text-xs">
                          {doc.doc_type.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Raw responses */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-primary" />
                  <CardTitle className="text-sm">Raw Responses ({responses.length})</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {responses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No responses recorded.</p>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {responses.map((r) => (
                      <div key={r.id} className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">{r.question_text}</p>
                        <p className="text-sm text-foreground leading-relaxed break-words">{r.answer || 'Not answered'}</p>
                        {r.answer_mode && (
                          <span className="text-[10px] text-muted-foreground">via {r.answer_mode}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Review status */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <CardTitle className="text-sm">Review Status</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="text-foreground capitalize">{summary.status.replace('_', ' ')}</span>
                  </div>
                  {summary.physician_id && profile && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Reviewed by</span>
                      <span className="text-foreground font-medium">{profile.name}</span>
                    </div>
                  )}
                  {summary.reviewed_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Reviewed at</span>
                      <span className="text-foreground">{formatDate(summary.reviewed_at)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-muted-foreground">Created</span>
                    <span className="text-foreground">{formatDate(summary.created_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}