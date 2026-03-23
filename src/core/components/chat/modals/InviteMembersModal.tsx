import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useToast } from "../../../providers/ToastProvider";
import { UserAvatar } from "../shared/UserAvatar";
import { X, UserPlus, Search, Check, Loader2 } from "lucide-react";
import type { Id } from "../../../../../convex/_generated/dataModel";

interface InviteMembersModalProps {
    channelId: Id<"chatChannels">;
    onClose: () => void;
}

export function InviteMembersModal({ channelId, onClose }: InviteMembersModalProps) {
    const { toast } = useToast();
    const members = useQuery(api.chatMembers.listMembers, { channelId });
    const allUsers = useQuery(api.users.getDirectory);
    const inviteToChannel = useMutation(api.chatMembers.inviteToChannel);

    const [search, setSearch] = useState("");
    const [invited, setInvited] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState<string | null>(null);

    const memberIds = new Set(members?.map((m) => m.userId));
    const candidates = (allUsers ?? []).filter(
        (u) => !memberIds.has(u._id) && u.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleInvite = async (userId: Id<"users">, name: string) => {
        setLoading(userId);
        try {
            await inviteToChannel({ channelId, userId });
            setInvited((prev) => new Set([...prev, userId]));
            toast(`${name} added to channel`, "success");
        } catch (err: any) {
            toast(err?.message ?? "Failed to invite", "error");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-blue/30 backdrop-blur-sm">
            <div className="bg-white rounded-tl-2xl rounded-br-2xl shadow-[6px_6px_0px_0px_rgba(10,22,48,0.15)] w-[400px] max-h-[75vh] flex flex-col overflow-hidden border-2 border-brand-blue/10">
                <div className="flex items-center justify-between px-5 py-4 border-b-2 border-brand-blue/8 shrink-0">
                    <div className="flex items-center gap-2">
                        <UserPlus size={15} className="text-brand-lightBlue" />
                        <h2 className="text-sm font-bold text-brand-blue">Add Members</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-tl-lg rounded-br-lg text-brand-blue/40 hover:bg-brand-bgLight transition-colors">
                        <X size={14} />
                    </button>
                </div>

                <div className="px-4 pt-3 pb-2 shrink-0">
                    <div className="flex items-center gap-2 bg-brand-bgLight border-2 border-brand-blue/10 rounded-tl-lg rounded-br-lg px-2.5 py-1.5 focus-within:border-brand-lightBlue/30">
                        <Search size={13} className="text-brand-blue/30 flex-shrink-0" />
                        <input
                            autoFocus
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search people..."
                            className="flex-1 bg-transparent text-sm text-brand-blue placeholder-brand-blue/30 outline-none"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-3">
                    {candidates.length === 0 ? (
                        <p className="text-xs text-brand-blue/35 text-center py-6">
                            {search ? "No matches" : "Everyone is already a member"}
                        </p>
                    ) : (
                        candidates.map((u) => {
                            const isInvited = invited.has(u._id);
                            const isLoading = loading === u._id;
                            return (
                                <div key={u._id} className="flex items-center gap-3 px-3 py-2.5 rounded-tl-lg rounded-br-lg hover:bg-brand-bgLight transition-colors">
                                    <UserAvatar name={u.name} size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-brand-blue truncate">{u.name}</p>
                                        <p className="text-[10px] text-brand-blue/40">{u.role}</p>
                                    </div>
                                    <button
                                        onClick={() => !isInvited && handleInvite(u._id, u.name)}
                                        disabled={isInvited || isLoading}
                                        className={`p-1.5 rounded-tl-lg rounded-br-lg transition-colors flex-shrink-0 ${
                                            isInvited
                                                ? "text-green-500 bg-green-50"
                                                : "text-brand-lightBlue hover:bg-brand-lightBlue/8"
                                        }`}
                                    >
                                        {isLoading ? <Loader2 size={14} className="animate-spin" /> : isInvited ? <Check size={14} /> : <UserPlus size={14} />}
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="px-4 py-3 border-t-2 border-brand-blue/8 flex justify-end shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 bg-brand-blue text-white text-xs font-bold rounded-tl-lg rounded-br-lg hover:bg-brand-lightBlue transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
