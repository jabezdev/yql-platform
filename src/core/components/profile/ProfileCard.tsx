import * as Icons from "lucide-react";

interface ProfileCardProps {
    user: {
        name: string;
        email: string;
        role: string;
        specialRoles?: string[];
        bio?: string;
        favoriteShape?: "circle" | "square" | "triangle" | "hexagon";
        favoriteColor?: string;
        techStackIcon?: string;
    };
}

export function ProfileCard({ user }: ProfileCardProps) {
    const customColor = user.favoriteColor || "#396799";
    const activeShape = user.favoriteShape || "circle";

    const LucideIcon = (user.techStackIcon && Icons[user.techStackIcon as keyof typeof Icons])
        ? (Icons[user.techStackIcon as keyof typeof Icons] as any)
        : Icons.Code;

    // Decorative accent clip-path per shape
    const accentClip =
        activeShape === "triangle" ? "polygon(50% 0%, 0% 100%, 100% 100%)"
        : activeShape === "hexagon" ? "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
        : activeShape === "circle" ? "circle(50% at 50% 50%)"
        : "none";

    // Avatar clip-path per shape (same as accent)
    const avatarClip = accentClip;

    return (
        <div className="w-full max-w-sm bg-white rounded-tl-2xl rounded-br-2xl border-2 border-brand-blue/15 shadow-[4px_4px_0px_0px_rgba(57,103,153,0.12)] overflow-hidden relative group transition-all duration-200 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_0px_rgba(57,103,153,0.15)]">
            {/* Decorative header band — user's custom color at low opacity */}
            <div className="h-28 w-full relative overflow-hidden" style={{ backgroundColor: `${customColor}18` }}>
                {/* Rotating shape accent */}
                <div
                    className="absolute -top-10 -right-10 w-40 h-40 opacity-25 transform rotate-12 transition-transform group-hover:rotate-45 duration-700"
                    style={{ backgroundColor: customColor, clipPath: accentClip, borderRadius: activeShape === 'square' ? '0.75rem' : '0' }}
                />
                {/* Brand corner mark */}
                <div className="absolute top-3 left-3 w-5 h-5 bg-brand-yellow border-2 border-brand-blue/40 rounded-tl-md rounded-br-md" />
            </div>

            <div className="px-6 pb-6 relative">
                {/* Avatar */}
                <div
                    className="-mt-10 mx-auto relative z-10 w-20 h-20 flex items-center justify-center text-2xl font-bold text-white border-4 border-white shadow-[2px_2px_0px_0px_rgba(57,103,153,0.15)]"
                    style={{
                        backgroundColor: customColor,
                        clipPath: avatarClip,
                        borderRadius: activeShape === 'square' ? '0.75rem'
                            : activeShape === 'circle' ? '9999px'
                            : '0',
                    }}
                >
                    <span className={activeShape === "triangle" ? "mt-4" : ""}>
                        {user.name.charAt(0)}
                    </span>
                </div>

                <div className="text-center mt-4">
                    <h2 className="text-xl font-display font-extrabold text-brand-blue">{user.name}</h2>
                    <p className="text-xs font-extrabold uppercase tracking-widest text-brand-lightBlue mt-0.5">
                        {user.specialRoles?.length
                            ? `${user.role} · ${user.specialRoles.join(", ")}`
                            : user.role}
                    </p>
                </div>

                {user.bio && (
                    <div className="mt-4 text-center">
                        <p className="text-sm text-brand-blue/60 italic leading-relaxed">"{user.bio}"</p>
                    </div>
                )}

                <div className="mt-5 pt-5 border-t-2 border-brand-blue/10 flex justify-center">
                    <div className="flex flex-col items-center p-3 rounded-tl-xl rounded-br-xl bg-brand-bgLight border-2 border-brand-blue/10 min-w-[4rem]">
                        <LucideIcon size={22} style={{ color: customColor }} strokeWidth={1.5} />
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-brand-blue/40 mt-2">Stack</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
