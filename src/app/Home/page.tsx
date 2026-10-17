import HeroSection from "@/components/Home/HeroSection";
import AfterHeroSection from "@/components/Home/AfterHeroSection";
import ShapeComponent from "@/components/Home/ShapeComponent";
import Link from "next/link";

const AllHomePage = () => {
    return (
        <div className="min-h-screen bg-[#F2EDE3] text-[#24211C]">
            <header className="sticky top-0 z-30 border-b border-[#CFC6B4] bg-[#F2EDE3]/95 backdrop-blur-sm">
                <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-5 px-5 sm:px-8">
                    <Link
                        href="#home"
                        className="font-serif text-2xl tracking-tight text-[#24211C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#354625]"
                    >
                        Grow
                    </Link>
                    <nav aria-label="Main navigation" className="hidden items-center gap-7 sm:flex">
                        <Link href="#community" className="text-sm text-[#6B6458] transition-colors hover:text-[#24211C]">The network</Link>
                        <Link href="#how-it-works" className="text-sm text-[#6B6458] transition-colors hover:text-[#24211C]">How it works</Link>
                        <Link href="/login" className="text-sm text-[#6B6458] transition-colors hover:text-[#24211C]">Log in</Link>
                        <Link
                            href="/register"
                            className="inline-flex min-h-10 items-center justify-center bg-[#354625] px-4 text-sm font-medium text-[#fff8f2] transition-colors hover:bg-[#4C5E3A] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#354625]"
                        >
                            Join Grow
                        </Link>
                    </nav>
                    <div className="flex items-center gap-4 sm:hidden">
                        <Link href="/login" className="text-sm text-[#6B6458]">Log in</Link>
                        <Link
                            href="/register"
                            className="inline-flex min-h-10 items-center justify-center bg-[#354625] px-4 text-sm font-medium text-[#fff8f2]"
                        >
                            Join
                        </Link>
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-6xl px-5 sm:px-8">
                <HeroSection />
                <AfterHeroSection />
                <ShapeComponent />
            </main>
            <footer className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-xs text-[#6B6458] sm:flex-row sm:items-center sm:justify-between sm:px-8">
                <span>Grow — a community for people building what’s next.</span>
                <nav aria-label="Footer navigation" className="flex gap-5">
                    <Link href="/login" className="hover:text-[#24211C]">Log in</Link>
                    <Link href="/register" className="hover:text-[#24211C]">Join Grow</Link>
                </nav>
            </footer>
        </div>
    );
};

export default AllHomePage;