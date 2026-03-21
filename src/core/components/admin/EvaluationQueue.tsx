import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { UserProfile } from "../../providers/AuthProvider";
import { useToast } from "../../providers/ToastProvider";
import { Button } from "../ui/Button";
import { CheckSquare, Star, FileText, MessageSquare, User as UserIcon, CalendarDays } from "lucide-react";

interface Props {
    user: UserProfile;
    onOpenAvailability: () => void;
}

export function EvaluationQueue({ user, onOpenAvailability }: Props) {
    const { toast } = useToast();
    const expandedApps = useQuery(api.applications.getExpandedApplicationsForReviewer, { reviewerId: user._id as Id<"users"> }) ?? [];
    const [selectedAppId, setSelectedAppId] = useState<Id<"applications"> | null>(null);
    const selectedApp = expandedApps.find(app => app._id === selectedAppId);

    const form = useQuery(api.forms.getFormForCohort, selectedApp ? { cohortId: selectedApp.cohortId } : "skip");
    const formResponse = useQuery(
        api.forms.getResponseForApplication,
        selectedApp && form ? { applicationId: selectedApp._id, formId: form._id } : "skip"
    );
    const rubric = useQuery(api.scoring.getRubric, selectedApp ? { cohortId: selectedApp.cohortId, round: selectedApp.status as any } : "skip");

    const [scores, setScores] = useState<Record<string, number>>({});
    const [feedback, setFeedback] = useState("");
    const saveEvaluation = useMutation(api.scoring.saveEvaluation);

    const handleSubmitEvaluation = async () => {
        if (!selectedApp) return;
        const scoreArray = Object.entries(scores).map(([criterionName, score]) => ({ criterionName, score }));
        try {
            await saveEvaluation({
                applicationId: selectedApp._id,
                reviewerId: user._id as Id<"users">,
                round: selectedApp.status as any,
                scores: scoreArray,
                feedback,
            });
            toast("Evaluation saved successfully.", "success");
            setScores({});
            setFeedback("");
            setSelectedAppId(null);
        } catch {
            toast("Failed to save evaluation.", "error");
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6 min-h-0">
                {/* Queue Sidebar */}
                <div className="md:col-span-1 bg-white border-2 border-brand-blueDark shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] rounded-tl-2xl rounded-br-2xl flex flex-col min-h-0 overflow-hidden">
                    <div className="p-4 border-b-2 border-brand-blueDark bg-brand-bgLight flex items-center justify-between shrink-0">
                        <span className="font-extrabold text-brand-blueDark text-sm tracking-wide uppercase flex items-center gap-2">
                            <CheckSquare size={14} /> Queue
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onOpenAvailability}
                                className="p-1.5 bg-brand-bgLight border-2 border-brand-blueDark rounded-lg text-brand-blueDark hover:bg-brand-blueDark hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)]"
                                title="Manage Availability"
                            >
                                <CalendarDays size={16} />
                            </button>
                            <span className="bg-brand-blueDark text-white text-xs font-bold px-2 py-0.5 border border-brand-blueDark shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] rounded-sm min-w-[24px] text-center">
                                {expandedApps.length}
                            </span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                        {expandedApps.length === 0 && (
                            <p className="p-4 text-sm text-center text-brand-blueDark/50 italic font-medium">Queue is empty.</p>
                        )}
                        {expandedApps.map(app => (
                            <button
                                key={app._id}
                                onClick={() => { setSelectedAppId(app._id); setScores({}); setFeedback(""); }}
                                className={`w-full text-left p-3 rounded-tl-lg rounded-br-lg border-2 transition-all ${selectedAppId === app._id
                                    ? "bg-brand-bgLight border-brand-blueDark shadow-[2px_2px_0px_0px_rgba(10,22,48,0.35)]"
                                    : "bg-white border-transparent hover:border-brand-blueDark/30 hover:bg-brand-bgLight/50"
                                    }`}
                            >
                                <div className="font-bold text-brand-blueDark truncate">{app.user?.name ?? "Unknown Applicant"}</div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-xs text-brand-darkBlue/70 font-medium truncate">{app.user?.email}</span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-brand-yellow/20 text-brand-blueDark uppercase border border-brand-blueDark/30">
                                        {app.status.replace("round", "R")}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Candidate Review Panel */}
                <div className="md:col-span-3 bg-white border-2 border-brand-blueDark shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] rounded-tl-2xl rounded-br-2xl flex flex-col min-h-0 overflow-hidden">
                    {!selectedApp ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-brand-darkBlue/50 p-8">
                            <div className="w-20 h-20 bg-brand-bgLight border-2 border-brand-blueDark rounded-tl-2xl rounded-br-2xl flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(57,103,153,0.1)]">
                                <UserIcon size={40} className="text-brand-blueDark/50" />
                            </div>
                            <h3 className="text-2xl font-display font-extrabold text-brand-blueDark mb-2">Select a Candidate</h3>
                            <p className="text-sm font-medium">Choose an applicant from the queue to begin your evaluation.</p>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col min-h-0">
                            {/* Candidate Header */}
                            <div className="p-6 border-b-2 border-brand-blueDark flex justify-between items-center bg-brand-bgLight shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white border-2 border-brand-blueDark rounded-tl-xl rounded-br-xl flex items-center justify-center text-xl font-extrabold text-brand-blueDark shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)]">
                                        {selectedApp.user?.name.charAt(0) ?? "U"}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-display font-extrabold text-brand-blueDark">{selectedApp.user?.name}</h2>
                                        <p className="text-brand-darkBlue/70 text-sm font-medium mt-0.5">{selectedApp.user?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/50">Current Phase</span>
                                    <span className="inline-flex items-center px-3 py-1 bg-brand-yellow/20 text-brand-blueDark rounded-sm text-sm font-bold border border-brand-blueDark/30 shadow-[2px_2px_0px_0px_rgba(57,103,153,0.1)]">
                                        {selectedApp.status.replace("round", "Round ")}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white custom-scrollbar">
                                {/* Application Materials */}
                                <div className="space-y-8 pr-4">
                                    <section>
                                        <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/50 mb-4 flex items-center gap-2">
                                            <FileText size={16} className="text-brand-blue" /> Application Materials
                                        </h3>
                                        <div className="bg-brand-bgLight border-2 border-brand-blueDark/20 rounded-tl-xl rounded-br-xl p-5 text-sm text-brand-blueDark space-y-5">
                                            {!formResponse ? (
                                                <p className="italic text-brand-darkBlue/50 font-medium">No form responses found.</p>
                                            ) : (
                                                form?.fields.map((field: any) => {
                                                    const answer = formResponse.responses.find((r: any) => r.fieldId === field.id);
                                                    return (
                                                        <div key={field.id}>
                                                            <div className="font-bold text-brand-blueDark mb-1">{field.label}</div>
                                                            <div className="text-brand-darkBlue/80 font-medium bg-white p-3 rounded-lg border border-brand-blueDark/10 whitespace-pre-wrap">
                                                                {answer?.value
                                                                    ? Array.isArray(answer.value) ? answer.value.join(", ") : answer.value
                                                                    : "No answer provided"}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </section>
                                    <section>
                                        <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/50 mb-4 flex items-center gap-2">
                                            <MessageSquare size={16} className="text-brand-blue" /> Attached Notes
                                        </h3>
                                        <div className="bg-brand-blue/5 border-2 border-brand-blue/20 rounded-tl-xl rounded-br-xl p-5 text-sm text-brand-darkBlue/70 font-medium">
                                            <p className="italic">Standard notes from previous rounds will appear here.</p>
                                        </div>
                                    </section>
                                </div>

                                {/* Scoring Rubric */}
                                <div className="pl-4 lg:border-l-2 border-brand-blueDark/10">
                                    <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/50 mb-4 flex items-center gap-2">
                                        <Star size={16} className="text-brand-yellow" /> Evaluation Matrix
                                    </h3>
                                    <div className="bg-white border-2 border-brand-blueDark rounded-tl-xl rounded-br-xl p-6 shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)]">
                                        {!rubric ? (
                                            <p className="text-sm text-brand-darkBlue/50 font-medium italic text-center py-8">
                                                No scoring rubric configured for this round.
                                            </p>
                                        ) : (
                                            <div className="space-y-6">
                                                {rubric.criteria.map((criterion: any) => (
                                                    <div key={criterion.name}>
                                                        <div className="flex justify-between items-center mb-2">
                                                            <label className="text-sm font-bold text-brand-blueDark">{criterion.name}</label>
                                                            <span className="text-[10px] text-brand-blueDark font-extrabold bg-brand-yellow/20 border border-brand-yellow/30 px-2 py-0.5 rounded-sm uppercase">Max: {criterion.maxScore}</span>
                                                        </div>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            max={criterion.maxScore}
                                                            className="w-full p-2.5 bg-brand-bgLight/50 border-2 border-brand-blueDark/20 rounded-lg focus:border-brand-blueDark focus:shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] focus:bg-white transition-all outline-none font-bold text-brand-blueDark"
                                                            placeholder="Enter score..."
                                                            value={scores[criterion.name] ?? ""}
                                                            onChange={e => setScores(prev => ({ ...prev, [criterion.name]: Number(e.target.value) }))}
                                                        />
                                                    </div>
                                                ))}
                                                <div className="pt-4 border-t-2 border-brand-blueDark/10">
                                                    <label className="block text-sm font-bold text-brand-blueDark mb-2">Qualitative Feedback</label>
                                                    <textarea
                                                        className="w-full p-3 bg-brand-bgLight/50 border-2 border-brand-blueDark/20 rounded-lg h-32 focus:border-brand-blueDark focus:shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] focus:bg-white transition-all outline-none resize-none font-medium text-brand-blueDark"
                                                        placeholder="Provide detailed constructive feedback..."
                                                        value={feedback}
                                                        onChange={e => setFeedback(e.target.value)}
                                                    />
                                                </div>
                                                <Button
                                                    onClick={handleSubmitEvaluation}
                                                    variant="geometric-primary"
                                                    className="w-full py-3 flex items-center justify-center gap-2 mt-4"
                                                >
                                                    <Star size={18} className="text-brand-yellow" /> Commit Evaluation
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
