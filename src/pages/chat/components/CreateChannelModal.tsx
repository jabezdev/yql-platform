import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { 
    Modal, 
    Input, 
    Button, 
    Select, 
    Textarea, 
} from "@/design";
import { Hash, MessageSquare } from "lucide-react";
import { useToast } from "../../../providers/ToastProvider";
import { useTheme } from "../../../providers/ThemeProvider";

interface CreateChannelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (channelId: string) => void;
}

export function CreateChannelModal({ isOpen, onClose, onSuccess }: CreateChannelModalProps) {
    const { isDark } = useTheme();
    const { toast } = useToast();
    const createChannel = useMutation(api.chat.channels.createChannel);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<"channel" | "subchannel" | "group" | "sidechat">("channel");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast("Channel name is required", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            const channelId = await createChannel({
                name: name.trim(),
                description: description.trim() || undefined,
                type: type,
                // For simplicity in this UI, we only create top-level channels
                // Sub-channel logic can be expanded later
                isPrivate: false,
            });

            toast(`Channel "#${name}" created successfully`, "success");
            onSuccess?.(channelId);
            handleClose();
        } catch (err: any) {
            toast(err.message || "Failed to create channel", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setName("");
        setDescription("");
        setType("channel");
        onClose();
    };

    return (
        <Modal 
            open={isOpen} 
            onClose={handleClose} 
            title="Create New Channel"
            maxWidth="max-w-md"
            dark={isDark}
        >
            <div className="space-y-6">
                <p className="text-sm text-brand-blue/60 dark:text-white/40 leading-relaxed">
                    Channels are high-bandwidth technical nodes where your team collaborates on specific projects or operations.
                </p>

                <div className="space-y-4">
                    <Input
                        label="Channel Name"
                        placeholder="e.g. quantum-protocol-beta"
                        value={name}
                        onChange={e => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                        required
                        icon={Hash}
                        autoFocus
                        dark={isDark}
                    />

                    <Select
                        label="Channel Type"
                        value={type}
                        onChange={(val: any) => setType(val)}
                        options={[
                            { label: "Public Channel", value: "channel" },
                            { label: "Private Member Group", value: "group" },
                            { label: "Encrypted Sidechat", value: "sidechat" },
                        ]}
                        dark={isDark}
                    />

                    <Textarea
                        label="Description (Optional)"
                        placeholder="What is this channel's primary objective?"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={3}
                        dark={isDark}
                    />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                    <Button 
                        variant="ghost" 
                        onClick={handleClose} 
                        disabled={isSubmitting}
                        className="dark:text-white/60 dark:hover:text-white dark:hover:bg-white/10"
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            "Initializing..."
                        ) : (
                            <>
                                <MessageSquare size={16} className="mr-2" />
                                Initialize Channel
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
