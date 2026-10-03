import { Star } from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { demoReviews } from "@/lib/demo-data";

export function Testimonials() {
  return (
    <section id="reviews" className="container-page py-16 sm:py-20">
      <Reveal className="mx-auto max-w-2xl text-center">
        <div className="flex justify-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="size-5 fill-brand-tangerine text-brand-tangerine" />
          ))}
        </div>
        <h2 className="mt-4 text-4xl font-bold sm:text-5xl">Loved across India</h2>
        <p className="mt-2 text-muted-foreground">
          Over 170 five-star reviews and counting.
        </p>
      </Reveal>

      <StaggerGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {demoReviews.map((r, i) => (
          <StaggerItem key={i}>
            <figure className="flex h-full flex-col rounded-[1.5rem] border border-black/5 bg-card p-6 shadow-sm">
              <div className="flex gap-0.5">
                {[...Array(r.rating)].map((_, s) => (
                  <Star key={s} className="size-4 fill-brand-tangerine text-brand-tangerine" />
                ))}
              </div>
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-brand-ink/80">
                “{r.comment}”
              </blockquote>
              <figcaption className="mt-4 text-sm font-bold">{r.author}</figcaption>
            </figure>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
