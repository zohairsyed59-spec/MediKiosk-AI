import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, ArrowLeft, Check, Lock, Languages } from 'lucide-react';
import { KioskLayout } from '@/components/kiosk/KioskLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { useKiosk } from '@/hooks/useKiosk';
import { supabase } from '@/lib/supabase';
import { errorMessage } from '@/lib/errors';
import { languageLabels } from '@/types/clinical';
import type { Language } from '@/types';

const consentTexts: Record<Language, string> = {
  en: 'I consent to MediKiosk AI collecting my medical history through voice and touch interaction. I consent to my physical medical documents being scanned and digitized. I understand my data will be shared with my treating physician for clinical care. I understand my data is protected under the Digital Personal Data Protection Act 2023. I can revoke this consent at any time and request data deletion. Temporary session data will be cleared after my consultation is complete.',
  hi: 'मैं मेडिकियोस्क एआई को अपनी चिकित्सा इतिहास आवाज और टच के माध्यम से एकत्र करने की सहमति देता हूं। मैं अपनी चिकित्सा दस्तावेजों को स्कैन और डिजिटल करने की सहमति देता हूं। मैं समझता हूं कि मेरा डेटा मेरे चिकित्सक के साथ साझा किया जाएगा। मैं अपनी सहमति किसी भी समय वापस ले सकता हूं।',
  ta: 'நான் மெடிகியோஸ்க் AI எனது மருத்துவ வரலாற்றை குரல் மற்றும் தொடுதல் மூலம் சேகரிக்க ஒப்புக்கொள்கிறேன். எனது தரவு எனது மருத்துவருடன் பகிரப்படும் என்பதை நான் புரிந்துகொள்கிறேன்.',
  te: 'నేను మెడికియోస్క్ AI నా వైద్య చరిత్రను సేకరించడానికి అంగీకరిస్తున్నాను. నా డేటా నా వైద్యుడితో పంచుకోబడుతుందని నేను అర్థం చేసుకుంటున్నాను.',
  kn: 'ನಾನು ಮೆಡಿಕಿಯೋಸ್ಕ್ AI ನನ್ನ ವೈದ್ಯಕೀಯ ಇತಿಹಾಸವನ್ನು ಸಂಗ್ರಹಿಸಲು ಒಪ್ಪುತ್ತೇನೆ. ನನ್ನ ದತ್ತಾಂಶ ನನ್ನ ವೈದ್ಯರೊಂದಿಗೆ ಹಂಚಲ್ಪಡುತ್ತದೆ ಎಂದು ನಾನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುತ್ತೇನೆ.',
  bn: 'আমি মেডিকিয়স্ক এআই-কে আমার চিকিৎসা ইতিহাস সংগ্রহ করতে সম্মতি দিচ্ছি। আমার ডেটা আমার চিকিৎসকের সাথে শেয়ার করা হবে বলে আমি বুঝতে পারছি।',
  mr: 'मी मेडिकियोस्क एआयला माझा वैद्यकीय इतिहास गोळा करण्यासाठी संमती देत आहे. माझा डेटा माझ्या डॉक्टरांसोबत शेअर केला जाईल असे मला समजते.',
  gu: 'હું મેડિકિયોસ્ક એઆઈને મારો તબીબી ઇતિહાસ એકત્ર કરવા માટે સંમતિ આપું છું. મારો ડેટા મારા ડૉક્ટર સાથે શેર કરવામાં આવશે તે હું સમજું છું.',
};

export default function KioskConsent() {
  const navigate = useNavigate();
  const toast = useToast();
  const { patient, setSession } = useKiosk();
  const [consentGiven, setConsentGiven] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!patient) {
    navigate('/kiosk/identify');
    return null;
  }

  const handleCreateSession = async () => {
    if (!consentGiven) {
      toast.error('Consent required', 'Please agree to the consent terms to continue.');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          patient_id: patient.id,
          status: 'in_progress',
          language: patient.language,
          consent_given: true,
        })
        .select()
        .single();

      if (error) throw error;
      setSession(data);
      toast.success('Consent recorded', 'Your session has been started securely.');
      navigate('/kiosk/mode');
    } catch (err) {
      toast.error('Failed to start session', errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const consentItems = [
    'I consent to MediKiosk AI collecting my medical history through voice and touch interaction.',
    'I consent to my physical medical documents being scanned and digitized.',
    'I understand my data will be shared with my treating physician for clinical care.',
    'I understand my data is protected under the Digital Personal Data Protection Act 2023.',
    'I can revoke this consent at any time and request data deletion.',
    'Temporary session data will be cleared after my consultation is complete.',
  ];

  return (
    <KioskLayout step={2} backLink="/kiosk/identify" title="Consent & Privacy" subtitle="Your data is protected. Please review and agree to continue.">
      <div className="space-y-5 animate-slide-up">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Informed Consent</h3>
              <p className="text-xs text-muted-foreground">ABDM Consent Framework Compliant</p>
            </div>
          </div>

          {/* Consent text in the patient's preferred language */}
          <div className="rounded-xl bg-primary/5 border border-primary/15 p-4 mb-5">
            <div className="flex items-center gap-2 text-xs font-medium text-primary mb-2">
              <Languages className="w-3.5 h-3.5" />
              Consent in {languageLabels[patient.language]}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{consentTexts[patient.language]}</p>
          </div>

          <div className="space-y-3 mb-5">
            {consentItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <label className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border cursor-pointer hover:border-primary/30 transition-colors">
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded accent-primary cursor-pointer"
            />
            <span className="text-sm text-foreground">
              I have understood and agree to the above consent terms. I give permission for my health data to be collected and shared with my doctor.
            </span>
          </label>
        </Card>

        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
          <Lock className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <p className="text-xs text-emerald-700">
            All data is encrypted in transit and at rest. Session data is cleared after your consultation.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/kiosk/identify')} icon={<ArrowLeft className="w-5 h-5" />}>
            Back
          </Button>
          <Button fullWidth size="lg" loading={loading} onClick={handleCreateSession} disabled={!consentGiven} icon={<ArrowRight className="w-5 h-5" />}>
            I Agree — Continue
          </Button>
        </div>
      </div>
    </KioskLayout>
  );
}