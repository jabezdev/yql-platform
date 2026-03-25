import { useState, useEffect } from "react";
import type { Block, BoundsMap, CanvasBg } from "./types";
import { S, PAD } from "./constants";

export function wrapText(
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

export function drawBg(ctx: CanvasRenderingContext2D, bg: CanvasBg) {
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

export function drawBlock(
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

export function useLogos() {
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
