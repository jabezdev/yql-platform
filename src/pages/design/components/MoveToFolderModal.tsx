import { useState } from "react";
import { X, Folder, FolderOpen, ChevronRight } from "lucide-react";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { FolderNode } from "./FolderTree";

interface MoveToFolderModalProps {
    open: boolean;
    designTitle: string;
    currentFolderId?: Id<"posterFolders">;
    folders: FolderNode[];
    onClose: () => void;
    onConfirm: (folderId: Id<"posterFolders"> | null) => void;
}

function FolderOption({ folder, depth, selected, onSelect, expanded, onToggleExpand }: {
    folder: FolderNode;
    depth: number;
    selected: string | null;
    onSelect: (id: Id<"posterFolders"> | null) => void;
    expanded: Set<string>;
    onToggleExpand: (id: string) => void;
}) {
    const isSelected = selected === folder._id;
    const isExpanded = expanded.has(folder._id);

    return (
        <>
            <button
                onClick={() => onSelect(folder._id)}
                className={`w-full flex items-center gap-2 py-2 pr-3 rounded-lg text-sm transition-colors ${
                    isSelected ? "bg-brand-lightBlue/12 text-brand-blue font-bold" : "text-brand-blue/65 hover:bg-brand-bgLight hover:text-brand-blue"
                }`}
                style={{ paddingLeft: `${depth * 16 + 12}px` }}
            >
                {folder.children.length > 0 ? (
                    <button
                        className={`flex-shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                        onClick={e => { e.stopPropagation(); onToggleExpand(folder._id); }}
                    >
                        <ChevronRight size={12} className="text-brand-blue/30" />
                    </button>
                ) : (
                    <span className="w-3 flex-shrink-0" />
                )}
                {isExpanded
                    ? <FolderOpen size={14} style={{ color: folder.color ?? "#3d8ccb" }} className="flex-shrink-0" />
                    : <Folder size={14} style={{ color: folder.color ?? "#3d8ccb" }} className="flex-shrink-0" />
                }
                <span className="flex-1 text-left truncate font-semibold text-[12px]">{folder.name}</span>
                {isSelected && <span className="text-[10px] text-brand-lightBlue">✓</span>}
            </button>
            {isExpanded && folder.children.map(child => (
                <FolderOption
                    key={child._id}
                    folder={child}
                    depth={depth + 1}
                    selected={selected}
                    onSelect={onSelect}
                    expanded={expanded}
                    onToggleExpand={onToggleExpand}
                />
            ))}
        </>
    );
}

export function MoveToFolderModal({ open, designTitle, currentFolderId, folders, onClose, onConfirm }: MoveToFolderModalProps) {
    const [selected, setSelected] = useState<Id<"posterFolders"> | null>(null);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    const toggleExpand = (id: string) => setExpanded(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-tl-2xl rounded-br-2xl shadow-2xl w-full max-w-xs mx-4 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b-2 border-brand-blue/8">
                    <div>
                        <div className="text-sm font-bold text-brand-blue">Move to Folder</div>
                        <div className="text-[10px] text-brand-blue/45 truncate max-w-[200px]">{designTitle}</div>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-brand-blue/30 hover:text-brand-blue rounded transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <div className="p-3 max-h-64 overflow-y-auto">
                    {/* Root option */}
                    <button
                        onClick={() => setSelected(null)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                            selected === null ? "bg-brand-lightBlue/12 text-brand-blue" : "text-brand-blue/65 hover:bg-brand-bgLight hover:text-brand-blue"
                        }`}
                    >
                        <Folder size={14} className="text-brand-blue/30 flex-shrink-0" />
                        <span className="flex-1 text-left text-[12px]">Root (Unfiled)</span>
                        {selected === null && <span className="text-[10px] text-brand-lightBlue">✓</span>}
                    </button>

                    {folders.map(folder => (
                        <FolderOption
                            key={folder._id}
                            folder={folder}
                            depth={0}
                            selected={selected as string | null}
                            onSelect={id => setSelected(id)}
                            expanded={expanded}
                            onToggleExpand={toggleExpand}
                        />
                    ))}

                    {folders.length === 0 && (
                        <p className="text-xs text-brand-blue/40 text-center py-4">No folders yet. Create one first.</p>
                    )}
                </div>

                <div className="flex gap-2 px-4 py-3 border-t border-brand-blue/8">
                    <button onClick={onClose}
                        className="flex-1 py-2.5 text-xs font-bold text-brand-blue/60 border-2 border-brand-blue/12 rounded-tl-lg rounded-br-lg hover:border-brand-blue/25 hover:text-brand-blue transition-colors">
                        Cancel
                    </button>
                    <button onClick={() => onConfirm(selected)}
                        className="flex-1 py-2.5 text-xs font-bold text-white bg-brand-blue rounded-tl-lg rounded-br-lg hover:bg-brand-blue/90 transition-colors shadow-sm">
                        Move Here
                    </button>
                </div>
            </div>
        </div>
    );
}
