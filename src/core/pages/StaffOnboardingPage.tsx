import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuthContext } from "../providers/AuthProvider";
import { Button } from "../components/ui/Button";
import { CheckCircle2, ChevronRight, ChevronLeft, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PageHeader } from "../components/ui/PageHeader";

export default function StaffOnboardingPage() {
    const { user } = useAuthContext();
    const modules = useQuery(api.onboarding.getModules);
    const progress = useQuery(api.onboarding.getProgress, user ? { userId: user._id as any } : "skip");
    const markCompletedMutation = useMutation(api.onboarding.markCompleted);

    const [currentIndex, setCurrentIndex] = useState(0);

    if (modules === undefined || progress === undefined) {
        return <div className="p-8">Loading course material...</div>;
    }

    if (modules.length === 0) {
        return (
            <div className="p-8 max-w-4xl mx-auto text-center">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h1 className="text-3xl font-bold mb-2">Welcome to YQL!</h1>
                <p className="text-gray-600">The training modules are still being prepared. Check back later.</p>
            </div>
        );
    }

    const currentModule = modules[currentIndex];
    const isCompleted = progress.some((p: any) => p.moduleId === currentModule._id);

    const handleComplete = async () => {
        if (!user?._id) return;
        await markCompletedMutation({
            userId: user._id as any,
            moduleId: currentModule._id,
        });

        // Auto advance if not the last one
        if (currentIndex < modules.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const overallProgress = Math.round((progress.length / modules.length) * 100);

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <PageHeader
                title="Staff Onboarding"
                subtitle="Complete your training modules to gain full access to YQL systems."
            />

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-1/3 shrink-0">
                    <div className="bg-white border-2 border-brand-blue shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] rounded-tl-2xl rounded-br-2xl p-6 sticky top-8">
                        <h2 className="text-2xl font-display font-extrabold text-brand-blue mb-6">Course Outline</h2>

                        <div className="mb-6">
                            <div className="flex justify-between text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 mb-2">
                                <span>Overall Progress</span>
                                <span>{overallProgress}%</span>
                            </div>
                            <div className="w-full bg-brand-blue/10 rounded-sm h-3 border border-brand-blue/20">
                                <div className="bg-brand-green h-full rounded-sm transition-all duration-500 border border-brand-blue/20 shadow-[2px_2px_0px_0px_rgba(57,103,153,0.1)]" style={{ width: `${overallProgress}%` }}></div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {modules.map((mod: any, idx: number) => {
                                const completed = progress.some((p: any) => p.moduleId === mod._id);
                                const isActive = idx === currentIndex;
                                return (
                                    <button
                                        key={mod._id}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-4 transition-all border-2 ${isActive
                                            ? "bg-brand-yellow/20 border-brand-blue shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] text-brand-blue hover:-translate-y-0.5 hover:shadow-[2px_4px_0px_0px_rgba(57,103,153,0.5)]"
                                            : "bg-white hover:bg-brand-bgLight/50 border-brand-blue/10 text-brand-darkBlue hover:border-brand-blue/30"
                                            }`}
                                    >
                                        {completed ? (
                                            <div className="w-6 h-6 rounded bg-brand-green/20 border border-brand-green flex items-center justify-center shrink-0">
                                                <CheckCircle2 className="w-4 h-4 text-brand-green" />
                                            </div>
                                        ) : (
                                            <div className={`w-6 h-6 rounded border-2 shrink-0 ${isActive ? 'border-brand-blue' : 'border-brand-blue/20'}`} />
                                        )}
                                        <div className="overflow-hidden flex-1">
                                            <p className="font-bold text-sm truncate">{mod.title}</p>
                                            {mod.isRequired && <p className="text-[10px] text-brand-red mt-0.5 font-extrabold uppercase tracking-widest">Required</p>}
                                        </div>
                                        {isActive && <ChevronRight className="w-4 h-4 text-brand-blue opacity-50 shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 w-full min-w-0">
                    <div className="bg-white border-2 border-brand-blue shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] rounded-tl-2xl rounded-br-2xl p-8 lg:p-12">
                        <div className="mb-10">
                            <div className="flex items-center gap-2 text-[10px] text-brand-blue/50 font-extrabold mb-3 uppercase tracking-widest bg-brand-bgLight/50 px-3 py-1 rounded-sm border border-brand-blue/10 w-fit">
                                Module {currentIndex + 1} of {modules.length}
                            </div>
                            <h1 className="text-5xl font-extrabold font-display text-brand-blue mb-6 leading-tight max-w-3xl">{currentModule.title}</h1>
                            {currentModule.description && (
                                <p className="text-lg text-brand-darkBlue/80 mb-6 border-l-4 border-brand-yellow pl-5 py-2 font-medium bg-brand-yellow/5 rounded-r-lg max-w-3xl leading-relaxed">
                                    {currentModule.description}
                                </p>
                            )}
                        </div>

                        <div className="prose prose-brand max-w-none text-brand-darkBlue/80 prose-headings:font-display prose-headings:text-brand-blue prose-a:text-brand-lightBlue prose-a:font-bold prose-strong:text-brand-blue prose-strong:font-extrabold prose-code:text-brand-red prose-code:bg-brand-bgLight/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:border border-brand-blue/10">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {currentModule.content}
                            </ReactMarkdown>
                        </div>

                        <div className="mt-16 pt-8 border-t-2 border-brand-blue/10 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <Button
                                variant="geometric-secondary"
                                onClick={() => setCurrentIndex(prev => prev - 1)}
                                disabled={currentIndex === 0}
                                className="w-full sm:w-auto flex items-center justify-center py-3 px-6"
                            >
                                <ChevronLeft className="w-5 h-5 mr-2" strokeWidth={3} />
                                Previous
                            </Button>

                            {!isCompleted ? (
                                <Button
                                    onClick={handleComplete}
                                    variant="geometric-primary"
                                    className="w-full sm:w-auto flex items-center justify-center py-3 px-8 text-lg"
                                >
                                    <CheckCircle2 className="w-5 h-5 mr-2" strokeWidth={3} />
                                    Mark as Completed
                                </Button>
                            ) : currentIndex < modules.length - 1 ? (
                                <Button
                                    variant="geometric-primary"
                                    onClick={() => setCurrentIndex(prev => prev + 1)}
                                    className="w-full sm:w-auto flex items-center justify-center py-3 px-8 text-lg"
                                >
                                    Next Module
                                    <ChevronRight className="w-5 h-5 ml-2" strokeWidth={3} />
                                </Button>
                            ) : (
                                <div className="text-brand-green font-bold flex items-center bg-brand-green/10 px-6 py-3 rounded-lg border-2 border-brand-green/20">
                                    <CheckCircle2 className="w-5 h-5 mr-2" />
                                    Course Completed!
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
