import { servicesData } from "@/lib/data/services";
import { ServiceCard } from "@/components/web/ServiceCard";

export function ServicesSection() {
  return (
    <section id="services" className="px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-8 text-xl font-bold sm:text-2xl">Services</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {servicesData.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
