import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy | Andrei's Portfolio",
  description: "How Andrei's Portfolio handles requests, analytics, and preferences.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="September 7, 2026">
      <p>
        This portfolio belongs to Andrei Kyle Hidalgo. This policy explains what
        information is handled when you browse the site or use its interactive features.
      </p>
      <h2>Information you provide</h2>
      <p>
        The contact form opens your own email application using a mailto link. The site
        does not submit or store that message. If you email Andrei directly, your email
        address and message are used only to respond and are retained only as long as
        reasonably needed for that conversation.
      </p>
      <h2>Interactive features</h2>
      <p>
        Questions sent to the optional portfolio chat are processed by this site&apos;s
        server and the configured Google Gemini service to generate a response. Do not
        send confidential or sensitive information. The site does not intentionally use
        chat questions to identify you or build a profile.
      </p>
      <h2>Analytics and preferences</h2>
      <p>
        Vercel Analytics and Speed Insights may receive technical, aggregated usage data
        to measure traffic and performance. The site stores only theme preferences in
        your browser&apos;s local storage. It currently does not set advertising, tracking,
        or authentication cookies.
      </p>
      <h2>Third-party links</h2>
      <p>
        Project, source-code, and social links lead to third-party sites with their own
        policies. Review those policies before submitting information there.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about this policy can be sent to{" "}
        <a className="text-primary hover:underline" href="mailto:andreihidalgo16@gmail.com">
          andreihidalgo16@gmail.com
        </a>
        .
      </p>
    </LegalPage>
  );
}

