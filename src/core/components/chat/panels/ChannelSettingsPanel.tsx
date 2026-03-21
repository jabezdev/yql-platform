import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useAuthContext } from "../../../providers/AuthProvider";
import { useToast } from "../../../providers/ToastProvider";
import { useChatContext } from "../../../providers/ChatProvider";
import { Save, Archive, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Id } from "../../../../../convex/_generated/dataModel";

interface ChannelSettingsPanelProps {
    channelId: Id<"chatChannels">;
}

export function ChannelSettingsPanel({ channelId }: ChannelSettingsPanelProps) {
    const { user } = useAuthContext();
    const { toast } = useToast();
    const { setRightPanel } = useChatContext();
    const navigate = useNavigate();

    const channel = useQuery(api.chatChannels.getChannel, { channelId });
    const updateChannel = useMutation(api.chatChannels.updateChannel);
    const archiveChannel = useMutation(api.chatChannels.archiveChannel);

    const [name, setName] = useState("");
    const [topic, setTopic] = useState("");
    const [icon, setIcon] = useState("");
    const [saving, setSaving] = useState(false);
    const [archiving, setArchiving] = useState(false);

    // Populate form when the active channel changes. Intentionally keyed on
    // channel._id only — we don't want to overwrite the user's in-progress edits
    // if an unrelated field on the channel doc updates.
    useEffect(() => {
        if (channel) {
            setName(channel.name);
            setTopic(channel.topic ?? "");
            setIcon(channel.icon ?? "");
        }
    }, [channel?._id]); // eslint-disable-line react-hooks/exhaustive-deps

    const isManager =
        user?.role === "T1" || user?.role === "T2" || user?.role === "T3" || user?.role === "Super Admin";

    if (!channel) {
        return (
            <div className="flex justify-center py-6">
                <Loader2 size={18} className="animate-spin text-brand-blue/50" />
            </div>
        );
    }

    const handleSave = async () => {
        if (!name.trim()) { toast("Channel name cannot be empty", "error"); return; }
        setSaving(true);
        try {
            await updateChannel({ channelId, name: name.trim(), topic: topic.trim() || undefined, icon: icon.trim() || undefined });
            toast("Channel updated", "success");
        } catch (err: any) {
            toast(err?.message ?? "Failed to update channel", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleArchive = async () => {
        if (!confirm(`Archive #${channel.name}? It will become read-only and hidden from the sidebar.`)) return;
        setArchiving(true);
        try {
            await archiveChannel({ channelId });
            setRightPanel(null);
            navigate("/chat");
            toast(`#${channel.name} archived`, "success");
        } catch (err: any) {
            toast(err?.message ?? "Failed to archive channel", "error");
        } finally {
            setArchiving(false);
        }
    };

    return (
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            <div className="p-4 flex flex-col gap-4">
                {/* Channel name */}
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-blueDark/40 mb-1.5">
                        Channel Name
                    </label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={!isManager}
                        className="w-full text-sm text-brand-blueDark border-2 border-brand-blueDark/12 rounded-tl-lg rounded-br-lg px-3 py-2 outline-none focus:border-brand-blue/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>

                {/* Icon */}
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-blueDark/40 mb-1.5">
                        Icon (emoji)
                    </label>
                    <input
                        value={icon}
                        onChange={(e) => setIcon(e.target.value)}
                        disabled={!isManager}
                        placeholder="e.g. 🚀"
                        maxLength={4}
                        className="w-24 text-sm text-brand-blueDark border-2 border-brand-blueDark/12 rounded-tl-lg rounded-br-lg px-3 py-2 outline-none focus:border-brand-blue/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-center"
                    />
                </div>

                {/* Topic */}
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-blueDark/40 mb-1.5">
                        Topic
                    </label>
                    <input
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        disabled={!isManager}
                        placeholder="What's this channel about?"
                        className="w-full text-sm text-brand-blueDark border-2 border-brand-blueDark/12 rounded-tl-lg rounded-br-lg px-3 py-2 outline-none focus:border-brand-blue/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>

                {/* Info */}
                <div className="text-[11px] text-brand-blueDark/35 space-y-0.5">
                    <p>Type: <span className="font-medium text-brand-blueDark/50">{channel.type}</span></p>
                    <p>Created: <span className="font-medium text-brand-blueDark/50">{new Date(channel._creationTime).toLocaleDateString()}</span></p>
                </div>

                {isManager && (
                    <>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center justify-center gap-2 w-full py-2 bg-brand-blueDark text-white text-xs font-bold rounded-tl-lg rounded-br-lg hover:bg-brand-blue transition-colors disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                            Save Changes
                        </button>

                        <div className="border-t-2 border-brand-blueDark/6 pt-3">
                            <button
                                onClick={handleArchive}
                                disabled={archiving || !!channel.isArchived}
                                className="flex items-center gap-2 text-xs text-red-500/70 hover:text-red-500 transition-colors disabled:opacity-40"
                            >
                                <Archive size={13} />
                                {channel.isArchived ? "Channel is archived" : "Archive channel"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
