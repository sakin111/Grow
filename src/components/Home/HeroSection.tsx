"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import HeroTextAnimation from "./HeroTextAnimation/HeroTextAnimation";
import { useAuth } from "@/hooks/useAuth";
import Earth from "./HeroTextAnimation/Earth";

const HeroContent = () => {
  return (
    <section
      id="home"
      className="grid min-h-[calc(100svh-5rem)] w-full grid-cols-1 items-center gap-10 overflow-hidden border-b border-[#CFC6B4] py-14 md:grid-cols-12 md:py-20"
    >
      <div className="z-10 flex flex-col items-start md:col-span-6">
        <p className="mb-5 font-mono text-xs uppercase tracking-[0.16em] text-[#6B6458]">
          A network for people building what’s next
        </p>
        <h1 className="max-w-xl font-serif text-5xl font-normal leading-[1.08] tracking-tight text-[#24211C] sm:text-6xl lg:text-7xl">
          Good things grow together.
        </h1>
        <p className="mt-6 max-w-lg text-base leading-7 text-[#6B6458] sm:text-lg">
          Meet the mentors, founders, and peers who can help turn your next
          idea into meaningful progress.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href="/register"
            className="inline-flex min-h-12 items-center justify-center bg-[#354625] px-6 text-sm font-medium text-[#fff8f2] transition-colors hover:bg-[#4C5E3A] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#354625]"
          >
            Join the community <span aria-hidden="true" className="ml-3">→</span>
          </Link>
          <Link
            href="/mentors"
            className="text-sm font-medium text-[#354625] underline decoration-[#CFC6B4] underline-offset-4 transition-colors hover:decoration-[#354625] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#354625]"
          >
            Meet the mentors
          </Link>
        </div>
        <div className="mt-8">
          <HeroTextAnimation />
        </div>
      </div>

      <div className="relative flex min-h-72 items-center justify-center md:col-span-6 md:min-h-[34rem]">
        <div
          aria-hidden="true"
          className="absolute aspect-square w-[min(75vw,32rem)] rounded-full bg-[#E9E2D4]"
        />
        <Earth className="z-10 w-[min(68vw,27rem)] md:w-[min(42vw,31rem)]" />
        <p className="absolute bottom-4 right-0 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-[#6B6458] md:bottom-8">
          Better, together
        </p>
      </div>
    </section>
  );
};

const HeroSection = () => {
  const router = useRouter();

  const { isLoading, isAuthenticated } = useAuth({
    skipAuthHandling: true,
  });

  useEffect(() => {
  
    if (isLoading || isAuthenticated) {
      return;
    }

    const promptTimer = window.setTimeout(() => {
      toast("Ready to grow your business?", {
        description: "Find your people and take your next step with Grow.",
        action: {
          label: "Log in",
          onClick: () => router.push("/login"),
        },
        duration: 6000,
      });
    }, 1200);

    return () => {
      window.clearTimeout(promptTimer);
    };
  }, [isLoading, isAuthenticated, router]);

  return <HeroContent />;
};

export default HeroSection;