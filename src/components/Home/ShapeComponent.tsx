
import Link from "next/link";

export default function ShapeComponent() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-8 border-y border-[#CFC6B4] py-16 md:py-24"
    >
      <div className="grid gap-10 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-5">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.14em] text-[#6B6458]">
            02 / How Grow works
          </p>
          <h2 className="max-w-md font-serif text-4xl font-normal leading-tight tracking-tight text-[#24211C] sm:text-5xl">
            Progress starts with a conversation.
          </h2>
          <p className="mt-5 max-w-md text-sm leading-6 text-[#6B6458]">
            Grow brings people and practical support into one place, so the
            next step does not have to be a solo one.
          </p>
        </div>
        <ol className="divide-y divide-[#CFC6B4] md:col-span-7">
          {[
            {
              number: "01",
              title: "Find your people",
              description:
                "Browse mentors, founders, and businesses connected by the work of building something.",
            },
            {
              number: "02",
              title: "Start a conversation",
              description:
                "Meet through mentorship, share a question, or join a discussion with the community.",
            },
            {
              number: "03",
              title: "Keep moving",
              description:
                "Turn what you learn into a next step, and bring your progress back to the network.",
            },
          ].map((step) => (
            <li
              key={step.number}
              className="grid gap-2 py-5 sm:grid-cols-[3rem_1fr] sm:gap-4"
            >
              <span className="font-mono text-xs text-[#6B6458]">
                {step.number}
              </span>
              <div>
                <h3 className="font-serif text-xl text-[#24211C]">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-[#6B6458]">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="mt-12 flex flex-col gap-5 border-t border-[#CFC6B4] pt-7 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-serif text-2xl text-[#24211C]">
          Make your next move with Grow.
        </p>
        <Link
          href="/register"
          className="inline-flex min-h-12 w-fit items-center justify-center bg-[#354625] px-6 text-sm font-medium text-[#fff8f2] transition-colors hover:bg-[#4C5E3A] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#354625]"
        >
          Get started <span aria-hidden="true" className="ml-3">→</span>
        </Link>
      </div>
    </section>
  );
}