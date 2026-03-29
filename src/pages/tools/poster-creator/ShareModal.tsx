import { useState, useCallback } from "react";
import { X, Share2, Link2, Check, Lock, Globe, Copy } from "lucide-react";
import type { Id } from "../../../../convex/_generated/dataModel";

interface ShareModalProps {
    open: boolean;
    onClose: () => void;
    designId: Id<"posterDesigns">;
    designTitle: string;
    isPrivate: boolean;
    onPrivacyChange: (isPrivate: boolean) => Promise<void>;
    onGenerateToken: () => Promise<string>;
}

export function ShareModal({
    open,
    onClose,
    designId: _designId,
    designTitle,
    isPrivate,
    onPrivacyChange,
    onGenerateToken,
}: ShareModalProps) {
    const [shareUrl, setShareUrl] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUpdatingPrivacy, setIsUpdatingPrivacy] = useState(false);

    const handleGetShareLink = useCallback(async () => {
        setIsGenerating(true);
        try {
            const token = await onGenerateToken();
            const url = `${window.location.origin}/poster/share/${token}`;
            setShareUrl(url);
        } finally {
            setIsGenerating(false);
        }
    }, [onGenerateToken]);

    const handleCopy = useCallback(async () => {
        if (!shareUrl) return;
        await navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
    }, [shareUrl]);

    const handlePrivacyToggle = useCallback(async (priv: boolean) => {
        setIsUpdatingPrivacy(true);
        try {
            await onPrivacyChange(priv);
            if (priv) setShareUrl(null); // clear share URL if made private
        } finally {
            setIsUpdatingPrivacy(false);
        }
    }, [onPrivacyChange]);

    if (!open) return null;

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
                            <Share2 size={14} className="text-brand-blue" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-brand-blue">Share Design</div>
                            <div className="text-[10px] text-brand-blue/45 truncate max-w-[160px]">{designTitle}</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-brand-blue/30 hover:text-brand-blue rounded transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-5">
                    {/* Visibility */}
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-brand-blue/45 block mb-2">
                            Visibility
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => !isPrivate && handlePrivacyToggle(true)}
                                disabled={isUpdatingPrivacy}
                                className={`flex items-center gap-2 px-3 py-2.5 border-2 rounded-tl-lg rounded-br-lg transition-all ${
                                    isPrivate
                                        ? "border-brand-blue/50 bg-brand-bgLight text-brand-blue"
                                        : "border-brand-blue/12 text-brand-blue/45 hover:border-brand-blue/25 cursor-pointer"
                                }`}
                            >
                                <Lock size={13} />
                                <div className="text-left">
                                    <div className="text-xs font-bold">Private</div>
                                    <div className="text-[9px] opacity-60">Only you</div>
                                </div>
                            </button>
                            <button
                                onClick={() => isPrivate && handlePrivacyToggle(false)}
                                disabled={isUpdatingPrivacy}
                                className={`flex items-center gap-2 px-3 py-2.5 border-2 rounded-tl-lg rounded-br-lg transition-all ${
                                    !isPrivate
                                        ? "border-emerald-400/60 bg-emerald-50 text-emerald-700"
                                        : "border-brand-blue/12 text-brand-blue/45 hover:border-brand-blue/25 cursor-pointer"
                                }`}
                            >
                                <Globe size={13} />
                                <div className="text-left">
                                    <div className="text-xs font-bold">Public</div>
                                    <div className="text-[9px] opacity-60">Gallery + link</div>
                                </div>
                            </button>
                        </div>
                        {isUpdatingPrivacy && (
                            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-brand-blue/50">
                                <div className="w-3 h-3 border border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
                                Updating…
                            </div>
                        )}
                    </div>

                    {/* Share link section */}
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-brand-blue/45 block mb-2">
                            Share Link
                        </label>

                        {isPrivate ? (
                            <div className="flex items-start gap-2.5 p-3 bg-brand-bgLight/60 border border-brand-blue/10 rounded-tl-lg rounded-br-lg">
                                <Lock size={13} className="text-brand-blue/35 mt-0.5 flex-shrink-0" />
                                <p className="text-[11px] text-brand-blue/55 leading-relaxed">
                                    Make this design <strong>Public</strong> to generate a shareable link and have it appear in the community gallery.
                                </p>
                            </div>
                        ) : shareUrl ? (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 p-2.5 bg-brand-bgLight/60 border border-brand-blue/15 rounded-tl-lg rounded-br-lg">
                                    <Link2 size={12} className="text-brand-blue/40 flex-shrink-0" />
                                    <span className="flex-1 text-[10px] font-mono text-brand-blue/70 truncate">{shareUrl}</span>
                                </div>
                                <button
                                    onClick={handleCopy}
                                    className={`w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-tl-lg rounded-br-lg border-2 transition-all ${
                                        isCopied
                                            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                            : "border-brand-blue/25 text-brand-blue hover:bg-brand-bgLight"
                                    }`}
                                >
                                    {isCopied ? <Check size={13} /> : <Copy size={13} />}
                                    {isCopied ? "Copied!" : "Copy Link"}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleGetShareLink}
                                disabled={isGenerating}
                                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-brand-blue bg-brand-bgLight border-2 border-brand-blue/15 rounded-tl-lg rounded-br-lg hover:border-brand-lightBlue/40 hover:bg-brand-lightBlue/5 disabled:opacity-50 transition-all"
                            >
                                {isGenerating ? (
                                    <div className="w-3.5 h-3.5 border border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
                                ) : (
                                    <Link2 size={13} />
                                )}
                                {isGenerating ? "Generating…" : "Get Share Link"}
                            </button>
                        )}
                    </div>

                    {/* Info */}
                    {!isPrivate && (
                        <p className="text-[10px] text-brand-blue/40 leading-relaxed border-t border-brand-blue/8 pt-4">
                            Public designs are visible in the Community gallery and can be liked and remixed by other YQL members.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
