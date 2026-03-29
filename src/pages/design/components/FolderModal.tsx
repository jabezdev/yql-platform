import { useState, useEffect } from "react";
import { X, FolderPlus, Pencil } from "lucide-react";
import type { Id } from "../../../../convex/_generated/dataModel";

const FOLDER_COLORS = [
    "#3d8ccb", "#fed432", "#22c55e", "#f97316",
    "#a855f7", "#ec4899", "#ef4444", "#64748b",
    "#0891b2", "#84cc16",
];

interface FolderModalProps {
    open: boolean;
    mode: "create" | "rename";
    defaultName?: string;
    defaultColor?: string;
    parentId?: Id<"posterFolders">;
    onClose: () => void;
    onConfirm: (name: string, color: string, parentId?: Id<"posterFolders">) => void;
}

export function FolderModal({ open, mode, defaultName = "", defaultColor = "#3d8ccb", parentId, onClose, onConfirm }: FolderModalProps) {
    const [name, setName] = useState(defaultName);
    const [color, setColor] = useState(defaultColor);

    useEffect(() => {
        if (open) { setName(defaultName); setColor(defaultColor); }
    }, [open, defaultName, defaultColor]);

    if (!open) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;
        onConfirm(trimmed, color, parentId);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-tl-2xl rounded-br-2xl shadow-2xl w-full max-w-xs mx-4 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b-2 border-brand-blue/8">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-tl-lg rounded-br-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                            {mode === "create" ? <FolderPlus size={14} style={{ color }} /> : <Pencil size={14} style={{ color }} />}
                        </div>
                        <div>
                            <div className="text-sm font-bold text-brand-blue">
                                {mode === "create" ? "New Folder" : "Rename Folder"}
                            </div>
                            {parentId && mode === "create" && (
                                <div className="text-[10px] text-brand-blue/45">Creating as subfolder</div>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-brand-blue/30 hover:text-brand-blue rounded transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-brand-blue/45 block mb-1.5">
                            Folder Name
                        </label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Marketing, Events…"
                            autoFocus
                            className="w-full text-sm px-3 py-2.5 border-2 border-brand-blue/15 rounded-tl-lg rounded-br-lg outline-none focus:border-brand-lightBlue/60 text-brand-blue font-medium placeholder:text-brand-blue/25"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-brand-blue/45 block mb-2">
                            Color
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {FOLDER_COLORS.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={`w-7 h-7 rounded-lg border-2 transition-all ${color === c ? "border-brand-blue/60 scale-110 shadow-sm" : "border-transparent hover:scale-110"}`}
                                    style={{ background: c }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5 text-xs font-bold text-brand-blue/60 border-2 border-brand-blue/12 rounded-tl-lg rounded-br-lg hover:border-brand-blue/25 hover:text-brand-blue transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={!name.trim()}
                            className="flex-1 py-2.5 text-xs font-bold text-white rounded-tl-lg rounded-br-lg hover:opacity-90 disabled:opacity-40 transition-all shadow-sm"
                            style={{ background: color }}>
                            {mode === "create" ? "Create Folder" : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
