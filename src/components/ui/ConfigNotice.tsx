import { AlertTriangle } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

/**
 * Shown only when the Supabase credentials are missing from .env,
 * so the app never renders as a blank page and the operator knows
 * exactly what to configure. Invisible in a properly configured deployment.
 */
export function ConfigNotice() {
  if (isSupabaseConfigured) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl border border-amber-500/30 bg-[#1B1329] p-4 shadow-2xl shadow-black/50"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
          <AlertTriangle className="h-4.5 w-4.5 text-amber-400" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">Database not connected</p>
          <p className="mt-0.5 text-xs leading-relaxed text-white/60">
            Add your Supabase credentials to a <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-[11px] text-violet-300">.env</code> file
            (<code className="rounded bg-white/10 px-1 py-0.5 font-mono text-[11px] text-violet-300">VITE_SUPABASE_URL</code> and{' '}
            <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-[11px] text-violet-300">VITE_SUPABASE_ANON_KEY</code>)
            and restart the dev server. See <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-[11px] text-violet-300">.env.example</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
