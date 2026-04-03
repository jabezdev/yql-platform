import { Plus } from "lucide-react";
import { Skeleton, SidebarLabel, SidebarItem, Avatar } from "@/design";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { DMChannel } from "../types";
import { formatTime } from "../utils";
import { useToast } from "../../../providers/ToastProvider";

export function SidebarDirectMessages({
    dms,
    activeId,
    unread,
    onSelect,
    userId,
    isLoading
}: {
    dms: DMChannel[];
    activeId: Id<"chatChannels"> | null;
    unread: Record<string, number>;
    onSelect: (id: Id<"chatChannels">) => void;
    userId?: Id<"users">;
    isLoading: boolean;
}) {
    const { toast } = useToast();

    const ComingSoon = (feature: string) => () => toast(`${feature} coming soon!`, "info");

    return (
        <div className="space-y-0.5">
            {isLoading ? (
                <div className="px-3 pt-4 space-y-4">
                    <Skeleton variant="line" lines={1} className="w-24 opacity-20" dark />
                    <Skeleton variant="list" dark />
                </div>
            ) : dms.length === 0 ? (
                <div className="px-4 py-8 text-center bg-white/5 mx-3 mt-4 rounded-tl-xl rounded-br-xl border border-dashed border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20">No direct messages</p>
                </div>
            ) : (
                <>
                    <SidebarLabel className="px-4 pt-6 pb-2">Direct Messages</SidebarLabel>
                    <div className="px-2">
                        {dms.map(dm => {
                            const other = dm.participants.find(p => p._id !== userId);
                            const name  = other?.name ?? dm.name;
                            const isAct = activeId === dm._id;
                            const cnt   = unread[dm._id] ?? 0;
                            const lastMsg = dm.lastMessage;
                            
                            return (
                                <SidebarItem 
                                    key={dm._id}
                                    icon={() => <Avatar name={name} size="sm" className="ring-2 ring-white/5" />}
                                    label={name}
                                    active={isAct}
                                    onClick={() => onSelect(dm._id)}
                                    badge={
                                        <div className="flex items-center gap-1.5">
                                            {lastMsg && (
                                                <span className="text-[10px] text-white/30 flex-shrink-0 group-hover:text-white/50 transition-colors">
                                                    {formatTime(lastMsg._creationTime)}
                                                </span>
                                            )}
                                            {cnt > 0 && (
                                                <span className="bg-brand-yellow text-brand-darkBlue text-[9px] font-black px-1.5 py-0.5 rounded-sm shadow-sm leading-none animate-in zoom-in duration-300">
                                                    {cnt > 99 ? "99+" : cnt}
                                                </span>
                                            )}
                                        </div>
                                    }
                                />
                            );
                        })}
                    </div>
                </>
            )}
            
            <button 
                onClick={ComingSoon("New DM")}
                className="group flex items-center gap-3 w-[calc(100%-1.5rem)] mx-3 mt-4 px-4 py-2.5 text-white/20 hover:text-white/60 text-[11px] font-black uppercase tracking-widest rounded-tl-xl rounded-br-xl border-2 border-dashed border-white/5 hover:border-white/20 hover:bg-white/5 transition-all outline-none focus:border-brand-yellow/50"
            >
                <div className="w-5 h-5 rounded-md border border-white/10 flex items-center justify-center group-hover:border-white/30 group-hover:bg-white/5 transition-all">
                    <Plus size={12} className="group-hover:rotate-90 transition-transform duration-300" />
                </div>
                <span>Start New DM</span>
            </button>
        </div>
    );
}

