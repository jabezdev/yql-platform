import { useRef, useEffect, useState, useCallback } from "react";
import { Download, Image as ImageIcon } from "lucide-react";

import type { BlockType, PosterState, TabId, BoundsMap } from "./poster-creator/types";
import { DEFAULT_BG, S, TEMPLATES, uid, makeBlock } from "./poster-creator/constants";
import { drawBg, drawBlock, useLogos } from "./poster-creator/canvas-utils";
import { Sidebar } from "./poster-creator/Sidebar";
import { AddBlockPicker } from "./poster-creator/AddBlockPicker";
import { Button } from "@/design";

export default function PosterCreatorPage() {
    const logos = useLogos();

    const [state, setState] = useState<PosterState>(() => ({
        bg: { ...DEFAULT_BG },
        blocks: TEMPLATES[0].state.blocks.map(b => ({ ...b, id: uid() })),
    }));

    const [tab, setTab] = useState<TabId>("layers");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [, setHoveredId] = useState<string | null>(null);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [showAddPicker, setShowAddPicker] = useState(false);
    const [sidebarW, setSidebarW] = useState(340);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const boundsRef = useRef<BoundsMap>(new Map());
    const dragBlockRef = useRef<{ id: string; startY: number; startBlockY: number; startX: number; startBlockX: number } | null>(null);
    
    const [listDragOverId, setListDragOverId] = useState<string | null>(null);
    const listDragRef = useRef<{ id: string } | null>(null);

    // ── Render ──────────────────────────────────────────────────────────────
    const render = useCallback((highlight: string | null = selectedId) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const newBounds: BoundsMap = new Map();
        drawBg(ctx, state.bg);
        for (const block of state.blocks) {
            drawBlock(ctx, block, logos, newBounds, highlight);
        }
        boundsRef.current = newBounds;
    }, [state, logos, selectedId]);

    useEffect(() => {
        document.fonts.ready.then(() => render());
    }, [render]);

    // ── Update helpers ───────────────────────────────────────────────────────
    const removeBlock = useCallback((id: string) => {
        setState(p => ({ ...p, blocks: p.blocks.filter(b => b.id !== id) }));
        if (selectedId === id) setSelectedId(null);
    }, [selectedId]);

    const toggleVisible = useCallback((id: string) => {
        setState(p => ({ ...p, blocks: p.blocks.map(b => b.id === id ? { ...b, visible: !b.visible } : b) }));
    }, []);

    const applyTemplate = useCallback((tpl: typeof TEMPLATES[0]) => {
        setState({
            bg: { ...tpl.state.bg },
            blocks: tpl.state.blocks.map(b => ({ ...b, id: uid() })),
        });
        setSelectedId(null);
        setExpandedIds(new Set());
    }, []);

    const addBlock = useCallback((type: BlockType) => {
        const block = makeBlock(type, { y: 300 });
        setState(p => ({ ...p, blocks: [...p.blocks, block] }));
        setSelectedId(block.id);
        setExpandedIds(prev => new Set([...prev, block.id]));
    }, []);

    // ── Canvas mouse ─────────────────────────────────────────────────────────
    const toCanvasCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        return {
            cx: (e.clientX - rect.left) * (S / rect.width),
            cy: (e.clientY - rect.top)  * (S / rect.height),
        };
    }, []);

    const hitTest = useCallback((cx: number, cy: number): string | null => {
        // Test in reverse (top layers first)
        const blocks = [...state.blocks].reverse();
        for (const b of blocks) {
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
        if (hit) {
            const block = state.blocks.find(b => b.id === hit)!;
            dragBlockRef.current = { id: hit, startY: cy, startBlockY: block.y, startX: cx, startBlockX: block.x };
        } else {
            dragBlockRef.current = null;
        }
    }, [toCanvasCoords, hitTest, state.blocks]);

    const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const { cx, cy } = toCanvasCoords(e);
        if (dragBlockRef.current) {
            const { id, startY, startBlockY, startX, startBlockX } = dragBlockRef.current;
            const newY = Math.round(startBlockY + (cy - startY));
            const newX = Math.round(startBlockX + (cx - startX));
            setState(p => ({
                ...p,
                blocks: p.blocks.map(b => b.id === id ? { ...b, y: newY, x: newX } : b),
            }));
        } else {
            const hit = hitTest(cx, cy);
            setHoveredId(hit);
        }
    }, [toCanvasCoords, hitTest]);

    const handleCanvasMouseUp = useCallback(() => {
        dragBlockRef.current = null;
    }, []);

    // ── Sidebar layer drag-to-reorder ────────────────────────────────────────

    const handleListDragStart = useCallback((id: string) => {
        listDragRef.current = { id };
    }, []);

    const handleListDragOver = useCallback((id: string) => {
        if (listDragRef.current && listDragRef.current.id !== id) {
            setListDragOverId(id);
        }
    }, []);

    const handleListDrop = useCallback((targetId: string) => {
        const srcId = listDragRef.current?.id;
        if (!srcId || srcId === targetId) { listDragRef.current = null; setListDragOverId(null); return; }
        setState(p => {
            const arr = [...p.blocks];
            const srcIdx = arr.findIndex(b => b.id === srcId);
            // Reverse display means we need to invert the drop logic
            const [moved] = arr.splice(srcIdx, 1);
            const newTgt = arr.findIndex(b => b.id === targetId);
            arr.splice(newTgt, 0, moved);
            return { ...p, blocks: arr };
        });
        listDragRef.current = null;
        setListDragOverId(null);
    }, []);

    const toggleExpand = useCallback((id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) { next.delete(id); } else { next.add(id); }
            return next;
        });
    }, []);

    // ── Export ───────────────────────────────────────────────────────────────
    const handleExport = useCallback(async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;
        const emptyBounds: BoundsMap = new Map();
        await document.fonts.ready;
        drawBg(ctx, state.bg);
        for (const block of state.blocks) drawBlock(ctx, block, logos, emptyBounds, null);
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = "yql-poster.png";
        a.click();
        render(selectedId);
    }, [state, logos, selectedId, render]);

    // ── Resize sidebar ───────────────────────────────────────────────────────
    const handleResizeStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        const startX = e.clientX, startW = sidebarW;
        const onMove = (ev: MouseEvent) => setSidebarW(Math.max(280, Math.min(520, startW + (startX - ev.clientX))));
        const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
    }, [sidebarW]);

    const selectedBlock = state.blocks.find(b => b.id === selectedId) ?? null;

    // ═══════════════════════════════════════════════════════════════════════
    //  RENDER
    // ═══════════════════════════════════════════════════════════════════════

    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden bg-brand-bgLight select-none">
            {/* Top bar */}
            <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 bg-white border-b-2 border-brand-blue/8 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-tl-lg rounded-br-lg bg-brand-blue flex items-center justify-center">
                        <ImageIcon size={13} className="text-white" />
                    </div>
                    <span className="text-sm font-bold text-brand-blue">Poster Creator</span>
                    <span className="text-xs text-brand-blue/35 border border-brand-blue/15 rounded px-1.5 py-0.5">YQL Design Studio</span>
                </div>
                <Button onClick={handleExport} size="sm" className="flex items-center gap-2">
                    <Download size={16} />
                    Export PNG
                </Button>
            </div>

            {/* Main layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Canvas area */}
                <div className="flex-1 flex items-center justify-center p-6 overflow-hidden bg-[radial-gradient(circle_at_50%_50%,rgba(61,140,203,0.04)_0%,transparent_70%)]">
                    <canvas
                        ref={canvasRef}
                        width={S} height={S}
                        className="rounded-tl-2xl rounded-br-2xl shadow-[0_12px_40px_rgba(10,22,48,0.22)] cursor-crosshair"
                        style={{ width: "min(calc(100vh - 160px), calc(100% - 32px))", height: "auto" }}
                        onMouseDown={handleCanvasMouseDown}
                        onMouseMove={handleCanvasMouseMove}
                        onMouseUp={handleCanvasMouseUp}
                        onMouseLeave={handleCanvasMouseUp}
                    />
                </div>

                {/* Resize handle */}
                <div
                    className="w-1.5 bg-brand-blue/8 hover:bg-brand-lightBlue/40 transition-colors cursor-col-resize flex-shrink-0"
                    onMouseDown={handleResizeStart}
                />

                {/* Sidebar */}
                <div className="flex-shrink-0 flex flex-col bg-white border-l-2 border-brand-blue/8 overflow-hidden"
                    style={{ width: sidebarW }}>
                    <Sidebar 
                        state={state}
                        setState={setState}
                        selectedId={selectedId}
                        setSelectedId={setSelectedId}
                        expandedIds={expandedIds}
                        setShowAddPicker={setShowAddPicker}
                        removeBlock={removeBlock}
                        toggleVisible={toggleVisible}
                        applyTemplate={applyTemplate}
                        listDragOverId={listDragOverId}
                        handleListDragStart={handleListDragStart}
                        handleListDragOver={handleListDragOver}
                        handleListDrop={handleListDrop}
                        toggleExpand={toggleExpand}
                        tab={tab}
                        setTab={setTab}
                    />

                    {/* Bottom status bar */}
                    {selectedBlock && (
                        <div className="flex-shrink-0 border-t-2 border-brand-blue/8 px-3 py-2 bg-brand-bgLight/40 flex items-center justify-between">
                            <span className="text-[10px] text-brand-blue/50 font-medium">
                                x{selectedBlock.x} y{selectedBlock.y}
                            </span>
                            <button onClick={() => setSelectedId(null)} className="text-[10px] text-brand-blue/40 hover:text-brand-blue">
                                Deselect
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <AddBlockPicker open={showAddPicker} onAdd={addBlock} onClose={() => setShowAddPicker(false)} />
        </div>
    );
}
