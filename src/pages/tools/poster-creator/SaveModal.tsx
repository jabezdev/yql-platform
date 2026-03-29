import { useState, useEffect } from "react";
import { X, Save, Lock, Globe } from "lucide-react";

interface SaveModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (title: string, isPrivate: boolean) => void;
    defaultTitle?: string;
}

export function SaveModal({ open, onClose, onConfirm, defaultTitle = "Untitled Design" }: SaveModalProps) {
    const [title, setTitle] = useState(defaultTitle);
    const [isPrivate, setIsPrivate] = useState(true);

    useEffect(() => {
        if (open) {
            setTitle(defaultTitle);
            setIsPrivate(true);
        }
    }, [open, defaultTitle]);

    if (!open) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = title.trim() || "Untitled Design";
        onConfirm(trimmed, isPrivate);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-tl-2xl rounded-br-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b-2 border-brand-blue/8">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-tl-lg rounded-br-lg bg-brand-blue/10 flex items-center justify-center">
                            <Save size={14} className="text-brand-blue" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-brand-blue">Save Design</div>
                            <div className="text-[10px] text-brand-blue/45">Name and set visibility</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-brand-blue/30 hover:text-brand-blue rounded transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Title input */}
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-brand-blue/45 block mb-1.5">
                            Design Name
                        </label>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="My Awesome Poster"
                            autoFocus
                            className="w-full text-sm px-3 py-2.5 border-2 border-brand-blue/15 rounded-tl-lg rounded-br-lg outline-none focus:border-brand-lightBlue/60 text-brand-blue font-medium placeholder:text-brand-blue/30"
                        />
                    </div>

                    {/* Privacy toggle */}
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-brand-blue/45 block mb-2">
                            Visibility
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setIsPrivate(true)}
                                className={`flex items-center gap-2 px-3 py-2.5 border-2 rounded-tl-lg rounded-br-lg transition-all ${
                                    isPrivate
                                        ? "border-brand-blue/50 bg-brand-bgLight text-brand-blue"
                                        : "border-brand-blue/12 text-brand-blue/45 hover:border-brand-blue/25"
                                }`}
                            >
                                <Lock size={13} />
                                <div className="text-left">
                                    <div className="text-xs font-bold">Private</div>
                                    <div className="text-[9px] opacity-60">Only you</div>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsPrivate(false)}
                                className={`flex items-center gap-2 px-3 py-2.5 border-2 rounded-tl-lg rounded-br-lg transition-all ${
                                    !isPrivate
                                        ? "border-emerald-400/60 bg-emerald-50 text-emerald-700"
                                        : "border-brand-blue/12 text-brand-blue/45 hover:border-brand-blue/25"
                                }`}
                            >
                                <Globe size={13} />
                                <div className="text-left">
                                    <div className="text-xs font-bold">Public</div>
                                    <div className="text-[9px] opacity-60">Anyone + gallery</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 text-xs font-bold text-brand-blue/60 border-2 border-brand-blue/12 rounded-tl-lg rounded-br-lg hover:border-brand-blue/25 hover:text-brand-blue transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2.5 text-xs font-bold text-white bg-brand-blue rounded-tl-lg rounded-br-lg hover:bg-brand-blue/90 transition-colors shadow-sm flex items-center justify-center gap-1.5"
                        >
                            <Save size={13} />
                            Save Design
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
