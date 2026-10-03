import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { FEATURE_ICON_COMPONENTS } from "@/components/feature-icons";
import type { HomepageSettings } from "@/lib/settings/schema";

// Card tints cycle through the brand palette.
const TINTS = ["brand-berry", "brand-tangerine", "brand-sky", "brand-mint", "brand-lavender", "brand-peach"];

export function Features({ content }: { content: HomepageSettings["features"] }) {
  if (content.items.length === 0) return null;
  return (
    <section id="story" className="container-page py-16 sm:py-20">
      <Reveal className="mx-auto max-w-2xl text-center">
        {content.eyebrow && (
          <p className="text-sm font-bold uppercase tracking-widest text-primary">
            {content.eyebrow}
          </p>
        )}
        <h2 className="mt-2 text-4xl font-bold sm:text-5xl">{content.title}</h2>
      </Reveal>

      <StaggerGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {content.items.map((f, i) => {
          const Icon = FEATURE_ICON_COMPONENTS[f.icon];
          return (
          <StaggerItem key={`${f.title}-${i}`}>
            <div className="flex h-full flex-col rounded-[1.75rem] border border-black/5 bg-card p-6 transition-transform hover:-translate-y-1.5">
              <div
                className="grid size-12 place-items-center rounded-2xl"
                style={{
                  backgroundColor: `color-mix(in oklab, var(--${TINTS[i % TINTS.length]}) 35%, white)`,
                }}
              >
                <Icon className="size-6 text-brand-ink" />
              </div>
              <h3 className="mt-5 text-lg font-bold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.copy}</p>
            </div>
          </StaggerItem>
          );
        })}
      </StaggerGroup>
    </section>
  );
}
