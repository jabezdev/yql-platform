import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { Skeleton, SidebarLabel, SidebarItem } from "@/design";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { TreeChannel } from "../types";
import { getChanIcon } from "../utils";
import { useToast } from "../../../providers/ToastProvider";

interface ChannelRowProps {
    ch: TreeChannel;
    activeId: Id<"chatChannels"> | null;
    expanded: Set<string>;
    unread: Record<string, number>;
    onSelect: (id: Id<"chatChannels">) => void;
    onToggle: (id: string) => void;
    depth?: number;
}

function ChannelRow({
    ch, activeId, expanded, unread, onSelect, onToggle, depth = 0,
}: ChannelRowProps) {
    const isActive = activeId === ch._id;
    const hasKids  = ch.children.length > 0;
    const isOpen   = expanded.has(ch._id);
    const Icon     = getChanIcon(ch.type);
    const cnt      = unread[ch._id] ?? 0;

    return (
        <>
            <div className="relative group">
                <SidebarItem 
                    icon={Icon}
                    label={ch.name}
                    active={isActive}
                    onClick={() => { onSelect(ch._id); if (hasKids) onToggle(ch._id); }}
                    className={`${depth > 0 ? 'ml-2 border-l border-white/5 rounded-none' : ''}`}
                    badge={
                        <div className="flex items-center gap-1.5">
                            {cnt > 0 && (
                                <span className="bg-brand-yellow text-brand-darkBlue text-[9px] font-black px-1.5 py-0.5 rounded-sm shadow-sm leading-none flex-shrink-0 animate-in zoom-in duration-300">
                                    {cnt > 99 ? "99+" : cnt}
                                </span>
                            )}
                            {hasKids && (
                                <span className="opacity-40 group-hover:opacity-100 transition-opacity">
                                    {isOpen ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                                </span>
                            )}
                        </div>
                    }
                />
            </div>
            {hasKids && isOpen && ch.children.map(kid => (
                <ChannelRow
                    key={kid._id} ch={kid} activeId={activeId} expanded={expanded}
                    unread={unread} onSelect={onSelect} onToggle={onToggle} depth={depth + 1}
                />
            ))}
        </>
    );
}

export function SidebarChannels({
    tree,
    activeId,
    expanded,
    unread,
    onSelect,
    onToggle,
    isLoading
}: {
    tree: TreeChannel[];
    activeId: Id<"chatChannels"> | null;
    expanded: Set<string>;
    unread: Record<string, number>;
    onSelect: (id: Id<"chatChannels">) => void;
    onToggle: (id: string) => void;
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
            ) : tree.length === 0 ? (
                <div className="px-4 py-8 text-center bg-white/5 mx-3 mt-4 rounded-tl-xl rounded-br-xl border border-dashed border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20">No active channels</p>
                </div>
            ) : (
                <>
                    <SidebarLabel className="px-4 pt-6 pb-2">Global Channels</SidebarLabel>
                    <div className="px-2">
                        {tree.map(ch => (
                            <ChannelRow
                                key={ch._id} ch={ch} activeId={activeId}
                                expanded={expanded} unread={unread}
                                onSelect={onSelect}
                                onToggle={onToggle}
                            />
                        ))}
                    </div>
                </>
            )}
            
            <button 
                onClick={ComingSoon("Create Channel")}
                className="group flex items-center gap-3 w-[calc(100%-1.5rem)] mx-3 mt-4 px-4 py-2.5 text-white/20 hover:text-white/60 text-[11px] font-black uppercase tracking-widest rounded-tl-xl rounded-br-xl border-2 border-dashed border-white/5 hover:border-white/20 hover:bg-white/5 transition-all outline-none focus:border-brand-yellow/50"
            >
                <div className="w-5 h-5 rounded-md border border-white/10 flex items-center justify-center group-hover:border-white/30 group-hover:bg-white/5 transition-all">
                    <Plus size={12} className="group-hover:rotate-90 transition-transform duration-300" />
                </div>
                <span>Create Channel</span>
            </button>
        </div>
    );
}

