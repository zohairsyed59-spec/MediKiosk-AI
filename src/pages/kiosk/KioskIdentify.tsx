import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Calendar, Heart, ArrowRight, AlertCircle, Shield } from 'lucide-react';
import { KioskLayout } from '@/components/kiosk/KioskLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { useKiosk } from '@/hooks/useKiosk';
import { supabase } from '@/lib/supabase';
import { errorMessage } from '@/lib/errors';
import { languageLabels } from '@/types/clinical';
import type { Language, Gender } from '@/types';

export default function KioskIdentify() {
  const navigate = useNavigate();
  const toast = useToast();
  const { setPatient, setLanguage } = useKiosk();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [phone, setPhone] = useState('');
  const [abhaId, setAbhaId] = useState('');
  const [selectedLang, setSelectedLang] = useState<Language>('en');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Please enter your name';
    if (!age || isNaN(Number(age)) || Number(age) < 1 || Number(age) > 149) e.age = 'Please enter a valid age (1-149)';
    if (!gender) e.gender = 'Please select your gender';
    if (phone && !/^[0-9+\-\s]{10,15}$/.test(phone)) e.phone = 'Please enter a valid phone number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .insert({
          name: name.trim(),
          age: Number(age),
          gender,
          phone: phone.trim() || null,
          abha_id: abhaId.trim() || null,
          language: selectedLang,
        })
        .select()
        .single();

      if (error) throw error;
      setPatient(data);
      setLanguage(selectedLang);
      toast.success('Patient registered', 'Your details have been saved securely.');
      navigate('/kiosk/consent');
    } catch (err) {
      console.error('Patient registration failed:', err);
      toast.error('Registration failed', errorMessage(err, 'Please try again or ask for assistance.'));
    } finally {
      setLoading(false);
    }
  };

  const langOptions = Object.entries(languageLabels).map(([value, label]) => ({ value, label }));

  return (
    <KioskLayout step={1} backLink="/kiosk" title="Patient Identification" subtitle="Enter your details or ask the attendant for help">
      <div className="space-y-5 animate-slide-up">
        <Card className="p-6 space-y-5">
          <div className="flex items-center gap-2 text-sm text-primary mb-2">
            <Shield className="w-4 h-4" />
            Your data is encrypted and protected under DPDP Act 2023
          </div>

          <Input
            label="Full Name *"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            icon={<User className="w-4 h-4" />}
            maxLength={100}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Age *"
              type="number"
              placeholder="e.g. 45"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              error={errors.age}
              icon={<Calendar className="w-4 h-4" />}
              min={1}
              max={149}
            />
            <Select
              label="Gender *"
              value={gender}
              onChange={(v: string) => setGender(v as Gender)}
              options={[
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' },
                { label: 'Other', value: 'other' },
              ]}
              placeholder="Select gender"
              error={errors.gender}
            />
          </div>

          <Input
            label="Phone Number (optional)"
            placeholder="10-digit mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={errors.phone}
            icon={<Phone className="w-4 h-4" />}
            maxLength={15}
          />

          <Input
            label="ABHA ID (optional)"
            placeholder="e.g. 14-digit ABHA number"
            value={abhaId}
            onChange={(e) => setAbhaId(e.target.value)}
            icon={<Heart className="w-4 h-4" />}
            maxLength={20}
          />

          <Select
            label="Preferred Language *"
            value={selectedLang}
            onChange={(v: string) => setSelectedLang(v as Language)}
            options={langOptions}
          />
        </Card>

        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            Please provide accurate information. This will be shared with your doctor to help them provide better care.
          </p>
        </div>

        <Button fullWidth size="lg" loading={loading} onClick={handleSubmit} icon={<ArrowRight className="w-5 h-5" />}>
          Continue to Consent
        </Button>
      </div>
    </KioskLayout>
  );
}