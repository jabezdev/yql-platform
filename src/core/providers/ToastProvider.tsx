import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

/* eslint-disable react-refresh/only-export-components */

export type ToastType = "success" | "error" | "info";

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

let counter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = useCallback((message: string, type: ToastType = "info") => {
        const id = ++counter;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4500);
    }, []);

    const dismiss = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

    const icons: Record<ToastType, React.ReactNode> = {
        success: <CheckCircle2 size={18} className="text-brand-green shrink-0" strokeWidth={2.5} />,
        error: <XCircle size={18} className="text-brand-red shrink-0" strokeWidth={2.5} />,
        info: <Info size={18} className="text-brand-lightBlue shrink-0" strokeWidth={2.5} />,
    };

    const borderColors: Record<ToastType, string> = {
        success: "border-brand-green/50",
        error: "border-brand-red/50",
        info: "border-brand-blue/20",
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={`pointer-events-auto flex items-center gap-3 bg-white border-2 ${borderColors[t.type]} rounded-tl-xl rounded-br-xl shadow-[4px_4px_0px_0px_rgba(57,103,153,0.25)] px-4 py-3 min-w-[280px] max-w-sm animate-in slide-in-from-right-6 duration-200`}
                    >
                        {icons[t.type]}
                        <span className="flex-1 text-sm font-bold text-brand-blue leading-snug">{t.message}</span>
                        <button
                            onClick={() => dismiss(t.id)}
                            className="p-1 text-brand-blue/30 hover:text-brand-blue transition-colors rounded"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    return useContext(ToastContext);
}
