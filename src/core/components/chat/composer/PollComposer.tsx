import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useToast } from "../../../providers/ToastProvider";
import { Plus, Trash2, X } from "lucide-react";
import type { Id } from "../../../../../convex/_generated/dataModel";

interface PollComposerProps {
    channelId: Id<"chatChannels">;
    threadRootMessageId?: Id<"chatMessages">;
    onClose: () => void;
}

export function PollComposer({ channelId, threadRootMessageId, onClose }: PollComposerProps) {
    const { toast } = useToast();
    const createPoll = useMutation(api.chatPolls.createPoll);

    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(() => [
        { uid: crypto.randomUUID(), text: "" },
        { uid: crypto.randomUUID(), text: "" },
    ]);
    const [allowMultiple, setAllowMultiple] = useState(false);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const setOption = (uid: string, value: string) => {
        setOptions((prev) => prev.map((o) => (o.uid === uid ? { ...o, text: value } : o)));
    };

    const addOption = () => {
        if (options.length >= 8) return;
        setOptions((prev) => [...prev, { uid: crypto.randomUUID(), text: "" }]);
    };

    const removeOption = (uid: string) => {
        if (options.length <= 2) return;
        setOptions((prev) => prev.filter((o) => o.uid !== uid));
    };

    const handleSubmit = async () => {
        const q = question.trim();
        const validOptions = options.map((o) => o.text.trim()).filter(Boolean);
        if (!q) { toast("Poll question is required", "error"); return; }
        if (validOptions.length < 2) { toast("At least 2 options required", "error"); return; }

        setSubmitting(true);
        try {
            await createPoll({
                channelId,
                threadRootMessageId,
                question: q,
                options: validOptions.map((text, i) => ({ id: String(i + 1), text })),
                allowMultipleVotes: allowMultiple,
                isAnonymous,
            });
            onClose();
        } catch (err: any) {
            toast(err?.message ?? "Failed to create poll", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mb-2 border-2 border-brand-blue/20 rounded-tl-xl rounded-br-xl bg-white overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-brand-blueDark/8 bg-brand-bgLight/60">
                <span className="text-xs font-bold text-brand-blueDark">Create Poll</span>
                <button onClick={onClose} className="p-1 rounded text-brand-blueDark/40 hover:text-brand-blueDark transition-colors">
                    <X size={13} />
                </button>
            </div>

            <div className="p-3 flex flex-col gap-3">
                {/* Question */}
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-blueDark/40 mb-1">
                        Question
                    </label>
                    <input
                        autoFocus
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask a question..."
                        className="w-full text-sm text-brand-blueDark placeholder-brand-blueDark/30 border-2 border-brand-blueDark/12 rounded-tl-lg rounded-br-lg px-3 py-2 outline-none focus:border-brand-blue/40 transition-colors"
                    />
                </div>

                {/* Options */}
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-blueDark/40 mb-1">
                        Options
                    </label>
                    <div className="flex flex-col gap-1.5">
                        {options.map((opt, i) => (
                            <div key={opt.uid} className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-brand-blueDark/30 w-4 text-center flex-shrink-0">
                                    {i + 1}
                                </span>
                                <input
                                    value={opt.text}
                                    onChange={(e) => setOption(opt.uid, e.target.value)}
                                    placeholder={`Option ${i + 1}`}
                                    className="flex-1 text-xs text-brand-blueDark placeholder-brand-blueDark/25 border-2 border-brand-blueDark/10 rounded-lg px-2.5 py-1.5 outline-none focus:border-brand-blue/35 transition-colors"
                                />
                                {options.length > 2 && (
                                    <button
                                        onClick={() => removeOption(opt.uid)}
                                        className="p-1 text-brand-blueDark/25 hover:text-red-500 transition-colors flex-shrink-0"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </div>
                        ))}
                        {options.length < 8 && (
                            <button
                                onClick={addOption}
                                className="flex items-center gap-1.5 text-[11px] font-medium text-brand-blue/60 hover:text-brand-blue transition-colors pl-6 mt-0.5"
                            >
                                <Plus size={12} />
                                Add option
                            </button>
                        )}
                    </div>
                </div>

                {/* Settings */}
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={allowMultiple}
                            onChange={(e) => setAllowMultiple(e.target.checked)}
                            className="rounded"
                        />
                        <span className="text-xs text-brand-blueDark/60">Multiple choices</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                            className="rounded"
                        />
                        <span className="text-xs text-brand-blueDark/60">Anonymous</span>
                    </label>
                </div>

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="self-end flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue text-white text-xs font-bold rounded-tl-lg rounded-br-lg hover:bg-brand-blue/85 transition-colors disabled:opacity-50"
                >
                    {submitting ? "Creating…" : "Create Poll"}
                </button>
            </div>
        </div>
    );
}
