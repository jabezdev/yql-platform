import { useState, useCallback, useEffect } from "react";
import { X, Share2, Link2, Check, Lock, Globe, Copy, Pencil, AlertCircle } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

interface ShareDesignModalProps {
    open: boolean;
    onClose: () => void;
    designId: Id<"posterDesigns">;
    designTitle: string;
    slug: string | undefined;
    isPrivate: boolean;
    onPrivacyChange: (isPrivate: boolean) => Promise<void>;
    onSlugChange: (newSlug: string) => void;
}

export function ShareDesignModal({
    open,
    onClose,
    designId,
    designTitle,
    slug: initialSlug,
    isPrivate,
    onPrivacyChange,
    onSlugChange,
}: ShareDesignModalProps) {
    const [slug, setSlug] = useState(initialSlug ?? "");
    const [slugDraft, setSlugDraft] = useState(initialSlug ?? "");
    const [isEditingSlug, setIsEditingSlug] = useState(false);
    const [slugError, setSlugError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUpdatingPrivacy, setIsUpdatingPrivacy] = useState(false);
    const [isSavingSlug, setIsSavingSlug] = useState(false);

    useEffect(() => {
        if (open) { setSlug(initialSlug ?? ""); setSlugDraft(initialSlug ?? ""); setIsEditingSlug(false); setSlugError(null); }
    }, [open, initialSlug]);

    const generateSlugMutation = useMutation(api.posterDesigns.generateSlug);
    const setCustomSlugMutation = useMutation(api.posterDesigns.setCustomSlug);
    const slugAvailable = useQuery(
        api.posterDesigns.checkSlugAvailable,
        isEditingSlug && slugDraft.length >= 3 ? { slug: slugDraft, designId } : "skip"
    );

    const shareUrl = slug ? `${window.location.origin}/design/s/${slug}` : null;

    const handleGetLink = useCallback(async () => {
        setIsGenerating(true);
        try {
            const newSlug = await generateSlugMutation({ designId });
            setSlug(newSlug);
            setSlugDraft(newSlug);
            onSlugChange(newSlug);
        } finally {
            setIsGenerating(false);
        }
    }, [generateSlugMutation, designId, onSlugChange]);

    const handleCopy = useCallback(async () => {
        if (!shareUrl) return;
        await navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
    }, [shareUrl]);

    const handlePrivacyToggle = useCallback(async (priv: boolean) => {
        setIsUpdatingPrivacy(true);
        try { await onPrivacyChange(priv); }
        finally { setIsUpdatingPrivacy(false); }
    }, [onPrivacyChange]);

    const handleSaveSlug = useCallback(async () => {
        const clean = slugDraft.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/--+/g, "-").replace(/^-|-$/g, "");
        if (clean.length < 3) { setSlugError("Must be at least 3 characters"); return; }
        if (slugAvailable === false) { setSlugError("This URL is already taken"); return; }

        setIsSavingSlug(true);
        try {
            const saved = await setCustomSlugMutation({ designId, slug: clean });
            setSlug(saved);
            setSlugDraft(saved);
            setIsEditingSlug(false);
            setSlugError(null);
            onSlugChange(saved);
        } catch (err: any) {
            setSlugError(err.message ?? "Failed to save");
        } finally {
            setIsSavingSlug(false);
        }
    }, [slugDraft, slugAvailable, setCustomSlugMutation, designId, onSlugChange]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-tl-2xl rounded-br-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b-2 border-brand-blue/8">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-tl-lg rounded-br-lg bg-brand-blue/10 flex items-center justify-center">
                            <Share2 size={14} className="text-brand-blue" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-brand-blue">Share Design</div>
                            <div className="text-[10px] text-brand-blue/45 truncate max-w-[180px]">{designTitle}</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-brand-blue/30 hover:text-brand-blue rounded transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <div className="p-5 space-y-5">
                    {/* Visibility */}
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-brand-blue/45 block mb-2">Visibility</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => !isPrivate && handlePrivacyToggle(true)} disabled={isUpdatingPrivacy}
                                className={`flex items-center gap-2 px-3 py-2.5 border-2 rounded-tl-lg rounded-br-lg transition-all ${isPrivate ? "border-brand-blue/50 bg-brand-bgLight text-brand-blue" : "border-brand-blue/12 text-brand-blue/45 hover:border-brand-blue/25 cursor-pointer"}`}>
                                <Lock size={13} />
                                <div className="text-left">
                                    <div className="text-xs font-bold">Private</div>
                                    <div className="text-[9px] opacity-60">Only you</div>
                                </div>
                            </button>
                            <button onClick={() => isPrivate && handlePrivacyToggle(false)} disabled={isUpdatingPrivacy}
                                className={`flex items-center gap-2 px-3 py-2.5 border-2 rounded-tl-lg rounded-br-lg transition-all ${!isPrivate ? "border-emerald-400/60 bg-emerald-50 text-emerald-700" : "border-brand-blue/12 text-brand-blue/45 hover:border-brand-blue/25 cursor-pointer"}`}>
                                <Globe size={13} />
                                <div className="text-left">
                                    <div className="text-xs font-bold">Public</div>
                                    <div className="text-[9px] opacity-60">Gallery + link</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Share link + slug editor */}
                    {!isPrivate && (
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-brand-blue/45 block mb-2">Share URL</label>

                            {slug ? (
                                <div className="space-y-2">
                                    {/* URL display */}
                                    {isEditingSlug ? (
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-1 p-2.5 bg-brand-bgLight/60 border border-brand-blue/15 rounded-tl-lg rounded-br-lg">
                                                <span className="text-[10px] text-brand-blue/40 font-mono flex-shrink-0">/design/s/</span>
                                                <input
                                                    value={slugDraft}
                                                    onChange={e => { setSlugDraft(e.target.value); setSlugError(null); }}
                                                    autoFocus
                                                    className="flex-1 text-[11px] font-mono text-brand-blue bg-transparent outline-none min-w-0"
                                                    placeholder="your-custom-url"
                                                />
                                            </div>
                                            {slugAvailable === false && (
                                                <div className="flex items-center gap-1 text-[10px] text-red-500">
                                                    <AlertCircle size={10} /> This URL is already taken
                                                </div>
                                            )}
                                            {slugAvailable === true && slugDraft.length >= 3 && (
                                                <div className="flex items-center gap-1 text-[10px] text-emerald-600">
                                                    <Check size={10} /> Available
                                                </div>
                                            )}
                                            {slugError && (
                                                <div className="text-[10px] text-red-500 flex items-center gap-1">
                                                    <AlertCircle size={10} /> {slugError}
                                                </div>
                                            )}
                                            <div className="flex gap-1.5">
                                                <button onClick={() => { setIsEditingSlug(false); setSlugDraft(slug); setSlugError(null); }}
                                                    className="flex-1 py-2 text-xs font-bold text-brand-blue/60 border border-brand-blue/12 rounded-lg hover:border-brand-blue/25 transition-colors">
                                                    Cancel
                                                </button>
                                                <button onClick={handleSaveSlug} disabled={isSavingSlug || slugAvailable === false || slugDraft.length < 3}
                                                    className="flex-1 py-2 text-xs font-bold text-white bg-brand-blue rounded-lg hover:bg-brand-blue/90 disabled:opacity-50 transition-colors">
                                                    {isSavingSlug ? "Saving…" : "Save URL"}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-2 p-2.5 bg-brand-bgLight/60 border border-brand-blue/15 rounded-tl-lg rounded-br-lg group">
                                                <Link2 size={11} className="text-brand-blue/35 flex-shrink-0" />
                                                <span className="flex-1 text-[10px] font-mono text-brand-blue/65 truncate">{shareUrl}</span>
                                                <button onClick={() => setIsEditingSlug(true)} title="Edit URL"
                                                    className="p-1 rounded text-brand-blue/25 hover:text-brand-blue/60 hover:bg-brand-blue/8 transition-colors flex-shrink-0">
                                                    <Pencil size={10} />
                                                </button>
                                            </div>
                                            <button onClick={handleCopy}
                                                className={`w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-tl-lg rounded-br-lg border-2 transition-all ${isCopied ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-brand-blue/25 text-brand-blue hover:bg-brand-bgLight"}`}>
                                                {isCopied ? <Check size={13} /> : <Copy size={13} />}
                                                {isCopied ? "Copied!" : "Copy Link"}
                                            </button>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <button onClick={handleGetLink} disabled={isGenerating}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-brand-blue bg-brand-bgLight border-2 border-brand-blue/15 rounded-tl-lg rounded-br-lg hover:border-brand-lightBlue/40 disabled:opacity-50 transition-all">
                                    {isGenerating ? <div className="w-3.5 h-3.5 border border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" /> : <Link2 size={13} />}
                                    {isGenerating ? "Generating…" : "Get Share Link"}
                                </button>
                            )}
                        </div>
                    )}

                    {isPrivate && (
                        <div className="flex items-start gap-2.5 p-3 bg-brand-bgLight/60 border border-brand-blue/10 rounded-tl-lg rounded-br-lg">
                            <Lock size={13} className="text-brand-blue/35 mt-0.5 flex-shrink-0" />
                            <p className="text-[11px] text-brand-blue/55 leading-relaxed">
                                Make this design <strong>Public</strong> to get a shareable link and have it appear in the team gallery.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
