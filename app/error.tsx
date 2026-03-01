"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-bg-primary px-6 text-center">
      <div className="mb-4 text-5xl">⚠️</div>
      <h2 className="mb-2 text-xl font-bold text-white">Something went wrong</h2>
      <p className="mb-6 text-sm text-text-secondary">
        We&apos;re experiencing high traffic. Please try again later.
      </p>
      <button
        onClick={reset}
        className="rounded-[var(--radius-full)] bg-accent-cta px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-cta-hover"
      >
        Try Again
      </button>
    </div>
  );
}
