import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Plus, Trash2, Lock, Globe, Heart, Clock, Users } from "lucide-react";
import { useToast } from "../../../providers/ToastProvider";

interface DesignRecord {
    _id: Id<"posterDesigns">;
    title: string;
    state: any;
    thumbnail?: string;
    isPrivate: boolean;
    likesCount: number;
    updatedAt: number;
    authorName?: string;
}

interface DesignsPanelProps {
    currentDesignId: Id<"posterDesigns"> | null;
    onLoadDesign: (design: { _id: Id<"posterDesigns">; title: string; state: any; isPrivate: boolean }) => void;
    onNewDesign: () => void;
}

function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function DesignCard({
    design,
    isActive,
    isLiked,
    onLoad,
    onDelete,
    onToggleLike,
    showAuthor = false,
}: {
    design: DesignRecord;
    isActive: boolean;
    isLiked: boolean;
    onLoad: () => void;
    onDelete?: () => void;
    onToggleLike: () => void;
    showAuthor?: boolean;
}) {
    const [confirmDelete, setConfirmDelete] = useState(false);

    return (
        <div
            className={`group relative flex flex-col border-2 rounded-tl-xl rounded-br-xl overflow-hidden transition-all cursor-pointer ${
                isActive
                    ? "border-brand-lightBlue/60 shadow-md shadow-brand-lightBlue/10"
                    : "border-brand-blue/8 hover:border-brand-lightBlue/40 hover:shadow-sm"
            }`}
            onClick={onLoad}
        >
            {/* Thumbnail */}
            <div className="relative w-full bg-brand-bgLight" style={{ paddingTop: "100%" }}>
                {design.thumbnail ? (
                    <img
                        src={design.thumbnail}
                        alt={design.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        draggable={false}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-bgLight to-white">
                        <div
                            className="w-8 h-8 rounded-tl-lg rounded-br-lg"
                            style={{ background: design.state?.bg?.bgColor ?? "#3d8ccb" }}
                        />
                    </div>
                )}

                {/* Active badge */}
                {isActive && (
                    <div className="absolute top-1.5 left-1.5 bg-brand-lightBlue text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        editing
                    </div>
                )}

                {/* Privacy badge */}
                <div className={`absolute top-1.5 right-1.5 p-1 rounded ${
                    design.isPrivate ? "bg-black/40" : "bg-emerald-500/80"
                }`}>
                    {design.isPrivate
                        ? <Lock size={8} className="text-white" />
                        : <Globe size={8} className="text-white" />
                    }
                </div>

                {/* Hover overlay with actions */}
                <div className="absolute inset-0 bg-brand-blue/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                        onClick={e => { e.stopPropagation(); onLoad(); }}
                        className="bg-white text-brand-blue text-[11px] font-bold px-3 py-1.5 rounded-tl-lg rounded-br-lg shadow-sm hover:bg-brand-bgLight transition-colors"
                    >
                        Open
                    </button>
                    {onDelete && !confirmDelete && (
                        <button
                            onClick={e => { e.stopPropagation(); setConfirmDelete(true); }}
                            className="bg-white/20 text-white text-[11px] font-bold px-2 py-1.5 rounded hover:bg-red-500 transition-colors"
                        >
                            <Trash2 size={11} />
                        </button>
                    )}
                    {onDelete && confirmDelete && (
                        <button
                            onClick={e => { e.stopPropagation(); onDelete(); }}
                            className="bg-red-500 text-white text-[11px] font-bold px-2 py-1.5 rounded hover:bg-red-600 transition-colors"
                        >
                            Confirm
                        </button>
                    )}
                </div>
            </div>

            {/* Info footer */}
            <div className="px-2.5 py-2 bg-white">
                <div className="text-xs font-bold text-brand-blue truncate mb-0.5">{design.title}</div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[10px] text-brand-blue/40">
                        {showAuthor ? (
                            <><Users size={8} /><span className="truncate max-w-[60px]">{design.authorName}</span></>
                        ) : (
                            <><Clock size={8} /><span>{timeAgo(design.updatedAt)}</span></>
                        )}
                    </div>
                    <button
                        onClick={e => { e.stopPropagation(); onToggleLike(); }}
                        className={`flex items-center gap-1 text-[10px] font-semibold transition-colors ${
                            isLiked ? "text-red-500" : "text-brand-blue/30 hover:text-red-400"
                        }`}
                    >
                        <Heart size={10} className={isLiked ? "fill-current" : ""} />
                        <span>{design.likesCount}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export function DesignsPanel({ currentDesignId, onLoadDesign, onNewDesign }: DesignsPanelProps) {
    const { toast } = useToast();
    const [section, setSection] = useState<"mine" | "community">("mine");

    const myDesigns = useQuery(api.posterDesigns.getMyDesigns) ?? [];
    const publicDesigns = useQuery(api.posterDesigns.getPublicDesigns) ?? [];
    const likedIds = useQuery(api.posterDesigns.getMyLikedDesignIds) ?? [];

    const deleteDesignMutation = useMutation(api.posterDesigns.deleteDesign);
    const toggleLikeMutation = useMutation(api.posterDesigns.toggleLike);

    const handleDelete = async (designId: Id<"posterDesigns">, title: string) => {
        try {
            await deleteDesignMutation({ designId });
            toast(`Deleted "${title}"`, "info");
        } catch {
            toast("Failed to delete design", "error");
        }
    };

    const handleToggleLike = async (designId: Id<"posterDesigns">) => {
        try {
            await toggleLikeMutation({ designId });
        } catch {
            toast("Failed to update like", "error");
        }
    };

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Section tabs */}
            <div className="flex gap-0 border-b border-brand-blue/8 flex-shrink-0">
                <button
                    onClick={() => setSection("mine")}
                    className={`flex-1 py-2.5 text-[11px] font-bold transition-colors ${
                        section === "mine"
                            ? "text-brand-blue border-b-2 border-brand-blue bg-brand-bgLight/50"
                            : "text-brand-blue/40 hover:text-brand-blue/70"
                    }`}
                >
                    My Designs
                    {myDesigns.length > 0 && (
                        <span className="ml-1.5 text-[9px] bg-brand-blue/10 text-brand-blue/60 px-1.5 py-0.5 rounded-full">
                            {myDesigns.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setSection("community")}
                    className={`flex-1 py-2.5 text-[11px] font-bold transition-colors ${
                        section === "community"
                            ? "text-brand-blue border-b-2 border-brand-blue bg-brand-bgLight/50"
                            : "text-brand-blue/40 hover:text-brand-blue/70"
                    }`}
                >
                    Community
                    {publicDesigns.length > 0 && (
                        <span className="ml-1.5 text-[9px] bg-brand-blue/10 text-brand-blue/60 px-1.5 py-0.5 rounded-full">
                            {publicDesigns.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {section === "mine" ? (
                    <div className="p-3 space-y-3">
                        {/* New design button */}
                        <button
                            onClick={onNewDesign}
                            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-brand-lightBlue/25 rounded-tl-xl rounded-br-xl text-xs font-bold text-brand-lightBlue/60 hover:border-brand-lightBlue/50 hover:text-brand-lightBlue hover:bg-brand-lightBlue/4 transition-all"
                        >
                            <Plus size={13} />
                            New Design
                        </button>

                        {myDesigns.length === 0 ? (
                            <div className="py-8 text-center">
                                <div className="text-2xl mb-2">💾</div>
                                <div className="text-xs text-brand-blue/40 leading-relaxed">
                                    No saved designs yet.<br />Click Save to store your first design.
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                {myDesigns.map(design => (
                                    <DesignCard
                                        key={design._id}
                                        design={design as DesignRecord}
                                        isActive={currentDesignId === design._id}
                                        isLiked={likedIds.includes(design._id as string)}
                                        onLoad={() => onLoadDesign({
                                            _id: design._id,
                                            title: design.title,
                                            state: design.state,
                                            isPrivate: design.isPrivate,
                                        })}
                                        onDelete={() => handleDelete(design._id, design.title)}
                                        onToggleLike={() => handleToggleLike(design._id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="p-3">
                        {publicDesigns.length === 0 ? (
                            <div className="py-8 text-center">
                                <div className="text-2xl mb-2">🌐</div>
                                <div className="text-xs text-brand-blue/40 leading-relaxed">
                                    No public designs yet.<br />Be the first to share one!
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                {publicDesigns.map(design => (
                                    <DesignCard
                                        key={design._id}
                                        design={design as DesignRecord}
                                        isActive={false}
                                        isLiked={likedIds.includes(design._id as string)}
                                        onLoad={() => onLoadDesign({
                                            _id: design._id,
                                            title: design.title,
                                            state: design.state,
                                            isPrivate: design.isPrivate,
                                        })}
                                        onToggleLike={() => handleToggleLike(design._id)}
                                        showAuthor
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
