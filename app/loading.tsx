export default function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg-primary">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-cta border-t-transparent" />
        <p className="text-sm text-text-muted">Loading...</p>
      </div>
    </div>
  );
}
