/**
 * Extract a readable message from a thrown Supabase or JS error.
 * Supabase PostgREST errors are plain objects with a `message`
 * property rather than Error instances, so both shapes are handled.
 */
export function errorMessage(err: unknown, fallback = 'Please try again.'): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object' && 'message' in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
}
