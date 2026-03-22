import { ChannelTreeItem, type ChannelNode } from "./ChannelTreeItem";
import type { Id } from "../../../../../convex/_generated/dataModel";

interface ChannelTreeProps {
    channelTree: ChannelNode[] | undefined;
    unreadCounts: Record<string, number>;
    filterText?: string;
    onCreateChild: (parentId: Id<"chatChannels">, parentType: string) => void;
    onCreateRoot: () => void;
}

function flattenAndFilter(nodes: ChannelNode[], filterText: string): ChannelNode[] {
    const results: ChannelNode[] = [];
    for (const node of nodes) {
        if (node.name.toLowerCase().includes(filterText.toLowerCase())) {
            // Show match without children so tree stays flat in search results
            results.push({ ...node, children: [] });
        }
        results.push(...flattenAndFilter(node.children, filterText));
    }
    return results;
}

export function ChannelTree({
    channelTree,
    unreadCounts,
    filterText = "",
    onCreateChild,
    onCreateRoot,
}: ChannelTreeProps) {
    if (channelTree === undefined) {
        return (
            <div className="space-y-1 px-2">
                {[68, 82, 55, 74].map((w, i) => (
                    <div
                        key={i}
                        className="h-7 bg-brand-blue/5 rounded-lg animate-pulse"
                        style={{ width: `${w}%` }}
                    />
                ))}
            </div>
        );
    }

    const isFiltering = filterText.trim().length > 0;
    const displayNodes = isFiltering
        ? flattenAndFilter(channelTree, filterText.trim())
        : channelTree;

    if (displayNodes.length === 0) {
        if (isFiltering) {
            return (
                <p className="text-xs text-brand-blue/30 text-center py-4 px-3 italic">
                    No channels match &ldquo;{filterText}&rdquo;
                </p>
            );
        }
        return (
            <p className="text-xs text-brand-blue/30 text-center py-6 font-medium px-3">
                No channels yet.{" "}
                <button onClick={onCreateRoot} className="text-brand-lightBlue hover:underline">
                    Create one
                </button>
            </p>
        );
    }

    return (
        <div className="space-y-0.5 px-1">
            {displayNodes.map((node) => (
                <ChannelTreeItem
                    key={node._id}
                    node={node}
                    unreadCounts={unreadCounts}
                    onCreateChild={isFiltering ? undefined : onCreateChild}
                />
            ))}
        </div>
    );
}
