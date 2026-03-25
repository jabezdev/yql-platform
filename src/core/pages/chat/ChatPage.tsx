import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ConversationView } from "../../components/chat/conversation/ConversationView";

export default function ChatPage() {
    const { channelId } = useParams();
    const navigate = useNavigate();

    // If no channel selected, try to redirect to first available channel
    const channelTree = useQuery(api.chatChannels.getChannelTree, {});

    useEffect(() => {
        if (!channelId && channelTree && channelTree.length > 0) {
            navigate(`/chat/${channelTree[0]._id}`, { replace: true });
        }
    }, [channelId, channelTree, navigate]);

    return <ConversationView />;
}
