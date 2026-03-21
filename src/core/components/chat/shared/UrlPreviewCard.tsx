import { ExternalLink } from "lucide-react";

export interface UrlPreview {
    url: string;
    title?: string;
    description?: string;
    imageUrl?: string;
    siteName?: string;
}

interface UrlPreviewCardProps {
    preview: UrlPreview;
}

export function UrlPreviewCard({ preview }: UrlPreviewCardProps) {
    const domain = (() => {
        try {
            return new URL(preview.url).hostname.replace(/^www\./, "");
        } catch {
            return preview.url;
        }
    })();

    return (
        <a
            href={preview.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-3 mt-2 border-l-[3px] border-brand-blue/40 pl-3 max-w-sm hover:border-brand-blue transition-colors group"
        >
            {preview.imageUrl && (
                <img
                    src={preview.imageUrl}
                    alt={preview.title ?? domain}
                    className="w-14 h-14 object-cover rounded flex-shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
            )}
            <div className="flex-1 min-w-0 py-0.5">
                <p className="text-[10px] font-semibold text-brand-blueDark/40 uppercase tracking-wide flex items-center gap-1">
                    {preview.siteName ?? domain}
                    <ExternalLink size={9} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
                {preview.title && (
                    <p className="text-xs font-bold text-brand-blue truncate mt-0.5">{preview.title}</p>
                )}
                {preview.description && (
                    <p className="text-[11px] text-brand-blueDark/50 line-clamp-2 mt-0.5">
                        {preview.description}
                    </p>
                )}
            </div>
        </a>
    );
}
