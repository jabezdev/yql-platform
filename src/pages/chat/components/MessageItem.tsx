import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { MessageCircle, Pin, MoreHorizontal, Hash, Download, ExternalLink, FileIcon, Trash2, Edit2 } from "lucide-react";
import { Avatar, StatusBadge } from "@/design";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { EnrichedMessage } from "../types";
import { formatTime, parseContent } from "../utils";
import { useToast } from "../../../providers/ToastProvider";
import { PollItem } from "./PollItem";

interface ActionBtnProps {
    icon: React.ElementType;
    title: string;
    onClick?: () => void;
}

function ActionBtn({ icon: Icon, title, onClick }: ActionBtnProps) {
    return (
        <button
            title={title}
            onClick={onClick}
            className="p-1.5 rounded-md text-brand-blue/40 hover:text-brand-blue hover:bg-brand-blue/10 dark:text-white/30 dark:hover:text-brand-yellow dark:hover:bg-white/10 transition-all active:scale-95"
        >
            <Icon size={14} />
        </button>
    );
}

function RoleBadge({ role }: { role: string }) {
    const variants: Record<string, "info" | "warning" | "success" | "neutral"> = {
        T1: "neutral",
        T2: "info",
        T3: "warning",
    };
    return (
        <StatusBadge 
            status={role} 
            variant={variants[role] ?? "neutral"} 
            size="sm" 
            className="font-black tracking-tighter"
        />
    );
}

export function MessageItem({
    msg, compact, userId,
    onToggleReaction,
    onOpenThread,
    activeThreadId,
}: {
    msg: EnrichedMessage;
    compact: boolean;
    userId?: Id<"users">;
    onToggleReaction: (msgId: Id<"chatMessages">, emoji: string) => void;
    onOpenThread?: (msgId: Id<"chatMessages">) => void;
    activeThreadId?: Id<"chatMessages"> | null;
}) {
    const [hover, setHover] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(msg.bodyPlainText);
    
    const { toast } = useToast();
    const editMessage = useMutation(api.chat.messages.editMessage);
    const deleteMessage = useMutation(api.chat.messages.deleteMessage);
    const pinMessage    = useMutation(api.chat.messages.pinMessage);

    const handleEdit = async () => {
        if (!editText.trim() || editText === msg.bodyPlainText) {
            setIsEditing(false);
            return;
        }
        try {
            await editMessage({ messageId: msg._id, body: editText, bodyPlainText: editText });
            setIsEditing(false);
            toast("Message updated", "success");
        } catch (_err) {
            toast("Failed to update message", "error");
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this message?")) return;
        try {
            await deleteMessage({ messageId: msg._id });
            toast("Message deleted", "success");
        } catch (_err) {
            toast("Failed to delete message", "error");
        }
    };

    const handlePin = async () => {
        try {
            await pinMessage({ messageId: msg._id });
            toast(msg.isPinned ? "Message unpinned" : "Message pinned", "success");
        } catch (_err) {
            toast("Action failed", "error");
        }
    };

    if (msg.isSystem) {
        return (
            <div className="flex items-center justify-center py-3 px-6">
                <div className="flex items-center gap-2 px-4 py-1.5 bg-brand-blue/[0.03] dark:bg-white/[0.02] border border-brand-blue/5 dark:border-white/5 rounded-full">
                    <Hash size={10} className="text-brand-blue/30" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-brand-blue/40 dark:text-white/30">
                        {msg.bodyPlainText}
                    </span>
                </div>
            </div>
        );
    }

    if (msg.isDeleted) {
        return (
            <div className="px-6 py-3 border-l-4 border-l-transparent text-[11px] font-black uppercase tracking-widest text-brand-blue/20 italic">
                <Trash2 size={10} className="inline mr-2" /> Message purged from secure logs
            </div>
        );
    }

    const isMine = msg.authorId === userId;
    const mentionsMe = userId && msg.bodyPlainText.includes(`@${msg.author?.name ?? ""}`);
    const isActiveThread = activeThreadId === msg._id;

    return (
        <div
            className={`relative flex gap-4 px-6 group transition-all duration-200 ${
                compact ? "pt-0.5 pb-0.5" : "pt-4 pb-1"
            } ${mentionsMe ? "bg-brand-yellow/[0.04] border-l-4 border-l-brand-yellow" : isActiveThread ? "bg-brand-blue/[0.04] border-l-4 border-l-brand-blue" : "hover:bg-brand-blue/[0.015] dark:hover:bg-white/[0.01] border-l-4 border-l-transparent"}`}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            {compact ? (
                <div className="w-10 flex-shrink-0 flex justify-end items-start pt-1">
                    {hover ? (
                        <span className="text-[9px] font-black tabular-nums text-[var(--text-muted)] whitespace-nowrap">
                            {formatTime(msg._creationTime).replace(/ (AM|PM)/, "")}
                        </span>
                    ) : (
                        <div className="w-1 h-1 rounded-full bg-[var(--color-border)] mt-2" />
                    )}
                </div>
            ) : (
                <div className="flex-shrink-0 relative">
                    <Avatar name={msg.author?.name ?? "?"} size="md" className="ring-2 ring-[var(--color-border)]" />
                    {isMine && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[var(--color-accent)] rounded-full border-2 border-[var(--color-bg)] shadow-sm" />}
                </div>
            )}

            <div className="flex-1 min-w-0">
                {!compact && (
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-[13px] font-black tracking-tight ${isMine ? "text-[var(--color-accent)]" : "text-[var(--text-primary)]"}`}>
                            {msg.author?.name ?? "Unknown Identity"}
                        </span>
                        {msg.author?.role && <RoleBadge role={msg.author.role} />}
                        <span className="text-[10px] font-black uppercase tracking-tighter text-[var(--text-muted)] tabular-nums">
                            {formatTime(msg._creationTime)}
                        </span>
                        {msg.isPinned && (
                            <span className="flex items-center gap-1 text-[10px] font-black uppercase text-brand-yellow tracking-tighter">
                                <Pin size={10} className="fill-current" /> PINNED
                            </span>
                        )}
                    </div>
                )}

                {isEditing ? (
                    <div className="mt-1 animate-in fade-in zoom-in-95 duration-200">
                        <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full bg-white dark:bg-[#1a2d40] border-2 border-brand-blue rounded-xl p-3 text-sm text-brand-blue dark:text-white outline-none ring-4 ring-brand-blue/5 min-h-[80px]"
                            autoFocus
                        />
                        <div className="flex justify-end gap-2 mt-2">
                            <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-brand-blue/40 hover:text-brand-red transition-all">Cancel</button>
                            <button onClick={handleEdit} className="px-4 py-1 bg-brand-blue text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Save Changes</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="text-sm text-brand-blue/80 dark:text-white/70 leading-relaxed break-words font-medium">
                            {parseContent(msg.bodyPlainText)}
                            {msg.isEdited && (
                                <span className="text-[10px] font-black uppercase tracking-tighter text-brand-blue/20 dark:text-white/10 ml-2">(edited)</span>
                            )}
                        </div>

                        {msg.poll && (
                            <PollItem 
                                pollId={msg.poll._id}
                                userId={userId}
                            />
                        )}
                    </>
                )}

                {msg.attachments && msg.attachments.length > 0 && !isEditing && (
                    <div className="flex flex-col gap-2 mt-3 max-w-sm">
                        {msg.attachments.map((att, idx) => {
                            const isImage = att.mimeType.startsWith("image/");
                            return (
                                <div key={idx} className="group/att overflow-hidden border border-slate-200 dark:border-white/10 rounded-tl-xl rounded-br-xl bg-white dark:bg-white/5 transition-all hover:shadow-lg">
                                    {isImage ? (
                                        <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                            <img src={att.url} alt={att.filename} className="w-full h-full object-cover transition-transform duration-500 group-hover/att:scale-110" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/att:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                <a href={att.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-md transition-all"><ExternalLink size={18} /></a>
                                                <a href={att.url} download={att.filename} className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-md transition-all"><Download size={18} /></a>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-3 flex items-center gap-3">
                                            <div className="p-2 bg-brand-blue/5 dark:bg-white/5 rounded text-brand-blue dark:text-brand-lightBlue"><FileIcon size={20} /></div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">{att.filename}</p>
                                                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">{(att.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                            <a href={att.url} download={att.filename} className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 rounded transition-all"><Download size={16} /></a>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {!isEditing && msg.reactions && msg.reactions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {msg.reactions.map((r, i) => {
                            const mine = userId ? r.userIds.includes(userId) : false;
                            return (
                                <button
                                    key={i}
                                    onClick={() => onToggleReaction(msg._id, r.emoji)}
                                    className={`inline-flex items-center gap-2 text-xs px-2.5 py-1 rounded-tl-md rounded-br-md border-2 transition-all ${
                                        mine ? "bg-brand-blue/10 border-brand-blue/30 text-brand-blue font-black" : "bg-white dark:bg-white/5 border-brand-blue/5 text-brand-blue/60 hover:border-brand-blue/20"
                                    }`}
                                >
                                    <span className="text-sm leading-none">{r.emoji}</span>
                                    <span className="text-[10px] font-black">{r.count}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {!isEditing && !!msg.threadReplyCount && msg.threadReplyCount > 0 && (
                    <button 
                        onClick={() => onOpenThread?.(msg._id)}
                        className="mt-3 flex items-center gap-2.5 text-[11px] font-black uppercase tracking-widest text-brand-blue/40 hover:text-brand-blue transition-colors group/thr bg-brand-blue/[0.02] border border-brand-blue/5 rounded-lg pr-3 py-1"
                    >
                        <div className="flex -space-x-1.5 ml-1">
                            {[...Array(Math.min(msg.threadReplyCount, 3))].map((_, i) => (
                                <div key={i} className="w-5 h-5 rounded-full border-2 border-white dark:border-[#0d1825] bg-brand-blue/5 flex items-center justify-center overflow-hidden">
                                    <div className="w-full h-full bg-brand-blue/10" />
                                </div>
                            ))}
                        </div>
                        <span>{msg.threadReplyCount} {msg.threadReplyCount === 1 ? "Operator Reply" : "Operator Replies"}</span>
                        <span className="opacity-0 group-hover/thr:opacity-100 transition-opacity translate-x-[-4px] group-hover:translate-x-0">→</span>
                    </button>
                )}
            </div>

            {hover && !isEditing && (
                <div className="absolute right-6 top-1 flex items-center bg-white/90 dark:bg-[#1a2d40]/90 border-2 border-brand-blue/10 rounded-tl-xl rounded-br-xl shadow-[4px_4px_0px_0px_rgba(57,103,153,0.1)] p-1 z-10 backdrop-blur-md animate-in slide-in-from-right-2 duration-200">
                    <ActionBtn icon={MessageCircle}  title="Thread Reply" onClick={() => onOpenThread?.(msg._id)} />
                    <ActionBtn icon={Pin}            title={msg.isPinned ? "Unpin" : "Pin"} onClick={handlePin} />
                    {isMine && <ActionBtn icon={Edit2}  title="Edit" onClick={() => setIsEditing(true)} />}
                    {isMine && <ActionBtn icon={Trash2} title="Delete" onClick={handleDelete} />}
                    <ActionBtn icon={MoreHorizontal} title="More" />
                </div>
            )}
        </div>
    );
}
