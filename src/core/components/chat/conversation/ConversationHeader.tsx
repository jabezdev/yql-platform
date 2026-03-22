import { Hash, Users, Pin, Search, Settings, MessageSquare, Bookmark, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useChatContext } from "../../../providers/ChatProvider";
import type { Id } from "../../../../../convex/_generated/dataModel";

interface ConversationHeaderProps {
    channelId: Id<"chatChannels">;
}

export function ConversationHeader({ channelId }: ConversationHeaderProps) {
    const channel = useQuery(api.chatChannels.getChannel, { channelId });
    const { toggleRightPanel, rightPanel } = useChatContext();
    const [showOverflow, setShowOverflow] = useState(false);

    if (!channel) return null;

    const isDM = channel.type === "dm" || channel.type === "group_dm";

    const iconBtn = (
        panel: typeof rightPanel,
        Icon: React.ElementType,
        label: string,
        extraClass = "",
    ) => (
        <button
            title={label}
            onClick={() => { toggleRightPanel(panel); setShowOverflow(false); }}
            className={`p-2 rounded-lg transition-colors ${extraClass} ${
                rightPanel === panel
                    ? "bg-brand-lightBlue/15 text-brand-lightBlue"
                    : "text-brand-blue/40 hover:bg-brand-bgLight hover:text-brand-blue"
            }`}
        >
            <Icon size={16} />
        </button>
    );

    return (
        <div className="flex items-center justify-between px-3 lg:px-4 py-2.5 border-b-2 border-brand-blue/8 bg-white shrink-0 gap-2">
            {/* Left: channel info */}
            <div className="flex items-center gap-2 min-w-0">
                {!isDM ? (
                    <Hash size={16} className="text-brand-blue/40 flex-shrink-0" />
                ) : (
                    <MessageSquare size={16} className="text-brand-blue/40 flex-shrink-0" />
                )}
                <div className="min-w-0">
                    <h2 className="text-sm font-bold text-brand-blue truncate">
                        {channel.icon && <span className="mr-1">{channel.icon}</span>}
                        {channel.name}
                    </h2>
                    {channel.topic && (
                        <p className="hidden sm:block text-[11px] text-brand-blue/45 truncate">
                            {channel.topic}
                        </p>
                    )}
                </div>
                <span className="hidden md:block text-[11px] text-brand-blue/30 font-medium flex-shrink-0">
                    {channel.memberCount} members
                </span>
            </div>

            {/* Right: action buttons */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
                {/* Always visible: Search + Members */}
                {iconBtn("search", Search, "Search messages")}
                {iconBtn("members", Users, "Members")}

                {/* Desktop-only: Pins, Bookmarks, Settings */}
                <div className="hidden sm:flex items-center gap-0.5">
                    {iconBtn("pins", Pin, "Pinned messages")}
                    {iconBtn("bookmarks", Bookmark, "Bookmarks")}
                    {!isDM && iconBtn("settings", Settings, "Channel settings")}
                </div>

                {/* Mobile overflow — Pins / Bookmarks / Settings */}
                <div className="relative sm:hidden">
                    <button
                        title="More options"
                        onClick={() => setShowOverflow((v) => !v)}
                        className={`p-2 rounded-lg transition-colors ${
                            showOverflow
                                ? "bg-brand-lightBlue/15 text-brand-lightBlue"
                                : "text-brand-blue/40 hover:bg-brand-bgLight hover:text-brand-blue"
                        }`}
                    >
                        <MoreHorizontal size={16} />
                    </button>

                    {showOverflow && (
                        <div className="absolute right-0 top-full mt-1 bg-white border-2 border-brand-blue/10 rounded-tl-xl rounded-br-xl shadow-[3px_3px_0px_0px_rgba(10,22,48,0.08)] z-40 py-1 min-w-[160px]">
                            {[
                                { panel: "pins" as const, Icon: Pin, label: "Pinned messages" },
                                { panel: "bookmarks" as const, Icon: Bookmark, label: "Bookmarks" },
                                ...(!isDM ? [{ panel: "settings" as const, Icon: Settings, label: "Channel settings" }] : []),
                            ].map(({ panel, Icon, label }) => (
                                <button
                                    key={panel}
                                    onClick={() => { toggleRightPanel(panel); setShowOverflow(false); }}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                                        rightPanel === panel
                                            ? "text-brand-lightBlue bg-brand-lightBlue/5"
                                            : "text-brand-blue/70 hover:bg-brand-bgLight"
                                    }`}
                                >
                                    <Icon size={14} />
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
