import { useState } from "react";
import { X, Hash } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useAuthContext } from "../../../providers/AuthProvider";
import { hasMinRole } from "../../../../../convex/roleHierarchy";
import type { Role } from "../../../../../convex/roleHierarchy";
import type { Id } from "../../../../../convex/_generated/dataModel";

type ChannelType = "channel" | "subchannel" | "group" | "sidechat";

const TYPE_LABELS: Record<ChannelType, string> = {
    channel: "Channel",
    subchannel: "Sub-Channel",
    group: "Group",
    sidechat: "Sidechat",
};

const TYPE_DESCRIPTIONS: Record<ChannelType, string> = {
    channel: "Top-level, visible to all",
    subchannel: "Nested under a channel",
    group: "Nested under a sub-channel",
    sidechat: "Lightweight branch off any channel",
};

type FlatChannel = {
    _id: Id<"chatChannels">;
    name: string;
    icon?: string;
    type: string;
};

function flattenTree(nodes: FlatChannel[]): FlatChannel[] {
    const result: FlatChannel[] = [];
    for (const node of nodes) {
        result.push(node);
        // children may exist at runtime even though FlatChannel doesn't declare it
        const children = (node as any).children as FlatChannel[] | undefined;
        if (children?.length) result.push(...flattenTree(children));
    }
    return result;
}

interface CreateChannelModalProps {
    defaultParentId?: Id<"chatChannels">;
    defaultParentType?: string;
    onClose: () => void;
}

export function CreateChannelModal({
    defaultParentId,
    defaultParentType,
    onClose,
}: CreateChannelModalProps) {
    const { user } = useAuthContext();
    const createChannel = useMutation(api.chatChannels.createChannel);
    const channelTree = useQuery(api.chatChannels.getChannelTree, {});

    const isManager = hasMinRole((user?.role ?? "Applicant") as Role, "T3");

    const getInitialType = (): ChannelType => {
        if (!isManager) return "sidechat";
        if (defaultParentType === "channel") return "subchannel";
        if (defaultParentType === "subchannel") return "group";
        if (defaultParentType === "group" || defaultParentType === "sidechat") return "sidechat";
        return "channel";
    };

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [icon, setIcon] = useState("");
    const [type, setType] = useState<ChannelType>(getInitialType);
    const [parentId, setParentId] = useState<Id<"chatChannels"> | "">(defaultParentId ?? "");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const allChannels = channelTree ? flattenTree(channelTree as FlatChannel[]) : [];

    const parentOptions = allChannels.filter((c) => {
        if (type === "channel") return false;
        if (type === "subchannel") return c.type === "channel";
        if (type === "group") return c.type === "subchannel";
        if (type === "sidechat") return ["channel", "subchannel", "group"].includes(c.type);
        return false;
    });

    const needsParent = type !== "channel";

    const handleTypeChange = (newType: ChannelType) => {
        setType(newType);
        // Recompute valid parents for newType to avoid stale-closure check
        const nextParentOptions = allChannels.filter((c) => {
            if (newType === "channel") return false;
            if (newType === "subchannel") return c.type === "channel";
            if (newType === "group") return c.type === "subchannel";
            if (newType === "sidechat") return ["channel", "subchannel", "group"].includes(c.type);
            return false;
        });
        const stillValid = defaultParentId
            ? nextParentOptions.some((c) => c._id === defaultParentId)
            : false;
        if (!stillValid) setParentId("");
    };

    const handleNameInput = (raw: string) => {
        // Channel names: lowercase, spaces → hyphens, no special chars
        setName(raw.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, ""));
    };

    const handleSubmit = async () => {
        if (!name.trim()) { setError("Name is required"); return; }
        if (needsParent && !parentId) { setError("Please select a parent channel"); return; }

        setSubmitting(true);
        setError(null);
        try {
            await createChannel({
                name: name.trim(),
                description: description.trim() || undefined,
                type,
                parentId: parentId || undefined,
                icon: icon.trim() || undefined,
            });
            onClose();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Failed to create channel");
        } finally {
            setSubmitting(false);
        }
    };

    const availableTypes: ChannelType[] = isManager
        ? ["channel", "subchannel", "group", "sidechat"]
        : ["sidechat"];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-brand-blueDark/40 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="w-full max-w-md mx-4 bg-white border-2 border-brand-blueDark/15 rounded-tl-2xl rounded-br-2xl shadow-[6px_6px_0px_0px_rgba(10,22,48,0.12)]">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b-2 border-brand-blueDark/8">
                    <h2 className="text-sm font-bold text-brand-blueDark">Create Channel</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-brand-blueDark/40 hover:text-brand-blueDark hover:bg-brand-bgLight transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    {/* Type selector */}
                    <div>
                        <label className="block text-[11px] font-bold text-brand-blueDark/50 uppercase tracking-wider mb-1.5">
                            Type
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                            {availableTypes.map((t) => (
                                <button
                                    key={t}
                                    onClick={() => handleTypeChange(t)}
                                    className={`px-3 py-2 rounded-lg border-2 text-left transition-all ${
                                        type === t
                                            ? "border-brand-blue bg-brand-blue/5 text-brand-blueDark"
                                            : "border-brand-blueDark/10 text-brand-blueDark/50 hover:border-brand-blue/30"
                                    }`}
                                >
                                    <div className="text-xs font-semibold">{TYPE_LABELS[t]}</div>
                                    <div className="text-[10px] text-brand-blueDark/40 mt-0.5 leading-tight">
                                        {TYPE_DESCRIPTIONS[t]}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Parent picker */}
                    {needsParent && (
                        <div>
                            <label className="block text-[11px] font-bold text-brand-blueDark/50 uppercase tracking-wider mb-1.5">
                                Parent <span className="text-brand-blue">*</span>
                            </label>
                            {channelTree === undefined ? (
                                <div className="h-9 bg-brand-blueDark/5 rounded-lg animate-pulse" />
                            ) : parentOptions.length === 0 ? (
                                <p className="text-xs text-brand-blueDark/40 italic py-1">
                                    No valid parent channels exist yet. Create a{" "}
                                    {type === "group" ? "sub-channel" : "channel"} first.
                                </p>
                            ) : (
                                <select
                                    value={parentId}
                                    onChange={(e) =>
                                        setParentId(e.target.value as Id<"chatChannels"> | "")
                                    }
                                    className="w-full text-sm px-3 py-2 border-2 border-brand-blueDark/10 rounded-lg outline-none focus:border-brand-blue/50 text-brand-blueDark bg-white"
                                >
                                    <option value="">Select parent…</option>
                                    {parentOptions.map((c) => (
                                        <option key={c._id} value={c._id}>
                                            {c.icon ? `${c.icon} ` : "# "}
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <label className="block text-[11px] font-bold text-brand-blueDark/50 uppercase tracking-wider mb-1.5">
                            Name <span className="text-brand-blue">*</span>
                        </label>
                        <div className="relative">
                            <Hash
                                size={13}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-blueDark/30 pointer-events-none"
                            />
                            <input
                                autoFocus
                                value={name}
                                onChange={(e) => handleNameInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSubmit();
                                    if (e.key === "Escape") onClose();
                                }}
                                placeholder="channel-name"
                                className="w-full pl-8 pr-3 py-2 text-sm border-2 border-brand-blueDark/10 rounded-lg outline-none focus:border-brand-blue/50 text-brand-blueDark"
                            />
                        </div>
                    </div>

                    {/* Icon */}
                    <div>
                        <label className="block text-[11px] font-bold text-brand-blueDark/50 uppercase tracking-wider mb-1.5">
                            Icon{" "}
                            <span className="text-brand-blueDark/30 font-normal normal-case">
                                (optional emoji)
                            </span>
                        </label>
                        <input
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            placeholder="🔵"
                            maxLength={4}
                            className="w-20 text-center text-lg px-3 py-1.5 border-2 border-brand-blueDark/10 rounded-lg outline-none focus:border-brand-blue/50"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-[11px] font-bold text-brand-blueDark/50 uppercase tracking-wider mb-1.5">
                            Description{" "}
                            <span className="text-brand-blueDark/30 font-normal normal-case">
                                (optional)
                            </span>
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What's this channel about?"
                            rows={2}
                            className="w-full px-3 py-2 text-sm border-2 border-brand-blueDark/10 rounded-lg outline-none focus:border-brand-blue/50 text-brand-blueDark resize-none"
                        />
                    </div>

                    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
                </div>

                {/* Footer */}
                <div className="flex gap-2 px-5 pb-5">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 text-xs font-bold text-brand-blueDark/50 hover:text-brand-blueDark border-2 border-brand-blueDark/10 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !name.trim() || (needsParent && !parentId)}
                        className="flex-1 py-2 text-xs font-bold bg-brand-blueDark text-white rounded-lg hover:bg-brand-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? "Creating…" : "Create"}
                    </button>
                </div>
            </div>
        </div>
    );
}
