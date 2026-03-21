import { createContext, useContext, useState, useCallback } from "react";
import type { Id } from "../../../convex/_generated/dataModel";

/* eslint-disable react-refresh/only-export-components */

export type RightPanel = "thread" | "members" | "search" | "pins" | "bookmarks" | "settings" | null;
export type MobileView = "sidebar" | "conversation" | "panel";

interface ChatContextType {
    activeChannelId: Id<"chatChannels"> | null;
    setActiveChannelId: (id: Id<"chatChannels"> | null) => void;
    rightPanel: RightPanel;
    setRightPanel: (panel: RightPanel) => void;
    toggleRightPanel: (panel: RightPanel) => void;
    activeThreadMessageId: Id<"chatMessages"> | null;
    openThread: (messageId: Id<"chatMessages">) => void;
    closeThread: () => void;
    sidebarTab: "channels" | "direct";
    setSidebarTab: (tab: "channels" | "direct") => void;
    mobileView: MobileView;
    setMobileView: (view: MobileView) => void;
}

const ChatContext = createContext<ChatContextType>({
    activeChannelId: null,
    setActiveChannelId: () => {},
    rightPanel: null,
    setRightPanel: () => {},
    toggleRightPanel: () => {},
    activeThreadMessageId: null,
    openThread: () => {},
    closeThread: () => {},
    sidebarTab: "channels",
    setSidebarTab: () => {},
    mobileView: "sidebar",
    setMobileView: () => {},
});

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [activeChannelId, setActiveChannelId] = useState<Id<"chatChannels"> | null>(null);
    const [rightPanel, setRightPanelRaw] = useState<RightPanel>(null);
    const [activeThreadMessageId, setActiveThreadMessageId] = useState<Id<"chatMessages"> | null>(null);
    const [sidebarTab, setSidebarTab] = useState<"channels" | "direct">("channels");
    const [mobileView, setMobileView] = useState<MobileView>("sidebar");

    // Wraps raw setter so mobileView stays in sync on all devices.
    const setRightPanel = useCallback((panel: RightPanel) => {
        setRightPanelRaw(panel);
        setMobileView(panel ? "panel" : "conversation");
    }, []);

    const toggleRightPanel = useCallback((panel: RightPanel) => {
        setRightPanelRaw((prev) => {
            const next = prev === panel ? null : panel;
            setMobileView(next ? "panel" : "conversation");
            if (next !== "thread") setActiveThreadMessageId(null);
            return next;
        });
    }, []);

    const openThread = useCallback((messageId: Id<"chatMessages">) => {
        setActiveThreadMessageId(messageId);
        setRightPanelRaw("thread");
        setMobileView("panel");
    }, []);

    const closeThread = useCallback(() => {
        setActiveThreadMessageId(null);
        setRightPanelRaw(null);
        setMobileView("conversation");
    }, []);

    return (
        <ChatContext.Provider
            value={{
                activeChannelId,
                setActiveChannelId,
                rightPanel,
                setRightPanel,
                toggleRightPanel,
                activeThreadMessageId,
                openThread,
                closeThread,
                sidebarTab,
                setSidebarTab,
                mobileView,
                setMobileView,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}

export function useChatContext() {
    return useContext(ChatContext);
}
