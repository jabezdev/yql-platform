import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useToast } from "../../../providers/ToastProvider";
import { X, Hash, Loader2, MoveRight } from "lucide-react";
import type { Id } from "../../../../../convex/_generated/dataModel";

interface MoveMessageModalProps {
    messageId: Id<"chatMessages">;
    currentChannelId: Id<"chatChannels">;
    onClose: () => void;
}

export function MoveMessageModal({ messageId, currentChannelId, onClose }: MoveMessageModalProps) {
    const { toast } = useToast();
    const channelTree = useQuery(api.chatChannels.getChannelTree, {});
    const moveMessage = useMutation(api.chatMessages.moveMessage);

    const [selected, setSelected] = useState<Id<"chatChannels"> | null>(null);
    const [reason, setReason] = useState("");
    const [moving, setMoving] = useState(false);

    // Flatten channel tree into a list
    const flatChannels: { _id: Id<"chatChannels">; name: string; icon?: string }[] = [];
    const flattenTree = (nodes: any[]) => {
        for (const n of nodes) {
            if (n._id !== currentChannelId && !n.isArchived) {
                flatChannels.push({ _id: n._id, name: n.name, icon: n.icon });
            }
            if (n.children?.length) flattenTree(n.children);
        }
    };
    if (channelTree) flattenTree(channelTree);

    const handleMove = async () => {
        if (!selected) return;
        setMoving(true);
        try {
            await moveMessage({ messageId, toChannelId: selected, reason: reason.trim() || undefined });
            toast("Message moved", "success");
            onClose();
        } catch (err: any) {
            toast(err?.message ?? "Failed to move message", "error");
        } finally {
            setMoving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-blue/30 backdrop-blur-sm">
            <div className="bg-white rounded-tl-2xl rounded-br-2xl shadow-[6px_6px_0px_0px_rgba(10,22,48,0.15)] w-[420px] max-h-[80vh] flex flex-col overflow-hidden border-2 border-brand-blue/10">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b-2 border-brand-blue/8 shrink-0">
                    <div className="flex items-center gap-2">
                        <MoveRight size={15} className="text-brand-lightBlue" />
                        <h2 className="text-sm font-bold text-brand-blue">Move Message</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-tl-lg rounded-br-lg text-brand-blue/40 hover:bg-brand-bgLight transition-colors">
                        <X size={14} />
                    </button>
                </div>

                {/* Channel list */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                    {!channelTree ? (
                        <div className="flex justify-center py-6"><Loader2 size={18} className="animate-spin text-brand-lightBlue/50" /></div>
                    ) : flatChannels.length === 0 ? (
                        <p className="text-xs text-brand-blue/35 text-center py-4">No other channels available</p>
                    ) : (
                        <div className="flex flex-col gap-0.5">
                            {flatChannels.map((ch) => (
                                <button
                                    key={ch._id}
                                    onClick={() => setSelected(ch._id)}
                                    className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-tl-lg rounded-br-lg text-left transition-all border-2 ${
                                        selected === ch._id
                                            ? "border-brand-lightBlue/50 bg-brand-lightBlue/5"
                                            : "border-transparent hover:bg-brand-bgLight"
                                    }`}
                                >
                                    {ch.icon ? (
                                        <span className="text-sm">{ch.icon}</span>
                                    ) : (
                                        <Hash size={13} className="text-brand-blue/35 flex-shrink-0" />
                                    )}
                                    <span className="text-xs font-medium text-brand-blue">{ch.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Reason + confirm */}
                <div className="px-4 py-3 border-t-2 border-brand-blue/8 shrink-0 space-y-2.5">
                    <input
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Reason (optional)"
                        className="w-full text-xs text-brand-blue border-2 border-brand-blue/10 rounded-tl-lg rounded-br-lg px-3 py-2 outline-none focus:border-brand-lightBlue/30 transition-colors"
                    />
                    <div className="flex items-center justify-end gap-2">
                        <button onClick={onClose} className="px-3 py-1.5 text-xs font-medium text-brand-blue/50 hover:text-brand-blue transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={handleMove}
                            disabled={!selected || moving}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-brand-blue text-white text-xs font-bold rounded-tl-lg rounded-br-lg hover:bg-brand-lightBlue transition-colors disabled:opacity-40"
                        >
                            {moving ? <Loader2 size={12} className="animate-spin" /> : <MoveRight size={12} />}
                            Move
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
