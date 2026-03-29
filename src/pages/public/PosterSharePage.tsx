import { useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Heart, Download, ExternalLink, ArrowLeft, Lock, Globe } from "lucide-react";

import { S } from "../tools/poster-creator/constants";
import { drawBg, drawBlock, useLogos } from "../tools/poster-creator/canvas-utils";
import type { PosterState, BoundsMap } from "../tools/poster-creator/types";
import { useToast } from "../../providers/ToastProvider";

export default function PosterSharePage() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { isAuthenticated } = useConvexAuth();
    const logos = useLogos();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const design = useQuery(
        api.posterDesigns.getSharedDesign,
        token ? { shareToken: token } : "skip"
    );

    const likedIds = useQuery(
        api.posterDesigns.getMyLikedDesignIds,
        isAuthenticated ? {} : "skip"
    ) ?? [];

    const toggleLikeMutation = useMutation(api.posterDesigns.toggleLike);

    const isLiked = design ? likedIds.includes(design._id as string) : false;

    // Render design to canvas
    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !design?.state) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const state = design.state as PosterState;
        const bounds: BoundsMap = new Map();
        drawBg(ctx, state.bg);
        for (const block of state.blocks) {
            drawBlock(ctx, block, logos, bounds, null);
        }
    }, [design, logos]);

    useEffect(() => {
        document.fonts.ready.then(() => render());
    }, [render]);

    const handleToggleLike = async () => {
        if (!isAuthenticated) {
            toast("Sign in to like designs", "info");
            return;
        }
        if (!design) return;
        try {
            await toggleLikeMutation({ designId: design._id });
        } catch {
            toast("Failed to update like", "error");
        }
    };

    const handleExport = useCallback(async () => {
        const canvas = canvasRef.current;
        if (!canvas || !design) return;
        const ctx = canvas.getContext("2d")!;
        const state = design.state as PosterState;
        await document.fonts.ready;
        drawBg(ctx, state.bg);
        for (const block of state.blocks) drawBlock(ctx, block, logos, new Map(), null);
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = `${design.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.png`;
        a.click();
    }, [design, logos]);

    const handleOpenInEditor = () => {
        if (!token) return;
        navigate(`/poster?fork=${token}`);
    };

    // ── Loading state ────────────────────────────────────────────────────────
    if (design === undefined) {
        return (
            <div className="min-h-screen bg-[#0e1720] flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
            </div>
        );
    }

    // ── Not found ────────────────────────────────────────────────────────────
    if (!design) {
        return (
            <div className="min-h-screen bg-[#0e1720] flex flex-col items-center justify-center gap-4 p-8 text-center">
                <Lock size={40} className="text-brand-blue/30" />
                <div>
                    <div className="text-xl font-bold text-white mb-2">Design not found</div>
                    <div className="text-sm text-white/40">This design is private or the link is invalid.</div>
                </div>
                <button
                    onClick={() => navigate("/")}
                    className="mt-4 flex items-center gap-2 text-sm font-bold text-brand-lightBlue/70 hover:text-brand-lightBlue transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to home
                </button>
            </div>
        );
    }

    // ── Design found ─────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#0e1720] flex flex-col">
            {/* Nav bar */}
            <nav className="flex-shrink-0 flex items-center justify-between px-6 py-3 bg-white/5 border-b border-white/5 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors"
                    >
                        <ArrowLeft size={14} />
                        <span className="font-medium">YQL</span>
                    </button>
                    <div className="w-px h-4 bg-white/15" />
                    <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded bg-brand-blue flex items-center justify-center">
                            <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                                <rect x="1" y="1" width="5" height="5" rx="1" fill="white" opacity="0.9"/>
                                <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6"/>
                                <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6"/>
                                <rect x="8" y="8" width="5" height="5" rx="1" fill="#FED432"/>
                            </svg>
                        </div>
                        <span className="text-xs font-bold text-white/60">Design Studio</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isAuthenticated && (
                        <button
                            onClick={handleOpenInEditor}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-tl-lg rounded-br-lg bg-brand-blue text-white hover:bg-brand-blue/90 transition-colors"
                        >
                            <ExternalLink size={12} />
                            Open in Editor
                        </button>
                    )}
                    {!isAuthenticated && (
                        <button
                            onClick={() => navigate("/login")}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-tl-lg rounded-br-lg bg-brand-blue text-white hover:bg-brand-blue/90 transition-colors"
                        >
                            Sign in to remix
                        </button>
                    )}
                </div>
            </nav>

            {/* Main content */}
            <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 p-8">
                {/* Canvas */}
                <div className="flex-shrink-0">
                    <canvas
                        ref={canvasRef}
                        width={S}
                        height={S}
                        className="rounded-tl-2xl rounded-br-2xl"
                        style={{
                            width: "min(560px, calc(100vw - 48px))",
                            height: "auto",
                            boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 24px 80px rgba(0,0,0,0.6)",
                        }}
                    />
                </div>

                {/* Info panel */}
                <div className="flex flex-col gap-5 max-w-xs w-full">
                    {/* Design info */}
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Globe size={12} className="text-emerald-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/80">Public Design</span>
                        </div>
                        <h1 className="text-2xl font-black text-white leading-tight mb-1">{design.title}</h1>
                        <p className="text-sm text-white/40">
                            by <span className="text-white/60 font-semibold">{design.authorName}</span>
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleToggleLike}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-tl-lg rounded-br-lg border-2 transition-all font-bold text-sm ${
                                isLiked
                                    ? "border-red-400/50 bg-red-500/10 text-red-400"
                                    : "border-white/15 bg-white/5 text-white/50 hover:border-red-400/40 hover:text-red-400"
                            }`}
                        >
                            <Heart size={15} className={isLiked ? "fill-current" : ""} />
                            <span>{design.likesCount}</span>
                        </button>

                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-tl-lg rounded-br-lg border-2 border-white/15 bg-white/5 text-white/50 hover:border-white/30 hover:text-white transition-all font-bold text-sm"
                        >
                            <Download size={14} />
                            Export PNG
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-white/8" />

                    {/* CTA */}
                    {isAuthenticated ? (
                        <div className="bg-white/5 border border-white/10 rounded-tl-xl rounded-br-xl p-4">
                            <div className="text-sm font-bold text-white mb-1">Like this design?</div>
                            <p className="text-xs text-white/50 leading-relaxed mb-3">
                                Open it in YQL Design Studio to remix it with your own content and style.
                            </p>
                            <button
                                onClick={handleOpenInEditor}
                                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-brand-blue bg-white rounded-tl-lg rounded-br-lg hover:bg-brand-bgLight transition-colors"
                            >
                                <ExternalLink size={12} />
                                Open in Editor
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white/5 border border-white/10 rounded-tl-xl rounded-br-xl p-4">
                            <div className="text-sm font-bold text-white mb-1">Create your own</div>
                            <p className="text-xs text-white/50 leading-relaxed mb-3">
                                Sign in to YQL Design Studio to create, save and share your own posters.
                            </p>
                            <button
                                onClick={() => navigate("/login")}
                                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-brand-blue bg-white rounded-tl-lg rounded-br-lg hover:bg-brand-bgLight transition-colors"
                            >
                                Sign in to get started
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
