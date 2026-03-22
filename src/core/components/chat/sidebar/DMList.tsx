import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useChatContext } from "../../../providers/ChatProvider";
import { useAuthContext } from "../../../providers/AuthProvider";
import { DMListItem } from "./DMListItem";
import { Plus, Search, X } from "lucide-react";
import type { Id } from "../../../../../convex/_generated/dataModel";

export function DMList() {
    const dms = useQuery(api.chatDirectMessages.listMyDMs);
    const allUsers = useQuery(api.users.getDirectory);
    const getOrCreateDM = useMutation(api.chatDirectMessages.getOrCreateDM);
    const { setActiveChannelId } = useChatContext();
    const { user } = useAuthContext();

    const [showPicker, setShowPicker] = useState(false);
    const [search, setSearch] = useState("");
    const [starting, setStarting] = useState(false);

    const filteredUsers = (allUsers ?? []).filter(
        (u) =>
            u._id !== user?._id &&
            u.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleStartDM = async (targetUserId: Id<"users">) => {
        if (starting) return;
        setStarting(true);
        try {
            const channelId = await getOrCreateDM({ targetUserId });
            setActiveChannelId(channelId);
            setShowPicker(false);
            setSearch("");
        } finally {
            setStarting(false);
        }
    };

    return (
        <div className="flex flex-col gap-0.5">
            {/* Header row */}
            <div className="flex items-center justify-between px-3 py-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-blue/40">
                    Direct Messages
                </span>
                <button
                    onClick={() => setShowPicker((v) => !v)}
                    className="p-0.5 rounded text-brand-blue/30 hover:text-brand-lightBlue hover:bg-brand-lightBlue/5 transition-colors"
                    title="New direct message"
                >
                    <Plus size={14} />
                </button>
            </div>

            {/* User picker */}
            {showPicker && (
                <div className="mx-2 mb-2 border-2 border-brand-blue/10 rounded-tl-xl rounded-br-xl overflow-hidden shadow-sm">
                    <div className="flex items-center gap-2 px-2.5 py-2 border-b border-brand-blue/10 bg-brand-bgLight">
                        <Search size={12} className="text-brand-blue/30 flex-shrink-0" />
                        <input
                            autoFocus
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Find a member..."
                            className="flex-1 bg-transparent text-xs text-brand-blue placeholder-brand-blue/30 outline-none"
                        />
                        <button
                            onClick={() => { setShowPicker(false); setSearch(""); }}
                            className="text-brand-blue/30 hover:text-brand-blue/60 transition-colors"
                        >
                            <X size={12} />
                        </button>
                    </div>
                    <div className="max-h-48 overflow-y-auto bg-white">
                        {filteredUsers.length === 0 ? (
                            <p className="text-xs text-brand-blue/40 text-center py-4">
                                {search ? "No members found" : "No other members"}
                            </p>
                        ) : (
                            filteredUsers.slice(0, 20).map((u) => (
                                <button
                                    key={u._id}
                                    onClick={() => handleStartDM(u._id)}
                                    disabled={starting}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-brand-bgLight transition-colors disabled:opacity-50"
                                >
                                    <div className="w-6 h-6 bg-brand-yellow border-2 border-brand-blue/20 rounded-tl-md rounded-br-md flex items-center justify-center text-[10px] font-bold text-brand-blue flex-shrink-0">
                                        {u.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-brand-blue truncate">{u.name}</p>
                                        <p className="text-[10px] text-brand-blue/40 truncate">{u.role}</p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* DM list */}
            {dms === undefined ? (
                <div className="px-3 py-2 space-y-1.5">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-10 bg-brand-blue/5 rounded-lg animate-pulse" />
                    ))}
                </div>
            ) : dms.length === 0 ? (
                <p className="px-3 py-2 text-xs text-brand-blue/35 italic">
                    No conversations yet. Start one with the{" "}
                    <button
                        onClick={() => setShowPicker(true)}
                        className="text-brand-lightBlue font-medium hover:underline"
                    >
                        + button
                    </button>
                    .
                </p>
            ) : (
                dms.map((dm) => <DMListItem key={dm._id} channel={dm} />)
            )}
        </div>
    );
}
