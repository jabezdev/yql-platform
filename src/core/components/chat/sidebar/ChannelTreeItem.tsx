import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Hash, ChevronDown, ChevronRight, Plus } from "lucide-react";
import { UnreadBadge } from "../shared/UnreadBadge";
import type { Id } from "../../../../../convex/_generated/dataModel";

export type ChannelNode = {
    _id: Id<"chatChannels">;
    name: string;
    icon?: string;
    type: string;
    children: ChannelNode[];
};

interface ChannelTreeItemProps {
    node: ChannelNode;
    depth?: number;
    unreadCounts: Record<string, number>;
    onCreateChild?: (parentId: Id<"chatChannels">, parentType: string) => void;
}

export function ChannelTreeItem({
    node,
    depth = 0,
    unreadCounts,
    onCreateChild,
}: ChannelTreeItemProps) {
    const { channelId: activeId } = useParams();
    const [expanded, setExpanded] = useState(depth < 2);
    const [showActions, setShowActions] = useState(false);

    const hasChildren = node.children.length > 0;
    const isActive = activeId === node._id;
    const unreadCount = unreadCounts[node._id] ?? 0;
    // sidechats are leaf nodes — no sub-channels can be created under them
    const canHaveChildren = node.type !== "sidechat";

    return (
        <div style={{ paddingLeft: depth > 0 ? `${depth * 12}px` : undefined }}>
            <div
                className="flex items-center gap-0.5 group/item"
                onMouseEnter={() => setShowActions(true)}
                onMouseLeave={() => setShowActions(false)}
            >
                {/* Expand/collapse toggle or spacer */}
                <div className="w-4 flex-shrink-0 flex items-center justify-center">
                    {hasChildren && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="w-4 h-4 flex items-center justify-center text-brand-blueDark/25 hover:text-brand-blueDark/50 transition-colors"
                        >
                            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        </button>
                    )}
                </div>

                {/* Channel link */}
                <Link
                    to={`/chat/${node._id}`}
                    className={`flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all text-xs min-w-0 ${
                        isActive
                            ? "bg-brand-blueDark text-white font-semibold shadow-[1px_1px_0px_0px_rgba(10,22,48,0.3)]"
                            : "text-brand-blueDark/65 hover:bg-brand-blueDark/[0.06] hover:text-brand-blueDark font-medium"
                    }`}
                >
                    <Hash
                        size={11}
                        className={`flex-shrink-0 ${isActive ? "text-brand-yellow" : "text-brand-blueDark/30"}`}
                    />
                    <span className="flex-1 truncate">
                        {node.icon && <span className="mr-0.5">{node.icon}</span>}
                        {node.name}
                    </span>
                    {unreadCount > 0 && !isActive && <UnreadBadge count={unreadCount} />}
                </Link>

                {/* Hover: add-child button (only for T3+ channels via backend, show for all and let backend guard) */}
                {showActions && canHaveChildren && onCreateChild && (
                    <button
                        onClick={() => onCreateChild(node._id, node.type)}
                        title={`Add sub-channel under ${node.name}`}
                        className="w-5 h-5 flex items-center justify-center rounded text-brand-blueDark/25 hover:text-brand-blue hover:bg-brand-blue/[0.08] transition-colors flex-shrink-0"
                    >
                        <Plus size={11} />
                    </button>
                )}
            </div>

            {/* Children */}
            {expanded && hasChildren && (
                <div className="mt-0.5">
                    {node.children.map((child) => (
                        <ChannelTreeItem
                            key={child._id}
                            node={child}
                            depth={depth + 1}
                            unreadCounts={unreadCounts}
                            onCreateChild={onCreateChild}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
