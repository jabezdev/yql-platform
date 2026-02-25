import * as Icons from "lucide-react";

interface ProfileCardProps {
    user: {
        name: string;
        email: string;
        role: string;
        staffSubRole?: string;
        bio?: string;
        favoriteShape?: "circle" | "square" | "triangle" | "hexagon";
        favoriteColor?: string;
        techStackIcon?: string;
    };
}

export function ProfileCard({ user }: ProfileCardProps) {
    // Map favorite shape to Tailwind classes
    const shapeClasses = {
        circle: "rounded-full",
        square: "rounded-lg",
        triangle: "clip-triangle rounded-none", // Needs custom CSS or clip-path
        hexagon: "clip-hexagon rounded-none", // Needs custom CSS or clip-path
    };

    const activeShape = user.favoriteShape || "circle";
    const shapeStyle = shapeClasses[activeShape];
    const customColor = user.favoriteColor || "#0052cc"; // Default brand-blue

    // Fallback icon if none chosen or invalid
    const LucideIcon = (user.techStackIcon && Icons[user.techStackIcon as keyof typeof Icons])
        ? (Icons[user.techStackIcon as keyof typeof Icons] as any)
        : Icons.Code;

    return (
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden relative group transition-transform hover:-translate-y-1 hover:shadow-xl">
            {/* Decorative top background */}
            <div
                className="h-32 w-full transition-colors duration-500"
                style={{ backgroundColor: `${customColor}20` }} // 20% opacity hex
            >
                {/* Geometric Accent */}
                <div
                    className="absolute -top-10 -right-10 w-40 h-40 opacity-30 transform rotate-12 transition-transform group-hover:rotate-45 duration-700"
                    style={{
                        backgroundColor: customColor,
                        clipPath: activeShape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' :
                            activeShape === 'hexagon' ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' :
                                activeShape === 'circle' ? 'circle(50% at 50% 50%)' : 'none',
                        borderRadius: activeShape === 'square' ? '1rem' : '0'
                    }}
                />
            </div>

            <div className="px-6 pb-6 relative">
                {/* Avatar / Shape Indicator */}
                <div
                    className={`w-20 h-20 -mt-10 mx-auto flex items-center justify-center text-2xl font-bold bg-white border-4 border-white shadow-md relative z-10 ${shapeStyle}`}
                    style={{
                        backgroundColor: customColor,
                        color: '#fff',
                        clipPath: activeShape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' :
                            activeShape === 'hexagon' ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' : 'none'
                    }}
                >
                    {/* Ensure text is visible and somewhat centered regardless of shape */}
                    <span className={activeShape === 'triangle' ? 'mt-4' : ''}>
                        {user.name.charAt(0)}
                    </span>
                </div>

                <div className="text-center mt-4">
                    <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                    <p className="text-sm text-gray-500 font-medium">
                        {user.staffSubRole ? `${user.role} - ${user.staffSubRole}` : user.role}
                    </p>
                </div>

                {user.bio && (
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 italic">"{user.bio}"</p>
                    </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-100 flex justify-center gap-4">
                    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 min-w-16">
                        <LucideIcon
                            size={24}
                            style={{ color: customColor }}
                            strokeWidth={1.5}
                        />
                        <span className="text-[10px] uppercase font-bold text-gray-400 mt-2 tracking-wider">Stack</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
