import { useCallback, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Mention from "@tiptap/extension-mention";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useToast } from "../../../providers/ToastProvider";
import { Check, X } from "lucide-react";
import type { Id } from "../../../../../convex/_generated/dataModel";

interface InlineEditComposerProps {
    messageId: Id<"chatMessages">;
    initialBody: string;
    onDone: () => void;
}

export function InlineEditComposer({ messageId, initialBody, onDone }: InlineEditComposerProps) {
    const { toast } = useToast();
    const editMessage = useMutation(api.chatMessages.editMessage);

    const content = (() => {
        try { return JSON.parse(initialBody); } catch { return initialBody; }
    })();

    const editor = useEditor({
        extensions: [StarterKit, Mention.configure({ HTMLAttributes: { class: "mention" } })],
        content,
        editorProps: {
            attributes: {
                class: "outline-none text-sm text-brand-blueDark leading-relaxed py-2 px-3 [&_p]:m-0 [&_strong]:font-bold [&_em]:italic [&_code]:bg-brand-blueDark/8 [&_code]:px-1 [&_code]:rounded [&_code]:font-mono [&_code]:text-xs",
            },
        },
        immediatelyRender: false,
    });

    // Focus at end on mount
    useEffect(() => {
        editor?.commands.focus("end");
    }, [editor]);

    const handleSave = useCallback(async () => {
        if (!editor) return;
        const body = JSON.stringify(editor.getJSON());
        const bodyPlainText = editor.getText().trim();
        if (!bodyPlainText) return;

        try {
            await editMessage({ messageId, body, bodyPlainText });
            onDone();
        } catch (err: any) {
            toast(err?.message ?? "Failed to edit message", "error");
        }
    }, [editor, messageId, editMessage, toast, onDone]);

    // Escape = cancel, Enter = save
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onDone();
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSave(); }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [handleSave, onDone]);

    return (
        <div className="border-2 border-brand-blue/30 rounded-tl-lg rounded-br-lg bg-white overflow-hidden">
            <EditorContent editor={editor} />
            <div className="flex items-center gap-1.5 px-2 py-1 border-t border-brand-blueDark/6 bg-brand-bgLight/50">
                <span className="text-[10px] text-brand-blueDark/30 flex-1">Enter to save · Esc to cancel</span>
                <button
                    onClick={onDone}
                    className="p-1 rounded text-brand-blueDark/40 hover:text-brand-blueDark transition-colors"
                    title="Cancel"
                >
                    <X size={12} />
                </button>
                <button
                    onClick={handleSave}
                    className="p-1 rounded text-green-600 hover:bg-green-50 transition-colors"
                    title="Save"
                >
                    <Check size={12} />
                </button>
            </div>
        </div>
    );
}
