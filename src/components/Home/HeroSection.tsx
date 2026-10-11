"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Skeleton } from "boneyard-js/react";

import { LightRays } from "../ui/light-rays";
import { AnimatedGridPattern } from "../ui/animated-grid-pattern";
import HeroTextAnimation from "./HeroTextAnimation/HeroTextAnimation";
import { useAuth } from "@/hooks/useAuth";

const HeroContent = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden rounded-xl border">
      {/* Background effects */}
      <LightRays color="rgba(160, 210, 255, 0.2)" />

      <AnimatedGridPattern className="text-[#EFEBE3]" />

      {/* Hero content */}
      <div className="absolute inset-0 flex max-w-7xl flex-col justify-center p-8">
        {/* Welcome + to */}
        <div className="flex items-baseline">
          <h1 className="text-9xl font-bold text-transparent [-webkit-text-stroke:2px_black]">
            Welcome
          </h1>

          <h1 className="ml-4 text-9xl font-bold text-transparent [-webkit-text-stroke:2px_black]">
            to
          </h1>
        </div>

        {/* Grow */}
        <h1 className="text-9xl font-bold text-[#ac9f85] text-shadow-lg">
          Grow
        </h1>

        {/* Animated text */}
        <HeroTextAnimation />
      </div>
    </div>
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
      toast("Want to step into the world of business?", {
        description: "Join Grow and turn your ideas into momentum.",
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

  return (
    <Skeleton
      name="hero-section"
      loading={isLoading}
      animate="shimmer"
      transition={300}
    >
      <HeroContent />
    </Skeleton>
  );
};

export default HeroSection;