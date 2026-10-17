"use client";

import { useState } from "react";
import { BlurFade } from "@/components/ui/blur-fade"
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

function HeroImage({
  src,
  alt,
  animationClass,
}: {
  src: string;
  alt: string;
  animationClass: string;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
      {!isLoaded && (
        <Skeleton
          aria-hidden="true"
          className="absolute inset-0 rounded-xl"
        />
      )}
      <Image
        src={src}
        width={96}
        height={96}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsLoaded(true)}
        className={`absolute inset-0 h-full w-full rounded-xl border-2 border-[#1B1B18]/15 object-cover shadow-sm transition-opacity duration-300 ${animationClass} ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

export default function HeroTextAnimation() {
  return (
    <BlurFade
      duration={1.5}
      className="mt-6 flex items-center justify-first gap-3 text-2xl font-semibold text-[#1B1B18]"
    >
      <HeroImage
        src="/Hero1.png"
        alt="first"
        animationClass="animate-[hero-float_4s_ease-in-out_infinite]"
      />
      <HeroImage
        src="/Hero2.png"
        alt="second"
        animationClass="animate-[hero-float_4s_ease-in-out_0.5s_infinite]"
      />
      <HeroImage
        src="/Hero3.png"
        alt="third"
        animationClass="animate-[hero-float_4s_ease-in-out_1s_infinite]"
      />
      <HeroImage
        src="/Hero4.png"
        alt="fourth"
        animationClass="animate-[hero-float_4s_ease-in-out_1.5s_infinite]"
      />
    </BlurFade>
  );
}