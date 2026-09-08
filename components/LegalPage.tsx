import Link from "next/link";

type LegalPageProps = {
  title: string;
  updated: string;
  children: React.ReactNode;
};

export function LegalPage({ title, updated, children }: LegalPageProps) {
  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-20 sm:px-8 lg:py-28">
      <Link href="/" className="mb-10 inline-flex text-sm text-primary hover:underline">
        ← Back to portfolio
      </Link>
      <p className="mb-3 text-sm font-mono uppercase tracking-[0.16em] text-muted">
        Last updated {updated}
      </p>
      <h1 className="mb-10 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
        {title}
      </h1>
      <div className="space-y-8 text-base leading-8 text-foreground/80 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:tracking-[-0.02em] [&_p]:max-w-2xl [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
        {children}
      </div>
    </article>
  );
}

