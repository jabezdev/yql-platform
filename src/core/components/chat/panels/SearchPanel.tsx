import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { MessageBody } from "../conversation/MessageBody";
import { UserAvatar } from "../shared/UserAvatar";
import { Search, Loader2 } from "lucide-react";
import { format } from "date-fns";
import type { Id } from "../../../../../convex/_generated/dataModel";

interface SearchPanelProps {
    channelId: Id<"chatChannels">;
}

export function SearchPanel({ channelId }: SearchPanelProps) {
    const [query, setQuery] = useState("");

    const results = useQuery(
        api.chatMessages.searchMessages,
        query.trim().length >= 2 ? { channelId, searchText: query.trim() } : "skip"
    );

    return (
        <div className="flex flex-col flex-1 min-h-0">
            {/* Search input */}
            <div className="px-3 py-2.5 border-b border-brand-blue/8 shrink-0">
                <div className="flex items-center gap-2 bg-brand-bgLight border-2 border-brand-blue/10 rounded-tl-lg rounded-br-lg px-2.5 py-1.5 focus-within:border-brand-lightBlue/30 transition-colors">
                    <Search size={13} className="text-brand-blue/30 flex-shrink-0" />
                    <input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search messages..."
                        className="flex-1 bg-transparent text-xs text-brand-blue placeholder-brand-blue/30 outline-none"
                    />
                </div>
                {query.trim().length > 0 && query.trim().length < 2 && (
                    <p className="text-[10px] text-brand-blue/30 mt-1 pl-1">
                        Type at least 2 characters
                    </p>
                )}
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {results === undefined && query.trim().length >= 2 && (
                    <div className="flex justify-center py-6">
                        <Loader2 size={16} className="animate-spin text-brand-lightBlue/50" />
                    </div>
                )}

                {results !== undefined && results.length === 0 && query.trim().length >= 2 && (
                    <div className="flex flex-col items-center justify-center gap-2 py-8 text-brand-blue/25 px-4">
                        <Search size={24} strokeWidth={1.5} />
                        <p className="text-xs font-medium text-center">No messages found</p>
                    </div>
                )}

                {query.trim().length < 2 && (
                    <div className="flex flex-col items-center justify-center gap-2 py-8 text-brand-blue/20 px-4">
                        <Search size={24} strokeWidth={1.5} />
                        <p className="text-xs text-center">Search messages in this channel</p>
                    </div>
                )}

                {results && results.map((msg) => (
                    <div
                        key={msg._id}
                        className="px-4 py-3 border-b border-brand-blue/6 hover:bg-brand-bgLight/60 transition-colors"
                    >
                        <div className="flex items-start gap-2">
                            <UserAvatar name={msg.author?.name ?? "?"} size="sm" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2 mb-0.5">
                                    <span className="text-xs font-bold text-brand-blue">
                                        {msg.author?.name ?? "Unknown"}
                                    </span>
                                    <span className="text-[10px] text-brand-blue/35">
                                        {format(new Date(msg._creationTime), "MMM d, h:mm a")}
                                    </span>
                                </div>
                                <MessageBody body={msg.body} isDeleted={msg.isDeleted} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
