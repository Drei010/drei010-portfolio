import { contactData } from "@/lib/data/contact";

export function ContactSection() {
  return (
    <section id="contact" className="px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-8 text-xl font-bold sm:text-2xl">Contact</h2>
        <p className="mb-6 text-foreground/80">
          Interested in working together? Feel free to reach out.
        </p>
        <div className="space-y-4">
          <a
            href={`mailto:${contactData.email}`}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:border-primary hover:text-primary"
          >
            <MailIcon />
            {contactData.email}
          </a>
          <div className="flex flex-wrap gap-3">
            {contactData.links.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:border-primary hover:text-primary"
                aria-label={`Visit ${link.platform} profile`}
              >
                {link.platform}
                <span className="text-muted">↗</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MailIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
