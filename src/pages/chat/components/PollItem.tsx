import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { 
    Button, 
    GeometricPattern,
} from "@/design";
import { Check, Users, Lock, Clock } from "lucide-react";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useToast } from "../../../providers/ToastProvider";

interface PollItemProps {
    pollId: Id<"chatPolls">;
    userId?: Id<"users">;
}

export function PollItem({ pollId, userId }: PollItemProps) {
    const { toast } = useToast();
    const poll = useQuery(api.chat.polls.getPollWithVotes, { pollId });
    const vote = useMutation(api.chat.polls.vote);
    const closePoll = useMutation(api.chat.polls.closePoll);

    if (!poll) {
        return (
            <div className="p-4 bg-brand-blue/5 rounded-xl border border-dashed border-brand-blue/20 animate-pulse">
                <div className="h-4 w-3/4 bg-brand-blue/10 rounded mb-3" />
                <div className="space-y-2">
                    <div className="h-8 w-full bg-brand-blue/5 rounded" />
                    <div className="h-8 w-full bg-brand-blue/5 rounded" />
                </div>
            </div>
        );
    }

    const { 
        question, 
        options, 
        voteCounts, 
        totalVotes, 
        myVotes, 
        closedAt, 
        isAnonymous, 
        allowMultipleVotes,
        createdBy 
    } = poll;

    const isClosed = !!closedAt;
    const isCreator = userId === createdBy;

    const handleVote = async (optionId: string) => {
        if (isClosed) return;
        try {
            await vote({ pollId, optionId });
        } catch (err: any) {
            toast(err.message || "Failed to submit vote", "error");
        }
    };

    const handleClose = async () => {
        if (!confirm("Are you sure you want to finalize this poll? No more votes can be cast.")) return;
        try {
            await closePoll({ pollId });
            toast("Poll finalized", "success");
        } catch (err: any) {
            toast("Failed to close poll", "error");
        }
    };

    return (
        <div className="my-3 p-5 bg-white dark:bg-[#1a2d40] border-2 border-brand-blue/15 dark:border-white/10 rounded-tl-2xl rounded-br-2xl shadow-[4px_4px_0px_rgba(57,103,153,0.1)] dark:shadow-[6px_6px_0px_rgba(0,0,0,0.3)] relative overflow-hidden group">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 p-2 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                <GeometricPattern variant="corner-tr" size={40} />
            </div>

            <div className="relative z-10">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                        <h3 className="text-[15px] font-black tracking-tight text-brand-blue dark:text-white mb-1 leading-snug">
                            {question}
                        </h3>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-brand-blue/40 dark:text-white/30">
                                <Users size={10} /> {totalVotes} {totalVotes === 1 ? "Operator" : "Operators"}
                            </span>
                            {isAnonymous && (
                                <span className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-brand-yellow font-black">
                                    <Lock size={10} /> Encrypted
                                </span>
                            )}
                            {isClosed && (
                                <span className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-brand-red font-black">
                                    <Clock size={10} /> Finalized
                                </span>
                            )}
                        </div>
                    </div>
                    
                    {isCreator && !isClosed && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleClose}
                            className="h-7 px-2 text-[8px] font-black"
                        >
                            FINALIZE
                        </Button>
                    )}
                </div>

                <div className="space-y-3">
                    {options.map((opt) => {
                        const count = voteCounts[opt.id] ?? 0;
                        const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                        const hasVoted = myVotes.includes(opt.id);

                        return (
                            <button
                                key={opt.id}
                                disabled={isClosed}
                                onClick={() => handleVote(opt.id)}
                                className={`relative w-full text-left overflow-hidden rounded-lg border-2 transition-all group/opt ${
                                    isClosed 
                                        ? "cursor-default border-brand-blue/5 dark:border-white/5" 
                                        : hasVoted 
                                        ? "border-brand-blue dark:border-brand-yellow bg-brand-blue/[0.02] dark:bg-brand-yellow/[0.02]" 
                                        : "border-brand-blue/10 dark:border-white/10 hover:border-brand-blue/40 dark:hover:border-white/30 hover:bg-brand-blue/[0.03] dark:hover:bg-white/[0.03]"
                                }`}
                            >
                                {/* Progress Bar Background */}
                                <div 
                                    className={`absolute inset-y-0 left-0 transition-all duration-1000 ease-out ${
                                        hasVoted 
                                            ? "bg-brand-blue/10 dark:bg-brand-yellow/10" 
                                            : "bg-brand-blue/[0.03] dark:bg-white/[0.03]"
                                    }`}
                                    style={{ width: `${percentage}%` }}
                                />

                                <div className="relative z-10 px-4 py-2.5 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                                            hasVoted 
                                                ? "bg-brand-blue border-brand-blue dark:bg-brand-yellow dark:border-brand-yellow text-white dark:text-brand-darkBlue" 
                                                : "border-brand-blue/20 dark:border-white/20"
                                        }`}>
                                            {hasVoted && <Check size={10} strokeWidth={4} />}
                                        </div>
                                        <span className={`text-xs font-bold truncate ${
                                            hasVoted ? "text-brand-blue dark:text-brand-yellow" : "text-brand-blue/70 dark:text-white/60"
                                        }`}>
                                            {opt.text}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className={`text-[10px] font-black tracking-tighter ${
                                            hasVoted ? "text-brand-blue dark:text-brand-yellow" : "text-brand-blue/30 dark:text-white/20"
                                        }`}>
                                            {percentage}%
                                        </span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {!isClosed && allowMultipleVotes && (
                    <p className="mt-3 text-[9px] font-black uppercase tracking-widest text-brand-blue/20 dark:text-white/10 text-center">
                        Multiple selection enabled
                    </p>
                )}
            </div>
        </div>
    );
}
