import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-24 sm:px-8">
      <p className="mb-4 text-sm font-mono uppercase tracking-[0.16em] text-primary">404</p>
      <h1 className="mb-4 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
        Page not found
      </h1>
      <p className="mb-8 max-w-xl text-lg text-muted">
        That route does not exist, but the portfolio is still here.
      </p>
      <Link
        href="/"
        className="inline-flex min-h-11 w-fit items-center rounded-lg bg-primary px-5 font-medium text-background hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
      >
        Return home
      </Link>
    </div>
  );
}

