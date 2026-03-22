import { Search, X } from "lucide-react";

interface ChannelSearchProps {
    value: string;
    onChange: (value: string) => void;
}

export function ChannelSearch({ value, onChange }: ChannelSearchProps) {
    return (
        <div className="relative px-2 mb-1">
            <Search
                size={12}
                className="absolute left-[18px] top-1/2 -translate-y-1/2 text-brand-blue/30 pointer-events-none"
            />
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Filter channels…"
                className="w-full pl-7 pr-7 py-1.5 text-xs bg-brand-bgLight border border-brand-blue/10 rounded-lg outline-none focus:border-brand-lightBlue/40 text-brand-blue placeholder-brand-blue/30 transition-colors"
            />
            {value && (
                <button
                    onClick={() => onChange("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-blue/30 hover:text-brand-blue/60 transition-colors"
                >
                    <X size={11} />
                </button>
            )}
        </div>
    );
}
