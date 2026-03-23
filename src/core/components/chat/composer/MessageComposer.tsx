import { useCallback, useRef, useState, useMemo, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Mention from "@tiptap/extension-mention";
import Link from "@tiptap/extension-link";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useToast } from "../../../providers/ToastProvider";
import { Bold, Italic, Code, List, Send, ImagePlus, Smile, BarChart2 } from "lucide-react";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { EmojiPicker } from "./EmojiPicker";
import { createMentionSuggestion, type MentionUser } from "./MentionSuggestion";
import { PollComposer } from "./PollComposer";
import { AttachmentPreview, type StagedFile } from "./AttachmentPreview";
import { useTypingIndicator } from "../../../hooks/useTypingIndicator";

interface MessageComposerProps {
    channelId: Id<"chatChannels">;
    threadRootMessageId?: Id<"chatMessages">;
    placeholder?: string;
    onSent?: () => void;
}

function extractMentionIds(doc: any): string[] {
    const ids: string[] = [];
    const traverse = (node: any) => {
        if (node.type === "mention" && node.attrs?.id) ids.push(node.attrs.id);
        (node.content ?? []).forEach(traverse);
    };
    traverse(doc);
    return ids;
}

export function MessageComposer({
    channelId,
    threadRootMessageId,
    placeholder = "Message… (@ to mention)",
    onSent,
}: MessageComposerProps) {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showPollComposer, setShowPollComposer] = useState(false);
    const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);

    const sendMessage = useMutation(api.chatMessages.sendMessage);
    const generateUploadUrl = useMutation(api.chatMessages.generateUploadUrl);
    const canSend = useQuery(api.chatMessages.canSendInChannel, { channelId });
    const allUsers = useQuery(api.users.getDirectory);

    const { onTyping, onStop } = useTypingIndicator(channelId);

    // Revoke object URLs on unmount / when files change
    useEffect(() => {
        return () => {
            stagedFiles.forEach((sf) => { if (sf.previewUrl) URL.revokeObjectURL(sf.previewUrl); });
        };
    }, [stagedFiles]);

    const usersRef = useRef<MentionUser[]>([]);
    useEffect(() => {
        if (allUsers) usersRef.current = allUsers as MentionUser[];
    }, [allUsers]);
    // getUsers is only invoked by Tiptap during user interaction, never during render.
    const getUsers = useCallback(() => usersRef.current, []);
    // eslint-disable-next-line react-hooks/refs
    const mentionSuggestion = useMemo(() => createMentionSuggestion(getUsers), [getUsers]);

    const editor = useEditor({
        extensions: [
            // Exclude StarterKit's bundled link so our configured Link below is the sole instance.
            StarterKit.configure({ link: false }),
            Placeholder.configure({ placeholder }),
            Link.configure({ openOnClick: false, autolink: true }),
            Mention.configure({
                HTMLAttributes: { class: "mention" },
                suggestion: mentionSuggestion,
            }),
        ],
        editorProps: {
            attributes: {
                class: "outline-none min-h-[40px] max-h-32 sm:max-h-48 overflow-y-auto custom-scrollbar text-sm text-brand-blue leading-relaxed py-2.5 px-3 [&_p]:m-0 [&_p+p]:mt-1 [&_strong]:font-bold [&_em]:italic [&_code]:bg-brand-blue/8 [&_code]:px-1 [&_code]:rounded [&_code]:font-mono [&_code]:text-xs [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_.mention]:bg-brand-lightBlue/10 [&_.mention]:text-brand-lightBlue [&_.mention]:font-semibold [&_.mention]:px-1 [&_.mention]:rounded [&_a]:text-brand-lightBlue [&_a]:underline",
            },
            handleKeyDown: (_view, event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                    return true;
                }
                onTyping();
                return false;
            },
        },
        immediatelyRender: false,
    });

    const handleSend = useCallback(async () => {
        if (!editor) return;
        const doc = editor.getJSON();
        const body = JSON.stringify(doc);
        const bodyPlainText = editor.getText().trim();

        // Require either text content or staged files
        if (!bodyPlainText && stagedFiles.length === 0) return;

        const mentionIds = extractMentionIds(doc);
        const mentions = mentionIds.length > 0 ? { userIds: mentionIds as Id<"users">[] } : undefined;

        try {
            // Upload staged files
            let attachments: any[] | undefined;
            if (stagedFiles.length > 0) {
                attachments = [];
                for (const sf of stagedFiles) {
                    const uploadUrl = await generateUploadUrl();
                    const result = await fetch(uploadUrl, {
                        method: "POST",
                        headers: { "Content-Type": sf.file.type },
                        body: sf.file,
                    });
                    const { storageId } = await result.json();
                    attachments.push({
                        storageId,
                        filename: sf.file.name,
                        mimeType: sf.file.type,
                        size: sf.file.size,
                    });
                }
            }

            await sendMessage({
                channelId,
                body: body,
                bodyPlainText: bodyPlainText || "[attachment]",
                threadRootMessageId,
                mentions,
                attachments,
            });

            editor.commands.clearContent();
            setStagedFiles([]);
            onStop();
            onSent?.();
        } catch (err: any) {
            toast(err?.message ?? "Failed to send message", "error");
        }
    }, [editor, channelId, threadRootMessageId, sendMessage, generateUploadUrl, stagedFiles, toast, onSent, onStop]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newFiles: StagedFile[] = Array.from(files).map((file) => ({
            uid: crypto.randomUUID(),
            file,
            previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
        }));

        setStagedFiles((prev) => [...prev, ...newFiles]);
        e.target.value = "";
    };

    const removeStaged = (uid: string) => {
        setStagedFiles((prev) => {
            const removed = prev.find((sf) => sf.uid === uid);
            if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
            return prev.filter((sf) => sf.uid !== uid);
        });
    };

    const insertEmoji = (emoji: string) => {
        editor?.chain().focus().insertContent(emoji).run();
    };

    if (canSend === false) {
        return (
            <div className="px-4 py-3 border-t-2 border-brand-blue/8">
                <p className="text-xs text-center text-brand-blue/35 font-medium">
                    You don't have permission to send messages in this channel.
                </p>
            </div>
        );
    }

    const btnClass = (active = false) =>
        `p-1.5 rounded-tl-lg rounded-br-lg transition-colors ${
            active
                ? "bg-brand-lightBlue/15 text-brand-lightBlue"
                : "text-brand-blue/35 hover:bg-brand-bgLight hover:text-brand-blue"
        }`;

    return (
        <div className="px-4 pb-4 pt-2 shrink-0">
            {/* Poll composer */}
            {showPollComposer && (
                <PollComposer
                    channelId={channelId}
                    threadRootMessageId={threadRootMessageId}
                    onClose={() => setShowPollComposer(false)}
                />
            )}

            <div className="border-2 border-brand-blue/15 rounded-tl-xl rounded-br-xl focus-within:border-brand-blue/40 transition-colors bg-white shadow-[1px_1px_0px_0px_rgba(10,22,48,0.06)]">
                {/* Toolbar — horizontally scrollable on mobile so all buttons remain accessible */}
                <div className="flex items-center gap-0.5 px-2 pt-1.5 pb-1 border-b border-brand-blue/6 overflow-x-auto no-scrollbar">
                    <button type="button" title="Bold (⌘B)" onClick={() => editor?.chain().focus().toggleBold().run()} className={btnClass(editor?.isActive("bold"))}>
                        <Bold size={13} />
                    </button>
                    <button type="button" title="Italic (⌘I)" onClick={() => editor?.chain().focus().toggleItalic().run()} className={btnClass(editor?.isActive("italic"))}>
                        <Italic size={13} />
                    </button>
                    <button type="button" title="Inline code" onClick={() => editor?.chain().focus().toggleCode().run()} className={btnClass(editor?.isActive("code"))}>
                        <Code size={13} />
                    </button>
                    <button type="button" title="Bullet list" onClick={() => editor?.chain().focus().toggleBulletList().run()} className={btnClass(editor?.isActive("bulletList"))}>
                        <List size={13} />
                    </button>

                    <div className="w-px h-4 bg-brand-blue/8 mx-1" />

                    <button type="button" title="Attach image or file" onClick={() => fileInputRef.current?.click()} className={btnClass()}>
                        <ImagePlus size={13} />
                    </button>

                    {/* Emoji picker */}
                    <div className="relative">
                        <button type="button" title="Insert emoji" onClick={() => setShowEmojiPicker((v) => !v)} className={btnClass(showEmojiPicker)}>
                            <Smile size={13} />
                        </button>
                        {showEmojiPicker && (
                            <div className="absolute bottom-full left-0 mb-1 z-50">
                                <EmojiPicker onSelect={insertEmoji} onClose={() => setShowEmojiPicker(false)} />
                            </div>
                        )}
                    </div>

                    {/* Poll toggle */}
                    <button type="button" title="Create a poll" onClick={() => setShowPollComposer((v) => !v)} className={btnClass(showPollComposer)}>
                        <BarChart2 size={13} />
                    </button>
                </div>

                {/* Staged attachment previews */}
                <AttachmentPreview files={stagedFiles} onRemove={removeStaged} />

                {/* Editor area */}
                <EditorContent editor={editor} />

                {/* Send row */}
                <div className="flex items-center justify-between px-2 pb-1.5 pt-1">
                    <span className="hidden sm:block text-[10px] text-brand-blue/25 font-medium">
                        Enter to send · Shift+Enter for newline · @ to mention
                    </span>
                    <span className="block sm:hidden text-[10px] text-brand-blue/25 font-medium">
                        @ to mention
                    </span>
                    <button
                        type="button"
                        onClick={handleSend}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue text-white text-xs font-bold rounded-tl-lg rounded-br-lg hover:bg-brand-lightBlue transition-colors shadow-[2px_2px_0px_0px_rgba(10,22,48,0.25)] active:translate-y-px active:shadow-none"
                    >
                        <Send size={12} />
                        Send
                    </button>
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={handleFileSelect}
            />
        </div>
    );
}
