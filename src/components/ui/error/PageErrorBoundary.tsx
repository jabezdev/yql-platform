import { Component } from "react";
import type { ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export class PageErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error) {
        console.error("[PageErrorBoundary]", error);
    }

    render() {
        if (!this.state.hasError) return this.props.children;

        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 bg-brand-red/10 rounded-tl-3xl rounded-br-3xl rotate-6 animate-pulse" />
                    <div className="absolute inset-0 bg-brand-yellow/20 rounded-tl-3xl rounded-br-3xl -rotate-3" />
                    <div className="relative z-10 w-full h-full bg-white border-4 border-brand-blue rounded-tl-3xl rounded-br-3xl shadow-[6px_6px_0px_0px_rgba(10,22,48,0.3)] flex items-center justify-center">
                        <AlertTriangle size={44} className="text-brand-red" strokeWidth={2.5} />
                    </div>
                </div>
                <h2 className="text-3xl font-display font-extrabold text-brand-blue mb-2">
                    Something went wrong
                </h2>
                <p className="text-brand-blue/60 font-medium max-w-sm mb-8 leading-relaxed">
                    {this.state.error?.message ?? "An unexpected error occurred while loading this page."}
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="flex items-center gap-2 px-5 py-2.5 bg-brand-bgLight border-2 border-brand-blue font-bold text-brand-blue rounded-tl-xl rounded-br-xl shadow-[3px_3px_0px_0px_rgba(57,103,153,0.3)] hover:-translate-y-0.5 transition-transform text-sm"
                    >
                        <RefreshCw size={16} strokeWidth={2.5} /> Try Again
                    </button>
                    <Link
                        to="/me"
                        className="flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white border-2 border-brand-blue font-bold rounded-tl-xl rounded-br-xl shadow-[3px_3px_0px_0px_rgba(10,22,48,0.45)] hover:-translate-y-0.5 transition-transform text-sm"
                    >
                        <Home size={16} strokeWidth={2.5} /> Go Home
                    </Link>
                </div>
            </div>
        );
    }
}
