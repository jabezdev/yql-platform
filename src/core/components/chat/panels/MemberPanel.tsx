import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { UserAvatar } from "../shared/UserAvatar";
import { useAuthContext } from "../../../providers/AuthProvider";
import { UserPlus, Loader2, Search, Crown, Shield, User } from "lucide-react";
import type { Id } from "../../../../../convex/_generated/dataModel";

interface MemberPanelProps {
    channelId: Id<"chatChannels">;
}

const roleIcon = (role: "owner" | "admin" | "member") => {
    if (role === "owner") return <Crown size={11} className="text-brand-yellow" />;
    if (role === "admin") return <Shield size={11} className="text-brand-blue/60" />;
    return <User size={11} className="text-brand-blueDark/25" />;
};

export function MemberPanel({ channelId }: MemberPanelProps) {
    const { user } = useAuthContext();
    const members = useQuery(api.chatMembers.listMembers, { channelId });
    const allUsers = useQuery(api.users.getDirectory);
    const inviteToChannel = useMutation(api.chatMembers.inviteToChannel);

    const [showInvite, setShowInvite] = useState(false);
    const [search, setSearch] = useState("");
    const [inviting, setInviting] = useState(false);

    const isManager =
        user?.role === "T1" || user?.role === "T2" || user?.role === "T3" || user?.role === "Super Admin";

    const memberIds = new Set(members?.map((m) => m.userId));
    const inviteable = (allUsers ?? []).filter(
        (u) => !memberIds.has(u._id) && u.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleInvite = async (userId: Id<"users">) => {
        if (inviting) return;
        setInviting(true);
        try {
            await inviteToChannel({ channelId, userId });
        } finally {
            setInviting(false);
        }
    };

    if (!members) {
        return (
            <div className="flex justify-center py-6">
                <Loader2 size={18} className="animate-spin text-brand-blue/50" />
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1 min-h-0">
            {/* Invite section (managers only) */}
            {isManager && (
                <div className="px-3 py-2.5 border-b border-brand-blueDark/8 shrink-0">
                    {!showInvite ? (
                        <button
                            onClick={() => setShowInvite(true)}
                            className="flex items-center gap-2 w-full text-xs font-medium text-brand-blue hover:text-brand-blue/80 transition-colors"
                        >
                            <UserPlus size={13} />
                            Add members
                        </button>
                    ) : (
                        <div>
                            <div className="flex items-center gap-2 bg-brand-bgLight border-2 border-brand-blueDark/10 rounded-lg px-2.5 py-1.5 focus-within:border-brand-blue/30 mb-2">
                                <Search size={12} className="text-brand-blueDark/30 flex-shrink-0" />
                                <input
                                    autoFocus
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Find people..."
                                    className="flex-1 bg-transparent text-xs text-brand-blueDark placeholder-brand-blueDark/30 outline-none"
                                />
                            </div>
                            <div className="max-h-36 overflow-y-auto custom-scrollbar">
                                {inviteable.slice(0, 15).map((u) => (
                                    <button
                                        key={u._id}
                                        onClick={() => handleInvite(u._id)}
                                        disabled={inviting}
                                        className="w-full flex items-center gap-2 px-1 py-1.5 rounded-lg hover:bg-brand-bgLight transition-colors disabled:opacity-50"
                                    >
                                        <UserAvatar name={u.name} size="xs" />
                                        <div className="flex-1 min-w-0 text-left">
                                            <p className="text-xs font-medium text-brand-blueDark truncate">{u.name}</p>
                                            <p className="text-[10px] text-brand-blueDark/40">{u.role}</p>
                                        </div>
                                        <UserPlus size={12} className="text-brand-blue/50 flex-shrink-0" />
                                    </button>
                                ))}
                                {inviteable.length === 0 && (
                                    <p className="text-xs text-brand-blueDark/35 text-center py-2">
                                        {search ? "No matches" : "Everyone is already a member"}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => { setShowInvite(false); setSearch(""); }}
                                className="mt-1 text-[11px] text-brand-blueDark/35 hover:text-brand-blueDark transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Member list */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-blueDark/35 mb-2">
                    {members.length} Member{members.length !== 1 ? "s" : ""}
                </p>
                <div className="flex flex-col gap-0.5">
                    {members.map((m) => (
                        <div key={m._id} className="flex items-center gap-2.5 px-1 py-1.5 rounded-lg hover:bg-brand-bgLight transition-colors">
                            <UserAvatar name={m.user?.name ?? "?"} size="sm" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-brand-blueDark truncate">
                                    {m.user?.name ?? "Unknown"}
                                </p>
                                <p className="text-[10px] text-brand-blueDark/40">{m.user?.role ?? ""}</p>
                            </div>
                            <span className="flex-shrink-0">{roleIcon(m.role)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
