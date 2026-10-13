import { Spinner } from './Spinner';

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" className="mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">Loading page…</p>
      </div>
    </div>
  );
}