import { useCallback } from "react";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import type { Block, FontFamily, AlignH } from "./types";
import { Label, ColorRow, SliderRow } from "./shared";

export function BlockEditor({ block, onChange }: { block: Block; onChange: (b: Block) => void }) {
    const set = useCallback(<K extends keyof Block>(key: K, val: Block[K]) => {
        onChange({ ...block, [key]: val });
    }, [block, onChange]);

    const hasText = !["logo", "bg-rect", "divider"].includes(block.type);
    const hasFontControls = hasText && block.type !== "quote-mark";
    const hasColorBg = ["tag", "cta", "bg-rect"].includes(block.type);

    return (
        <div className="space-y-4 p-3 bg-brand-bgLight/60 border-t border-brand-blue/8">
            {/* Label */}
            <div>
                <Label>Block Label</Label>
                <input value={block.label} onChange={e => set("label", e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-brand-blue/15 rounded-tl-md rounded-br-md outline-none focus:border-brand-lightBlue/50 text-brand-blue" />
            </div>

            {/* Text content */}
            {hasText && (
                <div>
                    <Label>Content</Label>
                    {["text", "quote-mark"].includes(block.type) || block.type === "bullet" ? (
                        <textarea
                            value={block.text}
                            onChange={e => set("text", e.target.value)}
                            rows={3}
                            className="w-full text-xs px-2.5 py-1.5 border border-brand-blue/15 rounded-tl-md rounded-br-md outline-none focus:border-brand-lightBlue/50 text-brand-blue resize-none"
                        />
                    ) : (
                        <input value={block.text} onChange={e => set("text", e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 border border-brand-blue/15 rounded-tl-md rounded-br-md outline-none focus:border-brand-lightBlue/50 text-brand-blue" />
                    )}
                </div>
            )}

            {/* Bullet icon */}
            {block.type === "bullet" && (
                <div>
                    <Label>Bullet Icon</Label>
                    <input value={block.icon} onChange={e => set("icon", e.target.value)} maxLength={4}
                        className="w-20 text-center text-lg px-2 py-1 border border-brand-blue/15 rounded-tl-md rounded-br-md outline-none focus:border-brand-lightBlue/50" />
                </div>
            )}

            {/* Font controls */}
            {hasFontControls && (
                <>
                    <SliderRow label="Font Size" value={block.fontSize} min={12} max={220} onChange={v => set("fontSize", v)} />
                    <div>
                        <Label>Font Family</Label>
                        <div className="grid grid-cols-2 gap-1">
                            {(["display", "sans"] as FontFamily[]).map(f => (
                                <button key={f} onClick={() => set("fontFamily", f)}
                                    className={`py-1.5 text-[11px] font-semibold rounded-tl-md rounded-br-md border transition-colors ${block.fontFamily === f ? "border-brand-lightBlue/60 bg-brand-lightBlue/8 text-brand-blue" : "border-brand-blue/12 text-brand-blue/50 hover:border-brand-lightBlue/30"}`}>
                                    {f === "display" ? "Montserrat" : "Inter"}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <Label>Font Weight</Label>
                        <div className="flex gap-1 flex-wrap">
                            {["400", "500", "600", "700", "800", "900"].map(w => (
                                <button key={w} onClick={() => set("fontWeight", w)}
                                    className={`px-2 py-1 text-[11px] rounded border transition-colors ${block.fontWeight === w ? "border-brand-lightBlue/60 bg-brand-lightBlue/8 text-brand-blue" : "border-brand-blue/12 text-brand-blue/45 hover:border-brand-lightBlue/30"}`}
                                    style={{ fontWeight: w }}>
                                    {w}
                                </button>
                            ))}
                        </div>
                    </div>
                    <SliderRow label="Line Height" value={block.lineHeight} min={0.9} max={2.5} step={0.05} onChange={v => set("lineHeight", v)} />
                </>
            )}

            {/* Alignment */}
            {!["divider", "logo", "bg-rect"].includes(block.type) && (
                <div>
                    <Label>Alignment</Label>
                    <div className="flex gap-1">
                        {(["left", "center", "right"] as AlignH[]).map(a => (
                            <button key={a} onClick={() => set("align", a)}
                                className={`p-2 rounded border transition-colors ${block.align === a ? "border-brand-lightBlue/60 bg-brand-lightBlue/8 text-brand-blue" : "border-brand-blue/12 text-brand-blue/40 hover:border-brand-lightBlue/30"}`}>
                                {a === "left" ? <AlignLeft size={13} /> : a === "center" ? <AlignCenter size={13} /> : <AlignRight size={13} />}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Text color */}
            {!["bg-rect", "logo"].includes(block.type) && (
                <div>
                    <Label>Text / Line Color</Label>
                    <ColorRow value={block.color} onChange={v => set("color", v)} />
                </div>
            )}

            {/* Background color */}
            {hasColorBg && (
                <div>
                    <Label>Background Color</Label>
                    <ColorRow value={block.bgColor} onChange={v => set("bgColor", v)} />
                </div>
            )}

            {/* BG-rect height */}
            {block.type === "bg-rect" && (
                <>
                    <div>
                        <Label>Fill Color</Label>
                        <ColorRow value={block.bgColor} onChange={v => set("bgColor", v)} />
                    </div>
                    <SliderRow label="Height" value={block.height} min={20} max={1080} onChange={v => set("height", v)} />
                    <SliderRow label="Width" value={block.width > 0 ? block.width : 1080 - 2 * 80} min={100} max={1080} onChange={v => set("width", v)} />
                </>
            )}

            {/* Logo */}
            {block.type === "logo" && (
                <>
                    <div>
                        <Label>Logo Variant</Label>
                        <div className="grid grid-cols-2 gap-1">
                            {(["dark", "white"] as const).map(v => (
                                <button key={v} onClick={() => set("logoVariant", v)}
                                    className={`py-1.5 text-[11px] font-semibold rounded-tl-md rounded-br-md border transition-colors ${block.logoVariant === v ? "border-brand-lightBlue/60 bg-brand-lightBlue/8 text-brand-blue" : "border-brand-blue/12 text-brand-blue/50 hover:border-brand-lightBlue/30"}`}>
                                    {v === "dark" ? "Dark (for light BGs)" : "White (for dark BGs)"}
                                </button>
                            ))}
                        </div>
                    </div>
                    <SliderRow label="Scale" value={block.logoScale} min={0.3} max={3} step={0.05} onChange={v => set("logoScale", v)} />
                </>
            )}

            {/* Opacity */}
            <SliderRow label="Opacity" value={block.opacity} min={0.05} max={1} step={0.05} onChange={v => set("opacity", v)} />

            {/* Position */}
            <div>
                <Label>Position</Label>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <div className="text-[10px] text-brand-blue/45 mb-0.5">X</div>
                        <input type="number" value={block.x} min={0} max={1080}
                            onChange={e => set("x", Number(e.target.value))}
                            className="w-full text-xs px-2 py-1.5 border border-brand-blue/15 rounded-tl-md rounded-br-md outline-none focus:border-brand-lightBlue/50 text-brand-blue font-mono" />
                    </div>
                    <div>
                        <div className="text-[10px] text-brand-blue/45 mb-0.5">Y</div>
                        <input type="number" value={block.y} min={0} max={1080}
                            onChange={e => set("y", Number(e.target.value))}
                            className="w-full text-xs px-2 py-1.5 border border-brand-blue/15 rounded-tl-md rounded-br-md outline-none focus:border-brand-lightBlue/50 text-brand-blue font-mono" />
                    </div>
                </div>
            </div>
        </div>
    );
}
