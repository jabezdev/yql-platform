import type { Block, BlockType, CanvasBg, PosterState } from "./types";

export const S = 1080;
export const PAD = 80;

export const YQL_PALETTE = [
    "#396799", "#3d8ccb", "#fed432", "#bc594f", "#10b981",
    "#97abc4", "#2f567f", "#0a1628", "#1e3a5f", "#ffffff",
    "#f5f6f8", "#18293d", "#064e3b", "rgba(255,255,255,0.3)",
];

export function uid() { return Math.random().toString(36).slice(2, 9); }

export const BLOCK_BASE: Omit<Block, "id" | "type" | "label"> = {
    visible: true, x: PAD, y: 200, width: 0, height: 200,
    text: "", fontSize: 36, fontWeight: "600", fontFamily: "display",
    color: "#ffffff", bgColor: "#396799", borderColor: "transparent",
    align: "left", lineHeight: 1.35, opacity: 1,
    icon: "◆", logoVariant: "white", logoScale: 1,
};

export const BLOCK_TYPE_DEFAULTS: Record<BlockType, Partial<Block>> = {
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

export const BLOCK_TYPE_META: Record<BlockType, { label: string; icon: string }> = {
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

export function makeBlock(type: BlockType, overrides: Partial<Block> = {}): Block {
    return {
        ...BLOCK_BASE,
        ...BLOCK_TYPE_DEFAULTS[type],
        ...overrides,
        id: uid(),
        type,
        label: overrides.label ?? BLOCK_TYPE_META[type].label,
    };
}

export const DEFAULT_BG: CanvasBg = {
    bgColor: "#396799", accentColor: "#fed432",
    diagTopLeft: true, diagBottomRight: true,
    cornerBrackets: true, topBand: false,
    topBandColor: "#fed432", topBandHeight: 10,
};

export const TEMPLATES: { id: string; label: string; icon: string; state: PosterState }[] = [
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
