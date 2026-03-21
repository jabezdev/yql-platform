import { MessageComposer } from "../composer/MessageComposer";
import type { Id } from "../../../../../convex/_generated/dataModel";

interface ThreadComposerProps {
    channelId: Id<"chatChannels">;
    rootMessageId: Id<"chatMessages">;
}

export function ThreadComposer({ channelId, rootMessageId }: ThreadComposerProps) {
    return (
        <MessageComposer
            channelId={channelId}
            threadRootMessageId={rootMessageId}
            placeholder="Reply in thread..."
        />
    );
}
