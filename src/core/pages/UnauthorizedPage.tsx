import { ShieldAlert, Home, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen bg-brand-bgLight flex items-center justify-center p-4 font-sans text-brand-blueDark">
            <div className="max-w-xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-300">
                {/* Visual Icon */}
                <div className="relative mx-auto w-32 h-32">
                    <div className="absolute inset-0 bg-brand-red/10 rounded-tl-3xl rounded-br-3xl rotate-6 animate-pulse" />
                    <div className="absolute inset-0 bg-brand-yellow/20 rounded-tl-3xl rounded-br-3xl -rotate-6" />
                    <div className="relative z-10 w-full h-full bg-white border-4 border-brand-blueDark rounded-tl-3xl rounded-br-3xl shadow-[8px_8px_0px_0px_rgba(10,22,48,0.3)] flex items-center justify-center">
                        <ShieldAlert size={64} className="text-brand-red" strokeWidth={2.5} />
                    </div>
                </div>

                {/* Text Content */}
                <div className="space-y-4">
                    <h1 className="text-5xl font-display font-extrabold leading-tight tracking-tight">
                        Access <span className="text-brand-red">Denied</span>
                    </h1>
                    <p className="text-xl font-medium text-brand-darkBlue/70 max-w-md mx-auto">
                        You've reached a high-security sector of the YQL platform that is restricted for your current clearance level.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <Button
                        onClick={() => window.history.back()}
                        variant="geometric-secondary"
                        className="w-full sm:w-auto px-8 py-4 flex items-center gap-2"
                    >
                        <ChevronLeft size={20} strokeWidth={3} /> Go Back
                    </Button>
                    <Link to="/dashboard" className="w-full sm:w-auto">
                        <Button
                            variant="geometric-primary"
                            className="w-full px-8 py-4 flex items-center gap-2 justify-center"
                        >
                            <Home size={20} strokeWidth={2.5} /> Return Home
                        </Button>
                    </Link>
                </div>

                {/* Decorative Elements */}
                <div className="pt-12 flex justify-center gap-6 opacity-20">
                    <div className="w-8 h-8 rounded-full border-4 border-brand-blueDark" />
                    <div className="w-8 h-8 rotate-45 border-4 border-brand-blueDark" />
                    <div className="w-8 h-8 rounded-tl-lg rounded-br-lg border-4 border-brand-blueDark" />
                </div>
            </div>
        </div>
    );
}
