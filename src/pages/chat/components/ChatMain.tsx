import { useState, useEffect } from "react";
import { Hash, Users, Search, Info, MessageSquare } from "lucide-react";
import { Avatar, Button, GeometricPattern } from "@/design";
import type { Id } from "../../../../convex/_generated/dataModel";
import { MessageFeed } from "./MessageFeed";
import { Composer } from "./Composer";
import { ThreadPanel } from "./ThreadPanel";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useToast } from "../../../providers/ToastProvider";

interface ChatMainProps {
    channelId: Id<"chatChannels"> | null;
    userId?: Id<"users">;
    activeDM?: any;
    isDM: boolean;
}

export function ChatMain({
    channelId,
    userId,
    activeDM,
    isDM,
}: ChatMainProps) {
    const { toast } = useToast();
    const [activeThreadId, setActiveThreadId] = useState<Id<"chatMessages"> | null>(null);
    
    // Clear thread when switching channels
    useEffect(() => {
        setActiveThreadId(null);
    }, [channelId]);

    const channelInfo = useQuery(
        api.chat.channels.getChannel,
        channelId && !isDM ? { channelId: channelId } : "skip"
    );

    if (!channelId) {
        return (
            <main className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-[#0d1825] p-12 text-center animate-in fade-in duration-700">
                <div className="relative mb-8">
                    <div className="w-24 h-24 bg-brand-blue/5 rounded-tl-3xl rounded-br-3xl flex items-center justify-center relative z-10 border-2 border-dashed border-brand-blue/10">
                        <MessageSquare size={48} className="text-brand-blue/30" />
                    </div>
                    <div className="absolute -top-4 -right-4 opacity-10">
                        <GeometricPattern variant="corner-tr" size={60} />
                    </div>
                </div>
                <h2 className="text-2xl font-display font-black text-brand-blue mb-3">Secure Communications</h2>
                <p className="text-sm text-brand-blue/50 max-w-sm font-medium leading-relaxed">
                    Select a channel or direct message from the sidebar to engage with the team.
                </p>
                <div className="mt-8 flex gap-4">
                    <Button variant="ghost" size="sm" className="border-brand-blue/5">Recent Activity</Button>
                    <Button variant="ghost" size="sm" className="border-brand-blue/5">Search Archive</Button>
                </div>
            </main>
        );
    }

    const otherParticipant = activeDM?.participants.find((p: any) => p._id !== userId);
    const displayName = isDM ? (otherParticipant?.name ?? activeDM?.name) : channelInfo?.name;
    const channelTopic = !isDM ? channelInfo?.topic : undefined;
    const memberCount = !isDM ? channelInfo?.memberCount : undefined;

    const ComingSoon = (feature: string) => () => toast(`${feature} coming soon!`, "info");

    return (
        <main className="flex-1 flex overflow-hidden bg-white dark:bg-[#0d1825] relative">
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ${activeThreadId ? "pr-0 lg:pr-[400px]" : ""}`}>
                <header className="flex-shrink-0 h-16 border-b-2 border-brand-blue/[0.03] px-6 flex items-center gap-4 bg-white/90 dark:bg-[#0d1825]/90 backdrop-blur-xl z-20">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                            {isDM ? (
                                <Avatar name={displayName ?? "?"} size="md" className="ring-2 ring-brand-blue/5" />
                            ) : (
                                <div className="w-9 h-9 bg-brand-blue/5 rounded-tl-lg rounded-br-lg flex items-center justify-center border-2 border-brand-blue/10">
                                    <Hash size={20} className="text-brand-blue" />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <h1 className="text-base font-black text-brand-blue truncate leading-none mb-1">
                                {displayName}
                            </h1>
                            {channelTopic ? (
                                <p className="text-[11px] font-black uppercase tracking-widest text-brand-blue/40 truncate">{channelTopic}</p>
                            ) : isDM ? (
                                <p className="text-[11px] font-black uppercase tracking-widest text-brand-green">Active Now</p>
                            ) : null}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        {!isDM && memberCount !== undefined && (
                            <button 
                                onClick={ComingSoon("Member List")}
                                className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-blue/40 hover:text-brand-blue hover:bg-brand-blue/5 px-3 py-1.5 rounded-tl-md rounded-br-md transition-all"
                            >
                                <Users size={14} />
                                <span>{memberCount}</span>
                            </button>
                        )}
                        <button onClick={ComingSoon("Search")} className="p-2 text-brand-blue/40 hover:text-brand-blue hover:bg-brand-blue/5 rounded-tl-md rounded-br-md transition-all">
                            <Search size={18} />
                        </button>
                        <button onClick={ComingSoon("Channel Info")} className="p-2 text-brand-blue/40 hover:text-brand-blue hover:bg-brand-blue/5 rounded-tl-md rounded-br-md transition-all">
                            <Info size={18} />
                        </button>
                    </div>
                </header>

                <div className="flex-1 min-h-0 bg-white/50 dark:bg-transparent overflow-hidden">
                    <MessageFeed 
                        channelId={channelId} 
                        userId={userId} 
                        onOpenThread={setActiveThreadId}
                        activeThreadId={activeThreadId}
                    />
                </div>

                <div className="p-4 sm:p-6 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-[#0d1825] dark:via-[#0d1825]/80 pointer-events-none z-10">
                    <div className="pointer-events-auto max-w-4xl mx-auto w-full">
                        <Composer
                            channelId={channelId}
                            placeholder={isDM ? `Send a secure message to ${displayName ?? ""}…` : `Enter message in #${displayName}…`}
                        />
                    </div>
                </div>
            </div>

            {/* Thread Sidebar Panel */}
            {activeThreadId && (
                <div className="absolute top-0 right-0 bottom-0 w-full lg:w-[400px] bg-white dark:bg-[#0d1825] border-l-2 border-brand-blue/5 shadow-2xl z-30 animate-in slide-in-from-right duration-300">
                    <ThreadPanel 
                        threadId={activeThreadId} 
                        userId={userId}
                        onClose={() => setActiveThreadId(null)} 
                    />
                </div>
            )}
        </main>
    );
}

