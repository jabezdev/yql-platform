interface UnreadBadgeProps {
    count: number;
    max?: number;
    /** Use "dot" for a simple dot (no number), useful in tight spaces */
    variant?: "count" | "dot";
}

export function UnreadBadge({ count, max = 99, variant = "count" }: UnreadBadgeProps) {
    if (count <= 0) return null;

    if (variant === "dot") {
        return (
            <span className="w-2 h-2 rounded-full bg-brand-blue flex-shrink-0" />
        );
    }

    const display = count > max ? `${max}+` : String(count);

    return (
        <span className="min-w-[18px] h-[18px] bg-brand-blue text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none flex-shrink-0">
            {display}
        </span>
    );
}
