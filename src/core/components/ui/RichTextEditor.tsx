import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from '@tiptap/markdown';
import {
    Heading1, Heading2, Bold, Italic, Underline as UnderlineIcon,
    Strikethrough, List, ListOrdered, Type
} from "lucide-react";
import { useEffect } from 'react';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    className?: string;
    editorClassName?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    const btnClass = (isActive: boolean) =>
        `p-1.5 rounded transition-colors ${isActive
            ? "bg-brand-blue text-white"
            : "hover:bg-brand-blue/10 text-brand-blueDark/60 hover:text-brand-blue"
        }`;

    return (
        <div className="flex items-center gap-1 p-1 bg-brand-bgLight border-2 border-brand-blueDark/10 rounded-t-lg border-b-0 sticky top-0 z-10 shrink-0">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={btnClass(editor.isActive('heading', { level: 1 }))}
                title="Heading 1"
            >
                <Heading1 size={14} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={btnClass(editor.isActive('heading', { level: 2 }))}
                title="Heading 2"
            >
                <Heading2 size={14} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().setParagraph().run()}
                className={btnClass(editor.isActive('paragraph'))}
                title="Paragraph"
            >
                <Type size={14} />
            </button>

            <div className="w-px h-4 bg-brand-blueDark/10 mx-1" />

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={btnClass(editor.isActive('bold'))}
                title="Bold"
            >
                <Bold size={14} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={btnClass(editor.isActive('italic'))}
                title="Italic"
            >
                <Italic size={14} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={btnClass(editor.isActive('underline'))}
                title="Underline"
            >
                <UnderlineIcon size={14} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={btnClass(editor.isActive('strike'))}
                title="Strikethrough"
            >
                <Strikethrough size={14} />
            </button>

            <div className="w-px h-4 bg-brand-blueDark/10 mx-1" />

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={btnClass(editor.isActive('bulletList'))}
                title="Bullet List"
            >
                <List size={14} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={btnClass(editor.isActive('orderedList'))}
                title="Ordered List"
            >
                <ListOrdered size={14} />
            </button>
        </div>
    );
};

export function RichTextEditor({ content, onChange, placeholder, className = "", editorClassName = "" }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                // Underline is already included in StarterKit v3.20.0
                underline: {},
            }),
            Markdown,
            Placeholder.configure({
                placeholder: placeholder || 'Start typing...',
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            const markdown = (editor as any).getMarkdown?.() || "";
            onChange(markdown);
        },
        editorProps: {
            attributes: {
                class: `prose-custom outline-none p-4 w-full bg-brand-bgLight border-2 border-brand-blueDark/20 rounded-b-lg focus-within:border-brand-blueDark transition-colors overflow-y-auto custom-scrollbar ${editorClassName || "min-h-[200px] h-full"}`,
            },
        },
    });

    // Update content if it changes externally
    useEffect(() => {
        if (editor && content !== (editor as any).getMarkdown?.()) {
            editor.commands.setContent(content, { emitUpdate: false });
        }
    }, [content, editor]);

    return (
        <div className={`rich-text-editor flex flex-col min-h-0 ${className}`}>
            <MenuBar editor={editor} />
            <div className="flex-1 relative min-h-0">
                <EditorContent
                    editor={editor}
                    className="absolute inset-0 flex flex-col overflow-hidden"
                />
            </div>
        </div>
    );
}


