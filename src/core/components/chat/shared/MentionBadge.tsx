interface MentionBadgeProps {
    label: string;
}

export function MentionBadge({ label }: MentionBadgeProps) {
    return (
        <span className="inline-flex items-center px-1.5 py-0 rounded-md bg-brand-lightBlue/10 text-brand-lightBlue font-semibold text-[0.875em] cursor-default select-none">
            @{label}
        </span>
    );
}
