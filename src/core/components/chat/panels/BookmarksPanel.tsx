import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useToast } from "../../../providers/ToastProvider";
import { format } from "date-fns";
import { Bookmark, Hash, Trash2 } from "lucide-react";
import { MessageBody } from "../conversation/MessageBody";
import type { Id } from "../../../../../convex/_generated/dataModel";

export function BookmarksPanel() {
    const { toast } = useToast();
    const bookmarks = useQuery(api.chatBookmarks.listBookmarks);
    const removeBookmark = useMutation(api.chatBookmarks.removeBookmark);

    const handleRemove = async (bookmarkId: Id<"chatBookmarks">) => {
        try {
            await removeBookmark({ bookmarkId });
        } catch (err: any) {
            toast(err?.message ?? "Failed to remove bookmark", "error");
        }
    };

    if (!bookmarks) {
        return (
            <div className="flex-1 flex items-center justify-center text-brand-blueDark/25 text-sm">
                Loading…
            </div>
        );
    }

    if (bookmarks.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-brand-blueDark/25 p-6">
                <Bookmark size={28} strokeWidth={1.5} />
                <p className="text-sm font-medium">No bookmarks yet</p>
                <p className="text-xs text-center">Bookmark messages to find them quickly here.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="flex flex-col divide-y-2 divide-brand-blueDark/5">
                {bookmarks.map((b) => (
                    <div key={b._id} className="group px-4 py-3 hover:bg-brand-bgLight/60 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1 text-[10px] text-brand-blueDark/35 font-medium">
                                <Hash size={10} />
                                <span>{b.message.channelName}</span>
                                <span className="mx-0.5 text-brand-blueDark/20">·</span>
                                <span>{b.message.author?.name ?? "Unknown"}</span>
                                <span className="mx-0.5 text-brand-blueDark/20">·</span>
                                <span>{format(new Date(b.message._creationTime), "MMM d, h:mm a")}</span>
                            </div>
                            <button
                                onClick={() => handleRemove(b._id)}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded text-brand-blueDark/30 hover:text-red-500 transition-all"
                                title="Remove bookmark"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                        <MessageBody body={b.message.body} isDeleted={b.message.isDeleted} />
                        {b.note && (
                            <p className="mt-1.5 text-[11px] text-brand-blueDark/45 italic border-l-2 border-brand-blue/20 pl-2">
                                {b.note}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
