import { useMemo } from "react";
import { generateHTML } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Mention from "@tiptap/extension-mention";
import xss from "xss";

interface MessageBodyProps {
    body: string; // TipTap JSON string
    isDeleted?: boolean;
}

// Shared extension list — same schema used when composing, so serialisation is accurate.
const EXTENSIONS = [
    StarterKit.configure({ link: false }),
    Mention.configure({ HTMLAttributes: { class: "mention" } }),
];

// Strict allowlist: only the tags TipTap's StarterKit + Mention can produce.
const XSS_OPTIONS: xss.IWhiteList = {
    p: [],
    strong: [],
    em: [],
    s: [],
    u: [],
    code: ["class"],
    pre: [],
    blockquote: [],
    ul: ["class"],
    ol: ["class"],
    li: [],
    h1: [], h2: [], h3: [], h4: [],
    a: ["href", "class", "target", "rel"],
    span: ["class"],
    br: [],
    hr: [],
};

const BODY_CLASSES =
    "text-sm text-brand-blue leading-relaxed " +
    "[&_p]:mb-0.5 [&_p:last-child]:mb-0 " +
    "[&_strong]:font-bold [&_em]:italic " +
    "[&_code]:bg-brand-blue/8 [&_code]:px-1 [&_code]:rounded [&_code]:font-mono [&_code]:text-xs " +
    "[&_pre]:bg-brand-blue/8 [&_pre]:p-2 [&_pre]:rounded [&_pre]:text-xs [&_pre]:overflow-x-auto " +
    "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 " +
    "[&_blockquote]:border-l-2 [&_blockquote]:border-brand-lightBlue/30 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-brand-blue/60 " +
    "[&_.mention]:bg-brand-lightBlue/10 [&_.mention]:text-brand-lightBlue [&_.mention]:font-semibold [&_.mention]:px-1 [&_.mention]:rounded " +
    "[&_a]:text-brand-lightBlue [&_a]:underline";

export function MessageBody({ body, isDeleted }: MessageBodyProps) {
    const html = useMemo(() => {
        try {
            const doc = JSON.parse(body);
            const raw = generateHTML(doc, EXTENSIONS);
            return xss(raw, { whiteList: XSS_OPTIONS });
        } catch {
            // Body is plain text (legacy or error case) — escape and display as-is
            return xss(body, { whiteList: {} });
        }
    }, [body]);

    if (isDeleted) {
        return (
            <p className="text-sm text-brand-blue/35 italic select-none">
                This message was deleted.
            </p>
        );
    }

    return (
        <div
            dangerouslySetInnerHTML={{ __html: html }}
            className={BODY_CLASSES}
        />
    );
}
