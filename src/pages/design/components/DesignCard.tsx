import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import {
    Pencil, Copy, FolderSymlink, Share2, Trash2,
    Lock, Globe, Heart, MoreHorizontal, ExternalLink
} from "lucide-react";
import { useToast } from "../../../providers/ToastProvider";

export interface DesignItem {
    _id: Id<"posterDesigns">;
    title: string;
    thumbnail?: string;
    isPrivate: boolean;
    folderId?: Id<"posterFolders">;
    slug?: string;
    likesCount: number;
    updatedAt: number;
    state?: any;
}

interface DesignCardProps {
    design: DesignItem;
    isLiked: boolean;
    folderName?: string;
    onToggleLike: () => void;
    onMoveToFolder: () => void;
    onShare: () => void;
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

export function DesignCard({ design, isLiked, folderName, onToggleLike, onMoveToFolder, onShare }: DesignCardProps) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [menuOpen, setMenuOpen] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleDraft, setTitleDraft] = useState(design.title);
    const titleRef = useRef<HTMLInputElement>(null);

    const deleteDesignMutation = useMutation(api.posterDesigns.deleteDesign);
    const duplicateDesignMutation = useMutation(api.posterDesigns.duplicateDesign);
    const renameDesignMutation = useMutation(api.posterDesigns.renameDesign);

    useEffect(() => {
        if (isEditingTitle) titleRef.current?.select();
    }, [isEditingTitle]);

    const handleEdit = () => navigate(`/design/edit/${design._id}`);

    const handleDuplicate = async () => {
        try {
            const newId = await duplicateDesignMutation({ designId: design._id });
            toast(`Duplicated "${design.title}"`, "success");
            navigate(`/design/edit/${newId}`);
        } catch {
            toast("Failed to duplicate", "error");
        }
    };

    const handleDelete = async () => {
        try {
            await deleteDesignMutation({ designId: design._id });
            toast(`Deleted "${design.title}"`, "info");
        } catch {
            toast("Failed to delete", "error");
        }
    };

    const handleRenameCommit = async () => {
        const trimmed = titleDraft.trim() || design.title;
        setIsEditingTitle(false);
        if (trimmed !== design.title) {
            try {
                await renameDesignMutation({ designId: design._id, title: trimmed });
            } catch {
                toast("Failed to rename", "error");
            }
        }
    };

    const bgColor = design.state?.bg?.bgColor;

    return (
        <div className="group flex flex-col rounded-tl-2xl rounded-br-2xl overflow-hidden border-2 border-brand-blue/6 hover:border-brand-lightBlue/30 hover:shadow-lg hover:shadow-brand-blue/5 transition-all duration-200 bg-white">
            {/* Thumbnail */}
            <div
                className="relative w-full cursor-pointer"
                style={{ paddingTop: "100%", background: bgColor ?? "#f0f4f8" }}
                onClick={handleEdit}
            >
                {design.thumbnail ? (
                    <img
                        src={design.thumbnail}
                        alt={design.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        draggable={false}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div
                            className="w-12 h-12 rounded-tl-xl rounded-br-xl opacity-40"
                            style={{ background: bgColor ?? "#3d8ccb" }}
                        />
                    </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-[#0d1825]/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                        onClick={e => { e.stopPropagation(); handleEdit(); }}
                        className="flex items-center gap-1.5 bg-white text-brand-blue text-xs font-bold px-4 py-2 rounded-tl-lg rounded-br-lg shadow-md hover:bg-brand-bgLight transition-colors"
                    >
                        <Pencil size={12} /> Edit
                    </button>
                </div>

                {/* Privacy badge */}
                <div className={`absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    design.isPrivate
                        ? "bg-black/40 text-white/80"
                        : "bg-emerald-500/80 text-white"
                }`}>
                    {design.isPrivate ? <Lock size={8} /> : <Globe size={8} />}
                    {design.isPrivate ? "Private" : "Public"}
                </div>

                {/* Three-dot menu */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="relative">
                        <button
                            onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
                            className="p-1.5 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors"
                        >
                            <MoreHorizontal size={13} />
                        </button>

                        {menuOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={e => { e.stopPropagation(); setMenuOpen(false); }} />
                                <div className="absolute right-0 top-full mt-1 z-20 bg-white border-2 border-brand-blue/10 rounded-xl shadow-2xl py-1 min-w-[175px]">
                                    <button onClick={e => { e.stopPropagation(); setMenuOpen(false); handleEdit(); }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-brand-blue/70 hover:bg-brand-bgLight hover:text-brand-blue transition-colors">
                                        <ExternalLink size={12} /> Open Editor
                                    </button>
                                    <button onClick={e => { e.stopPropagation(); setMenuOpen(false); handleDuplicate(); }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-brand-blue/70 hover:bg-brand-bgLight hover:text-brand-blue transition-colors">
                                        <Copy size={12} /> Duplicate
                                    </button>
                                    <button onClick={e => { e.stopPropagation(); setMenuOpen(false); onMoveToFolder(); }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-brand-blue/70 hover:bg-brand-bgLight hover:text-brand-blue transition-colors">
                                        <FolderSymlink size={12} /> Move to Folder
                                    </button>
                                    <button onClick={e => { e.stopPropagation(); setMenuOpen(false); onShare(); }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-brand-blue/70 hover:bg-brand-bgLight hover:text-brand-blue transition-colors">
                                        <Share2 size={12} /> Share
                                    </button>
                                    <div className="h-px bg-brand-blue/8 mx-2 my-1" />
                                    <button onClick={e => { e.stopPropagation(); setMenuOpen(false); handleDelete(); }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-500/80 hover:bg-red-50 hover:text-red-600 transition-colors">
                                        <Trash2 size={12} /> Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Info footer */}
            <div className="px-3 py-2.5 flex flex-col gap-1.5">
                {/* Title */}
                {isEditingTitle ? (
                    <input
                        ref={titleRef}
                        value={titleDraft}
                        onChange={e => setTitleDraft(e.target.value)}
                        onBlur={handleRenameCommit}
                        onKeyDown={e => { if (e.key === "Enter") handleRenameCommit(); if (e.key === "Escape") setIsEditingTitle(false); }}
                        className="text-sm font-bold text-brand-blue bg-brand-bgLight border border-brand-lightBlue/40 rounded px-1.5 py-0.5 outline-none w-full"
                        onClick={e => e.stopPropagation()}
                    />
                ) : (
                    <button
                        className="text-sm font-bold text-brand-blue text-left truncate hover:text-brand-lightBlue transition-colors leading-tight"
                        onDoubleClick={() => { setTitleDraft(design.title); setIsEditingTitle(true); }}
                        onClick={handleEdit}
                        title={`${design.title} — double-click to rename`}
                    >
                        {design.title}
                    </button>
                )}

                {/* Meta row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] text-brand-blue/35 flex-shrink-0">{timeAgo(design.updatedAt)}</span>
                        {folderName && (
                            <span className="text-[10px] text-brand-blue/30 truncate max-w-[80px]">
                                · {folderName}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={e => { e.stopPropagation(); onToggleLike(); }}
                        className={`flex items-center gap-1 text-[11px] font-semibold flex-shrink-0 transition-colors ${
                            isLiked ? "text-red-500" : "text-brand-blue/25 hover:text-red-400"
                        }`}
                    >
                        <Heart size={11} className={isLiked ? "fill-current" : ""} />
                        {design.likesCount > 0 && <span>{design.likesCount}</span>}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Gallery card (for Team Gallery — slightly different, shows author) ─────────
export function GalleryCard({ design, isLiked, onToggleLike, onFork }: {
    design: DesignItem & { authorName?: string };
    isLiked: boolean;
    onToggleLike: () => void;
    onFork: () => void;
}) {
    const bgColor = design.state?.bg?.bgColor;

    return (
        <div className="group flex flex-col rounded-tl-2xl rounded-br-2xl overflow-hidden border-2 border-brand-blue/6 hover:border-brand-lightBlue/30 hover:shadow-lg hover:shadow-brand-blue/5 transition-all duration-200 bg-white">
            <div
                className="relative w-full cursor-pointer"
                style={{ paddingTop: "100%", background: bgColor ?? "#f0f4f8" }}
                onClick={onFork}
            >
                {design.thumbnail ? (
                    <img src={design.thumbnail} alt={design.title} className="absolute inset-0 w-full h-full object-cover" draggable={false} />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-tl-xl rounded-br-xl opacity-40" style={{ background: bgColor ?? "#3d8ccb" }} />
                    </div>
                )}
                <div className="absolute inset-0 bg-[#0d1825]/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={e => { e.stopPropagation(); onFork(); }}
                        className="flex items-center gap-1.5 bg-white text-brand-blue text-xs font-bold px-4 py-2 rounded-tl-lg rounded-br-lg shadow-md hover:bg-brand-bgLight transition-colors">
                        <Copy size={12} /> Remix
                    </button>
                </div>
            </div>
            <div className="px-3 py-2.5">
                <div className="text-sm font-bold text-brand-blue truncate mb-1 leading-tight">{design.title}</div>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-brand-blue/40 truncate max-w-[120px]">
                        {(design as any).authorName ?? "Unknown"}
                    </span>
                    <button
                        onClick={e => { e.stopPropagation(); onToggleLike(); }}
                        className={`flex items-center gap-1 text-[11px] font-semibold flex-shrink-0 transition-colors ${
                            isLiked ? "text-red-500" : "text-brand-blue/25 hover:text-red-400"
                        }`}
                    >
                        <Heart size={11} className={isLiked ? "fill-current" : ""} />
                        {design.likesCount > 0 && <span>{design.likesCount}</span>}
                    </button>
                </div>
            </div>
        </div>
    );
}
