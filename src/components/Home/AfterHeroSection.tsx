import Link from "next/link";

const networkPaths = [
  {
    number: "01",
    title: "Founders",
    description:
      "Share what you are building, find perspective from people who have been there, and keep moving through the hard parts.",
    href: "/feed",
    link: "Explore the community",
  },
  {
    number: "02",
    title: "Mentors",
    description:
      "Learn from experienced people who can offer practical guidance, a fresh point of view, and a useful next conversation.",
    href: "/mentors",
    link: "Meet the mentors",
  },
  {
    number: "03",
    title: "Companies",
    description:
      "Give your business a home on Grow and make it easier for the right people to discover what you do.",
    href: "/company",
    link: "Discover companies",
  },
];

export default function AfterHeroSection() {
  return (
    <section id="community" className="scroll-mt-8 py-16 md:py-24">
      <div className="mb-2 flex items-baseline justify-between gap-4 border-b border-[#CFC6B4] pb-3">
        <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-[#6B6458]">
          01 / A network with room to grow
        </h2>
        <span className="hidden font-mono text-xs text-[#6B6458] sm:block">
          PEOPLE · IDEAS · MOMENTUM
        </span>
      </div>
      <div className="divide-y divide-[#CFC6B4]">
        {networkPaths.map((path) => (
          <article
            key={path.number}
            className="grid gap-3 py-7 sm:grid-cols-[5rem_1fr_auto] sm:items-center sm:gap-6"
          >
            <span className="font-mono text-sm text-[#6B6458]">{path.number}</span>
            <div>
              <h3 className="font-serif text-2xl text-[#24211C]">{path.title}</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B6458]">
                {path.description}
              </p>
            </div>
            <Link
              href={path.href}
              className="mt-2 w-fit text-sm font-medium text-[#354625] underline decoration-[#CFC6B4] underline-offset-4 transition-colors hover:decoration-[#354625] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#354625] sm:mt-0"
            >
              {path.link} <span aria-hidden="true">→</span>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}