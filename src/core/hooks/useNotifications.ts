import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

type Permission = NotificationPermission | "unsupported";

/** Manages browser notification permission and shows notifications for new chat mentions. */
export function useNotifications() {
    const [permission, setPermission] = useState<Permission>(() => {
        if (typeof Notification === "undefined") return "unsupported";
        return Notification.permission;
    });

    const requestPermission = useCallback(async () => {
        if (typeof Notification === "undefined") return;
        const result = await Notification.requestPermission();
        setPermission(result);
    }, []);

    const notify = useCallback((title: string, body: string, options?: NotificationOptions) => {
        if (permission !== "granted") return;
        // Don't notify if the tab is focused — user can already see it.
        if (!document.hidden) return;
        const n = new Notification(title, {
            body,
            icon: "/YQL_LOGO.svg",
            badge: "/YQL_LOGO.svg",
            ...options,
        });
        // Auto-close after 6 s
        setTimeout(() => n.close(), 6000);
        return n;
    }, [permission]);

    return { permission, requestPermission, notify };
}

/** Watches chatNotifications from Convex and fires browser notifications for new ones. */
export function useChatNotificationWatcher() {
    const { permission, requestPermission, notify } = useNotifications();
    const notifications = useQuery(api.chatMessages.listMyNotifications);
    const seenIds = useRef(new Set<string>());

    // Auto-request permission once when this hook first mounts (in chat).
    useEffect(() => {
        if (permission === "default") {
            requestPermission();
        }
    }, [permission, requestPermission]);

    useEffect(() => {
        if (!notifications) return;

        for (const n of notifications) {
            if (seenIds.current.has(n._id)) continue;
            seenIds.current.add(n._id);

            // Skip notifications the user has already read
            if (n.isRead) continue;

            const senderName = (n as any).senderName ?? "Someone";
            const channelName = (n as any).channelName ?? "a channel";
            notify(
                `${senderName} mentioned you`,
                `In #${channelName}`,
                { tag: n._id }, // de-duplicates native notifications with the same tag
            );
        }
    }, [notifications, notify]);

    return { permission, requestPermission };
}
