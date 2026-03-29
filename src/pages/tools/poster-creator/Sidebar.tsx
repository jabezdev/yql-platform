import type { Dispatch, SetStateAction } from "react";
import { Layers, Palette, LayoutTemplate, Plus, GripVertical, Eye, EyeOff, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import type { Block, CanvasBg, PosterState, TabId } from "./types";
import { TEMPLATES, BLOCK_TYPE_META } from "./constants";
import { BlockEditor } from "./BlockEditor";
import { Label, ColorRow, SliderRow } from "./shared";
import { Toggle, Tabs, TabsList, TabsTrigger, TabsContent } from "@/design";

interface SidebarProps {
    state: PosterState;
    setState: Dispatch<SetStateAction<PosterState>>;
    selectedId: string | null;
    setSelectedId: (id: string | null) => void;
    expandedIds: Set<string>;
    setShowAddPicker: (show: boolean) => void;
    removeBlock: (id: string) => void;
    toggleVisible: (id: string) => void;
    applyTemplate: (tpl: typeof TEMPLATES[0]) => void;
    listDragOverId: string | null;
    handleListDragStart: (id: string) => void;
    handleListDragOver: (id: string) => void;
    handleListDrop: (id: string) => void;
    toggleExpand: (id: string) => void;
    tab: TabId;
    setTab: (tab: TabId) => void;
}

export function Sidebar({
    state,
    setState,
    selectedId,
    setSelectedId,
    expandedIds,
    setShowAddPicker,
    removeBlock,
    toggleVisible,
    applyTemplate,
    listDragOverId,
    handleListDragStart,
    handleListDragOver,
    handleListDrop,
    toggleExpand,
    tab,
    setTab,
}: SidebarProps) {
    const reversedBlocks = [...state.blocks].reverse();
    const updateBg = (key: keyof CanvasBg, val: any) => {
        setState((p: PosterState) => ({ ...p, bg: { ...p.bg, [key]: val } }));
    };

    return (
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabId)} variant="underline" className="flex-1 flex flex-col min-h-0 bg-white border-l-2 border-brand-blue/8">
            <TabsList className="bg-white px-1 pt-1 justify-between gap-1 w-full">
                <TabsTrigger value="layers" className="flex-1 flex items-center justify-center gap-1.5">
                    <Layers size={12} /> Layers
                </TabsTrigger>
                <TabsTrigger value="background" className="flex-1 flex items-center justify-center gap-1.5">
                    <Palette size={12} /> Background
                </TabsTrigger>
                <TabsTrigger value="templates" className="flex-1 flex items-center justify-center gap-1.5">
                    <LayoutTemplate size={12} /> Templates
                </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto min-h-0">
                <TabsContent value="layers" className="h-full flex flex-col mt-0">
                    <div className="p-3 border-b border-brand-blue/8 flex-shrink-0">
                        <button onClick={() => setShowAddPicker(true)}
                            className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-brand-lightBlue/30 rounded-tl-lg rounded-br-lg text-xs font-bold text-brand-lightBlue/70 hover:border-brand-lightBlue/60 hover:text-brand-lightBlue hover:bg-brand-lightBlue/4 transition-all">
                            <Plus size={13} />
                            Add Block
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {reversedBlocks.length === 0 && (
                            <div className="p-6 text-center text-xs text-brand-blue/35 italic">No blocks yet. Add one above.</div>
                        )}
                        {reversedBlocks.map((block: Block) => {
                            const isSelected = selectedId === block.id;
                            const isExpanded = expandedIds.has(block.id);
                            const isDragOver = listDragOverId === block.id;
                            return (
                                <div key={block.id}
                                    className={`border-b border-brand-blue/6 transition-colors ${isDragOver ? "bg-brand-lightBlue/8" : ""}`}
                                    onDragOver={e => { e.preventDefault(); handleListDragOver(block.id); }}
                                    onDrop={e => { e.preventDefault(); handleListDrop(block.id); }}>
                                    
                                    <div className={`flex items-center gap-1.5 px-2.5 py-2 cursor-pointer ${isSelected ? "bg-brand-lightBlue/8" : "hover:bg-brand-bgLight/60"}`}
                                        onClick={() => { setSelectedId(block.id); toggleExpand(block.id); }}>
                                        <div draggable onDragStart={() => handleListDragStart(block.id)}
                                            className="text-brand-blue/25 hover:text-brand-blue/50 cursor-grab active:cursor-grabbing flex-shrink-0"
                                            onClick={e => e.stopPropagation()}>
                                            <GripVertical size={13} />
                                        </div>
                                        <span className="text-[11px] text-brand-blue/35 font-mono w-4 text-center flex-shrink-0">
                                            {BLOCK_TYPE_META[block.type].icon}
                                        </span>
                                        <span className={`flex-1 text-xs font-semibold truncate ${isSelected ? "text-brand-blue" : "text-brand-blue/70"}`}>
                                            {block.label}
                                        </span>
                                        <button onClick={e => { e.stopPropagation(); toggleVisible(block.id); }}
                                            className="p-1 text-brand-blue/30 hover:text-brand-blue/70 flex-shrink-0">
                                            {block.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                                        </button>
                                        <span className="text-brand-blue/30 flex-shrink-0">
                                            {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                        </span>
                                        <button onClick={e => { e.stopPropagation(); removeBlock(block.id); }}
                                            className="p-1 text-brand-blue/20 hover:text-red-500 flex-shrink-0">
                                            <Trash2 size={11} />
                                        </button>
                                    </div>
                                    
                                    {isExpanded && (
                                        <BlockEditor block={block} onChange={(updated) => {
                                            setState((p: PosterState) => ({ ...p, blocks: p.blocks.map(b => b.id === updated.id ? updated : b) }));
                                        }} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </TabsContent>

                <TabsContent value="background">
                    <div className="p-4 space-y-5">
                        <div>
                            <Label>Background Color</Label>
                            <ColorRow value={state.bg.bgColor} onChange={v => updateBg("bgColor", v)} />
                        </div>
                        <div>
                            <Label>Accent Color</Label>
                            <ColorRow value={state.bg.accentColor} onChange={v => updateBg("accentColor", v)} />
                        </div>
                        <div className="space-y-2.5 pt-1 border-t border-brand-blue/8">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-brand-blue/45 mb-2">Decorations</div>
                            <Toggle checked={state.bg.diagTopLeft} onChange={v => updateBg("diagTopLeft", v)} label="Diagonal Lines — Top Left" />
                            <Toggle checked={state.bg.diagBottomRight} onChange={v => updateBg("diagBottomRight", v)} label="Diagonal Lines — Bottom Right" />
                            <Toggle checked={state.bg.cornerBrackets} onChange={v => updateBg("cornerBrackets", v)} label="Corner Bracket Marks" />
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

                <TabsContent value="templates">
                    <div className="p-3">
                        <p className="text-[10px] text-brand-blue/45 mb-3 leading-relaxed">
                            Applying a template replaces all current blocks and background. You can then customize everything.
                        </p>
                        <div className="space-y-2">
                            {TEMPLATES.map(tpl => (
                                <button key={tpl.id} onClick={() => applyTemplate(tpl)}
                                    className="w-full flex items-center gap-3 p-3 border border-brand-blue/12 rounded-tl-lg rounded-br-lg hover:border-brand-lightBlue/50 hover:bg-brand-bgLight/60 transition-all text-left">
                                    <span className="text-xl flex-shrink-0">{tpl.icon}</span>
                                    <div>
                                        <div className="text-xs font-bold text-brand-blue">{tpl.label}</div>
                                        <div className="text-[10px] text-brand-blue/45">{tpl.state.blocks.length} blocks</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </TabsContent>
            </div>
        </Tabs>
    );
}
