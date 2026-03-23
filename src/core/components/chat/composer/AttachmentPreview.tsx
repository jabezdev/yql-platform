import { X, FileText, Image } from "lucide-react";

export interface StagedFile {
    uid: string;
    file: File;
    previewUrl?: string; // object URL for images
}

interface AttachmentPreviewProps {
    files: StagedFile[];
    onRemove: (uid: string) => void;
}

export function AttachmentPreview({ files, onRemove }: AttachmentPreviewProps) {
    if (files.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 px-4 pt-2 pb-1">
            {files.map((sf) => {
                const isImage = sf.file.type.startsWith("image/");
                return (
                    <div
                        key={sf.uid}
                        className="group relative flex items-center gap-2 bg-brand-bgLight border-2 border-brand-blue/10 rounded-tl-lg rounded-br-lg overflow-hidden max-w-[200px]"
                    >
                        {isImage && sf.previewUrl ? (
                            <img
                                src={sf.previewUrl}
                                alt={sf.file.name}
                                className="w-14 h-14 object-cover flex-shrink-0"
                            />
                        ) : (
                            <div className="w-10 h-10 flex items-center justify-center bg-brand-blue/5 flex-shrink-0">
                                {isImage ? (
                                    <Image size={18} className="text-brand-lightBlue/60" />
                                ) : (
                                    <FileText size={18} className="text-brand-lightBlue/60" />
                                )}
                            </div>
                        )}
                        <div className="flex-1 min-w-0 pr-6 py-1">
                            <p className="text-[11px] font-medium text-brand-blue truncate">
                                {sf.file.name}
                            </p>
                            <p className="text-[10px] text-brand-blue/35">
                                {(sf.file.size / 1024).toFixed(0)} KB
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => onRemove(sf.uid)}
                            className="absolute top-1 right-1 p-0.5 rounded-tl-md rounded-br-md bg-brand-blue/15 text-brand-blue/60 hover:bg-brand-red/10 hover:text-brand-red transition-colors"
                        >
                            <X size={10} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
