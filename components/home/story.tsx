import { Reveal } from "@/components/motion/reveal";
import { ProductGraphic } from "@/components/product/product-graphic";
import { Leaf, Sparkles, HeartHandshake } from "lucide-react";

const points = [
  {
    icon: Leaf,
    title: "Clean ingredients",
    copy: "Real fruit, no added sugar, and nothing you can't pronounce.",
  },
  {
    icon: Sparkles,
    title: "Crafted to delight",
    copy: "Balanced, lightly sparkling, and dialled in for pure joy.",
  },
  {
    icon: HeartHandshake,
    title: "Made responsibly",
    copy: "Small-batch, vegan, and proudly made in India.",
  },
];

export function Story() {
  return (
    <section id="story" className="bg-brand-cream py-16 sm:py-24">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <div
            id="ingredients"
            className="relative mx-auto grid aspect-square max-w-md place-items-center rounded-[2.5rem] p-8"
            style={{
              backgroundColor: "color-mix(in oklab, var(--brand-mint) 35%, white)",
            }}
          >
            <div className="grid grid-cols-2 gap-4">
              <ProductGraphic type="DRINK" accent="brand-tangerine" initials="TT" className="w-32" />
              <ProductGraphic type="GUMMY" accent="brand-grape" className="w-32" />
              <ProductGraphic type="GUMMY" accent="brand-mint" className="w-32" />
              <ProductGraphic type="DRINK" accent="brand-cherry" initials="LC" className="w-32" />
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="text-sm font-bold uppercase tracking-widest text-primary">
            Our promise
          </p>
          <h2 className="mt-2 text-4xl font-bold sm:text-5xl">
            Good vibes, made honestly
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            We started Joy Rush with one simple belief: feeling good shouldn&apos;t
            come with a compromise. Every can and every gummy is crafted with real
            ingredients and a whole lot of heart.
          </p>

          <div className="mt-8 space-y-5">
            {points.map((p) => (
              <div key={p.title} className="flex gap-4">
                <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <p.icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
