import { Link } from 'react-router-dom';
import { Heart, ArrowRight, Mic, ScanLine, FileText, Shield, Stethoscope, Languages, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function KioskStart() {
  const capabilities = [
    { icon: Mic, title: 'Speak in your language', desc: 'Voice or touch — your choice' },
    { icon: ScanLine, title: 'Scan your documents', desc: 'Prescriptions, reports, summaries' },
    { icon: FileText, title: 'Get a ready summary', desc: 'Doctor sees your full history' },
    { icon: Zap, title: 'Emergency detection', desc: 'Urgent symptoms flagged instantly' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-foreground">
                MediKiosk<span className="text-primary"> AI</span>
              </span>
            </Link>
            <Link to="/physician/login">
              <Button variant="ghost" size="sm" icon={<Stethoscope className="w-4 h-4" />}>Physician</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center max-w-2xl mb-10 animate-slide-up">
          <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-semibold mb-4 text-foreground">Welcome to MediKiosk</h1>
          <p className="text-lg text-muted-foreground mb-2">
            Record your medical history before seeing the doctor.
          </p>
          <p className="text-sm text-muted-foreground">
            Speak in your language, scan your documents, and get a complete summary ready for your doctor.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl w-full mb-10">
          {capabilities.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <Card key={i} className="text-center p-4 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm font-semibold mb-1 text-foreground">{cap.title}</p>
                <p className="text-xs text-muted-foreground">{cap.desc}</p>
              </Card>
            );
          })}
        </div>

        <Link to="/kiosk/identify">
          <Button size="lg" className="text-base px-10 py-4 text-lg" icon={<ArrowRight className="w-5 h-5" />}>
            Begin Check-In
          </Button>
        </Link>

        <div className="flex items-center gap-4 mt-8 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Languages className="w-3 h-3" /> 8 Languages</span>
          <span className="flex items-center gap-1.5"><Shield className="w-3 h-3" /> Secure & Private</span>
        </div>
      </main>
    </div>
  );
}