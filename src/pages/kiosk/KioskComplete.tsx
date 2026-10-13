import { Link } from 'react-router-dom';
import { CheckCircle2, Heart, ArrowRight, Home, FileText, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useKiosk } from '@/hooks/useKiosk';

export default function KioskComplete() {
  const { patient, session, mode } = useKiosk();

  if (!patient || !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Link to="/"><Button>Return Home</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12 relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-xl w-full text-center animate-scale-in">
        <div className="w-20 h-20 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>

        <h1 className="font-display text-3xl md:text-4xl font-semibold mb-3 text-foreground">Check-In Complete!</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Your clinical history has been sent to your doctor. When you enter the consultation room,
          your doctor will already have your complete summary ready.
        </p>

        <Card className="text-left mb-8">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{patient.name}</p>
                <p className="text-xs text-muted-foreground">{patient.age}y, {patient.gender}</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Consultation Type</span>
                <Badge variant="secondary">{mode === 'ayush' ? 'Ayurvedic (AYUSH)' : 'Allopathic'}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Session Status</span>
                <Badge variant="success">Completed</Badge>
              </div>
              {session.red_flag_triggered && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Priority Alert</span>
                  <Badge variant="emergency">Emergency Flagged</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8">
          <FileText className="w-4 h-4 flex-shrink-0" />
          <span>Summary sent to physician dashboard — ready for consultation</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">
          <Link to="/kiosk">
            <Button variant="secondary" className="w-full sm:w-auto" icon={<Home className="w-4 h-4" />}>
              New Check-In
            </Button>
          </Link>
          <Link to="/physician/login">
            <Button variant="secondary" className="w-full sm:w-auto" icon={<Stethoscope className="w-4 h-4" />}>
              View on Physician Dashboard
            </Button>
          </Link>
          <Link to="/">
            <Button className="w-full sm:w-auto" icon={<ArrowRight className="w-4 h-4" />}>
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}