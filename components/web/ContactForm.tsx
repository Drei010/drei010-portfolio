"use client";

import { useState } from "react";
import { contactData } from "@/lib/data/contact";

type FormErrors = {
  email?: string;
  subject?: string;
  message?: string;
};

export function ContactForm() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): FormErrors {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!message.trim()) {
      newErrors.message = "Message is required";
    }

    return newErrors;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const mailtoUrl = `mailto:${contactData.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${email}\n\n${message}`)}`;
    window.location.href = mailtoUrl;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="contact-email" className="mb-1 block text-sm text-muted">
          Your Email
        </label>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-primary-dim">{errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="contact-subject" className="mb-1 block text-sm text-muted">
          Subject
        </label>
        <input
          id="contact-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="What's this about?"
          className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none"
        />
        {errors.subject && (
          <p className="mt-1 text-sm text-primary-dim">{errors.subject}</p>
        )}
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-1 block text-sm text-muted">
          Message
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Your message..."
          rows={5}
          className="w-full resize-none rounded-lg border border-border bg-surface px-4 py-2 text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none"
        />
        {errors.message && (
          <p className="mt-1 text-sm text-primary-dim">{errors.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="rounded-lg bg-primary px-6 py-2 font-medium text-background transition-colors hover:bg-primary-dim"
      >
        Send Message
      </button>
    </form>
  );
}
