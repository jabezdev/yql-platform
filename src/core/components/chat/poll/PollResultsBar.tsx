interface PollResultsBarProps {
    text: string;
    voteCount: number;
    totalVotes: number;
    isSelected: boolean;
    isClosed: boolean;
    onVote: () => void;
}

export function PollResultsBar({
    text,
    voteCount,
    totalVotes,
    isSelected,
    isClosed,
    onVote,
}: PollResultsBarProps) {
    const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

    return (
        <button
            onClick={onVote}
            disabled={isClosed}
            className={`w-full text-left rounded-tl-lg rounded-br-lg border-2 overflow-hidden transition-all ${
                isSelected
                    ? "border-brand-lightBlue/50 bg-brand-lightBlue/5"
                    : "border-brand-blue/12 bg-white hover:border-brand-lightBlue/30 hover:bg-brand-lightBlue/3"
            } ${isClosed ? "cursor-default" : "cursor-pointer"}`}
        >
            {/* Progress fill */}
            <div className="relative px-3 py-2">
                <div
                    className={`absolute inset-0 transition-all duration-500 ${
                        isSelected ? "bg-brand-lightBlue/12" : "bg-brand-blue/4"
                    }`}
                    style={{ width: `${pct}%` }}
                />
                <div className="relative flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-brand-blue truncate flex items-center gap-1.5">
                        {isSelected && (
                            <span className="inline-block w-2 h-2 rounded-full bg-brand-lightBlue flex-shrink-0" />
                        )}
                        {text}
                    </span>
                    <span className="text-xs font-bold text-brand-blue/50 flex-shrink-0">
                        {pct}%
                        {voteCount > 0 && (
                            <span className="ml-1 text-brand-blue/35 font-normal">
                                ({voteCount})
                            </span>
                        )}
                    </span>
                </div>
            </div>
        </button>
    );
}
