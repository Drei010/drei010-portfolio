"use client";

import { servicesData } from "@/lib/data/services";
import { ServiceCard } from "@/components/web/ServiceCard";
import { AnimatedHeading } from "@/components/web/AnimatedHeading";

export function ServicesSection() {
  return (
    <section id="services" className="border-y border-border/70 bg-surface/45 px-5 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <AnimatedHeading className="mb-10 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
          Services
        </AnimatedHeading>
        <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {servicesData.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
