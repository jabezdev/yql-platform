import { Info, Pin, ArrowRight, UserPlus, UserMinus, Hash } from "lucide-react";

interface SystemMessageProps {
    message: { systemType?: string; bodyPlainText: string };
}

const systemIcons: Record<string, React.ReactNode> = {
    member_joined: <UserPlus size={13} />,
    member_added: <UserPlus size={13} />,
    member_left: <UserMinus size={13} />,
    message_pinned: <Pin size={13} />,
    message_unpinned: <Pin size={13} />,
    message_moved_out: <ArrowRight size={13} />,
    message_moved_in: <ArrowRight size={13} />,
    topic_changed: <Hash size={13} />,
};

export function SystemMessage({ message }: SystemMessageProps) {
    const icon = message.systemType ? (systemIcons[message.systemType] ?? <Info size={13} />) : <Info size={13} />;

    return (
        <div className="flex items-center gap-2 py-1 px-4 text-[12px] text-brand-blue/40 font-medium select-none">
            <span className="opacity-60">{icon}</span>
            <span>{message.bodyPlainText}</span>
        </div>
    );
}
