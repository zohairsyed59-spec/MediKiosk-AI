import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Home } from 'lucide-react';

interface KioskLayoutProps {
  children: ReactNode;
  step?: number;
  showBack?: boolean;
  backLink?: string;
  title?: string;
  subtitle?: string;
}

const totalSteps = 6;

export function KioskLayout({ children, step, showBack = true, backLink, title, subtitle }: KioskLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                <Heart className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-semibold tracking-tight text-foreground">
                MediKiosk<span className="text-primary"> AI</span>
              </span>
            </Link>
            <div className="flex items-center gap-4">
              {step !== undefined && (
                <div className="hidden sm:flex items-center gap-1.5">
                  {Array.from({ length: totalSteps }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i + 1 === step ? 'w-6 bg-primary' : i + 1 < step ? 'w-1.5 bg-primary/50' : 'w-1.5 bg-muted'
                      }`}
                    />
                  ))}
                </div>
              )}
              {showBack && backLink && (
                <Link to={backLink}>
                  <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Home className="w-3.5 h-3.5" />
                    Home
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-start px-6 py-8">
        {title && (
          <div className="text-center mb-8 max-w-2xl animate-slide-up w-full">
            <h1 className="font-display text-2xl md:text-4xl font-semibold mb-2 text-foreground">{title}</h1>
            {subtitle && <p className="text-muted-foreground text-sm md:text-base">{subtitle}</p>}
          </div>
        )}
        <div className="w-full max-w-3xl">{children}</div>
      </main>
    </div>
  );
}