import { useNavigate } from 'react-router-dom';
import { Stethoscope, Leaf, ArrowRight, ArrowLeft, Heart, Scan } from 'lucide-react';
import { KioskLayout } from '@/components/kiosk/KioskLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useKiosk } from '@/hooks/useKiosk';
import { useToast } from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase';
import { errorMessage } from '@/lib/errors';
import { useState } from 'react';
import type { SessionMode } from '@/types';

export default function KioskMode() {
  const navigate = useNavigate();
  const toast = useToast();
  const { session, mode, setMode } = useKiosk();
  const [loading, setLoading] = useState(false);

  if (!session) {
    navigate('/kiosk/consent');
    return null;
  }

  const handleSelect = (selectedMode: SessionMode) => {
    setMode(selectedMode);
  };

  const handleContinue = async () => {
    if (!mode) {
      toast.error('Please select a mode', 'Choose Allopathic or AYUSH to continue.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ mode })
        .eq('id', session.id);

      if (error) throw error;
      navigate('/kiosk/history');
    } catch (err) {
      toast.error('Failed to save selection', errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KioskLayout step={3} backLink="/kiosk/consent" title="Select Consultation Type" subtitle="Choose the type of healthcare you are visiting for today">
      <div className="space-y-5 animate-slide-up">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Allopathic */}
          <Card
            hover
            className={`cursor-pointer transition-all duration-300 ${mode === 'allopathic' ? 'border-primary/50 bg-primary/5' : ''}`}
          >
            <button onClick={() => handleSelect('allopathic')} className="w-full text-left">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-primary-foreground" />
                </div>
                {mode === 'allopathic' && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Heart className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Allopathic (Modern Medicine)</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Standard clinical history including chief complaint, HPI, past history, drug/allergy, family, personal, and review of systems.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">SOCRATES Framework</Badge>
                <Badge variant="outline">8 Sections</Badge>
              </div>
            </button>
          </Card>

          {/* AYUSH */}
          <Card
            hover
            className={`cursor-pointer transition-all duration-300 ${mode === 'ayush' ? 'border-primary/50 bg-primary/5' : ''}`}
          >
            <button onClick={() => handleSelect('ayush')} className="w-full text-left">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                {mode === 'ayush' && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Heart className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">AYUSH (Ayurvedic)</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Extended Ayurvedic assessment including Dashavidha Pariksha, Prakriti, Agni, Koshtha, Nidana, and Ahara-Vihara.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="priority">Dashavidha Pariksha</Badge>
                <Badge variant="outline">6 Sections</Badge>
              </div>
            </button>
          </Card>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
          <Scan className="w-5 h-5 text-primary flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            After the history interview, you can scan your previous medical documents regardless of the consultation type.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/kiosk/consent')} icon={<ArrowLeft className="w-5 h-5" />}>
            Back
          </Button>
          <Button fullWidth size="lg" loading={loading} onClick={handleContinue} disabled={!mode} icon={<ArrowRight className="w-5 h-5" />}>
            Start History Interview
          </Button>
        </div>
      </div>
    </KioskLayout>
  );
}