const Earth = ({ className = "" }: { className?: string }) => {


    const EARTH_MAP =
        "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg";

    return (
        <div
            className={`relative aspect-square ${className}`}
            style={{ animation: "earth-wobble 7s ease-in-out infinite" }}
        >
            {/* Water ripple filter: animated noise that distorts the surface */}
            <svg width="0" height="0" className="absolute" aria-hidden="true">
                <filter id="earth-water" x="-5%" y="-5%" width="110%" height="110%">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.012 0.02"
                        numOctaves="2"
                        seed="3"
                        result="noise"
                    >
                        <animate
                            attributeName="baseFrequency"
                            dur="12s"
                            values="0.012 0.02; 0.02 0.012; 0.012 0.02"
                            repeatCount="indefinite"
                        />
                    </feTurbulence>
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="noise"
                        scale="14"
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />
                </filter>
            </svg>

            {/* Atmosphere glow */}
            <div className="absolute -inset-4 rounded-full bg-sky-400/20 blur-2xl" />

            {/* Sphere (clips everything into a circle) */}
            <div className="absolute inset-0 overflow-hidden rounded-full bg-sky-900/10 shadow-[inset_-50px_-30px_90px_rgba(0,0,0,0.8),inset_12px_8px_30px_rgba(255,255,255,0.2)]">
                {/* Rolling + wobbling surface */}
                <div
                    className="absolute inset-y-0 left-0 flex h-full w-[400%] will-change-transform"
                    style={{
                        animation: "earth-roll 40s linear infinite",
                        filter: "url(#earth-water)",
                    }}
                >
                    <div
                        className="h-full w-1/2 bg-[length:100%_100%]"
                        style={{ backgroundImage: `url(${EARTH_MAP})` }}
                    />
                    <div
                        className="h-full w-1/2 bg-[length:100%_100%]"
                        style={{ backgroundImage: `url(${EARTH_MAP})` }}
                    />
                </div>

                {/* Moving water glints */}
                <div
                    className="absolute inset-0 mix-blend-soft-light opacity-70"
                    style={{
                        backgroundImage:
                            "radial-gradient(ellipse 40% 12% at 30% 30%, rgba(255,255,255,0.9), transparent 70%), radial-gradient(ellipse 35% 10% at 70% 65%, rgba(255,255,255,0.8), transparent 70%)",
                        backgroundSize: "180% 180%",
                        animation: "earth-shimmer 9s ease-in-out infinite alternate",
                    }}
                />
            </div>

            {/* Sphere shading (light from top-left) */}
            <div className="absolute inset-0 rounded-full shadow-[inset_-50px_-30px_90px_rgba(0,0,0,0.8),inset_12px_8px_30px_rgba(255,255,255,0.2)]" />

            {/* Rim light */}
            <div className="absolute inset-0 rounded-full ring-1 ring-sky-200/30" />
        </div>
    );
};

export default Earth;