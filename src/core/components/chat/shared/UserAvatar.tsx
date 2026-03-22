interface UserAvatarProps {
    name: string;
    imageUrl?: string | null;
    size?: "xs" | "sm" | "md" | "lg";
    className?: string;
}

const sizeClasses = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-10 h-10 text-base",
};

// Distinct palette — visually differentiable, readable against white initials.
const AVATAR_COLORS = [
    "#3d8ccb", // brand-lightBlue
    "#bc594f", // brand-wine
    "#10b981", // brand-green
    "#f59e0b", // amber
    "#8b5cf6", // violet
    "#06b6d4", // cyan
    "#f97316", // orange
    "#ec4899", // pink
];

function colorFromName(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function UserAvatar({ name, imageUrl, size = "sm", className = "" }: UserAvatarProps) {
    const sizeClass = sizeClasses[size];

    if (imageUrl) {
        return (
            <img
                src={imageUrl}
                alt={name}
                className={`${sizeClass} rounded-tl-lg rounded-br-lg object-cover border-2 border-brand-blue/20 flex-shrink-0 ${className}`}
            />
        );
    }

    return (
        <div
            style={{ backgroundColor: colorFromName(name) }}
            className={`${sizeClass} border-2 border-white/20 rounded-tl-lg rounded-br-lg flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}
        >
            {name.charAt(0).toUpperCase()}
        </div>
    );
}
