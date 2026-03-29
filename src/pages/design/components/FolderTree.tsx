import { useState } from "react";
import { Folder, FolderOpen, ChevronRight, Plus, MoreHorizontal, Pencil, Trash2, FolderPlus } from "lucide-react";
import type { Id } from "../../../../convex/_generated/dataModel";

export interface FolderNode {
    _id: Id<"posterFolders">;
    name: string;
    parentId?: Id<"posterFolders">;
    color?: string;
    children: FolderNode[];
    designCount: number;
}

interface FolderTreeProps {
    folders: FolderNode[];
    activeFolderId: string | null; // null = "All Designs" (root)
    totalDesignCount: number;
    rootDesignCount: number;
    onSelect: (folderId: string | null) => void;
    onCreateFolder: (parentId?: Id<"posterFolders">) => void;
    onRenameFolder: (folder: FolderNode) => void;
    onDeleteFolder: (folder: FolderNode) => void;
}

function FolderItem({
    folder,
    depth,
    activeFolderId,
    onSelect,
    onCreateFolder,
    onRenameFolder,
    onDeleteFolder,
}: {
    folder: FolderNode;
    depth: number;
    activeFolderId: string | null;
    onSelect: (id: string | null) => void;
    onCreateFolder: (parentId?: Id<"posterFolders">) => void;
    onRenameFolder: (f: FolderNode) => void;
    onDeleteFolder: (f: FolderNode) => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const isActive = activeFolderId === folder._id;
    const hasChildren = folder.children.length > 0;
    const folderColor = folder.color ?? "#3d8ccb";

    return (
        <div>
            <div
                className={`group relative flex items-center gap-1.5 rounded-lg pr-1 transition-all cursor-pointer select-none ${
                    isActive
                        ? "bg-brand-lightBlue/12 text-brand-blue"
                        : "hover:bg-brand-bgLight/80 text-brand-blue/65 hover:text-brand-blue"
                }`}
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
                onClick={() => onSelect(folder._id)}
            >
                {/* Expand chevron */}
                <button
                    className={`flex-shrink-0 transition-transform w-4 h-4 flex items-center justify-center text-brand-blue/25 hover:text-brand-blue/60 ${expanded ? "rotate-90" : ""}`}
                    onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
                    style={{ visibility: hasChildren ? "visible" : "hidden" }}
                >
                    <ChevronRight size={11} />
                </button>

                {/* Folder icon */}
                <span className="flex-shrink-0 w-4">
                    {isActive || expanded
                        ? <FolderOpen size={14} style={{ color: folderColor }} />
                        : <Folder size={14} style={{ color: folderColor }} />
                    }
                </span>

                {/* Name */}
                <span className={`flex-1 text-[12px] font-semibold py-1.5 truncate min-w-0 ${isActive ? "text-brand-blue" : ""}`}>
                    {folder.name}
                </span>

                {/* Count */}
                {folder.designCount > 0 && (
                    <span className="text-[10px] text-brand-blue/30 font-medium flex-shrink-0 mr-1">
                        {folder.designCount}
                    </span>
                )}

                {/* Menu */}
                <div className="relative flex-shrink-0">
                    <button
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-brand-blue/30 hover:text-brand-blue/70 hover:bg-brand-blue/8 transition-all"
                        onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
                    >
                        <MoreHorizontal size={13} />
                    </button>

                    {menuOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                            <div className="absolute right-0 top-full mt-1 z-20 bg-white border-2 border-brand-blue/10 rounded-xl shadow-xl py-1 min-w-[160px]">
                                <button
                                    onClick={e => { e.stopPropagation(); setMenuOpen(false); onCreateFolder(folder._id); }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-brand-blue/70 hover:bg-brand-bgLight hover:text-brand-blue transition-colors"
                                >
                                    <FolderPlus size={12} /> New Subfolder
                                </button>
                                <button
                                    onClick={e => { e.stopPropagation(); setMenuOpen(false); onRenameFolder(folder); }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-brand-blue/70 hover:bg-brand-bgLight hover:text-brand-blue transition-colors"
                                >
                                    <Pencil size={12} /> Rename
                                </button>
                                <div className="h-px bg-brand-blue/8 mx-2 my-1" />
                                <button
                                    onClick={e => { e.stopPropagation(); setMenuOpen(false); onDeleteFolder(folder); }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-500/80 hover:bg-red-50 hover:text-red-600 transition-colors"
                                >
                                    <Trash2 size={12} /> Delete Folder
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Children */}
            {expanded && folder.children.map(child => (
                <FolderItem
                    key={child._id}
                    folder={child}
                    depth={depth + 1}
                    activeFolderId={activeFolderId}
                    onSelect={onSelect}
                    onCreateFolder={onCreateFolder}
                    onRenameFolder={onRenameFolder}
                    onDeleteFolder={onDeleteFolder}
                />
            ))}
        </div>
    );
}

export function FolderTree({
    folders,
    activeFolderId,
    totalDesignCount,
    rootDesignCount,
    onSelect,
    onCreateFolder,
    onRenameFolder,
    onDeleteFolder,
}: FolderTreeProps) {
    return (
        <div className="flex flex-col gap-0.5">
            {/* All Designs */}
            <button
                onClick={() => onSelect(null)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold transition-all ${
                    activeFolderId === null
                        ? "bg-brand-lightBlue/12 text-brand-blue"
                        : "text-brand-blue/55 hover:bg-brand-bgLight/80 hover:text-brand-blue"
                }`}
            >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="0.5" y="0.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                    <rect x="8" y="0.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                    <rect x="0.5" y="8" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                    <rect x="8" y="8" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                </svg>
                <span className="flex-1 text-left">All Designs</span>
                {totalDesignCount > 0 && (
                    <span className="text-[10px] text-brand-blue/30 font-medium">{totalDesignCount}</span>
                )}
            </button>

            {/* Root (Unfiled) */}
            {rootDesignCount > 0 && (
                <button
                    onClick={() => onSelect("root")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold transition-all ${
                        activeFolderId === "root"
                            ? "bg-brand-lightBlue/12 text-brand-blue"
                            : "text-brand-blue/55 hover:bg-brand-bgLight/80 hover:text-brand-blue"
                    }`}
                >
                    <Folder size={14} className="text-brand-blue/30" />
                    <span className="flex-1 text-left">Unfiled</span>
                    <span className="text-[10px] text-brand-blue/30 font-medium">{rootDesignCount}</span>
                </button>
            )}

            {/* Folder tree */}
            {folders.length > 0 && (
                <div className="mt-1 space-y-0.5">
                    {folders.map(folder => (
                        <FolderItem
                            key={folder._id}
                            folder={folder}
                            depth={0}
                            activeFolderId={activeFolderId}
                            onSelect={onSelect}
                            onCreateFolder={onCreateFolder}
                            onRenameFolder={onRenameFolder}
                            onDeleteFolder={onDeleteFolder}
                        />
                    ))}
                </div>
            )}

            {/* New folder button */}
            <button
                onClick={() => onCreateFolder(undefined)}
                className="flex items-center gap-2 px-3 py-2 mt-1 rounded-lg text-[11px] font-semibold text-brand-blue/35 hover:text-brand-lightBlue hover:bg-brand-lightBlue/6 transition-all"
            >
                <Plus size={12} />
                New Folder
            </button>
        </div>
    );
}
