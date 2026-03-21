import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Mention from "@tiptap/extension-mention";

interface MessageBodyProps {
    body: string; // TipTap JSON string
    isDeleted?: boolean;
}

export function MessageBody({ body, isDeleted }: MessageBodyProps) {
    const content = (() => {
        try {
            return JSON.parse(body);
        } catch {
            return body;
        }
    })();

    const editor = useEditor({
        extensions: [
            StarterKit,
            Mention.configure({
                HTMLAttributes: { class: "mention" },
            }),
        ],
        content,
        editable: false,
        immediatelyRender: false,
    });

    if (isDeleted) {
        return (
            <p className="text-sm text-brand-blueDark/35 italic select-none">
                This message was deleted.
            </p>
        );
    }

    return (
        <EditorContent
            editor={editor}
            className="message-body text-sm text-brand-blueDark leading-relaxed [&_.ProseMirror]:outline-none [&_.ProseMirror_p]:mb-0.5 [&_.ProseMirror_p:last-child]:mb-0 [&_.ProseMirror_strong]:font-bold [&_.ProseMirror_em]:italic [&_.ProseMirror_code]:bg-brand-blueDark/8 [&_.ProseMirror_code]:px-1 [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:font-mono [&_.ProseMirror_code]:text-xs [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.mention]:bg-brand-blue/10 [&_.mention]:text-brand-blue [&_.mention]:font-semibold [&_.mention]:px-1 [&_.mention]:rounded"
        />
    );
}
