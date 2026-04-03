import React from "react";
import { Hash, Lock, Users } from "lucide-react";
import type { EnrichedMessage, DisplayEntry, FlatChannel, TreeChannel } from "./types";

export function formatTime(ms: number): string {
    return new Date(ms).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function formatDateLabel(ms: number): string {
    const d = new Date(ms);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    const yest = new Date(today);
    yest.setDate(yest.getDate() - 1);
    if (d.toDateString() === yest.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export function buildDisplayEntries(messages: EnrichedMessage[]): DisplayEntry[] {
    const entries: DisplayEntry[] = [];
    let lastDateLabel = "";
    let lastAuthorId: string | null = null;
    let lastTime = 0;

    for (const msg of messages) {
        if (msg.isDeleted) continue;

        const dateLabel = formatDateLabel(msg._creationTime);
        if (dateLabel !== lastDateLabel) {
            entries.push({ kind: "divider", key: `div-${msg._id}`, label: dateLabel });
            lastDateLabel = dateLabel;
            lastAuthorId = null;
        }

        const sameAuthor = msg.authorId === lastAuthorId;
        const within5min = msg._creationTime - lastTime < 5 * 60 * 1000;
        const compact = sameAuthor && within5min && !msg.isSystem;

        entries.push({ kind: "message", key: msg._id, msg, compact });
        lastAuthorId = msg.isSystem ? null : msg.authorId;
        lastTime = msg._creationTime;
    }
    return entries;
}

export function buildTree(channels: FlatChannel[]): TreeChannel[] {
    const byId = new Map<string, TreeChannel>();
    for (const ch of channels) {
        byId.set(ch._id, { ...ch, children: [] });
    }
    const roots: TreeChannel[] = [];
    for (const node of byId.values()) {
        if (node.parentId && byId.has(node.parentId)) {
            byId.get(node.parentId)!.children.push(node);
        } else if (!node.parentId) {
            roots.push(node);
        }
    }
    return roots;
}

export function getChanIcon(type: string) {
    if (type === "private" || type === "sidechat") return Lock;
    if (type === "group")    return Users;
    return Hash;
}

export function formatTyping(names: string[]): string {
    if (names.length === 0) return "";
    if (names.length === 1) return `${names[0]} is typing…`;
    if (names.length === 2) return `${names[0]} and ${names[1]} are typing…`;
    return "Several people are typing…";
}

export function parseContent(text: string): React.ReactNode[] {
    const re = /(@here|@everyone|@channel|@\w+|#[\w-]+|\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
    const parts: Array<string | React.ReactElement> = [];
    let last = 0;
    let m: RegExpExecArray | null;
    let keyIdx = 0;

    while ((m = re.exec(text)) !== null) {
        if (m.index > last) parts.push(text.slice(last, m.index));
        const token = m[0];
        
        if (/^@(here|everyone|channel)$/.test(token)) {
            parts.push(
                <span key={keyIdx++} className="bg-brand-yellow/40 text-brand-darkBlue font-semibold rounded px-0.5 dark:bg-brand-yellow/30 dark:text-brand-yellow">
                    {token}
                </span>
            );
        } else if (token.startsWith("@")) {
            parts.push(
                <span key={keyIdx++} className="text-brand-blue font-semibold dark:text-brand-lightBlue">
                    {token}
                </span>
            );
        } else if (token.startsWith("#")) {
            parts.push(
                <span key={keyIdx++} className="text-brand-lightBlue font-medium cursor-pointer hover:underline">
                    {token}
                </span>
            );
        } else if (token.startsWith("**") && token.endsWith("**")) {
            parts.push(
                <strong key={keyIdx++} className="font-bold">
                    {token.slice(2, -2)}
                </strong>
            );
        } else if (token.startsWith("*") && token.endsWith("*")) {
            parts.push(
                <em key={keyIdx++} className="italic">
                    {token.slice(1, -1)}
                </em>
            );
        } else if (token.startsWith("`") && token.endsWith("`")) {
            parts.push(
                <code key={keyIdx++} className="px-1 py-0.5 bg-slate-100 dark:bg-white/10 rounded font-mono text-[0.9em]">
                    {token.slice(1, -1)}
                </code>
            );
        }
        
        last = m.index + token.length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts;
}
