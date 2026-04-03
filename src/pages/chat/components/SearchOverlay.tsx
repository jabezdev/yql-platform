import { Hash, FileIcon, User, Search as SearchIcon, X, ArrowRight } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { format } from "date-fns";

interface SearchOverlayProps {
    query: string;
    channelId?: Id<"chatChannels"> | null;
    onClose: () => void;
    onSelectMessage: (id: Id<"chatMessages">, channelId: Id<"chatChannels">) => void;
}

export function SearchOverlay({ query, channelId, onClose, onSelectMessage }: SearchOverlayProps) {
    const results = useQuery(api.chat.messages.searchMessages, {
        query,
        channelId: channelId ?? undefined
    });

    if (!query) return null;

    const isLoading = results === undefined;

    return (
        <div className="absolute inset-0 z-50 bg-[#0d1825]/95 backdrop-blur-xl flex flex-col p-8 transition-all animate-in fade-in duration-300">
            {/* Header */}
            <div className="max-w-4xl mx-auto w-full flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand-yellow/10 rounded-tl-xl rounded-br-xl text-brand-yellow border-2 border-brand-yellow/20">
                        <SearchIcon size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white leading-tight uppercase tracking-tight">
                            Results for <span className="text-brand-yellow">"{query}"</span>
                        </h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                            {channelId ? "Searching in #" + channelId : "Global Network Search"}
                        </p>
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    className="p-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-xl transition-all border border-white/5 hover:border-white/20"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Results Grid */}
            <div className="flex-1 max-w-4xl mx-auto w-full overflow-y-auto pr-4 custom-scrollbar">
                {isLoading ? (
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white/5 rounded-2xl p-6 border border-white/5 animate-pulse">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-white/10" />
                                    <div className="h-4 w-48 bg-white/10 rounded" />
                                </div>
                                <div className="h-3 w-full bg-white/5 rounded mb-2" />
                                <div className="h-3 w-3/4 bg-white/5 rounded" />
                            </div>
                        ))}
                    </div>
                ) : results.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-4 py-20 border-2 border-dashed border-white/10 rounded-3xl">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                            <SearchIcon size={32} />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-white uppercase tracking-wider">No intel found</p>
                            <p className="text-sm font-medium text-white/30">Try different encryption tokens or expand scope</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {results.map((msg: any) => (
                            <button
                                key={msg._id}
                                onClick={() => onSelectMessage(msg._id, msg.channelId)}
                                className="group relative w-full text-left bg-white/5 hover:bg-brand-blue/10 rounded-2xl p-6 transition-all border border-white/5 hover:border-brand-blue/30 focus:outline-none focus:ring-2 focus:ring-brand-yellow/50"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-brand-yellow/60">
                                                <Hash size={10} />
                                                <span>{msg.channelName}</span>
                                            </div>
                                            <span className="text-[10px] text-white/20 font-black">•</span>
                                            <div className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-none">
                                                {format(msg._creationTime, "MMM d, h:mm a")}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-white/40">
                                                <User size={14} />
                                            </div>
                                            <span className="text-sm font-bold text-white/80">{msg.author?.name}</span>
                                        </div>

                                        <p className="text-sm text-white/60 leading-relaxed mb-4 line-clamp-3">
                                            {msg.bodyPlainText}
                                        </p>

                                        {/* Attachments Preview */}
                                        {msg.attachments && msg.attachments.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {msg.attachments.map((att: any, idx: number) => (
                                                    <div key={idx} className="flex items-center gap-2 bg-brand-blue/20 px-3 py-1.5 rounded-lg border border-brand-blue/30 max-w-[200px]">
                                                        <FileIcon size={12} className="text-brand-blue" />
                                                        <span className="text-[11px] font-bold text-brand-blue/80 truncate">
                                                            {att.filename}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                        <div className="w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center text-brand-darkBlue shadow-lg shadow-brand-yellow/20">
                                            <ArrowRight size={20} />
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Footer / Shortcuts */}
            <div className="max-w-4xl mx-auto w-full pt-8 flex items-center justify-between text-white/20 border-t border-white/5">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <kbd className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono lowercase">esc</kbd>
                        <span className="text-[10px] font-black uppercase tracking-widest">Close</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <kbd className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono uppercase">↵</kbd>
                        <span className="text-[10px] font-black uppercase tracking-widest">Navigate</span>
                    </div>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest">
                    YQL Command Intelligence Engine v2.0
                </div>
            </div>
        </div>
    );
}
