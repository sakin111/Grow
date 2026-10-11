"use client";
import { BlurFade } from "@/components/ui/blur-fade"
import Image from "next/image";


export default function HeroTextAnimation() {
  return (
    <BlurFade
      duration={1.5}
      className="mt-6 flex items-center justify-first gap-3 text-2xl font-semibold text-[#1B1B18]"
    >
      <Image
        src="/Hero1.png"
        width={96}
        height={96}
        alt="first"
        className="animate-[hero-float_4s_ease-in-out_infinite] rounded-xl border-2 border-[#1B1B18]/15 object-cover shadow-sm"
      />
      <Image
        src="/Hero2.png"
        width={96}
        height={96}
        alt="second"
        className="animate-[hero-float_4s_ease-in-out_0.5s_infinite] rounded-xl border-2 border-[#1B1B18]/15 object-cover shadow-sm"
      />
      <Image
        src="/Hero3.png"
        width={96}
        height={96}
        alt="third"
        className="animate-[hero-float_4s_ease-in-out_1s_infinite] rounded-xl border-2 border-[#1B1B18]/15 object-cover shadow-sm"
      />
      <Image
        src="/Hero4.png"
        width={96}
        height={96}
        alt="fourth"
        className="animate-[hero-float_4s_ease-in-out_1.5s_infinite] rounded-xl border-2 border-[#1B1B18]/15 object-cover shadow-sm"
      />
    </BlurFade>
  );
}