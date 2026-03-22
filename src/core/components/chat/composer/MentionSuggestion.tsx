import {
    forwardRef,
    useImperativeHandle,
    useState,
} from "react";
import { ReactRenderer } from "@tiptap/react";
import type { SuggestionOptions } from "@tiptap/suggestion";

export interface MentionUser {
    _id: string;
    name: string;
    role: string;
}

// ── Dropdown component ────────────────────────────────────────────────────────

interface MentionListProps {
    items: MentionUser[];
    command: (item: { id: string; label: string }) => void;
}

export const MentionList = forwardRef<
    { onKeyDown: (props: { event: KeyboardEvent }) => boolean },
    MentionListProps
>((props, ref) => {
    // Track both selectedIndex and the items reference together so that when
    // Tiptap pushes a new items array we can reset the index in the same render
    // without an effect (React's recommended "adjusting state on prop change" pattern).
    const [{ trackedItems, selectedIndex }, setSelectionState] = useState({
        trackedItems: props.items,
        selectedIndex: 0,
    });

    if (trackedItems !== props.items) {
        setSelectionState({ trackedItems: props.items, selectedIndex: 0 });
    }

    const setSelectedIndex = (updater: number | ((prev: number) => number)) => {
        setSelectionState((prev) => ({
            trackedItems: prev.trackedItems,
            selectedIndex: typeof updater === "function" ? updater(prev.selectedIndex) : updater,
        }));
    };

    const selectItem = (index: number) => {
        const item = props.items[index];
        if (item) {
            props.command({ id: item._id, label: item.name });
        }
    };

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
            if (event.key === "ArrowUp") {
                setSelectedIndex((i) => (i - 1 + props.items.length) % props.items.length);
                return true;
            }
            if (event.key === "ArrowDown") {
                setSelectedIndex((i) => (i + 1) % props.items.length);
                return true;
            }
            if (event.key === "Enter") {
                selectItem(selectedIndex);
                return true;
            }
            return false;
        },
    }));

    if (props.items.length === 0) {
        return (
            <div className="bg-white border-2 border-brand-blue/10 rounded-tl-xl rounded-br-xl shadow-[2px_2px_0px_0px_rgba(10,22,48,0.10)] px-3 py-2 text-xs text-brand-blue/40">
                No members found
            </div>
        );
    }

    return (
        <div className="bg-white border-2 border-brand-blue/10 rounded-tl-xl rounded-br-xl shadow-[2px_2px_0px_0px_rgba(10,22,48,0.10)] overflow-hidden min-w-[160px] max-w-[240px]">
            {props.items.map((item, i) => (
                <button
                    key={item._id}
                    onClick={() => selectItem(i)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${
                        i === selectedIndex
                            ? "bg-brand-lightBlue/8 text-brand-blue"
                            : "text-brand-blue hover:bg-brand-bgLight"
                    }`}
                >
                    <div className="w-5 h-5 rounded-md bg-brand-yellow border border-brand-blue/20 flex items-center justify-center text-[10px] font-bold text-brand-blue flex-shrink-0">
                        {item.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{item.name}</p>
                        <p className="text-[10px] text-brand-blue/40 truncate">{item.role}</p>
                    </div>
                </button>
            ))}
        </div>
    );
});

MentionList.displayName = "MentionList";

// ── Suggestion config factory ─────────────────────────────────────────────────

export function createMentionSuggestion(
    getUsers: () => MentionUser[]
): Partial<SuggestionOptions> {
    return {
        items: ({ query }: { query: string }) => {
            const q = query.toLowerCase();
            return getUsers()
                .filter((u) => u.name.toLowerCase().includes(q))
                .slice(0, 8);
        },

        render: () => {
            let renderer: ReactRenderer<{ onKeyDown: (p: { event: KeyboardEvent }) => boolean }>;
            let container: HTMLDivElement;

            const position = (clientRect: (() => DOMRect | null) | null) => {
                if (!clientRect) return;
                const rect = clientRect();
                if (!rect || !container) return;
                container.style.top = `${rect.bottom + window.scrollY + 4}px`;
                container.style.left = `${rect.left + window.scrollX}px`;
            };

            return {
                onStart: (props) => {
                    container = document.createElement("div");
                    container.style.position = "absolute";
                    container.style.zIndex = "9999";
                    document.body.appendChild(container);

                    renderer = new ReactRenderer(MentionList, {
                        props,
                        editor: props.editor,
                    });
                    container.appendChild(renderer.element);
                    position(props.clientRect ?? null);
                },

                onUpdate: (props) => {
                    renderer.updateProps(props);
                    position(props.clientRect ?? null);
                },

                onKeyDown: (props) => {
                    if (props.event.key === "Escape") {
                        container.remove();
                        return true;
                    }
                    return renderer.ref?.onKeyDown(props) ?? false;
                },

                onExit: () => {
                    renderer.destroy();
                    container.remove();
                },
            };
        },
    };
}
