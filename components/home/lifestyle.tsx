import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";

const moments = [
  {
    title: "Unwind & Reset",
    copy: "Melt into the evening with a calming sip.",
    color: "brand-lavender",
    emoji: "🌙",
  },
  {
    title: "Gather & Connect",
    copy: "The life of every table and patio.",
    color: "brand-tangerine",
    emoji: "🥂",
  },
  {
    title: "Celebrate & Spark",
    copy: "Because ordinary days deserve fizz too.",
    color: "brand-berry",
    emoji: "🎉",
  },
  {
    title: "Play & Indulge",
    copy: "Treat yourself to the good stuff, daily.",
    color: "brand-mint",
    emoji: "✨",
  },
];

export function Lifestyle() {
  return (
    <section className="container-page py-16 sm:py-20">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">
          A flavour for every mood
        </p>
        <h2 className="mt-2 text-4xl font-bold sm:text-5xl">
          Made for your best moments
        </h2>
      </Reveal>

      <StaggerGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {moments.map((m) => (
          <StaggerItem key={m.title}>
            <div
              className="group flex h-full flex-col justify-between rounded-[1.75rem] p-6 transition-transform hover:-translate-y-1.5"
              style={{
                backgroundColor: `color-mix(in oklab, var(--${m.color}) 30%, white)`,
              }}
            >
              <div className="text-4xl">{m.emoji}</div>
              <div className="mt-10">
                <h3 className="text-xl font-bold">{m.title}</h3>
                <p className="mt-1.5 text-sm text-brand-ink/70">{m.copy}</p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
