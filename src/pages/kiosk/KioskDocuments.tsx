import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, Upload, FileText, Trash2, ScanLine,
  Pill, FlaskConical, FileSpreadsheet, Image, AlertCircle, Check,
} from 'lucide-react';
import { KioskLayout } from '@/components/kiosk/KioskLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { useKiosk } from '@/hooks/useKiosk';
import { supabase } from '@/lib/supabase';
import { errorMessage } from '@/lib/errors';
import type { DocType, DocumentRecord } from '@/types';

export default function KioskDocuments() {
  const navigate = useNavigate();
  const toast = useToast();
  const { session } = useKiosk();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  if (!session) {
    navigate('/kiosk/mode');
    return null;
  }

  const docTypeOptions: { type: DocType; label: string; icon: typeof FileText }[] = [
    { type: 'prescription', label: 'Prescription', icon: FileText },
    { type: 'lab_report', label: 'Lab Report', icon: FlaskConical },
    { type: 'discharge_summary', label: 'Discharge Summary', icon: FileSpreadsheet },
    { type: 'imaging', label: 'Imaging', icon: Image },
    { type: 'other', label: 'Other', icon: FileText },
  ];

  const uploadFile = async (file: File, docType: DocType) => {
    if (!session) return;
    setUploading(true);

    try {
      const ext = file.name.split('.').pop();
      const fileName = `${session.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('medical-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data, error } = await supabase
        .from('documents')
        .insert({
          session_id: session.id,
          filename: file.name,
          doc_type: docType,
          file_size: file.size,
          mime_type: file.type,
          storage_path: fileName,
          upload_order: documents.length,
        })
        .select()
        .single();

      if (error) throw error;
      setDocuments((prev) => [...prev, data]);
      toast.success('Document uploaded', `${file.name} has been digitized.`);
    } catch (err: any) {
      toast.error('Upload failed', err.message || 'Could not upload the file.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File too large', `${file.name} exceeds 10MB limit.`);
        continue;
      }
      // Auto-detect type from filename
      const name = file.name.toLowerCase();
      let docType: DocType = 'other';
      if (name.includes('prescription') || name.includes('rx')) docType = 'prescription';
      else if (name.includes('lab') || name.includes('report') || name.includes('test')) docType = 'lab_report';
      else if (name.includes('discharge') || name.includes('summary')) docType = 'discharge_summary';
      else if (name.includes('scan') || name.includes('xray') || name.includes('mri') || name.includes('ct')) docType = 'imaging';

      await uploadFile(file, docType);
    }
  }, [session, documents.length]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDelete = async (doc: DocumentRecord) => {
    try {
      if (doc.storage_path) {
        await supabase.storage.from('medical-documents').remove([doc.storage_path]);
      }
      await supabase.from('documents').delete().eq('id', doc.id);
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      toast.info('Document removed', `${doc.filename} has been deleted.`);
    } catch (err) {
      toast.error('Failed to delete', errorMessage(err));
    }
  };

  const handleContinue = () => {
    navigate('/kiosk/summary');
  };

  const docIcons: Record<DocType, typeof FileText> = {
    prescription: Pill,
    lab_report: FlaskConical,
    discharge_summary: FileSpreadsheet,
    imaging: Image,
    other: FileText,
  };

  return (
    <KioskLayout step={5} backLink="/kiosk/history" title="Upload Medical Documents" subtitle="Scan your previous prescriptions, lab reports, and discharge summaries">
      <div className="space-y-5 animate-slide-up">
        {/* Upload zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`Card p-8 border-2 border-dashed transition-all duration-300 cursor-pointer ${dragActive ? 'border-primary/50 bg-primary/5' : 'border-border'}`}
        >
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-1 text-foreground">Drag & drop or tap to upload</h3>
            <p className="text-sm text-muted-foreground mb-4">PDF, JPG, PNG up to 10MB each</p>
            <label className="inline-block">
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
              <Button loading={uploading} icon={<ScanLine className="w-5 h-5" />}>
                Select Files
              </Button>
            </label>
          </div>
        </div>

        {/* Uploaded documents */}
        {documents.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Uploaded Documents ({documents.length})</h3>
              <Badge variant="success"><Check className="w-3 h-3" /> Digitized</Badge>
            </div>
            {documents.map((doc, i) => {
              const Icon = docIcons[doc.doc_type];
              return (
                <Card key={doc.id} className="flex items-center gap-4 p-4 animate-slide-up">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-foreground">{doc.filename}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{doc.doc_type.replace('_', ' ')}</Badge>
                      <span className="text-xs text-muted-foreground">{(doc.file_size! / 1024).toFixed(0)} KB</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(doc)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </Card>
              );
            })}
          </div>
        )}

        {/* Document type guide */}
        {documents.length === 0 && (
          <Card className="p-5">
            <p className="text-xs text-muted-foreground mb-3">Supported document types:</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {docTypeOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <div key={opt.type} className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="text-xs text-muted-foreground text-center">{opt.label}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Documents will be digitized and organized chronologically for your doctor. You can skip this step if you don't have any.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/kiosk/history')} icon={<ArrowLeft className="w-5 h-5" />}>
            Back
          </Button>
          <Button fullWidth size="lg" onClick={handleContinue} icon={<ArrowRight className="w-5 h-5" />}>
            {documents.length > 0 ? 'Generate Summary' : 'Skip & Generate Summary'}
          </Button>
        </div>
      </div>
    </KioskLayout>
  );
}