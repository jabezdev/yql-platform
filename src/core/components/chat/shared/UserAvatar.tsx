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

export function UserAvatar({ name, imageUrl, size = "sm", className = "" }: UserAvatarProps) {
    const sizeClass = sizeClasses[size];

    if (imageUrl) {
        return (
            <img
                src={imageUrl}
                alt={name}
                className={`${sizeClass} rounded-tl-lg rounded-br-lg object-cover border-2 border-brand-blueDark/20 flex-shrink-0 ${className}`}
            />
        );
    }

    return (
        <div
            className={`${sizeClass} bg-brand-yellow border-2 border-brand-blueDark/30 rounded-tl-lg rounded-br-lg flex items-center justify-center text-brand-blueDark font-bold flex-shrink-0 ${className}`}
        >
            {name.charAt(0).toUpperCase()}
        </div>
    );
}
