import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms & Conditions | Andrei's Portfolio",
  description: "Terms for using Andrei's Portfolio and its interactive features.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions" updated="September 7, 2026">
      <p>
        By using this portfolio, you agree to use it lawfully and respectfully. The site
        is provided as an informational showcase of Andrei Kyle Hidalgo&apos;s work.
      </p>
      <h2>Content and intellectual property</h2>
      <p>
        Unless stated otherwise, the site design, writing, graphics, and portfolio
        materials belong to Andrei. You may view and share ordinary links to the site;
        copying or redistributing the materials requires permission from the owner.
      </p>
      <h2>Interactive chat</h2>
      <p>
        The optional chat is provided for general portfolio questions. Do not use it for
        unlawful, abusive, automated, or confidential requests, and do not treat its
        responses as professional advice.
      </p>
      <h2>External services and availability</h2>
      <p>
        The portfolio links to external projects and services. Those destinations are
        operated independently and may change. Features may be updated, interrupted, or
        removed without notice.
      </p>
      <h2>Disclaimer</h2>
      <p>
        The site and its interactive features are provided on an as-is basis to the
        extent permitted by law. Andrei is not liable for losses resulting from reliance
        on site content, external links, or temporary unavailability.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about these terms can be sent to{" "}
        <a className="text-primary hover:underline" href="mailto:andreihidalgo16@gmail.com">
          andreihidalgo16@gmail.com
        </a>
        .
      </p>
    </LegalPage>
  );
}

