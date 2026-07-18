"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
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
  const emailRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const entranceVariants = shouldReduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0 } };

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
      if (validationErrors.email) emailRef.current?.focus();
      else if (validationErrors.subject) subjectRef.current?.focus();
      else messageRef.current?.focus();
      return;
    }

    const mailtoUrl = `mailto:${contactData.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${email}\n\n${message}`)}`;
    window.location.href = mailtoUrl;
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-4"
      noValidate
      variants={entranceVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        type: "spring",
        stiffness: 80,
        damping: 20,
        delay: 0.2,
      }}
    >
      <div>
        <label htmlFor="contact-email" className="mb-1 block text-sm text-muted">
          Your Email
        </label>
        <input
          ref={emailRef}
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors((current) => ({ ...current, email: undefined }));
          }}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
          placeholder="you@example.com"
          className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none"
        />
        {errors.email && (
          <p id="contact-email-error" role="alert" className="mt-1 text-sm text-primary-dim">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="contact-subject" className="mb-1 block text-sm text-muted">
          Subject
        </label>
        <input
          ref={subjectRef}
          id="contact-subject"
          type="text"
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
            setErrors((current) => ({ ...current, subject: undefined }));
          }}
          aria-invalid={Boolean(errors.subject)}
          aria-describedby={errors.subject ? "contact-subject-error" : undefined}
          placeholder="What's this about?"
          className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none"
        />
        {errors.subject && (
          <p id="contact-subject-error" role="alert" className="mt-1 text-sm text-primary-dim">
            {errors.subject}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-1 block text-sm text-muted">
          Message
        </label>
        <textarea
          ref={messageRef}
          id="contact-message"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            setErrors((current) => ({ ...current, message: undefined }));
          }}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          placeholder="Your message..."
          rows={5}
          className="w-full resize-none rounded-lg border border-border bg-surface px-4 py-2 text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none"
        />
        {errors.message && (
          <p id="contact-message-error" role="alert" className="mt-1 text-sm text-primary-dim">
            {errors.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="rounded-lg bg-primary px-6 py-2 font-medium text-background transition-colors hover:bg-primary-dim"
      >
        Send Message
      </button>
    </motion.form>
  );
}
