import type { Dispatch, SetStateAction } from "react";
import { Layers, Palette, LayoutTemplate, Library, Plus, GripVertical, Eye, EyeOff, Trash2, X } from "lucide-react";
import type { Block, CanvasBg, PosterState, TabId } from "./types";
import type { Id } from "../../../../convex/_generated/dataModel";
import { TEMPLATES, BLOCK_TYPE_META } from "./constants";
import { BlockEditor } from "./BlockEditor";
import { Label, ColorRow, SliderRow } from "./shared";
import { Toggle, Tabs, TabsList, TabsTrigger, TabsContent } from "@/design";
import { DesignsPanel } from "./DesignsPanel";

interface SidebarProps {
    state: PosterState;
    setState: Dispatch<SetStateAction<PosterState>>;
    selectedId: string | null;
    setSelectedId: (id: string | null) => void;
    selectedBlock: Block | null;
    setShowAddPicker: (show: boolean) => void;
    removeBlock: (id: string) => void;
    toggleVisible: (id: string) => void;
    applyTemplate: (tpl: typeof TEMPLATES[0]) => void;
    listDragOverId: string | null;
    handleListDragStart: (id: string) => void;
    handleListDragOver: (id: string) => void;
    handleListDrop: (id: string) => void;
    tab: TabId;
    setTab: (tab: TabId) => void;
    currentDesignId: Id<"posterDesigns"> | null;
    onLoadDesign: (design: { _id: Id<"posterDesigns">; title: string; state: any; isPrivate: boolean }) => void;
    onNewDesign: () => void;
}

export function Sidebar({
    state,
    setState,
    selectedId,
    setSelectedId,
    selectedBlock,
    setShowAddPicker,
    removeBlock,
    toggleVisible,
    applyTemplate,
    listDragOverId,
    handleListDragStart,
    handleListDragOver,
    handleListDrop,
    tab,
    setTab,
    currentDesignId,
    onLoadDesign,
    onNewDesign,
}: SidebarProps) {
    const reversedBlocks = [...state.blocks].reverse();

    const updateBg = (key: keyof CanvasBg, val: any) => {
        setState((p: PosterState) => ({ ...p, bg: { ...p.bg, [key]: val } }));
    };

    return (
        <div className="h-full flex flex-col overflow-hidden">

            {/* ── Scrollable tabs content ──────────────────────────────────── */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <Tabs
                    value={tab}
                    onValueChange={(v) => setTab(v as TabId)}
                    variant="underline"
                    className="h-full flex flex-col"
                >
                    <TabsList className="bg-white px-1 pt-1 justify-start gap-0.5 w-full flex-shrink-0 border-b-2 border-brand-blue/8">
                        <TabsTrigger value="layers" className="flex items-center gap-1.5 text-[11px] px-3 py-2">
                            <Layers size={11} /> Layers
                        </TabsTrigger>
                        <TabsTrigger value="background" className="flex items-center gap-1.5 text-[11px] px-3 py-2">
                            <Palette size={11} /> Background
                        </TabsTrigger>
                        <TabsTrigger value="templates" className="flex items-center gap-1.5 text-[11px] px-3 py-2">
                            <LayoutTemplate size={11} /> Templates
                        </TabsTrigger>
                        <TabsTrigger value="designs" className="flex items-center gap-1.5 text-[11px] px-3 py-2">
                            <Library size={11} /> Designs
                        </TabsTrigger>
                    </TabsList>

                    {/* ── LAYERS TAB ─────────────────────────────────────── */}
                    <TabsContent value="layers" className="flex-1 min-h-0 overflow-hidden flex flex-col mt-0">
                        {/* Add block button */}
                        <div className="px-3 pt-3 pb-2 flex-shrink-0">
                            <button
                                onClick={() => setShowAddPicker(true)}
                                className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-brand-lightBlue/25 rounded-tl-lg rounded-br-lg text-xs font-bold text-brand-lightBlue/60 hover:border-brand-lightBlue/50 hover:text-brand-lightBlue hover:bg-brand-lightBlue/4 transition-all"
                            >
                                <Plus size={13} />
                                Add Block
                            </button>
                        </div>

                        {/* Layer list */}
                        <div className="flex-1 overflow-y-auto">
                            {reversedBlocks.length === 0 && (
                                <div className="px-4 py-8 text-center">
                                    <div className="text-2xl mb-2">🎨</div>
                                    <div className="text-xs text-brand-blue/40">No blocks yet. Add one above or pick a template.</div>
                                </div>
                            )}
                            {reversedBlocks.map((block: Block) => {
                                const isSelected = selectedId === block.id;
                                const isDragOver = listDragOverId === block.id;
                                return (
                                    <div
                                        key={block.id}
                                        className={`relative flex items-center gap-2 pl-2 pr-2.5 py-2 cursor-pointer border-b border-brand-blue/5 transition-all ${
                                            isDragOver ? "bg-brand-lightBlue/8" : ""
                                        } ${isSelected ? "bg-brand-lightBlue/10" : "hover:bg-brand-bgLight/50"}`}
                                        onClick={() => setSelectedId(isSelected ? null : block.id)}
                                        onDragOver={e => { e.preventDefault(); handleListDragOver(block.id); }}
                                        onDrop={e => { e.preventDefault(); handleListDrop(block.id); }}
                                    >
                                        {/* Selected indicator bar */}
                                        {isSelected && (
                                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand-lightBlue rounded-r" />
                                        )}

                                        {/* Drag handle */}
                                        <div
                                            draggable
                                            onDragStart={() => handleListDragStart(block.id)}
                                            className="text-brand-blue/20 hover:text-brand-blue/50 cursor-grab active:cursor-grabbing flex-shrink-0"
                                            onClick={e => e.stopPropagation()}
                                        >
                                            <GripVertical size={13} />
                                        </div>

                                        {/* Type icon */}
                                        <span className="text-[11px] font-mono text-brand-blue/30 w-4 text-center flex-shrink-0">
                                            {BLOCK_TYPE_META[block.type].icon}
                                        </span>

                                        {/* Label */}
                                        <span className={`flex-1 text-xs font-semibold truncate ${
                                            isSelected ? "text-brand-blue" : "text-brand-blue/65"
                                        }`}>
                                            {block.label}
                                        </span>

                                        {/* Actions */}
                                        <div className="flex items-center gap-0.5 flex-shrink-0">
                                            <button
                                                onClick={e => { e.stopPropagation(); toggleVisible(block.id); }}
                                                className="p-1 text-brand-blue/25 hover:text-brand-blue/70 rounded transition-colors"
                                                title={block.visible ? "Hide" : "Show"}
                                            >
                                                {block.visible ? <Eye size={11} /> : <EyeOff size={11} />}
                                            </button>
                                            <button
                                                onClick={e => { e.stopPropagation(); removeBlock(block.id); }}
                                                className="p-1 text-brand-blue/20 hover:text-red-500 rounded transition-colors"
                                                title="Delete block"
                                            >
                                                <Trash2 size={11} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                            {/* Bottom padding */}
                            <div className="h-4" />
                        </div>
                    </TabsContent>

                    {/* ── BACKGROUND TAB ─────────────────────────────────── */}
                    <TabsContent value="background" className="flex-1 overflow-y-auto mt-0">
                        <div className="p-4 space-y-5">
                            <div>
                                <Label>Background Color</Label>
                                <ColorRow value={state.bg.bgColor} onChange={v => updateBg("bgColor", v)} />
                            </div>
                            <div>
                                <Label>Accent Color</Label>
                                <ColorRow value={state.bg.accentColor} onChange={v => updateBg("accentColor", v)} />
                            </div>
                            <div className="pt-1 border-t border-brand-blue/8">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-brand-blue/40 mb-3">Decorations</div>
                                <div className="space-y-2.5">
                                    <Toggle checked={state.bg.diagTopLeft} onChange={v => updateBg("diagTopLeft", v)} label="Diagonal Lines — Top Left" />
                                    <Toggle checked={state.bg.diagBottomRight} onChange={v => updateBg("diagBottomRight", v)} label="Diagonal Lines — Bottom Right" />
                                    <Toggle checked={state.bg.cornerBrackets} onChange={v => updateBg("cornerBrackets", v)} label="Corner Bracket Marks" />
                                </div>
                            </div>
                            <div className="space-y-3 pt-1 border-t border-brand-blue/8">
                                <Toggle checked={state.bg.topBand} onChange={v => updateBg("topBand", v)} label="Top Accent Band" />
                                {state.bg.topBand && (
                                    <>
                                        <div>
                                            <Label>Band Color</Label>
                                            <ColorRow value={state.bg.topBandColor} onChange={v => updateBg("topBandColor", v)} />
                                        </div>
                                        <SliderRow label="Band Height" value={state.bg.topBandHeight} min={4} max={200}
                                            onChange={v => updateBg("topBandHeight", v)} />
                                    </>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* ── TEMPLATES TAB ──────────────────────────────────── */}
                    <TabsContent value="templates" className="flex-1 overflow-y-auto mt-0">
                        <div className="p-3">
                            <p className="text-[10px] text-brand-blue/40 mb-3 leading-relaxed px-1">
                                Applying a template replaces all current blocks and background.
                            </p>
                            <div className="space-y-1.5">
                                {TEMPLATES.map(tpl => (
                                    <button
                                        key={tpl.id}
                                        onClick={() => applyTemplate(tpl)}
                                        className="w-full flex items-center gap-3 p-3 border border-brand-blue/10 rounded-tl-lg rounded-br-lg hover:border-brand-lightBlue/50 hover:bg-brand-bgLight/60 transition-all text-left group"
                                    >
                                        <span className="text-xl flex-shrink-0">{tpl.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-bold text-brand-blue group-hover:text-brand-blue">{tpl.label}</div>
                                            <div className="text-[10px] text-brand-blue/40">{tpl.state.blocks.length} blocks</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    {/* ── DESIGNS TAB ────────────────────────────────────── */}
                    <TabsContent value="designs" className="flex-1 min-h-0 overflow-hidden mt-0">
                        <DesignsPanel
                            currentDesignId={currentDesignId}
                            onLoadDesign={onLoadDesign}
                            onNewDesign={onNewDesign}
                        />
                    </TabsContent>
                </Tabs>
            </div>

            {/* ── Properties panel (shown when a block is selected) ──────── */}
            {selectedBlock && (
                <div className="flex-shrink-0 border-t-2 border-brand-blue/8 flex flex-col" style={{ maxHeight: "55%" }}>
                    {/* Properties header */}
                    <div className="flex items-center justify-between px-3 py-2 bg-brand-bgLight/60 border-b border-brand-blue/8 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-brand-blue/35">
                                {BLOCK_TYPE_META[selectedBlock.type].icon}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue/50">
                                {selectedBlock.type} Properties
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] font-mono text-brand-blue/35">
                                {selectedBlock.x},{selectedBlock.y}
                            </span>
                            <button
                                onClick={() => setSelectedId(null)}
                                className="p-1 text-brand-blue/30 hover:text-brand-blue rounded transition-colors"
                            >
                                <X size={11} />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable editor */}
                    <div className="overflow-y-auto flex-1 min-h-0">
                        <BlockEditor
                            block={selectedBlock}
                            onChange={(updated) => {
                                setState((p: PosterState) => ({
                                    ...p,
                                    blocks: p.blocks.map(b => b.id === updated.id ? updated : b),
                                }));
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
