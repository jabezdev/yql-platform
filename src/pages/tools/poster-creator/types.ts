export type BlockType = "text" | "tag" | "cta" | "divider" | "stat" | "quote-mark" | "bullet" | "logo" | "bg-rect";
export type AlignH = "left" | "center" | "right";
export type FontFamily = "display" | "sans";
export type TabId = "layers" | "background" | "templates" | "designs";

export interface Block {
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

export interface CanvasBg {
    bgColor: string;
    accentColor: string;
    diagTopLeft: boolean;
    diagBottomRight: boolean;
    cornerBrackets: boolean;
    topBand: boolean;
    topBandColor: string;
    topBandHeight: number;
}

export type PosterState = { bg: CanvasBg; blocks: Block[] };

export type BoundsMap = Map<string, { x0: number; y0: number; x1: number; y1: number }>;
