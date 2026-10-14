import { Link } from "react-router-dom";
import {
  Stethoscope,
  Mic,
  ScanLine,
  FileText,
  ShieldCheck,
  Heart,
  ArrowRight,
  Activity,
  Brain,
  Clock,
  CheckCircle2,
  Languages,
  Hospital,
  UserCog,
  Zap,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Separator } from "@/components/ui/Separator";

export default function LandingPage() {
  const features = [
    {
      icon: Mic,
      title: "Conversational Voice + Touch History",
      description:
        "Patients speak naturally in their preferred language or tap through guided options. The AI engine asks intelligent follow-up questions using the SOCRATES clinical framework.",
    },
    {
      icon: ScanLine,
      title: "Medical Document Digitization",
      description:
        "Upload prescriptions, lab reports, and discharge summaries. OCR extracts diagnoses, medications, and investigation values, then organizes them chronologically.",
    },
    {
      icon: FileText,
      title: "Structured Physician-Ready Summary",
      description:
        "AI synthesizes the conversation and digitized documents into a standard clinical format — chief complaint, HPI, past history, drug/allergy, family, personal, and ROS.",
    },
    {
      icon: ShieldCheck,
      title: "Consent-First Privacy & ABDM Integration",
      description:
        "Compliant with the Digital Personal Data Protection Act 2023 and ABDM consent framework. Granular, revocable consent shown in the patient's own language.",
    },
    {
      icon: Heart,
      title: "AYUSH Dashavidha Pariksha",
      description:
        "Extended Ayurvedic assessment mode captures Prakriti, Vikriti, Agni, Koshtha, Ahara-Vihara, Nidana, and Samprapti — the depth that defines personalized Ayurvedic care.",
    },
    {
      icon: Zap,
      title: "Red-Flag Emergency Detection",
      description:
        "AI flags emergency symptoms like acute chest pain with dyspnoea or stroke signs, triggering immediate priority alerts to triage staff instead of routine queueing.",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Identify",
      description:
        "Patient enters ABHA ID or registers, selects language, and grants consent in their preferred language.",
      icon: UserCog,
    },
    {
      num: "02",
      title: "Converse",
      description:
        "AI conducts adaptive voice + touch history interview. Red flags trigger priority triage.",
      icon: Mic,
    },
    {
      num: "03",
      title: "Scan",
      description:
        "Patient uploads prior prescriptions and lab reports. AI digitizes, structures, and timelines them.",
      icon: ScanLine,
    },
    {
      num: "04",
      title: "Summarize",
      description:
        "AI generates structured history summary, links to ABHA, and pushes to the hospital system.",
      icon: FileText,
    },
    {
      num: "05",
      title: "Consult",
      description:
        "Physician reviews complete history in seconds, edits/confirms, and focuses on examination and care.",
      icon: Stethoscope,
    },
  ];

  const stats = [
    { value: "70–80%", label: "of diagnoses come from history alone" },
    { value: "2–5 min", label: "average OPD consultation time in India" },
    { value: "10,000+", label: "daily OPD patients in tertiary hospitals" },
    { value: "8", label: "Indian languages supported" },
  ];

  const languages = [
    "English",
    "हिंदी",
    "தமிழ்",
    "తెలుగు",
    "ಕನ್ನಡ",
    "বাংলা",
    "मराठी",
    "ગુજરાતી",
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-body">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-foreground">
                MediKiosk<span className="text-primary"> AI</span>
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
              <a
                href="#features"
                className="hover:text-foreground transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="hover:text-foreground transition-colors"
              >
                How It Works
              </a>
              <a
                href="#impact"
                className="hover:text-foreground transition-colors"
              >
                Impact
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/physician/login">
                <Button variant="ghost" size="sm">
                  Physician Login
                </Button>
              </Link>
              <Link to="/kiosk">
                <Button size="sm">Start Kiosk</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto animate-slide-up">
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1] mb-6 text-foreground">
            Clinical history taking,
            <br />
            <span className="text-primary">reimagined for India.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
            Patients record their complete medical history through natural voice
            conversation and guided touch — in their own language — before
            entering the consultation room. Physicians get a structured,
            physician-ready summary in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/kiosk">
              <Button
                size="lg"
                className="text-base px-8 py-4"
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Start Patient Kiosk
              </Button>
            </Link>
            <Link to="/physician/login">
              <Button
                variant="secondary"
                size="lg"
                className="text-base px-8 py-4"
                icon={<Stethoscope className="w-5 h-5" />}
              >
                Physician Portal
              </Button>
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            {languages.map((lang) => (
              <span
                key={lang}
                className="text-xs text-muted-foreground px-3 py-1.5 rounded-full bg-muted border border-border"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats / Impact */}
      <section id="impact" className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <Card
              key={i}
              className="p-6 text-center animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <p className="font-display text-3xl md:text-4xl font-bold text-primary mb-2">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <Badge variant="purple" className="mb-4">
            Platform Modules
          </Badge>
          <h2 className="font-display text-3xl md:text-5xl font-semibold mb-4 text-foreground">
            Everything the first mile needs
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Four integrated AI modules that solve the history-taking bottleneck
            from patient arrival to physician screen.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Card
                key={i}
                hover
                className="animate-slide-up p-6"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="relative max-w-7xl mx-auto px-6 py-20"
      >
        <div className="text-center mb-12">
          <Badge variant="purple" className="mb-4">
            End-to-End Journey
          </Badge>
          <h2 className="font-display text-3xl md:text-5xl font-semibold mb-4 text-foreground">
            From arrival to consultation
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Five steps that turn a chaotic OPD intake into a structured clinical
            encounter.
          </p>
        </div>
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-[3rem] left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="grid md:grid-cols-5 gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className="relative flex flex-col items-center text-center animate-slide-up"
                  style={{ animationDelay: `${i * 120}ms` }}
                >
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-4 relative z-10 border-4 border-background">
                    <Icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="text-xs font-bold text-primary mb-1">
                    STEP {step.num}
                  </span>
                  <h3 className="text-base font-semibold mb-2 text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="relative max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <Badge variant="purple" className="mb-4">
            Why MediKiosk
          </Badge>
          <h2 className="font-display text-3xl md:text-5xl font-semibold mb-4 text-foreground">
            Built for the real OPD
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-destructive/10 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-destructive" />
              <h3 className="text-lg font-semibold text-foreground">
                Today's Bottleneck
              </h3>
            </div>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-0.5">—</span> 2–5 minute
                consultations force abbreviated history taking
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-0.5">—</span> Patients
                carry unstructured paper records in multiple languages
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-0.5">—</span> No mechanism
                to digitize documents before the encounter
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-0.5">—</span> Repeated
                questioning across visits, missed comorbidities
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-0.5">—</span> AYUSH depth
                assessment impossible within OPD time
              </li>
            </ul>
          </Card>
          <Card className="border-primary/20 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                With MediKiosk
              </h3>
            </div>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />{" "}
                Complete history captured before consultation begins
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />{" "}
                Documents digitized, structured, and chronologically ordered
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />{" "}
                Physician reads structured summary in seconds, edits/confirms
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />{" "}
                Full consultation time devoted to examination and counseling
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />{" "}
                AYUSH Dashavidha Pariksha captured comprehensively
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="relative max-w-7xl mx-auto px-6 py-20">
        <Card className="p-12 text-center relative overflow-hidden bg-muted/50">
          <div className="relative">
            <Brain className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4 text-foreground">
              Ready to transform OPD intake?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Start a demo kiosk session or explore the physician portal to see
              how structured history summaries appear on the consultation
              screen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/kiosk">
                <Button size="lg" icon={<ArrowRight className="w-5 h-5" />}>
                  Start Patient Kiosk
                </Button>
              </Link>
              <Link to="/physician/login">
                <Button
                  variant="secondary"
                  size="lg"
                  icon={<Hospital className="w-5 h-5" />}
                >
                  Physician Portal
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-10">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">
              MediKiosk AI
            </span>
            <span className="text-xs text-muted-foreground ml-2">
              Clinical History-Taking Platform
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3 h-3" /> ABDM Compliant
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3" /> DPDP Act 2023
            </span>
            <span className="flex items-center gap-1.5">
              <Languages className="w-3 h-3" /> 8 Languages
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
