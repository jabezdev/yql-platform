interface MentionBadgeProps {
    label: string;
    dark?: boolean;
}

export function MentionBadge({ label, dark = false }: MentionBadgeProps) {
    return (
        <span className={[
            "inline-flex items-center gap-0.5 px-1.5 py-0.5 border rounded-sm font-bold text-xs cursor-pointer transition-colors",
            dark 
                ? "bg-brand-yellow/20 border-brand-yellow/40 text-brand-yellow hover:bg-brand-yellow/30" 
                : "bg-brand-lightBlue/15 border-brand-lightBlue/30 text-brand-lightBlue hover:bg-brand-lightBlue/25"
        ].join(' ')}>
            @{label}
        </span>
    );
}
