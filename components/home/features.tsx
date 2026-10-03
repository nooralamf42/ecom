import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Sparkles, Ruler, Truck, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Handpicked designs",
    copy: "Fresh, on-trend styles added regularly.",
    color: "brand-berry",
  },
  {
    icon: Ruler,
    title: "Every size",
    copy: "Sizes 2.2 to 2.8 for the perfect fit.",
    color: "brand-tangerine",
  },
  {
    icon: Truck,
    title: "Pan-India shipping",
    copy: "Fast, tracked delivery to your door.",
    color: "brand-sky",
  },
  {
    icon: ShieldCheck,
    title: "Secure payments",
    copy: "Pay safely with UPI, cards & more.",
    color: "brand-mint",
  },
];

export function Features() {
  return (
    <section id="story" className="container-page py-16 sm:py-20">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">
          Why Bangleish
        </p>
        <h2 className="mt-2 text-4xl font-bold sm:text-5xl">
          Bangles you&apos;ll love to wear
        </h2>
      </Reveal>

      <StaggerGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <StaggerItem key={f.title}>
            <div className="flex h-full flex-col rounded-[1.75rem] border border-black/5 bg-card p-6 transition-transform hover:-translate-y-1.5">
              <div
                className="grid size-12 place-items-center rounded-2xl"
                style={{
                  backgroundColor: `color-mix(in oklab, var(--${f.color}) 35%, white)`,
                }}
              >
                <f.icon className="size-6 text-brand-ink" />
              </div>
              <h3 className="mt-5 text-lg font-bold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.copy}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
