export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-bg-primary px-6 text-center">
      <div className="mb-4 text-5xl">🔍</div>
      <h2 className="mb-2 text-xl font-bold text-white">Page Not Found</h2>
      <p className="mb-6 text-sm text-text-secondary">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <a
        href="/"
        className="rounded-[var(--radius-full)] bg-accent-cta px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-cta-hover"
      >
        Go Home
      </a>
    </div>
  );
}
