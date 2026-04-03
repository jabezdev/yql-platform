import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";

interface SidebarSearchProps {
    onSearch: (query: string) => void;
    onClose?: () => void;
    isMobile?: boolean;
}

export function SidebarSearch({ onSearch, onClose, isMobile }: SidebarSearchProps) {
    const [query, setQuery] = useState("");

    useEffect(() => {
        const handler = setTimeout(() => {
            onSearch(query);
        }, 300);
        return () => clearTimeout(handler);
    }, [query, onSearch]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                const input = document.getElementById("sidebar-search-input");
                input?.focus();
            }
            if (e.key === "Escape") {
                setQuery("");
                onClose?.();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    return (
        <div className="px-4 py-3 relative group">
            <div className="relative flex items-center">
                <div className="absolute left-3 text-white/30 group-focus-within:text-brand-yellow transition-colors pointer-events-none">
                    <Search size={14} />
                </div>
                <input
                    id="sidebar-search-input"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search"
                    className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 text-white text-[12px] font-medium rounded-tl-lg rounded-br-lg pl-10 pr-10 py-2 transition-all outline-none border-2 border-transparent focus:border-brand-yellow/30 placeholder:text-white/20"
                />
                {query ? (
                    <button 
                        onClick={() => setQuery("")}
                        className="absolute right-3 text-white/30 hover:text-white transition-colors"
                    >
                        <X size={14} />
                    </button>
                ) : !isMobile && (
                    <div className="absolute right-3 flex items-center gap-1 opacity-40 group-focus-within:opacity-0 transition-opacity pointer-events-none">
                        <kbd className="text-[9px] bg-white/10 rounded px-1.5 py-0.5 font-mono text-white lowercase">cmd k</kbd>
                    </div>
                )}
            </div>
        </div>
    );
}
