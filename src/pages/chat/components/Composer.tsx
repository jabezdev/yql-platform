import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { 
    Smile, Paperclip, Bold, Italic, Code, AtSign, Send, X, Terminal
} from "lucide-react";
import { useToast } from "../../../providers/ToastProvider";
import type { Id } from "../../../../convex/_generated/dataModel";
import EmojiPicker, { Theme as EmojiTheme } from "emoji-picker-react";
import { useTheme } from "../../../providers/ThemeProvider";
import { Button } from "@/design";

export function Composer({
    channelId,
    placeholder,
    threadRootMessageId,
}: {
    channelId: Id<"chatChannels">;
    placeholder: string;
    threadRootMessageId?: Id<"chatMessages">;
}) {
    const { toast } = useToast();
    const { isDark } = useTheme();
    
    // Draft Persistence (Only for main channel for now)
    const savedDraft = useQuery(
        api.chat.drafts.getDraft, 
        threadRootMessageId ? "skip" : { channelId }
    );
    const updateDraft = useMutation(api.chat.drafts.updateDraft);
    
    const [draft, setDraft]               = useState("");
    const [focused, setFocused]           = useState(false);
    const [showEmoji, setShowEmoji]       = useState(false);
    const [isUploading, setIsUploading]   = useState(false);
    const [attachment, setAttachment]     = useState<{ storageId: Id<"_storage">; filename: string; mimeType: string; size: number } | null>(null);
    
    const textareaRef             = useRef<HTMLTextAreaElement>(null);
    const fileInputRef            = useRef<HTMLInputElement>(null);
    const lastTypingSent          = useRef(0);
    const typingClearTimer        = useRef<any>(null);
    const draftUpdateTimer        = useRef<any>(null);

    const sendMessage      = useMutation(api.chat.messages.sendMessage);
    const setTyping        = useMutation(api.chat.typing.setTyping);
    const clearTyping      = useMutation(api.chat.typing.clearTyping);
    const generateUploadUrl = useMutation(api.chat.messages.generateUploadUrl);

    // Initialize draft from database
    useEffect(() => {
        if (savedDraft !== undefined) {
            setDraft(savedDraft);
        }
    }, [savedDraft, channelId]);

    // Internal textarea auto-height
    useEffect(() => {
        const el = textareaRef.current;
        if (el) {
            el.style.height = "auto";
            el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
        }
    }, [draft]);

    // Persist draft to database (debounced, skip if in thread)
    const persistDraft = useCallback((text: string) => {
        if (threadRootMessageId) return;
        clearTimeout(draftUpdateTimer.current);
        draftUpdateTimer.current = setTimeout(() => {
            updateDraft({ channelId, body: text }).catch(() => {});
        }, 1000);
    }, [channelId, updateDraft, threadRootMessageId]);

    const handleTyping = useCallback(() => {
        const now = Date.now();
        if (now - lastTypingSent.current > 4000) {
            setTyping({ channelId }).catch(() => {});
            lastTypingSent.current = now;
        }
        clearTimeout(typingClearTimer.current);
        typingClearTimer.current = setTimeout(() => {
            clearTyping({ channelId }).catch(() => {});
        }, 2000);
    }, [channelId, setTyping, clearTyping]);

    const handleSend = useCallback(() => {
        const text = draft.trim();
        if (!text && !attachment) return;
        
        clearTimeout(typingClearTimer.current);
        clearTimeout(draftUpdateTimer.current);
        
        clearTyping({ channelId }).catch(() => {});
        if (!threadRootMessageId) {
            updateDraft({ channelId, body: "" }).catch(() => {});
        }
        
        setDraft("");
        setAttachment(null);
        setShowEmoji(false);

        sendMessage({ 
            channelId, 
            body: text, 
            bodyPlainText: text,
            threadRootMessageId,
            attachments: attachment ? [attachment] : undefined
        }).catch((err) => {
            toast("Failed to send message", "error");
            console.error(err);
        });
    }, [draft, channelId, sendMessage, clearTyping, updateDraft, attachment, toast, threadRootMessageId]);

    const applyFormat = (prefix: string, suffix: string = prefix) => {
        const el = textareaRef.current;
        if (!el) return;

        const start = el.selectionStart;
        const end = el.selectionEnd;
        const text = draft;
        const selected = text.slice(start, end);
        
        const newText = text.slice(0, start) + prefix + selected + suffix + text.slice(end);
        setDraft(newText);
        persistDraft(newText);
        
        // Restore focus and selection
        setTimeout(() => {
            el.focus();
            el.setSelectionRange(start + prefix.length, end + prefix.length);
        }, 0);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const postUrl = await generateUploadUrl();
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            const { storageId } = await result.json();
            
            setAttachment({
                storageId,
                filename: file.name,
                mimeType: file.type,
                size: file.size,
            });
        } catch (_err) {
            toast("Failed to upload file", "error");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const ComingSoon = (feature: string) => () => toast(`${feature} coming soon!`, "info");

    return (
        <div className="flex-shrink-0 animate-in slide-in-from-bottom-4 duration-500">
            {showEmoji && (
                <div className="absolute bottom-full mb-6 left-0 z-50 shadow-2xl rounded-2xl overflow-hidden border-2 border-brand-blue/10 bg-white dark:bg-[#1a2d40] animate-in zoom-in-95 duration-200 origin-bottom-left">
                    <EmojiPicker
                        theme={isDark ? EmojiTheme.DARK : EmojiTheme.LIGHT}
                        autoFocusSearch={false}
                        onEmojiClick={(emoji) => {
                            const el = textareaRef.current;
                            if (!el) return;
                            const start = el.selectionStart;
                            const text = draft;
                            const newText = text.slice(0, start) + emoji.emoji + text.slice(start);
                            setDraft(newText);
                            persistDraft(newText);
                            setShowEmoji(false);
                            setTimeout(() => el.focus(), 0);
                        }}
                    />
                </div>
            )}

            <div
                className={`relative overflow-hidden bg-white/80 dark:bg-[#0d1825]/90 backdrop-blur-xl transition-all duration-300 ${
                    focused 
                        ? "border-2 border-brand-blue ring-4 ring-brand-blue/5 shadow-[8px_8px_0px_0px_rgba(57,103,153,0.1)] -translate-y-1" 
                        : "border-2 border-brand-blue/10 shadow-[4px_4px_0px_0px_rgba(57,103,153,0.05)]"
                } rounded-tl-3xl rounded-br-3xl`}
                onFocus={() => setFocused(true)}
                onBlur={(e) => {
                    const currentTarget = e.currentTarget;
                    requestAnimationFrame(() => {
                        if (!currentTarget.contains(document.activeElement)) {
                            setFocused(false);
                        }
                    });
                }}
            >
                {/* Formatting Toolbar */}
                <div className="flex items-center justify-between px-3 py-1 border-b-2 border-brand-blue/[0.03] bg-brand-blue/[0.02]">
                    <div className="flex items-center">
                        <button onClick={() => applyFormat("**")} title="Bold" className="p-2 rounded-lg text-brand-blue/40 hover:text-brand-blue hover:bg-brand-blue/10 transition-all active:scale-90">
                            <Bold size={15} />
                        </button>
                        <button onClick={() => applyFormat("*")} title="Italic" className="p-2 rounded-lg text-brand-blue/40 hover:text-brand-blue hover:bg-brand-blue/10 transition-all active:scale-90">
                            <Italic size={15} />
                        </button>
                        <button onClick={() => applyFormat("`")} title="Code" className="p-2 rounded-lg text-brand-blue/40 hover:text-brand-blue hover:bg-brand-blue/10 transition-all active:scale-90">
                            <Code size={15} />
                        </button>
                        <div className="w-px h-4 bg-brand-blue/10 mx-2" />
                        <button onClick={ComingSoon("Mentions")} title="Mention Operator" className="p-2 rounded-lg text-brand-blue/40 hover:text-brand-blue hover:bg-brand-blue/10 transition-all active:scale-90">
                            <AtSign size={15} />
                        </button>
                        <button onClick={() => setShowEmoji(!showEmoji)} title="Insert Emoji" className={`p-2 rounded-lg transition-all active:scale-90 ${showEmoji ? "text-brand-blue bg-brand-blue/10" : "text-brand-blue/40 hover:text-brand-blue hover:bg-brand-blue/10"}`}>
                            <Smile size={15} />
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue/20 mr-2 flex items-center gap-1.5">
                            <Terminal size={10} /> Secure Node
                        </span>
                    </div>
                </div>

                {attachment && (
                    <div className="mx-4 my-2 p-3 bg-brand-blue/5 border-2 border-brand-blue/10 rounded-tl-xl rounded-br-xl flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className="w-10 h-10 bg-white dark:bg-white/10 rounded-lg flex items-center justify-center border-2 border-brand-blue/10 text-brand-blue shadow-sm">
                            <Paperclip size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-brand-blue truncate uppercase tracking-tight">{attachment.filename}</p>
                            <p className="text-[10px] font-bold text-brand-blue/40">{(attachment.size / 1024).toFixed(1)} KB · READY FOR TRANSMISSION</p>
                        </div>
                        <button onClick={() => setAttachment(null)} className="p-1.5 hover:bg-brand-red/10 rounded-lg transition-colors text-brand-blue/30 hover:text-brand-red">
                            <X size={16} />
                        </button>
                    </div>
                )}

                <div className="flex items-end gap-3 p-4">
                    <button 
                        onClick={() => fileInputRef.current?.click()} 
                        title="Attach Documents" 
                        className={`mb-1 p-2 rounded-xl border-2 border-brand-blue/10 text-brand-blue/40 hover:text-brand-blue hover:bg-brand-blue/5 hover:border-brand-blue/20 transition-all active:scale-95 ${isUploading ? "animate-pulse" : ""}`}
                    >
                        <Paperclip size={18} />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

                    <textarea
                        ref={textareaRef}
                        value={draft}
                        onChange={e => { 
                            const val = e.target.value;
                            setDraft(val); 
                            handleTyping(); 
                            persistDraft(val);
                        }}
                        onKeyDown={e => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder={placeholder}
                        rows={1}
                        className="flex-1 text-[14px] text-brand-blue dark:text-white placeholder-brand-blue/20 dark:placeholder-white/20 resize-none outline-none leading-relaxed bg-transparent py-2.5 font-medium"
                        style={{ scrollbarWidth: "none" }}
                    />
                    
                    <Button
                        onClick={handleSend}
                        disabled={(!draft.trim() && !attachment) || isUploading}
                        size="sm"
                        className="mb-1 rounded-tl-xl rounded-br-xl shadow-lg active:shadow-none transition-all"
                    >
                        <Send size={16} />
                    </Button>
                </div>
            </div>

            <div className="flex items-center justify-between mt-3 px-2">
                <div className="flex items-center gap-4">
                    <p className="text-[10px] font-black uppercase tracking-tighter text-brand-blue/30">
                        <kbd className="bg-brand-blue/5 border border-brand-blue/10 px-1.5 py-0.5 rounded text-[9px] mr-1">Enter</kbd> to broadcast
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-tighter text-brand-blue/30">
                        <kbd className="bg-brand-blue/5 border border-brand-blue/10 px-1.5 py-0.5 rounded text-[9px] mr-1">Shift+Enter</kbd> break
                    </p>
                </div>
                <button 
                    onClick={ComingSoon("Shortcuts")}
                    className="text-[10px] font-black uppercase tracking-widest text-brand-blue/20 hover:text-brand-blue transition-colors"
                >
                    View Encryption Protocol
                </button>
            </div>
        </div>
    );
}

