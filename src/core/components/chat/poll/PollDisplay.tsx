import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { PollResultsBar } from "./PollResultsBar";
import { useAuthContext } from "../../../providers/AuthProvider";
import { Lock, BarChart2 } from "lucide-react";
import type { Doc } from "../../../../../convex/_generated/dataModel";

interface PollDisplayProps {
    poll: Doc<"chatPolls">;
}

export function PollDisplay({ poll }: PollDisplayProps) {
    const { user } = useAuthContext();
    const pollData = useQuery(api.chatPolls.getPollWithVotes, { pollId: poll._id });
    const voteMutation = useMutation(api.chatPolls.vote);
    const closePoll = useMutation(api.chatPolls.closePoll);

    const isClosed = !!poll.closedAt;
    const isCreator = user?._id === poll.createdBy;
    const isManager =
        user?.role === "T1" ||
        user?.role === "T2" ||
        user?.role === "T3" ||
        user?.role === "Super Admin";

    const myVotes = pollData?.myVotes ?? [];
    const voteCounts = pollData?.voteCounts ?? {};
    const totalVotes = pollData?.totalVotes ?? 0;

    const handleVote = async (optionId: string) => {
        if (isClosed) return;
        await voteMutation({ pollId: poll._id, optionId });
    };

    const handleClose = async () => {
        if (!confirm("Close this poll? No more votes will be accepted.")) return;
        await closePoll({ pollId: poll._id });
    };

    return (
        <div className="mt-2 border-2 border-brand-blueDark/10 rounded-tl-xl rounded-br-xl overflow-hidden max-w-sm">
            {/* Header */}
            <div className="flex items-start gap-2 px-3 pt-3 pb-2">
                <BarChart2 size={15} className="text-brand-blue flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-brand-blueDark leading-snug">
                        {poll.question}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                        {isClosed ? (
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-red-500">
                                <Lock size={9} /> Closed
                            </span>
                        ) : (
                            <span className="text-[10px] text-brand-blueDark/35">
                                {poll.allowMultipleVotes ? "Multiple choices allowed" : "Pick one"}
                                {poll.isAnonymous && " · Anonymous"}
                            </span>
                        )}
                        <span className="text-[10px] text-brand-blueDark/30">
                            {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-1.5 px-3 pb-3">
                {poll.options.map((opt) => (
                    <PollResultsBar
                        key={opt.id}
                        text={opt.text}
                        voteCount={voteCounts[opt.id] ?? 0}
                        totalVotes={totalVotes}
                        isSelected={myVotes.includes(opt.id)}
                        isClosed={isClosed}
                        onVote={() => handleVote(opt.id)}
                    />
                ))}
            </div>

            {/* Footer: close button for creator / manager */}
            {!isClosed && (isCreator || isManager) && (
                <div className="px-3 pb-2.5">
                    <button
                        onClick={handleClose}
                        className="text-[10px] text-brand-blueDark/35 hover:text-red-500 transition-colors font-medium"
                    >
                        Close poll
                    </button>
                </div>
            )}
        </div>
    );
}
