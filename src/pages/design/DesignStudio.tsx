import { useRef, useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import { Download, Save, Share2, Check, Pencil, ArrowLeft } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

import type { BlockType, PosterState, TabId, BoundsMap } from "../tools/poster-creator/types";
import { DEFAULT_BG, S, TEMPLATES, uid, makeBlock } from "../tools/poster-creator/constants";
import { drawBg, drawBlock, useLogos } from "../tools/poster-creator/canvas-utils";
import { Sidebar } from "../tools/poster-creator/Sidebar";
import { AddBlockPicker } from "../tools/poster-creator/AddBlockPicker";
import { SaveModal } from "../tools/poster-creator/SaveModal";
import { ShareDesignModal } from "./components/ShareDesignModal";
import { useToast } from "../../providers/ToastProvider";

export default function DesignStudio() {
    const { id } = useParams<{ id?: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const logos = useLogos();
    const { toast } = useToast();

    // ── Poster state ─────────────────────────────────────────────────────────
    const [state, setState] = useState<PosterState>(() => ({
        bg: { ...DEFAULT_BG },
        blocks: TEMPLATES[0].state.blocks.map(b => ({ ...b, id: uid() })),
    }));
    const [tab, setTab] = useState<TabId>("layers");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showAddPicker, setShowAddPicker] = useState(false);
    const [sidebarW, setSidebarW] = useState(320);

    // ── Design metadata ──────────────────────────────────────────────────────
    const [currentDesignId, setCurrentDesignId] = useState<Id<"posterDesigns"> | null>(
        id ? (id as Id<"posterDesigns">) : null
    );
    const [designTitle, setDesignTitle] = useState("Untitled Design");
    const [isPrivate, setIsPrivate] = useState(true);
    const [designSlug, setDesignSlug] = useState<string | undefined>(undefined);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleDraft, setTitleDraft] = useState("");
    const titleInputRef = useRef<HTMLInputElement>(null);
    const lastSavedStateRef = useRef<PosterState | null>(null);

    // ── Load existing design by URL param ────────────────────────────────────
    const existingDesign = useQuery(
        api.posterDesigns.getDesignById,
        currentDesignId ? { designId: currentDesignId } : "skip"
    );

    const [loaded, setLoaded] = useState(!id); // if new design, already "loaded"
    useEffect(() => {
        if (existingDesign && !loaded) {
            setState(existingDesign.state as PosterState);
            setDesignTitle(existingDesign.title);
            setIsPrivate(existingDesign.isPrivate);
            setDesignSlug(existingDesign.slug);
            lastSavedStateRef.current = existingDesign.state as PosterState;
            setLoaded(true);
        }
    }, [existingDesign, loaded]);

    // ── Fork from share link ─────────────────────────────────────────────────
    const forkSlug = searchParams.get("fork");
    const forkedDesign = useQuery(
        api.posterDesigns.getDesignBySlug,
        forkSlug ? { slug: forkSlug } : "skip"
    );
    useEffect(() => {
        if (forkedDesign && forkSlug) {
            setState(forkedDesign.state as PosterState);
            setDesignTitle(`Copy of ${forkedDesign.title}`);
            setCurrentDesignId(null);
            setHasUnsavedChanges(true);
            setSearchParams({}, { replace: true });
        }
    }, [forkedDesign, forkSlug, setSearchParams]);

    // ── Track unsaved changes ────────────────────────────────────────────────
    useEffect(() => {
        if (loaded && lastSavedStateRef.current !== null && lastSavedStateRef.current !== state) {
            setHasUnsavedChanges(true);
        }
    }, [state, loaded]);

    // ── Convex mutations ─────────────────────────────────────────────────────
    const saveDesignMutation = useMutation(api.posterDesigns.saveDesign);
    const generateSlugMutation = useMutation(api.posterDesigns.generateSlug);
    const updatePrivacyMutation = useMutation(api.posterDesigns.updateDesignPrivacy);
    const setCustomSlugMutation = useMutation(api.posterDesigns.setCustomSlug);

    // ── Canvas ───────────────────────────────────────────────────────────────
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const boundsRef = useRef<BoundsMap>(new Map());
    const dragBlockRef = useRef<{ id: string; startY: number; startBlockY: number; startX: number; startBlockX: number } | null>(null);
    const [listDragOverId, setListDragOverId] = useState<string | null>(null);
    const listDragRef = useRef<{ id: string } | null>(null);

    const render = useCallback((highlight: string | null = selectedId) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const newBounds: BoundsMap = new Map();
        drawBg(ctx, state.bg);
        for (const block of state.blocks) drawBlock(ctx, block, logos, newBounds, highlight);
        boundsRef.current = newBounds;
    }, [state, logos, selectedId]);

    useEffect(() => { document.fonts.ready.then(() => render()); }, [render]);

    // ── Thumbnail ────────────────────────────────────────────────────────────
    const generateThumbnail = useCallback(async (): Promise<string> => {
        const thumb = document.createElement("canvas");
        thumb.width = 320; thumb.height = 320;
        const tctx = thumb.getContext("2d")!;
        tctx.scale(320 / S, 320 / S);
        await document.fonts.ready;
        drawBg(tctx, state.bg);
        for (const block of state.blocks) drawBlock(tctx, block, logos, new Map(), null);
        return thumb.toDataURL("image/jpeg", 0.75);
    }, [state, logos]);

    // ── Save ─────────────────────────────────────────────────────────────────
    const doSave = useCallback(async (title: string, priv: boolean, fid?: Id<"posterDesigns"> | null, folderId?: Id<"posterFolders">) => {
        setIsSaving(true);
        try {
            const thumbnail = await generateThumbnail();
            const savedId = await saveDesignMutation({
                designId: (fid ?? currentDesignId) ?? undefined,
                title, state, thumbnail, isPrivate: priv, folderId,
            });
            const newId = savedId as Id<"posterDesigns">;
            setCurrentDesignId(newId);
            setDesignTitle(title);
            setIsPrivate(priv);
            setHasUnsavedChanges(false);
            lastSavedStateRef.current = state;
            // Update URL to /design/edit/:id
            if (!currentDesignId) navigate(`/design/edit/${newId}`, { replace: true });
            toast("Design saved!", "success");
            return newId;
        } catch {
            toast("Failed to save design", "error");
            return null;
        } finally {
            setIsSaving(false);
        }
    }, [currentDesignId, state, generateThumbnail, saveDesignMutation, navigate, toast]);

    const handleSaveClick = useCallback(async () => {
        if (!currentDesignId) { setShowSaveModal(true); return; }
        await doSave(designTitle, isPrivate);
    }, [currentDesignId, designTitle, isPrivate, doSave]);

    const handleSaveModalConfirm = useCallback(async (title: string, priv: boolean) => {
        setShowSaveModal(false);
        await doSave(title, priv, null);
    }, [doSave]);

    // ── Title editing ────────────────────────────────────────────────────────
    const startEditTitle = () => { setTitleDraft(designTitle); setIsEditingTitle(true); setTimeout(() => titleInputRef.current?.select(), 50); };
    const commitTitle = async () => {
        const t = titleDraft.trim() || "Untitled Design";
        setDesignTitle(t); setIsEditingTitle(false);
        if (currentDesignId) await doSave(t, isPrivate);
    };

    // ── Block ops ────────────────────────────────────────────────────────────
    const removeBlock = useCallback((id: string) => { setState(p => ({ ...p, blocks: p.blocks.filter(b => b.id !== id) })); if (selectedId === id) setSelectedId(null); }, [selectedId]);
    const toggleVisible = useCallback((id: string) => { setState(p => ({ ...p, blocks: p.blocks.map(b => b.id === id ? { ...b, visible: !b.visible } : b) })); }, []);
    const applyTemplate = useCallback((tpl: typeof TEMPLATES[0]) => { setState({ bg: { ...tpl.state.bg }, blocks: tpl.state.blocks.map(b => ({ ...b, id: uid() })) }); setSelectedId(null); }, []);
    const addBlock = useCallback((type: BlockType) => { const block = makeBlock(type, { y: 300 }); setState(p => ({ ...p, blocks: [...p.blocks, block] })); setSelectedId(block.id); }, []);

    // ── Canvas mouse ─────────────────────────────────────────────────────────
    const toCanvasCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        return { cx: (e.clientX - rect.left) * (S / rect.width), cy: (e.clientY - rect.top) * (S / rect.height) };
    }, []);
    const hitTest = useCallback((cx: number, cy: number) => {
        for (const b of [...state.blocks].reverse()) {
            if (!b.visible) continue;
            const bd = boundsRef.current.get(b.id);
            if (bd && cx >= bd.x0 - 8 && cx <= bd.x1 + 8 && cy >= bd.y0 - 8 && cy <= bd.y1 + 8) return b.id;
        }
        return null;
    }, [state.blocks]);
    const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const { cx, cy } = toCanvasCoords(e);
        const hit = hitTest(cx, cy);
        setSelectedId(hit);
        if (hit) { const block = state.blocks.find(b => b.id === hit)!; dragBlockRef.current = { id: hit, startY: cy, startBlockY: block.y, startX: cx, startBlockX: block.x }; }
        else dragBlockRef.current = null;
    }, [toCanvasCoords, hitTest, state.blocks]);
    const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const { cx, cy } = toCanvasCoords(e);
        if (dragBlockRef.current) {
            const { id, startY, startBlockY, startX, startBlockX } = dragBlockRef.current;
            setState(p => ({ ...p, blocks: p.blocks.map(b => b.id === id ? { ...b, y: Math.round(startBlockY + (cy - startY)), x: Math.round(startBlockX + (cx - startX)) } : b) }));
        }
    }, [toCanvasCoords]);
    const handleCanvasMouseUp = useCallback(() => { dragBlockRef.current = null; }, []);

    // ── Layer drag ───────────────────────────────────────────────────────────
    const handleListDragStart = useCallback((id: string) => { listDragRef.current = { id }; }, []);
    const handleListDragOver = useCallback((id: string) => { if (listDragRef.current?.id !== id) setListDragOverId(id); }, []);
    const handleListDrop = useCallback((targetId: string) => {
        const srcId = listDragRef.current?.id;
        if (!srcId || srcId === targetId) { listDragRef.current = null; setListDragOverId(null); return; }
        setState(p => {
            const arr = [...p.blocks];
            const [moved] = arr.splice(arr.findIndex(b => b.id === srcId), 1);
            arr.splice(arr.findIndex(b => b.id === targetId), 0, moved);
            return { ...p, blocks: arr };
        });
        listDragRef.current = null; setListDragOverId(null);
    }, []);

    // ── Export ───────────────────────────────────────────────────────────────
    const handleExport = useCallback(async () => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext("2d")!;
        await document.fonts.ready;
        drawBg(ctx, state.bg);
        for (const block of state.blocks) drawBlock(ctx, block, logos, new Map(), null);
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = `${designTitle.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.png`;
        a.click();
        render(selectedId);
    }, [state, logos, selectedId, render, designTitle]);

    // ── Resize sidebar ───────────────────────────────────────────────────────
    const handleResizeStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        const startX = e.clientX, startW = sidebarW;
        const onMove = (ev: MouseEvent) => setSidebarW(Math.max(280, Math.min(520, startW + (ev.clientX - startX))));
        const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
    }, [sidebarW]);

    const selectedBlock = state.blocks.find(b => b.id === selectedId) ?? null;

    // Loading state
    if (id && !loaded) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-[#0e1720]">
                <div className="w-6 h-6 border-2 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#0e1720] select-none">

            {/* ── Top bar ─────────────────────────────────────────────────── */}
            <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2.5 bg-white border-b-2 border-brand-blue/8 shadow-sm">
                {/* Back to dashboard */}
                <Link
                    to="/design"
                    className="flex items-center gap-1.5 text-xs font-bold text-brand-blue/50 hover:text-brand-blue transition-colors flex-shrink-0 mr-1"
                >
                    <ArrowLeft size={13} />
                    <span className="hidden sm:inline">Dashboard</span>
                </Link>

                <div className="w-px h-5 bg-brand-blue/10 flex-shrink-0" />

                {/* Brand */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-6 h-6 rounded-tl-md rounded-br-md bg-brand-blue flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                            <rect x="1" y="1" width="5" height="5" rx="1" fill="white" opacity="0.9"/>
                            <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6"/>
                            <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6"/>
                            <rect x="8" y="8" width="5" height="5" rx="1" fill="#FED432"/>
                        </svg>
                    </div>
                    <span className="text-[10px] font-black text-brand-blue/50 uppercase tracking-wider hidden sm:inline">Design Studio</span>
                </div>

                <div className="w-px h-5 bg-brand-blue/10 flex-shrink-0" />

                {/* Title */}
                <div className="flex-1 min-w-0 flex items-center gap-2">
                    {isEditingTitle ? (
                        <input
                            ref={titleInputRef}
                            value={titleDraft}
                            onChange={e => setTitleDraft(e.target.value)}
                            onBlur={commitTitle}
                            onKeyDown={e => { if (e.key === "Enter") commitTitle(); if (e.key === "Escape") setIsEditingTitle(false); }}
                            className="text-sm font-bold text-brand-blue bg-brand-bgLight border border-brand-lightBlue/40 rounded px-2 py-0.5 outline-none focus:border-brand-lightBlue/70 min-w-[100px] max-w-[260px]"
                            autoFocus
                        />
                    ) : (
                        <button onClick={startEditTitle} title="Click to rename"
                            className="group flex items-center gap-1.5 text-sm font-bold text-brand-blue hover:text-brand-blue/80 truncate max-w-[260px]">
                            <span className="truncate">{designTitle}</span>
                            <Pencil size={10} className="text-brand-blue/25 group-hover:text-brand-blue/55 flex-shrink-0 transition-colors" />
                        </button>
                    )}
                    {hasUnsavedChanges && (
                        <span className="text-[9px] font-bold text-brand-blue/35 flex-shrink-0 border border-brand-blue/15 rounded px-1.5 py-0.5">
                            unsaved
                        </span>
                    )}
                    {currentDesignId && (
                        <span className={`text-[9px] font-bold flex-shrink-0 rounded px-1.5 py-0.5 border ${
                            isPrivate ? "text-brand-blue/40 border-brand-blue/15" : "text-emerald-600 border-emerald-200 bg-emerald-50"
                        }`}>
                            {isPrivate ? "Private" : "Public"}
                        </span>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={handleSaveClick} disabled={isSaving}
                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-tl-lg rounded-br-lg bg-brand-blue text-white hover:bg-brand-blue/90 disabled:opacity-50 transition-colors shadow-sm">
                        {isSaving ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : hasUnsavedChanges && currentDesignId ? <Save size={13} /> : <Check size={13} />}
                        {currentDesignId ? (hasUnsavedChanges ? "Save" : "Saved") : "Save"}
                    </button>
                    <button
                        onClick={() => currentDesignId ? setShowShareModal(true) : toast("Save first to share", "info")}
                        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-tl-lg rounded-br-lg border-2 transition-colors ${currentDesignId ? "border-brand-blue/25 text-brand-blue hover:bg-brand-bgLight" : "border-brand-blue/10 text-brand-blue/30 cursor-not-allowed"}`}>
                        <Share2 size={13} /> Share
                    </button>
                    <button onClick={handleExport}
                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-tl-lg rounded-br-lg border-2 border-brand-blue/25 text-brand-blue hover:bg-brand-bgLight transition-colors">
                        <Download size={13} /> Export
                    </button>
                </div>
            </div>

            {/* ── Main layout ─────────────────────────────────────────────── */}
            <div className="flex-1 flex overflow-hidden">
                {/* LEFT Sidebar */}
                <div className="flex-shrink-0 flex flex-col bg-white border-r-2 border-brand-blue/8 overflow-hidden" style={{ width: sidebarW }}>
                    <Sidebar
                        state={state}
                        setState={setState}
                        selectedId={selectedId}
                        setSelectedId={setSelectedId}
                        selectedBlock={selectedBlock}
                        setShowAddPicker={setShowAddPicker}
                        removeBlock={removeBlock}
                        toggleVisible={toggleVisible}
                        applyTemplate={applyTemplate}
                        listDragOverId={listDragOverId}
                        handleListDragStart={handleListDragStart}
                        handleListDragOver={handleListDragOver}
                        handleListDrop={handleListDrop}
                        tab={tab}
                        setTab={setTab}
                        currentDesignId={currentDesignId}
                        onLoadDesign={(design) => {
                            setState(design.state as PosterState);
                            setCurrentDesignId(design._id);
                            setDesignTitle(design.title);
                            setIsPrivate(design.isPrivate);
                            setHasUnsavedChanges(false);
                            setSelectedId(null);
                            lastSavedStateRef.current = design.state as PosterState;
                            navigate(`/design/edit/${design._id}`, { replace: true });
                        }}
                        onNewDesign={() => {
                            setState({ bg: { ...DEFAULT_BG }, blocks: TEMPLATES[0].state.blocks.map(b => ({ ...b, id: uid() })) });
                            setCurrentDesignId(null);
                            setDesignTitle("Untitled Design");
                            setIsPrivate(true);
                            setHasUnsavedChanges(false);
                            setSelectedId(null);
                            lastSavedStateRef.current = null;
                            navigate("/design/new", { replace: true });
                        }}
                    />
                </div>

                {/* Resize handle */}
                <div className="w-1 bg-brand-blue/5 hover:bg-brand-lightBlue/30 transition-colors cursor-col-resize flex-shrink-0" onMouseDown={handleResizeStart} />

                {/* Canvas area */}
                <div className="flex-1 flex items-center justify-center p-8 overflow-hidden relative bg-[radial-gradient(ellipse_at_center,#1a2a3e_0%,#0e1720_70%)]">
                    <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "radial-gradient(circle, #7eb8e8 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                    <canvas
                        ref={canvasRef} width={S} height={S}
                        className="relative rounded-tl-2xl rounded-br-2xl cursor-crosshair"
                        style={{ width: "min(calc(100vh - 140px), calc(100% - 32px))", height: "auto", boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 24px 80px rgba(0,0,0,0.55), 0 8px 24px rgba(0,0,0,0.3)" }}
                        onMouseDown={handleCanvasMouseDown}
                        onMouseMove={handleCanvasMouseMove}
                        onMouseUp={handleCanvasMouseUp}
                        onMouseLeave={handleCanvasMouseUp}
                    />
                    <div className="absolute bottom-4 right-5 text-[10px] text-white/20 font-mono">1080 × 1080</div>
                </div>
            </div>

            {/* ── Modals ───────────────────────────────────────────────────── */}
            <AddBlockPicker open={showAddPicker} onAdd={addBlock} onClose={() => setShowAddPicker(false)} />

            <SaveModal
                open={showSaveModal}
                onClose={() => setShowSaveModal(false)}
                onConfirm={handleSaveModalConfirm}
                defaultTitle={designTitle}
            />

            {currentDesignId && (
                <ShareDesignModal
                    open={showShareModal}
                    onClose={() => setShowShareModal(false)}
                    designId={currentDesignId}
                    designTitle={designTitle}
                    slug={designSlug}
                    isPrivate={isPrivate}
                    onPrivacyChange={async (priv) => {
                        await updatePrivacyMutation({ designId: currentDesignId, isPrivate: priv });
                        setIsPrivate(priv);
                    }}
                    onSlugChange={(newSlug) => setDesignSlug(newSlug)}
                />
            )}
        </div>
    );
}
