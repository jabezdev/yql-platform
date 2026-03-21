import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

interface TypingIndicatorProps {
    channelId: Id<"chatChannels">;
}

export function TypingIndicator({ channelId }: TypingIndicatorProps) {
    const names = useQuery(api.chatTyping.getTyping, { channelId }) ?? [];

    if (names.length === 0) return null;

    const label =
        names.length === 1
            ? `${names[0]} is typing…`
            : names.length === 2
            ? `${names[0]} and ${names[1]} are typing…`
            : `${names[0]} and ${names.length - 1} others are typing…`;

    return (
        <div className="flex items-center gap-1.5 px-4 py-1 text-[11px] text-brand-blueDark/40 font-medium shrink-0">
            {/* Three bouncing dots */}
            <span className="flex items-center gap-0.5">
                {[0, 1, 2].map((i) => (
                    <span
                        key={i}
                        className="inline-block w-1 h-1 rounded-full bg-brand-blueDark/35 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                    />
                ))}
            </span>
            {label}
        </div>
    );
}
