import { useEffect, useRef } from "react";

// Common reaction/message emojis
const EMOJI_ROWS = [
    ["👍", "❤️", "😂", "😮", "😢", "😡", "🎉", "🔥"],
    ["✅", "👀", "🙌", "💯", "🤔", "😅", "🥲", "💀"],
    ["🚀", "⚡", "💡", "📌", "🎯", "🤝", "👏", "💪"],
];

interface EmojiPickerProps {
    onSelect: (emoji: string) => void;
    onClose: () => void;
}

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onClose]);

    return (
        <div
            ref={ref}
            className="absolute z-50 bg-white border-2 border-brand-blueDark/10 rounded-tl-xl rounded-br-xl shadow-[4px_4px_0px_0px_rgba(10,22,48,0.10)] p-2 flex flex-col gap-1"
        >
            {EMOJI_ROWS.map((row, ri) => (
                <div key={ri} className="flex gap-0.5">
                    {row.map((emoji) => (
                        <button
                            key={emoji}
                            onClick={() => { onSelect(emoji); onClose(); }}
                            className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-brand-bgLight transition-colors"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            ))}
        </div>
    );
}
