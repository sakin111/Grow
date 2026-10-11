"use client";

import { useState } from "react";
import { ArrowRight, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function AfterHeroSection() {

    const [activeDot, setActiveDot] = useState(0);



    return (
        <div className="w-full min-h-screen flex items-center justify-center p-6 my-16">
            <div className="relative w-full max-w-6xl aspect-video rounded-2xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-[0.85fr_1.15fr] bg-[#EFEBE3]">
                {/* LEFT PANEL */}
                <div className="relative flex flex-col justify-between px-10 py-8 md:px-12 md:py-10">
                    {/* Logo */}
                    <div>
                        <div className="w-9 h-9 rounded-full bg-[#1B1B18] flex items-center justify-center">
                            <Compass className="w-4.5 h-4.5 text-[#EFEBE3]" strokeWidth={1.75} />
                        </div>
                    </div>

                    {/* Headline */}
                    <div className="max-w-md">
                        <h1 className="font-serif text-[2.1rem] leading-[1.15] md:text-[2.6rem] md:leading-[1.12] text-[#1B1B18] tracking-tight">
                            Discover the beauty of the world of business With Us
                        </h1>
                        <p className="mt-5 text-[0.9rem] leading-relaxed text-[#5C594F] max-w-sm">
                            Embark on a journey of growth and innovation with our platform, where your business ideas take flight and transform into reality. Explore, connect, and thrive in the world of business with us.
                        </p>
                    </div>

                    {/* Footer nav */}
                    <nav className="flex flex-col gap-2.5 text-[0.82rem] text-[#3A392F]">

                    </nav>
                </div>

                {/* RIGHT PANEL — image side */}
                <div className="relative">
                    <Image
                        src="https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?q=80&w=876&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        width={1600}
                        height={900}
                        alt="Mountain valley landscape"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* subtle gradient for legibility */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/25 via-black/0 to-black/10" />

                    {/* Top bar */}
                    <div className="relative z-10 flex items-center justify-end gap-3 px-6 py-6">
                        <Button className="rounded-full bg-[#1B1B18] text-[#EFEBE3] hover:bg-[#2c2c26] h-9 px-5 text-[0.8rem] font-normal">
                            Get in touch
                        </Button>
                    </div>

                    {/* Floating card */}
                    <div className="absolute left-8 bottom-10 right-8 md:left-10 md:right-auto md:w-95 z-10">
                        <div className="bg-white rounded-2xl shadow-xl p-3 flex gap-3.5">
                            <Image
                                src="https://images.unsplash.com/photo-1639465469204-91ba9cc8e3f2?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                width={400}
                                height={400}
                                alt="Coastal cottage retreat"
                                className="w-24 h-full min-h-26 object-cover rounded-xl shrink-0"
                            />
                            <div className="py-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-[0.95rem] font-medium text-[#1B1B18]">
                                        Stay busi-ness
                                    </h3>
                                    <p className="text-[0.72rem] leading-snug text-[#6B6A61] mt-1.5">
                                        Discover the beauty of the world of business with us. Embark on a journey of growth and innovation with our platform, where your business ideas take flight and transform into reality.
                                    </p>
                                </div>
                                <Link
                                    href="/login"
                                >
                                    <button className="mt-2 inline-flex items-center gap-1 text-[0.72rem] font-medium text-[#1B1B18] bg-[#EFEBE3] rounded-full px-3 py-1.5 w-fit hover:bg-[#e3ded2] transition-colors">
                                        Explore More
                                        <ArrowRight className="w-3 h-3" />
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* Carousel dots */}
                        <div className="flex gap-1.5 justify-center mt-4">
                            {[0, 1, 2].map((i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveDot(i)}
                                    aria-label={`Slide ${i + 1}`}
                                    className={`h-1.5 rounded-full transition-all ${activeDot === i
                                            ? "w-5 bg-white"
                                            : "w-1.5 bg-white/50 hover:bg-white/70"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}