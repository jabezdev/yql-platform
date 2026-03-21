import { format, isToday, isYesterday } from "date-fns";

interface DateDividerProps {
    timestamp: number;
}

function formatDividerDate(timestamp: number): string {
    const date = new Date(timestamp);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM d, yyyy");
}

export function DateDivider({ timestamp }: DateDividerProps) {
    return (
        <div className="flex items-center gap-3 my-4 px-4">
            <div className="flex-1 h-px bg-brand-blueDark/10" />
            <span className="text-[11px] font-bold text-brand-blueDark/40 uppercase tracking-wider whitespace-nowrap">
                {formatDividerDate(timestamp)}
            </span>
            <div className="flex-1 h-px bg-brand-blueDark/10" />
        </div>
    );
}
