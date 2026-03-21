import { useCallback, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

const DEBOUNCE_MS = 3000; // re-send setTyping every 3s while user is actively typing

export function useTypingIndicator(channelId: Id<"chatChannels">) {
    const setTyping = useMutation(api.chatTyping.setTyping);
    const clearTyping = useMutation(api.chatTyping.clearTyping);

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isTypingRef = useRef(false);
    const lastSentRef = useRef(0);

    const onTyping = useCallback(() => {
        const now = Date.now();

        // Throttle: only send setTyping once every DEBOUNCE_MS
        if (now - lastSentRef.current >= DEBOUNCE_MS) {
            lastSentRef.current = now;
            isTypingRef.current = true;
            setTyping({ channelId }).catch(() => {});
        }

        // Reset the stop-typing timer
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            if (isTypingRef.current) {
                isTypingRef.current = false;
                clearTyping({ channelId }).catch(() => {});
            }
        }, DEBOUNCE_MS + 500);
    }, [channelId, setTyping, clearTyping]);

    const onStop = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (isTypingRef.current) {
            isTypingRef.current = false;
            clearTyping({ channelId }).catch(() => {});
        }
    }, [channelId, clearTyping]);

    // Clear on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (isTypingRef.current) {
                clearTyping({ channelId }).catch(() => {});
            }
        };
    }, [channelId, clearTyping]);

    return { onTyping, onStop };
}
