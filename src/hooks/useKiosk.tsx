import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Patient, Session, SessionMode, Language } from '@/types';

interface KioskSession {
  patient: Patient | null;
  session: Session | null;
  language: Language;
  mode: SessionMode;
}

interface KioskContextValue extends KioskSession {
  setPatient: (p: Patient | null) => void;
  setSession: (s: Session | null) => void;
  setLanguage: (l: Language) => void;
  setMode: (m: SessionMode) => void;
  reset: () => void;
}

const KioskContext = createContext<KioskContextValue | null>(null);

export function KioskProvider({ children }: { children: ReactNode }) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [mode, setMode] = useState<SessionMode>('allopathic');

  const reset = () => {
    setPatient(null);
    setSession(null);
    setLanguage('en');
    setMode('allopathic');
  };

  return (
    <KioskContext.Provider value={{ patient, session, language, mode, setPatient, setSession, setLanguage, setMode, reset }}>
      {children}
    </KioskContext.Provider>
  );
}

export function useKiosk() {
  const ctx = useContext(KioskContext);
  if (!ctx) throw new Error('useKiosk must be used within KioskProvider');
  return ctx;
}
