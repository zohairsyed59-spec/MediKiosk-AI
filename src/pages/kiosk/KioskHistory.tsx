import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, Mic, MicOff, Check, AlertTriangle,
  Volume2, ChevronRight, ChevronLeft, ListChecks, Send,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { KioskLayout } from '@/components/kiosk/KioskLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useKiosk } from '@/hooks/useKiosk';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { supabase } from '@/lib/supabase';
import { getSections, type ClinicalQuestion, type QuestionOption } from '@/types/clinical';
import type { AnswerMode } from '@/types';

export default function KioskHistory() {
  const navigate = useNavigate();
  const toast = useToast();
  const { session, mode, patient } = useKiosk();
  const voice = useVoiceInput();

  const sections = useMemo(() => getSections(mode), [mode]);
  const [sectionIdx, setSectionIdx] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { value: string; mode: AnswerMode }>>({});
  const [multiSelected, setMultiSelected] = useState<string[]>([]);
  const [showRedFlag, setShowRedFlag] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSectionOverview, setShowSectionOverview] = useState(true);

  if (!session) {
    navigate('/kiosk/mode');
    return null;
  }

  const currentSection = sections[sectionIdx];
  const currentQuestion: ClinicalQuestion | undefined = currentSection?.questions[questionIdx];
  const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0);
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / totalQuestions) * 100);

  const getIcon = (name: string) => {
    const Icon = (LucideIcons as any)[name];
    return Icon ? <Icon className="w-5 h-5" /> : <ListChecks className="w-5 h-5" />;
  };

  const handleAnswer = useCallback((value: string, answerMode: AnswerMode) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.key]: { value, mode: answerMode } }));

    // Check for red flags
    if (currentQuestion.redFlagCheck) {
      const flag = currentQuestion.redFlagCheck(value);
      if (flag) {
        setShowRedFlag(flag);
      }
    }
  }, [currentQuestion]);

  const handleOptionSelect = (opt: QuestionOption) => {
    if (currentQuestion?.type === 'multi') {
      setMultiSelected((prev) => {
        if (prev.includes(opt.value)) return prev.filter((v) => v !== opt.value);
        return [...prev, opt.value];
      });
    } else {
      handleAnswer(opt.value, 'touch');
    }
  };

  const handleConfirmMulti = () => {
    if (multiSelected.length === 0) {
      toast.warning('Please select at least one option', 'Or select "None" if applicable.');
      return;
    }
    handleAnswer(multiSelected.join(', '), 'touch');
    setMultiSelected([]);
  };

  const handleVoiceConfirm = () => {
    if (voice.transcript.trim()) {
      handleAnswer(voice.transcript.trim(), 'voice');
      voice.reset();
    }
  };

  const isAnswered = currentQuestion ? !!answers[currentQuestion.key] : false;
  const isMultiMode = currentQuestion?.type === 'multi';
  const currentAnswer = currentQuestion ? answers[currentQuestion.key] : undefined;

  const goNext = async () => {
    if (!currentQuestion) return;

    // Save response to database
    try {
      await supabase.from('history_responses').insert({
        session_id: session.id,
        section: currentQuestion.section,
        question_key: currentQuestion.key,
        question_text: currentQuestion.question,
        answer: answers[currentQuestion.key]?.value ?? null,
        answer_mode: answers[currentQuestion.key]?.mode ?? null,
      });
    } catch (err) {
      console.error('Failed to save response:', err);
    }

    // Check for next question in current section
    if (questionIdx < currentSection.questions.length - 1) {
      setQuestionIdx(questionIdx + 1);
      setMultiSelected([]);
      voice.reset();
      return;
    }

    // Move to next section
    if (sectionIdx < sections.length - 1) {
      setSectionIdx(sectionIdx + 1);
      setQuestionIdx(0);
      setMultiSelected([]);
      setShowSectionOverview(true);
      voice.reset();
      return;
    }

    // All sections complete — go to documents
    navigate('/kiosk/documents');
  };

  const goBack = () => {
    if (questionIdx > 0) {
      setQuestionIdx(questionIdx - 1);
    } else if (sectionIdx > 0) {
      const prevSection = sections[sectionIdx - 1];
      setSectionIdx(sectionIdx - 1);
      setQuestionIdx(prevSection.questions.length - 1);
    } else {
      navigate('/kiosk/mode');
    }
    setMultiSelected([]);
    voice.reset();
  };

  const handleRedFlagConfirm = async () => {
    if (!session || !showRedFlag) return;

    try {
      await supabase
        .from('sessions')
        .update({
          red_flag_triggered: true,
          red_flag_reason: showRedFlag,
        })
        .eq('id', session.id);
    } catch (err) {
      console.error('Failed to update red flag:', err);
    }

    toast.warning('Emergency alert sent', 'Triage staff have been notified. Please proceed.');
    setShowRedFlag(null);
  };

  if (showSectionOverview) {
    return (
      <KioskLayout step={4} backLink="/kiosk/mode" title={currentSection.title} subtitle={currentSection.description}>
        <div className="space-y-5 animate-slide-up">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              {getIcon(currentSection.icon)}
            </div>
            <h3 className="font-display text-xl font-semibold mb-2 text-foreground">{currentSection.title}</h3>
            <p className="text-sm text-muted-foreground mb-6">{currentSection.description}</p>
            <div className="flex items-center justify-center gap-2 mb-6">
              <Badge variant="secondary">Section {sectionIdx + 1} of {sections.length}</Badge>
              <Badge variant="outline">{currentSection.questions.length} questions</Badge>
            </div>
            <Button size="lg" onClick={() => setShowSectionOverview(false)} icon={<ArrowRight className="w-5 h-5" />}>
              Begin Section
            </Button>
          </Card>

          <Card className="p-5">
            <p className="text-xs text-muted-foreground mb-3">All sections in this interview:</p>
            <div className="space-y-2">
              {sections.map((s, i) => (
                <div key={s.id} className={`flex items-center gap-3 p-2 rounded-lg text-sm ${i === sectionIdx ? 'bg-primary/10 text-foreground' : 'text-muted-foreground'}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${i < sectionIdx ? 'bg-emerald-500/20 text-emerald-500' : i === sectionIdx ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {i < sectionIdx ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span>{s.title}</span>
                  {i < sectionIdx && <Badge variant="success" className="ml-auto">Done</Badge>}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </KioskLayout>
    );
  }

  return (
    <KioskLayout step={4} backLink="/kiosk/mode">
      {/* Progress bar */}
      <div className="mb-6 animate-fade-in">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              {getIcon(currentSection.icon)}
            </div>
            <div>
              <p className="font-semibold text-foreground">{currentSection.title}</p>
              <p className="text-xs text-muted-foreground">Question {questionIdx + 1} of {currentSection.questions.length}</p>
            </div>
          </div>
          <span className="text-sm text-muted-foreground">{progress}% complete</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-teal-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question card */}
      <div className="animate-slide-up" key={`${sectionIdx}-${questionIdx}`}>
        <Card className="p-6">
          <div className="flex items-start gap-2 mb-6">
            {currentQuestion?.required && <span className="text-primary text-lg">*</span>}
            <h2 className="font-display text-xl md:text-2xl font-semibold flex-1 text-foreground">{currentQuestion?.question}</h2>
          </div>

          {/* Answer mode indicator */}
          {currentAnswer && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-emerald-700">Answered via {currentAnswer.mode === 'voice' ? 'voice' : 'touch'}</span>
            </div>
          )}

          {/* Options */}
          {currentQuestion?.type === 'choice' && currentQuestion.options && (
            <div className="grid sm:grid-cols-2 gap-3">
              {currentQuestion.options.map((opt) => {
                const isSelected = currentAnswer?.value === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleOptionSelect(opt)}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 text-left ${
                      isSelected
                        ? 'bg-primary/10 border-primary/50 text-foreground'
                        : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted hover:border-border/50'
                    }`}
                  >
                    {opt.icon && <span className="text-primary">{getIcon(opt.icon)}</span>}
                    <span className="text-sm font-medium flex-1">{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Multi-select */}
          {currentQuestion?.type === 'multi' && currentQuestion.options && (
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                {currentQuestion.options.map((opt) => {
                  const isSelected = multiSelected.includes(opt.value);
                  const wasSelected = currentAnswer?.value?.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        if (currentAnswer) {
                          // Re-editing: start from existing
                          const existing = currentAnswer.value.split(', ');
                          setMultiSelected(existing);
                          setAnswers((prev) => {
                            const copy = { ...prev };
                            delete copy[currentQuestion.key];
                            return copy;
                          });
                        }
                        handleOptionSelect(opt);
                      }}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 text-left ${
                        isSelected || wasSelected
                          ? 'bg-primary/10 border-primary/50 text-foreground'
                          : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted hover:border-border/50'
                      }`}
                    >
                      {opt.icon && <span className="text-primary">{getIcon(opt.icon)}</span>}
                      <span className="text-sm font-medium flex-1">{opt.label}</span>
                      {(isSelected || wasSelected) && <Check className="w-4 h-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
              {!currentAnswer && (
                <Button fullWidth onClick={handleConfirmMulti} icon={<Check className="w-5 h-5" />}>
                  Confirm Selection ({multiSelected.length})
                </Button>
              )}
            </div>
          )}

          {/* Voice input section */}
          <div className="mt-5 pt-5 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <Volume2 className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Prefer to speak? Use voice input</span>
            </div>

            {voice.status === 'unsupported' ? (
              <p className="text-xs text-muted-foreground">Voice input is not available in this browser. Please use the touch options above.</p>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={voice.status === 'listening' ? voice.stop : voice.start}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 ${
                    voice.status === 'listening'
                      ? 'bg-destructive/10 border-destructive/40 text-destructive'
                      : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {voice.status === 'listening' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span className="text-sm">{voice.status === 'listening' ? 'Stop Recording' : 'Start Speaking'}</span>
                </button>

                {voice.status === 'listening' && (
                  <div className="flex items-center gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-1 bg-primary rounded-full voice-wave-bar"
                        style={{ height: '20px', animationDelay: `${i * 100}ms` }}
                      />
                    ))}
                  </div>
                )}

                {voice.transcript && (
                  <div className="flex-1 flex items-center gap-2">
                    <p className="text-sm text-muted-foreground italic flex-1 truncate">"{voice.transcript}"</p>
                    <Button size="sm" onClick={handleVoiceConfirm} icon={<Check className="w-4 h-4" />}>
                      Use
                    </Button>
                  </div>
                )}

                {voice.error && <p className="text-xs text-destructive">{voice.error}</p>}
              </div>
            )}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 animate-slide-up">
          <Button variant="ghost" onClick={goBack} icon={<ArrowLeft className="w-5 h-5" />}>
            Back
          </Button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Section {sectionIdx + 1}/{sections.length}</span>
            <ChevronRight className="w-3 h-3" />
            <span>Q {questionIdx + 1}/{currentSection.questions.length}</span>
          </div>
          <Button onClick={goNext} disabled={!isAnswered && currentQuestion?.required} icon={<ArrowRight className="w-5 h-5" />}>
            {sectionIdx === sections.length - 1 && questionIdx === currentSection.questions.length - 1 ? 'Finish Interview' : 'Next'}
          </Button>
        </div>

        {/* Red Flag Modal */}
        <Modal open={!!showRedFlag} onClose={() => setShowRedFlag(null)} title="Emergency Alert" size="sm">
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-destructive/15 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2 text-foreground">Emergency Symptom Detected</h3>
            <p className="text-sm text-muted-foreground mb-6">{showRedFlag}</p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setShowRedFlag(null)}>Dismiss</Button>
              <Button onClick={handleRedFlagConfirm} icon={<Send className="w-4 h-4" />}>Alert Triage Staff</Button>
            </div>
          </div>
        </Modal>
      </div>
    </KioskLayout>
  );
}