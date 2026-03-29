import { useState } from "react";
import { Loader2 } from "lucide-react";

interface PdfViewerProps {
    url: string;
    title?: string;
    className?: string;
}

export default function PdfViewer({ url, title = "PDF Document", className = "" }: PdfViewerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    return (
        <div className={`relative flex flex-col w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200 ${className}`} style={{ minHeight: "500px" }}>
            {/* Header / Title bar */}
            <div className="bg-gray-800 text-white px-4 py-2 text-sm flex justify-between items-center rounded-t-lg z-10">
                <span className="font-medium truncate">{title}</span>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition-colors"
                    title="Open in new tab"
                >
                    Open
                </a>
            </div>

            {/* Loading State */}
            {isLoading && !hasError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-0">
                    <Loader2 className="animate-spin text-brand-lightBlue mb-4" size={32} />
                    <p className="text-gray-500 font-medium">Loading Document...</p>
                </div>
            )}

            {/* Error State */}
            {hasError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-0">
                    <p className="text-gray-500 font-medium mb-2">Failed to load document.</p>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-brand-lightBlue hover:underline">
                        Try opening directly
                    </a>
                </div>
            )}

            {/* PDF Embed */}
            <iframe
                src={`${url}#view=FitH`}
                title={title}
                className="w-full flex-grow border-0 rounded-b-lg z-0"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    setIsLoading(false);
                    setHasError(true);
                }}
            />
        </div>
    );
}
