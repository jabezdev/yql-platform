import { useRef, useEffect, useState, useCallback } from "react";
import {
    Download, Plus, Trash2, GripVertical, Eye, EyeOff,
    ChevronDown, ChevronRight, AlignLeft, AlignCenter, AlignRight,
    Layers, Image as ImageIcon, LayoutTemplate, Palette,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const S = 1080;
const PAD = 80;

const YQL_PALETTE = [
    "#396799", "#3d8ccb", "#fed432", "#bc594f", "#10b981",
    "#97abc4", "#2f567f", "#0a1628", "#1e3a5f", "#ffffff",
    "#f5f6f8", "#18293d", "#064e3b", "rgba(255,255,255,0.3)",
];

// ═══════════════════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════════════════

type BlockType = "text" | "tag" | "cta" | "divider" | "stat" | "quote-mark" | "bullet" | "logo" | "bg-rect";
type AlignH = "left" | "center" | "right";
type FontFamily = "display" | "sans";
type TabId = "layers" | "background" | "templates";

interface Block {
    id: string;
    type: BlockType;
    label: string;
    visible: boolean;
    x: number;
    y: number;
    width: number;         // 0 = S - 2*PAD
    height: number;        // used by bg-rect
    text: string;
    fontSize: number;
    fontWeight: string;
    fontFamily: FontFamily;
    color: string;
    bgColor: string;
    borderColor: string;
    align: AlignH;
    lineHeight: number;
    opacity: number;
    icon: string;          // bullet prefix
    logoVariant: "dark" | "white";
    logoScale: number;
}

interface CanvasBg {
    bgColor: string;
    accentColor: string;
    diagTopLeft: boolean;
    diagBottomRight: boolean;
    cornerBrackets: boolean;
    topBand: boolean;
    topBandColor: string;
    topBandHeight: number;
}

type PosterState = { bg: CanvasBg; blocks: Block[] };

// ═══════════════════════════════════════════════════════════════════════════
//  BLOCK FACTORIES
// ═══════════════════════════════════════════════════════════════════════════

function uid() { return Math.random().toString(36).slice(2, 9); }

const BLOCK_BASE: Omit<Block, "id" | "type" | "label"> = {
    visible: true, x: PAD, y: 200, width: 0, height: 200,
    text: "", fontSize: 36, fontWeight: "600", fontFamily: "display",
    color: "#ffffff", bgColor: "#396799", borderColor: "transparent",
    align: "left", lineHeight: 1.35, opacity: 1,
    icon: "◆", logoVariant: "white", logoScale: 1,
};

const BLOCK_TYPE_DEFAULTS: Record<BlockType, Partial<Block>> = {
    text:          { text: "New text block",   fontSize: 40, fontWeight: "700", color: "#ffffff" },
    tag:           { text: "TAG LABEL",        fontSize: 20, fontWeight: "800", color: "#1a3456", bgColor: "#fed432" },
    cta:           { text: "Apply Now →",      fontSize: 28, fontWeight: "800", color: "#ffffff", bgColor: "#3d8ccb", align: "left" },
    divider:       { text: "",                 fontSize: 0,  color: "#ffffff",  opacity: 0.3 },
    stat:          { text: "200+",             fontSize: 180, fontWeight: "900", color: "#fed432", align: "center" },
    "quote-mark":  { text: "\u201C",           fontSize: 200, fontWeight: "900", color: "rgba(255,255,255,0.12)", align: "left" },
    bullet:        { text: "Bullet point",     fontSize: 30, fontWeight: "500", fontFamily: "sans", icon: "◆" },
    logo:          { text: "",                 logoVariant: "white", logoScale: 1.0, opacity: 1 },
    "bg-rect":     { text: "",                 bgColor: "rgba(0,0,0,0.18)", height: 200, opacity: 1, width: S - 2 * PAD },
};

function makeBlock(type: BlockType, overrides: Partial<Block> = {}): Block {
    return {
        ...BLOCK_BASE,
        ...BLOCK_TYPE_DEFAULTS[type],
        ...overrides,
        id: uid(),
        type,
        label: overrides.label ?? BLOCK_TYPE_META[type].label,
    };
}

const BLOCK_TYPE_META: Record<BlockType, { label: string; icon: string }> = {
    text:         { label: "Text",       icon: "T" },
    tag:          { label: "Tag",        icon: "#" },
    cta:          { label: "Button",     icon: "→" },
    divider:      { label: "Divider",    icon: "—" },
    stat:         { label: "Stat",       icon: "%" },
    "quote-mark": { label: "Quote Mark", icon: "\u201C" },
    bullet:       { label: "Bullet",     icon: "◆" },
    logo:         { label: "Logo",       icon: "⬟" },
    "bg-rect":    { label: "BG Rect",    icon: "□" },
};

// ═══════════════════════════════════════════════════════════════════════════
//  TEMPLATE PRESETS
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_BG: CanvasBg = {
    bgColor: "#396799", accentColor: "#fed432",
    diagTopLeft: true, diagBottomRight: true,
    cornerBrackets: true, topBand: false,
    topBandColor: "#fed432", topBandHeight: 10,
};

const TEMPLATES: { id: string; label: string; icon: string; state: PosterState }[] = [
    {
        id: "announcement", label: "Announcement", icon: "📢",
        state: {
            bg: { ...DEFAULT_BG, bgColor: "#396799", accentColor: "#fed432" },
            blocks: [
                makeBlock("tag",   { y: 160, text: "ANNOUNCEMENT",  label: "Tag", color: "#1a3456", bgColor: "#fed432" }),
                makeBlock("text",  { y: 250, text: "Big News Headline", label: "Headline", fontSize: 88, fontWeight: "900", lineHeight: 1.1 }),
                makeBlock("text",  { y: 430, text: "Supporting context or tagline for the announcement", label: "Subheadline", fontSize: 36, fontWeight: "600", lineHeight: 1.3, color: "rgba(255,255,255,0.75)" }),
                makeBlock("text",  { y: 540, text: "More details about the announcement here. Share all the important information your audience needs.", label: "Body", fontSize: 28, fontWeight: "400", fontFamily: "sans", lineHeight: 1.55, color: "rgba(255,255,255,0.65)" }),
                makeBlock("text",  { y: 960, text: "March 2026", label: "Date", fontSize: 26, fontWeight: "700", color: "#fed432" }),
                makeBlock("logo",  { y: 60, x: PAD, label: "YQL Logo", logoVariant: "white", logoScale: 0.9 }),
            ],
        },
    },
    {
        id: "event", label: "Event", icon: "📅",
        state: {
            bg: { ...DEFAULT_BG, bgColor: "#18293d", accentColor: "#fed432" },
            blocks: [
                makeBlock("tag",    { y: 160, text: "EVENT", label: "Tag", color: "#1a3456", bgColor: "#fed432" }),
                makeBlock("text",   { y: 250, text: "Workshop Session Name", label: "Title", fontSize: 78, fontWeight: "900", lineHeight: 1.1 }),
                makeBlock("divider",{ y: 410, color: "#fed432", opacity: 0.4 }),
                makeBlock("bullet", { y: 445, text: "March 23, 2026",       label: "Date",     icon: "📅", fontSize: 30, fontWeight: "600" }),
                makeBlock("bullet", { y: 505, text: "2:00 PM – 4:00 PM EST", label: "Time",    icon: "🕐", fontSize: 30, fontWeight: "600" }),
                makeBlock("bullet", { y: 565, text: "Virtual · Zoom",        label: "Location",icon: "📍", fontSize: 30, fontWeight: "600" }),
                makeBlock("text",   { y: 650, text: "A brief description of the event and what attendees will learn.", label: "Description", fontSize: 28, fontWeight: "400", fontFamily: "sans", lineHeight: 1.5, color: "rgba(255,255,255,0.65)" }),
                makeBlock("logo",   { y: 60, x: PAD, label: "YQL Logo", logoVariant: "white", logoScale: 0.9 }),
            ],
        },
    },
    {
        id: "quote", label: "Quote", icon: "💬",
        state: {
            bg: { ...DEFAULT_BG, bgColor: "#0a1628", accentColor: "#3d8ccb", diagTopLeft: true, diagBottomRight: false },
            blocks: [
                makeBlock("quote-mark", { y: 130, x: PAD - 10, label: "Quote Mark" }),
                makeBlock("text",   { y: 260, text: "The best way to predict the future is to create it.", label: "Quote Text", fontSize: 54, fontWeight: "700", lineHeight: 1.4 }),
                makeBlock("divider",{ y: 650, color: "#3d8ccb", opacity: 0.5 }),
                makeBlock("text",   { y: 690, text: "Person Name", label: "Attribution", fontSize: 30, fontWeight: "800", color: "#3d8ccb" }),
                makeBlock("text",   { y: 735, text: "YQL Volunteer · Cohort 3", label: "Role", fontSize: 24, fontWeight: "500", fontFamily: "sans", color: "rgba(255,255,255,0.6)" }),
                makeBlock("logo",   { y: 960, x: PAD, label: "YQL Logo", logoVariant: "white", logoScale: 0.7 }),
            ],
        },
    },
    {
        id: "recruitment", label: "Recruitment", icon: "🎯",
        state: {
            bg: { ...DEFAULT_BG, bgColor: "#2f567f", accentColor: "#fed432", diagTopLeft: true, diagBottomRight: true },
            blocks: [
                makeBlock("tag",    { y: 160, text: "NOW RECRUITING", label: "Tag", color: "#1a3456", bgColor: "#fed432" }),
                makeBlock("text",   { y: 250, text: "Join Our Team!", label: "Headline", fontSize: 80, fontWeight: "900", lineHeight: 1.1 }),
                makeBlock("text",   { y: 395, text: "Program Volunteer", label: "Role", fontSize: 34, fontWeight: "700", color: "#fed432" }),
                makeBlock("bullet", { y: 460, text: "Make a real community impact",    label: "Point 1", icon: "◆", fontSize: 28, fontWeight: "500", fontFamily: "sans" }),
                makeBlock("bullet", { y: 520, text: "Flexible, rewarding schedule",    label: "Point 2", icon: "◆", fontSize: 28, fontWeight: "500", fontFamily: "sans" }),
                makeBlock("bullet", { y: 580, text: "Grow with an amazing team",       label: "Point 3", icon: "◆", fontSize: 28, fontWeight: "500", fontFamily: "sans" }),
                makeBlock("cta",    { y: 670, text: "Apply at yql.org", label: "CTA", fontSize: 26, bgColor: "#fed432", color: "#1a3456" }),
                makeBlock("logo",   { y: 60, x: PAD, label: "YQL Logo", logoVariant: "white", logoScale: 0.9 }),
            ],
        },
    },
    {
        id: "stat", label: "Achievement", icon: "📊",
        state: {
            bg: { ...DEFAULT_BG, bgColor: "#396799", accentColor: "#fed432", diagTopLeft: false, diagBottomRight: false, cornerBrackets: true },
            blocks: [
                makeBlock("bg-rect",  { y: 220, x: 0, width: S, height: 480, bgColor: "rgba(0,0,0,0.15)", label: "BG Block" }),
                makeBlock("stat",     { y: 250, x: PAD, width: S - 2 * PAD, text: "200+", label: "Stat Number", fontSize: 188, align: "center", color: "#fed432" }),
                makeBlock("text",     { y: 510, text: "Students Served", label: "Stat Label", fontSize: 50, fontWeight: "700", align: "center", color: "#ffffff" }),
                makeBlock("divider",  { y: 590, color: "#fed432", opacity: 0.4 }),
                makeBlock("text",     { y: 620, text: "Across 3 cohorts since our founding in 2022", label: "Context", fontSize: 28, fontWeight: "500", fontFamily: "sans", align: "center", color: "rgba(255,255,255,0.7)", lineHeight: 1.45 }),
                makeBlock("text",     { y: 945, text: "YQL Program · 2026", label: "Source", fontSize: 22, fontWeight: "500", fontFamily: "sans", align: "center", color: "rgba(255,255,255,0.45)" }),
                makeBlock("logo",     { y: 60, x: PAD, label: "YQL Logo", logoVariant: "white", logoScale: 0.9 }),
            ],
        },
    },
    {
        id: "spotlight", label: "Spotlight", icon: "✨",
        state: {
            bg: { ...DEFAULT_BG, bgColor: "#1e3a5f", accentColor: "#97abc4" },
            blocks: [
                makeBlock("tag",    { y: 160, text: "TEAM SPOTLIGHT", label: "Tag", color: "#1e3a5f", bgColor: "#97abc4" }),
                makeBlock("text",   { y: 250, text: "Alex Johnson", label: "Name", fontSize: 68, fontWeight: "900", lineHeight: 1.1 }),
                makeBlock("text",   { y: 355, text: "Program Director", label: "Role", fontSize: 32, fontWeight: "700", color: "#97abc4" }),
                makeBlock("text",   { y: 400, text: "Cohort 3 · Fall 2025", label: "Cohort", fontSize: 24, fontWeight: "500", fontFamily: "sans", color: "rgba(255,255,255,0.55)" }),
                makeBlock("divider",{ y: 460, color: "#97abc4", opacity: 0.4 }),
                makeBlock("text",   { y: 500, text: "Every student reminded me why this work matters so deeply.", label: "Quote", fontSize: 30, fontWeight: "400", fontFamily: "sans", lineHeight: 1.55, color: "rgba(255,255,255,0.75)" }),
                makeBlock("text",   { y: 700, text: "Led 3 workshops · Mentored 12 students", label: "Achievement", fontSize: 26, fontWeight: "700", color: "#97abc4" }),
                makeBlock("logo",   { y: 60, x: PAD, label: "YQL Logo", logoVariant: "white", logoScale: 0.9 }),
            ],
        },
    },
    {
        id: "minimal", label: "Minimal", icon: "⬜",
        state: {
            bg: { bgColor: "#ffffff", accentColor: "#396799", diagTopLeft: false, diagBottomRight: false, cornerBrackets: false, topBand: true, topBandColor: "#396799", topBandHeight: 8 },
            blocks: [
                makeBlock("tag",   { y: 160, text: "ANNOUNCEMENT", label: "Tag", color: "#ffffff", bgColor: "#396799" }),
                makeBlock("text",  { y: 255, text: "Clean headline goes here", label: "Headline", fontSize: 80, fontWeight: "900", color: "#1a3456", lineHeight: 1.1 }),
                makeBlock("text",  { y: 440, text: "Supporting information and context for your audience.", label: "Body", fontSize: 34, fontWeight: "500", fontFamily: "sans", color: "#396799", lineHeight: 1.45 }),
                makeBlock("divider",{ y: 560, color: "#396799", opacity: 0.2 }),
                makeBlock("text",  { y: 600, text: "March 2026", label: "Date", fontSize: 26, fontWeight: "700", color: "#3d8ccb" }),
                makeBlock("logo",  { y: 60, x: PAD, label: "YQL Logo", logoVariant: "dark", logoScale: 0.9 }),
            ],
        },
    },
    {
        id: "dark", label: "Dark Bold", icon: "🌑",
        state: {
            bg: { ...DEFAULT_BG, bgColor: "#0a1628", accentColor: "#fed432", diagTopLeft: true, diagBottomRight: false },
            blocks: [
                makeBlock("tag",   { y: 160, text: "YQL PROGRAM",   label: "Tag",      color: "#0a1628",  bgColor: "#fed432" }),
                makeBlock("text",  { y: 250, text: "Bold Statement Here", label: "Headline", fontSize: 90, fontWeight: "900", lineHeight: 1.05 }),
                makeBlock("text",  { y: 450, text: "Powerful supporting message that drives action.", label: "Sub", fontSize: 40, fontWeight: "600", color: "rgba(255,255,255,0.7)", lineHeight: 1.3 }),
                makeBlock("cta",   { y: 580, text: "Learn more →", label: "CTA", bgColor: "#fed432", color: "#0a1628", fontSize: 28, fontWeight: "800" }),
                makeBlock("logo",  { y: 60, x: PAD, label: "YQL Logo", logoVariant: "white", logoScale: 0.9 }),
            ],
        },
    },
];

// ═══════════════════════════════════════════════════════════════════════════
//  CANVAS DRAWING
// ═══════════════════════════════════════════════════════════════════════════

type BoundsMap = Map<string, { x0: number; y0: number; x1: number; y1: number }>;

function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string, x: number, y: number,
    maxW: number, lineH: number, maxLines = 20,
): number {
    const words = text.split(" ");
    let line = "", curY = y, count = 0;
    for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        if (ctx.measureText(test).width > maxW && line) {
            if (++count > maxLines) break;
            ctx.fillText(line, x, curY);
            line = w; curY += lineH;
        } else { line = test; }
    }
    if (line && count <= maxLines) { ctx.fillText(line, x, curY); curY += lineH; }
    return curY;
}

function drawBg(ctx: CanvasRenderingContext2D, bg: CanvasBg) {
    ctx.fillStyle = bg.bgColor;
    ctx.fillRect(0, 0, S, S);

    if (bg.topBand) {
        ctx.fillStyle = bg.topBandColor;
        ctx.fillRect(0, 0, S, bg.topBandHeight);
    }

    if (bg.diagTopLeft) {
        ctx.save();
        ctx.globalAlpha = 0.13;
        ctx.strokeStyle = bg.accentColor;
        ctx.lineWidth = 4;
        for (let i = -4; i < 16; i++) {
            const d = i * 52;
            ctx.beginPath(); ctx.moveTo(d, 0); ctx.lineTo(0, d); ctx.stroke();
        }
        ctx.restore();
    }

    if (bg.diagBottomRight) {
        ctx.save();
        ctx.globalAlpha = 0.13;
        ctx.strokeStyle = bg.accentColor;
        ctx.lineWidth = 4;
        for (let i = 0; i < 16; i++) {
            const d = S - i * 52;
            ctx.beginPath(); ctx.moveTo(d, S); ctx.lineTo(S, d); ctx.stroke();
        }
        ctx.restore();
    }

    if (bg.cornerBrackets) {
        const sz = 55, m = 32;
        ctx.save();
        ctx.strokeStyle = bg.accentColor;
        ctx.lineWidth = 5;
        ctx.globalAlpha = 0.45;
        ctx.beginPath(); ctx.moveTo(m, m + sz); ctx.lineTo(m, m); ctx.lineTo(m + sz, m); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(S - m - sz, S - m); ctx.lineTo(S - m, S - m); ctx.lineTo(S - m, S - m - sz); ctx.stroke();
        ctx.restore();
    }
}

function drawBlock(
    ctx: CanvasRenderingContext2D,
    block: Block,
    logos: { dark: HTMLImageElement | null; white: HTMLImageElement | null },
    bounds: BoundsMap,
    highlighted: string | null,
) {
    if (!block.visible) return;
    ctx.save();
    ctx.globalAlpha = block.opacity;

    const effW = block.width > 0 ? block.width : (S - 2 * PAD);
    const ff = block.fontFamily === "display" ? "Montserrat, sans-serif" : "Inter, sans-serif";
    const tx = block.align === "center" ? block.x + effW / 2
             : block.align === "right"  ? block.x + effW
             : block.x;

    switch (block.type) {
        case "text":
        case "stat": {
            ctx.font = `${block.fontWeight} ${block.fontSize}px ${ff}`;
            ctx.fillStyle = block.color;
            ctx.textAlign = block.align;
            ctx.textBaseline = "top";
            const endY = wrapText(ctx, block.text, tx, block.y, effW, block.fontSize * block.lineHeight);
            bounds.set(block.id, { x0: block.x, y0: block.y, x1: block.x + effW, y1: endY });
            break;
        }
        case "quote-mark": {
            ctx.font = `${block.fontWeight} ${block.fontSize}px ${ff}`;
            ctx.fillStyle = block.color;
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.fillText("\u201C", block.x, block.y);
            const qw = ctx.measureText("\u201C").width;
            bounds.set(block.id, { x0: block.x, y0: block.y, x1: block.x + qw, y1: block.y + block.fontSize });
            break;
        }
        case "tag": {
            const tPad = 22, tH = block.fontSize + tPad;
            ctx.font = `${block.fontWeight} ${block.fontSize}px ${ff}`;
            const tW = ctx.measureText(block.text).width + tPad * 2;
            const skew = tH * 0.38;
            ctx.fillStyle = block.bgColor;
            ctx.beginPath();
            ctx.moveTo(block.x + skew, block.y);
            ctx.lineTo(block.x + tW, block.y);
            ctx.lineTo(block.x + tW - skew, block.y + tH);
            ctx.lineTo(block.x, block.y + tH);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = block.color;
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillText(block.text, block.x + skew / 2 + tPad / 2, block.y + tH / 2);
            bounds.set(block.id, { x0: block.x, y0: block.y, x1: block.x + tW, y1: block.y + tH });
            break;
        }
        case "cta": {
            const pH = 30, pV = 20;
            ctx.font = `${block.fontWeight} ${block.fontSize}px ${ff}`;
            const bW = ctx.measureText(block.text).width + pH * 2;
            const bH = block.fontSize + pV * 2;
            const r = 14;
            ctx.fillStyle = block.bgColor;
            ctx.beginPath();
            ctx.moveTo(block.x + r, block.y);
            ctx.lineTo(block.x + bW - r, block.y);
            ctx.arcTo(block.x + bW, block.y,     block.x + bW, block.y + r,     r);
            ctx.lineTo(block.x + bW, block.y + bH - r);
            ctx.arcTo(block.x + bW, block.y + bH, block.x + bW - r, block.y + bH, r);
            ctx.lineTo(block.x + r, block.y + bH);
            ctx.arcTo(block.x, block.y + bH,     block.x, block.y + bH - r,     r);
            ctx.lineTo(block.x, block.y + r);
            ctx.arcTo(block.x, block.y,           block.x + r, block.y,           r);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = block.color;
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillText(block.text, block.x + pH, block.y + bH / 2);
            bounds.set(block.id, { x0: block.x, y0: block.y, x1: block.x + bW, y1: block.y + bH });
            break;
        }
        case "divider": {
            ctx.strokeStyle = block.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(block.x, block.y);
            ctx.lineTo(block.x + effW, block.y);
            ctx.stroke();
            bounds.set(block.id, { x0: block.x, y0: block.y - 10, x1: block.x + effW, y1: block.y + 10 });
            break;
        }
        case "bullet": {
            const iconSz = block.fontSize * 0.55;
            const gap = 18;
            ctx.font = `${iconSz}px ${ff}`;
            ctx.fillStyle = block.color;
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.fillText(block.icon || "◆", block.x, block.y + (block.fontSize - iconSz) * 0.4);
            const iW = ctx.measureText(block.icon || "◆").width;
            ctx.font = `${block.fontWeight} ${block.fontSize}px ${ff}`;
            const txtX = block.x + iW + gap;
            const endY = wrapText(ctx, block.text, txtX, block.y, effW - iW - gap, block.fontSize * block.lineHeight);
            bounds.set(block.id, { x0: block.x, y0: block.y, x1: block.x + effW, y1: endY });
            break;
        }
        case "logo": {
            const img = block.logoVariant === "dark" ? logos.dark : logos.white;
            if (img) {
                const lW = 180 * block.logoScale;
                const lH = lW * (img.naturalHeight / (img.naturalWidth || 1));
                ctx.drawImage(img, block.x, block.y, lW, lH);
                bounds.set(block.id, { x0: block.x, y0: block.y, x1: block.x + lW, y1: block.y + lH });
            }
            break;
        }
        case "bg-rect": {
            ctx.fillStyle = block.bgColor;
            ctx.fillRect(block.x, block.y, effW, block.height);
            bounds.set(block.id, { x0: block.x, y0: block.y, x1: block.x + effW, y1: block.y + block.height });
            break;
        }
    }

    // Highlight border for selected/hovered
    if (highlighted === block.id) {
        const b = bounds.get(block.id);
        if (b) {
            ctx.save();
            ctx.strokeStyle = "#3d8ccb";
            ctx.lineWidth = 3;
            ctx.setLineDash([6, 4]);
            ctx.strokeRect(b.x0 - 6, b.y0 - 6, b.x1 - b.x0 + 12, b.y1 - b.y0 + 12);
            ctx.restore();
        }
    }

    ctx.restore();
}

// ═══════════════════════════════════════════════════════════════════════════
//  HOOKS
// ═══════════════════════════════════════════════════════════════════════════

function useLogos() {
    const [logos, setLogos] = useState<{ dark: HTMLImageElement | null; white: HTMLImageElement | null }>({ dark: null, white: null });
    useEffect(() => {
        let mounted = true;
        function load(src: string, key: "dark" | "white") {
            const img = new Image();
            img.onload  = () => { if (mounted) setLogos(p => ({ ...p, [key]: img })); };
            img.onerror = () => console.warn("Logo not found:", src);
            img.src = src;
        }
        load("/YQL_LOGO.svg", "dark");
        load("/YQL_LOGO_WHITE.svg", "white");
        return () => { mounted = false; };
    }, []);
    return logos;
}

// ═══════════════════════════════════════════════════════════════════════════
//  SMALL UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
    return (
        <div className="flex items-center justify-between py-0.5 cursor-pointer group" onClick={() => onChange(!checked)}>
            <span className="text-xs text-brand-blue/65 group-hover:text-brand-blue transition-colors select-none">{label}</span>
            <div
                role="switch" aria-checked={checked}
                className={`relative w-10 h-[22px] rounded-tl-lg rounded-br-lg transition-colors flex-shrink-0 overflow-hidden ${checked ? "bg-brand-lightBlue" : "bg-brand-blue/15"}`}
            >
                <span className={`absolute top-[3px] w-4 h-4 bg-white rounded-tl-md rounded-br-md shadow-sm transition-transform duration-150 ${checked ? "translate-x-[21px]" : "translate-x-[3px]"}`} />
            </div>
        </div>
    );
}

function Label({ children }: { children: React.ReactNode }) {
    return <div className="text-[10px] font-bold uppercase tracking-wider text-brand-blue/45 mb-1">{children}</div>;
}

function ColorRow({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
                <input
                    type="color"
                    value={value.startsWith("rgba") ? "#ffffff" : value}
                    onChange={e => onChange(e.target.value)}
                    className="w-8 h-7 rounded cursor-pointer border border-brand-blue/15 flex-shrink-0"
                />
                <input
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="flex-1 text-[11px] px-2 py-1.5 border border-brand-blue/15 rounded-tl-md rounded-br-md outline-none focus:border-brand-lightBlue/50 text-brand-blue/80 font-mono"
                />
            </div>
            <div className="flex flex-wrap gap-1">
                {YQL_PALETTE.map(c => (
                    <button
                        key={c} onClick={() => onChange(c)}
                        className="w-5 h-5 rounded-sm border border-black/10 hover:scale-110 transition-transform flex-shrink-0"
                        style={{ background: c }}
                        title={c}
                    />
                ))}
            </div>
        </div>
    );
}

function SliderRow({ label, value, min, max, step = 1, onChange }: {
    label: string; value: number; min: number; max: number; step?: number;
    onChange: (v: number) => void;
}) {
    return (
        <div>
            <div className="flex items-center justify-between mb-0.5">
                <Label>{label}</Label>
                <span className="text-[10px] text-brand-blue/50 font-mono">{value}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={value}
                onChange={e => onChange(Number(e.target.value))}
                className="w-full h-1.5 accent-brand-lightBlue cursor-pointer"
            />
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
//  BLOCK EDITOR PANEL
// ═══════════════════════════════════════════════════════════════════════════

function BlockEditor({ block, onChange }: { block: Block; onChange: (b: Block) => void }) {
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
                    <SliderRow label="Height" value={block.height} min={20} max={S} onChange={v => set("height", v)} />
                    <SliderRow label="Width" value={block.width > 0 ? block.width : S - 2 * PAD} min={100} max={S} onChange={v => set("width", v)} />
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
                        <input type="number" value={block.x} min={0} max={S}
                            onChange={e => set("x", Number(e.target.value))}
                            className="w-full text-xs px-2 py-1.5 border border-brand-blue/15 rounded-tl-md rounded-br-md outline-none focus:border-brand-lightBlue/50 text-brand-blue font-mono" />
                    </div>
                    <div>
                        <div className="text-[10px] text-brand-blue/45 mb-0.5">Y</div>
                        <input type="number" value={block.y} min={0} max={S}
                            onChange={e => set("y", Number(e.target.value))}
                            className="w-full text-xs px-2 py-1.5 border border-brand-blue/15 rounded-tl-md rounded-br-md outline-none focus:border-brand-lightBlue/50 text-brand-blue font-mono" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
//  ADD BLOCK PICKER
// ═══════════════════════════════════════════════════════════════════════════

function AddBlockPicker({ onAdd, onClose }: { onAdd: (type: BlockType) => void; onClose: () => void }) {
    const types: BlockType[] = ["text", "tag", "cta", "bullet", "divider", "stat", "quote-mark", "logo", "bg-rect"];
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-blue/30 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="w-80 bg-white border-2 border-brand-blue/15 rounded-tl-2xl rounded-br-2xl shadow-xl p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-brand-blue">Add Block</h3>
                    <button onClick={onClose} className="text-brand-blue/40 hover:text-brand-blue text-lg leading-none">×</button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {types.map(t => (
                        <button key={t} onClick={() => { onAdd(t); onClose(); }}
                            className="flex flex-col items-center gap-1.5 p-3 border border-brand-blue/12 rounded-tl-lg rounded-br-lg hover:border-brand-lightBlue/50 hover:bg-brand-bgLight/60 transition-all">
                            <span className="text-xl">{BLOCK_TYPE_META[t].icon}</span>
                            <span className="text-[10px] font-semibold text-brand-blue/65">{BLOCK_TYPE_META[t].label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════

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
    const listDragRef = useRef<{ id: string } | null>(null);
    const [listDragOverId, setListDragOverId] = useState<string | null>(null);

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
    const updateBlock = useCallback((updated: Block) => {
        setState(p => ({ ...p, blocks: p.blocks.map(b => b.id === updated.id ? updated : b) }));
    }, []);

    const updateBg = useCallback(<K extends keyof CanvasBg>(key: K, val: CanvasBg[K]) => {
        setState(p => ({ ...p, bg: { ...p.bg, [key]: val } }));
    }, []);

    const addBlock = useCallback((type: BlockType) => {
        const block = makeBlock(type, { y: 300 });
        setState(p => ({ ...p, blocks: [...p.blocks, block] }));
        setSelectedId(block.id);
        setExpandedIds(prev => new Set([...prev, block.id]));
    }, []);

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
    // Displayed in reverse (front block at top)
    const reversedBlocks = [...state.blocks].reverse();

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

    // ── Selected block ───────────────────────────────────────────────────────
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
                <button onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white text-xs font-bold rounded-tl-lg rounded-br-lg hover:bg-brand-lightBlue transition-colors">
                    <Download size={13} />
                    Export PNG
                </button>
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

                    {/* Tabs */}
                    <div className="flex border-b-2 border-brand-blue/8 flex-shrink-0 px-1">
                        {([
                            { id: "layers" as TabId, label: "Layers", icon: <Layers size={12} /> },
                            { id: "background" as TabId, label: "Background", icon: <Palette size={12} className="inline" /> },
                            { id: "templates" as TabId, label: "Templates", icon: <LayoutTemplate size={12} /> },
                        ] satisfies { id: TabId; label: string; icon: React.ReactNode }[]).map(t => (
                            <button key={t.id} onClick={() => setTab(t.id)}
                                className={`flex items-center gap-1.5 px-3 py-3 text-[11px] font-bold border-b-2 transition-colors -mb-[2px] ${tab === t.id ? "border-brand-lightBlue text-brand-blue" : "border-transparent text-brand-blue/40 hover:text-brand-blue/70"}`}>
                                {t.icon}{t.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab content */}
                    <div className="flex-1 overflow-y-auto min-h-0">

                        {/* ── LAYERS TAB ─────────────────────────────────────── */}
                        {tab === "layers" && (
                            <div className="flex flex-col h-full">
                                {/* Add block button */}
                                <div className="p-3 border-b border-brand-blue/8 flex-shrink-0">
                                    <button onClick={() => setShowAddPicker(true)}
                                        className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-brand-lightBlue/30 rounded-tl-lg rounded-br-lg text-xs font-bold text-brand-lightBlue/70 hover:border-brand-lightBlue/60 hover:text-brand-lightBlue hover:bg-brand-lightBlue/4 transition-all">
                                        <Plus size={13} />
                                        Add Block
                                    </button>
                                </div>

                                {/* Block list (reversed = front-to-back) */}
                                <div className="flex-1 overflow-y-auto">
                                    {reversedBlocks.length === 0 && (
                                        <div className="p-6 text-center text-xs text-brand-blue/35 italic">No blocks yet. Add one above.</div>
                                    )}
                                    {reversedBlocks.map(block => {
                                        const isSelected = selectedId === block.id;
                                        const isExpanded = expandedIds.has(block.id);
                                        const isDragOver = listDragOverId === block.id;
                                        return (
                                            <div key={block.id}
                                                className={`border-b border-brand-blue/6 transition-colors ${isDragOver ? "bg-brand-lightBlue/8" : ""}`}
                                                onDragOver={e => { e.preventDefault(); handleListDragOver(block.id); }}
                                                onDrop={e => { e.preventDefault(); handleListDrop(block.id); }}>
                                                {/* Row header */}
                                                <div className={`flex items-center gap-1.5 px-2.5 py-2 cursor-pointer ${isSelected ? "bg-brand-lightBlue/8" : "hover:bg-brand-bgLight/60"}`}
                                                    onClick={() => { setSelectedId(block.id); toggleExpand(block.id); }}>
                                                    {/* Drag handle */}
                                                    <div
                                                        draggable
                                                        onDragStart={() => handleListDragStart(block.id)}
                                                        className="text-brand-blue/25 hover:text-brand-blue/50 cursor-grab active:cursor-grabbing flex-shrink-0"
                                                        onClick={e => e.stopPropagation()}>
                                                        <GripVertical size={13} />
                                                    </div>
                                                    {/* Type badge */}
                                                    <span className="text-[11px] text-brand-blue/35 font-mono w-4 text-center flex-shrink-0">
                                                        {BLOCK_TYPE_META[block.type].icon}
                                                    </span>
                                                    {/* Label */}
                                                    <span className={`flex-1 text-xs font-semibold truncate ${isSelected ? "text-brand-blue" : "text-brand-blue/70"}`}>
                                                        {block.label}
                                                    </span>
                                                    {/* Visibility */}
                                                    <button
                                                        onClick={e => { e.stopPropagation(); toggleVisible(block.id); }}
                                                        className="p-1 text-brand-blue/30 hover:text-brand-blue/70 flex-shrink-0">
                                                        {block.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                                                    </button>
                                                    {/* Expand chevron */}
                                                    <span className="text-brand-blue/30 flex-shrink-0">
                                                        {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                                    </span>
                                                    {/* Delete */}
                                                    <button
                                                        onClick={e => { e.stopPropagation(); removeBlock(block.id); }}
                                                        className="p-1 text-brand-blue/20 hover:text-red-500 flex-shrink-0">
                                                        <Trash2 size={11} />
                                                    </button>
                                                </div>
                                                {/* Expanded editor */}
                                                {isExpanded && (
                                                    <BlockEditor block={block} onChange={updateBlock} />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ── BACKGROUND TAB ─────────────────────────────────── */}
                        {tab === "background" && (
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
                        )}

                        {/* ── TEMPLATES TAB ──────────────────────────────────── */}
                        {tab === "templates" && (
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
                        )}
                    </div>

                    {/* Bottom status bar */}
                    {selectedBlock && (
                        <div className="flex-shrink-0 border-t-2 border-brand-blue/8 px-3 py-2 bg-brand-bgLight/40 flex items-center justify-between">
                            <span className="text-[10px] text-brand-blue/50 font-medium">
                                {BLOCK_TYPE_META[selectedBlock.type].label} · x{selectedBlock.x} y{selectedBlock.y}
                            </span>
                            <button onClick={() => setSelectedId(null)} className="text-[10px] text-brand-blue/40 hover:text-brand-blue">
                                Deselect
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Add block picker modal */}
            {showAddPicker && (
                <AddBlockPicker onAdd={addBlock} onClose={() => setShowAddPicker(false)} />
            )}
        </div>
    );
}
