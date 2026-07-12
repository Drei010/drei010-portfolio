import { ContactForm } from "@/components/web/ContactForm";
import { ContactLinks } from "@/components/web/ContactLinks";

export function ContactSection() {
  return (
    <section id="contact" className="px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-8 text-xl font-bold sm:text-2xl">Contact</h2>
        <p className="-mt-4 mb-8 text-foreground/80">
          Interested in working together? Feel free to reach out.
        </p>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <ContactForm />
          <ContactLinks />
        </div>
      </div>
    </section>
  );
}
