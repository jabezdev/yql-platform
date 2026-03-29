import { Modal } from "@/design";
import { BLOCK_TYPE_META } from "./constants";
import type { BlockType } from "./types";

export function AddBlockPicker({ open, onAdd, onClose }: { open: boolean, onAdd: (type: BlockType) => void; onClose: () => void }) {
    const types: BlockType[] = ["text", "tag", "cta", "bullet", "divider", "stat", "quote-mark", "logo", "bg-rect"];
    return (
        <Modal open={open} onClose={onClose} title="Add Block" maxWidth="max-w-xs">
            <div className="grid grid-cols-3 gap-2">
                {types.map(t => (
                    <button key={t} onClick={() => { onAdd(t); onClose(); }}
                        className="flex flex-col items-center gap-1.5 p-3 border border-brand-blue/12 rounded-tl-lg rounded-br-lg hover:border-brand-lightBlue/50 hover:bg-brand-bgLight/60 transition-all">
                        <span className="text-xl">{BLOCK_TYPE_META[t].icon}</span>
                        <span className="text-[10px] font-semibold text-brand-blue/65">{BLOCK_TYPE_META[t].label}</span>
                    </button>
                ))}
            </div>
        </Modal>
    );
}
