import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useAuthContext } from "../providers/AuthProvider";
import { Star, FileText, User, MessageSquare, CalendarDays, Plus, Trash2, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "../components/ui/Button";

export default function RecruitmentDesk() {
    const { user } = useAuthContext();
    const expandedApps = useQuery(api.applications.getExpandedApplicationsForReviewer, user ? { reviewerId: user._id as Id<"users"> } : "skip") || [];

    const [selectedAppId, setSelectedAppId] = useState<Id<"applications"> | null>(null);
    const selectedApp = expandedApps.find(app => app._id === selectedAppId);

    const form = useQuery(api.forms.getFormForCohort, selectedApp ? { cohortId: selectedApp.cohortId } : "skip");
    const formResponse = useQuery(api.forms.getResponseForApplication,
        selectedApp && form ? { applicationId: selectedApp._id, formId: form._id } : "skip"
    );

    const rubric = useQuery(api.scoring.getRubric, selectedApp ? { cohortId: selectedApp.cohortId, round: selectedApp.status as any } : "skip");
    const evaluations = useQuery(api.scoring.getEvaluations, selectedApp ? { applicationId: selectedApp._id } : "skip");
    const myEvaluation = evaluations?.find(e => e.reviewerId === user?._id && e.round === selectedApp?.status);

    const saveEvaluation = useMutation(api.scoring.saveEvaluation);

    // Form states
    const [scores, setScores] = useState<Record<string, number>>({});
    const [feedback, setFeedback] = useState("");

    // Availability Modal State
    const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
    const availabilities = useQuery(api.interviews.getAvailabilitiesForReviewer, user ? { reviewerId: user._id as Id<"users"> } : "skip") || [];
    const addAvailability = useMutation(api.interviews.addAvailability);
    const removeAvailability = useMutation(api.interviews.removeAvailability);
    const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("10:00");

    useEffect(() => {
        if (myEvaluation) {
            const mappedScores: Record<string, number> = {};
            myEvaluation.scores.forEach(s => mappedScores[s.criterionName] = s.score);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setScores(mappedScores);
            setFeedback(myEvaluation.feedback || "");
        } else {
            setScores({});
            setFeedback("");
        }
    }, [myEvaluation, selectedAppId]);

    const handleScoreChange = (criterion: string, val: string) => {
        setScores(prev => ({ ...prev, [criterion]: Number(val) }));
    };

    const handleSubmit = async () => {
        if (!selectedApp || !user) return;
        const scoreArray = Object.keys(scores).map(key => ({ criterionName: key, score: scores[key] }));

        await saveEvaluation({
            applicationId: selectedApp._id,
            reviewerId: user._id as Id<"users">,
            round: selectedApp.status as any,
            scores: scoreArray,
            feedback
        });
        alert("Evaluation saved successfully!");
    };

    const handleAddSlot = async () => {
        if (!user) return;
        const start = new Date(`${selectedDate}T${startTime}`).getTime();
        const end = new Date(`${selectedDate}T${endTime}`).getTime();
        if (start >= end) { alert("End time must be after start time"); return; }
        try {
            await addAvailability({ reviewerId: user._id as Id<"users">, startTime: start, endTime: end });
        } catch (e) { console.error(e); alert("Failed to add timeslot"); }
    };

    const groupedSlots = availabilities.reduce((acc: any, slot) => {
        const d = format(new Date(slot.startTime), 'yyyy-MM-dd');
        if (!acc[d]) acc[d] = [];
        acc[d].push(slot);
        return acc;
    }, {});

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col relative">
            {/* Header Area */}
            <div className="flex justify-between items-center mb-6 shrink-0 bg-white p-6 border-2 border-brand-blueDark rounded-tl-2xl rounded-br-2xl shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)]">
                <div>
                    <h1 className="text-3xl font-display font-extrabold text-brand-blueDark">
                        Recruitment Desk
                    </h1>
                    <p className="text-brand-darkBlue/70 mt-1 font-medium">Evaluate candidates and manage your schedule</p>
                </div>
                <Button
                    onClick={() => setIsAvailabilityOpen(true)}
                    variant="destructive"
                    className="flex items-center gap-2"
                >
                    <CalendarDays size={18} /> Manage Availability
                </Button>
            </div>

            {/* Main Layout Workspace */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6 min-h-0">
                {/* Left Drawer Queue */}
                <div className="md:col-span-1 bg-white border-2 border-brand-blueDark shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] rounded-tl-2xl rounded-br-2xl flex flex-col min-h-0 overflow-hidden">
                    <div className="p-4 border-b-2 border-brand-blueDark bg-brand-bgLight flex items-center justify-between">
                        <span className="font-extrabold text-brand-blueDark text-sm tracking-wide uppercase">Evaluations Queue</span>
                        <span className="bg-brand-blueDark text-white text-xs font-bold px-2 py-0.5 border border-brand-blueDark shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] rounded-sm min-w-[24px] text-center">{expandedApps.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                        {expandedApps.length === 0 && <p className="p-4 text-sm text-center text-brand-blueDark/50 italic font-medium">Queue is empty.</p>}
                        {expandedApps.map((app) => (
                            <button
                                key={app._id}
                                onClick={() => setSelectedAppId(app._id)}
                                className={`w-full text-left p-3 rounded-tl-lg rounded-br-lg border-2 transition-all ${selectedAppId === app._id
                                    ? "bg-brand-bgLight border-brand-blueDark shadow-[2px_2px_0px_0px_rgba(57,103,153,1)]"
                                    : "bg-white border-transparent hover:border-brand-blueDark/30 hover:bg-brand-bgLight/50"
                                    }`}
                            >
                                <div className="font-bold text-brand-blueDark truncate">{app.user?.name || "Unknown Applicant"}</div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-xs text-brand-darkBlue/70 font-medium truncate">{app.user?.email}</span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-brand-yellow/20 text-brand-blueDark uppercase border border-brand-blueDark/30">
                                        {app.status.replace('round', 'R')}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Candidate Action View */}
                <div className="md:col-span-3 bg-white border-2 border-brand-blueDark shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] rounded-tl-2xl rounded-br-2xl flex flex-col min-h-0 overflow-hidden">
                    {!selectedApp ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-brand-darkBlue/50 p-8 w-full h-full bg-brand-bgLight">
                            <div className="w-20 h-20 bg-brand-bgLight border-2 border-brand-blueDark rounded-tl-2xl rounded-br-2xl flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(57,103,153,0.1)]">
                                <User size={40} className="text-brand-blueDark/50" />
                            </div>
                            <h3 className="text-2xl font-display font-extrabold text-brand-blueDark mb-2">Select a Candidate</h3>
                            <p className="text-sm font-medium">Choose an applicant from the queue to begin your evaluation.</p>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col min-h-0">
                            {/* App Header */}
                            <div className="p-6 border-b-2 border-brand-blueDark flex justify-between items-center bg-brand-bgLight shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white border-2 border-brand-blueDark rounded-tl-xl rounded-br-xl flex items-center justify-center text-xl font-extrabold text-brand-blueDark shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)]">
                                        {selectedApp.user?.name.charAt(0) || "U"}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-display font-extrabold text-brand-blueDark">{selectedApp.user?.name}</h2>
                                        <p className="text-brand-darkBlue/70 text-sm font-medium mt-0.5">{selectedApp.user?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/50">Current Phase</span>
                                    <span className="inline-flex items-center px-3 py-1 bg-brand-yellow/20 text-brand-blueDark rounded-sm text-sm font-bold border border-brand-blueDark/30 shadow-[2px_2px_0px_0px_rgba(57,103,153,0.1)]">
                                        {selectedApp.status.replace('round', 'Round ')}
                                    </span>
                                </div>
                            </div>

                            {/* App Content */}
                            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white custom-scrollbar">
                                {/* Left Col: Background & Responses */}
                                <div className="space-y-8 pr-4">
                                    <section>
                                        <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/50 mb-4 flex items-center gap-2">
                                            <FileText size={16} className="text-brand-blue" /> Application Materials
                                        </h3>
                                        <div className="bg-brand-bgLight border-2 border-brand-blueDark/20 rounded-tl-xl rounded-br-xl p-5 text-sm text-brand-blueDark space-y-5">
                                            {!formResponse ? (
                                                <p className="italic text-brand-darkBlue/50 font-medium">No form responses found.</p>
                                            ) : (
                                                form?.fields.map(field => {
                                                    const answer = formResponse.responses.find(r => r.fieldId === field.id);
                                                    return (
                                                        <div key={field.id}>
                                                            <div className="font-bold text-brand-blueDark mb-1">{field.label}</div>
                                                            <div className="text-brand-darkBlue/80 font-medium bg-white p-3 rounded-lg border border-brand-blueDark/10 whitespace-pre-wrap">{answer?.value ? (Array.isArray(answer.value) ? answer.value.join(", ") : answer.value) : "No answer provided"}</div>
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

                                {/* Right Col: Scoring Rubric */}
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
                                                {rubric.criteria.map(criterion => (
                                                    <div key={criterion.name}>
                                                        <div className="flex justify-between items-center mb-2">
                                                            <label className="text-sm font-bold text-brand-blueDark">{criterion.name}</label>
                                                            <span className="text-[10px] text-brand-blueDark font-extrabold bg-brand-yellow/20 border border-brand-yellow/30 px-2 py-0.5 rounded-sm uppercase">Max: {criterion.maxScore}</span>
                                                        </div>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={criterion.maxScore}
                                                            className="w-full p-2.5 bg-brand-bgLight/50 border-2 border-brand-blueDark/20 rounded-lg focus:ring-0 focus:border-brand-blueDark focus:shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] focus:bg-white transition-all outline-none font-bold text-brand-blueDark"
                                                            placeholder="Enter score..."
                                                            value={scores[criterion.name] || ""}
                                                            onChange={(e) => handleScoreChange(criterion.name, e.target.value)}
                                                        />
                                                    </div>
                                                ))}
                                                <div className="pt-4 border-t-2 border-brand-blueDark/10">
                                                    <label className="block text-sm font-bold text-brand-blueDark mb-2">Qualitative Feedback</label>
                                                    <textarea
                                                        className="w-full p-3 bg-brand-bgLight/50 border-2 border-brand-blueDark/20 rounded-lg h-32 focus:ring-0 focus:border-brand-blueDark focus:shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] focus:bg-white transition-all outline-none resize-none font-medium text-brand-blueDark"
                                                        placeholder="Provide detailed constructive feedback..."
                                                        value={feedback}
                                                        onChange={(e) => setFeedback(e.target.value)}
                                                    />
                                                </div>
                                                <Button
                                                    onClick={handleSubmit}
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

            {/* Availability Modal / Slide-over */}
            {isAvailabilityOpen && (
                <div className="fixed inset-0 z-50 flex justify-end bg-gray-900/50 backdrop-blur-sm transition-opacity">
                    <div className="w-full max-w-md bg-white border-l-4 border-brand-blueDark h-full shadow-[-12px_0px_0px_0px_rgba(37,99,235,0.2)] flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="p-6 border-b-2 border-brand-blueDark flex justify-between items-center bg-brand-bgLight shrink-0">
                            <div>
                                <h3 className="text-xl font-display font-extrabold text-brand-blueDark">My Availability</h3>
                                <p className="text-sm font-medium text-brand-darkBlue/70 mt-1">Manage slots for applicant interviews</p>
                            </div>
                            <Button variant="geometric-secondary" onClick={() => setIsAvailabilityOpen(false)} className="px-3 py-3 rounded-lg flex items-center justify-center">
                                <X size={20} strokeWidth={3} />
                            </Button>
                        </div>

                        <div className="p-6 bg-white border-b-2 border-brand-blueDark/10 shrink-0">
                            <h4 className="text-sm font-bold text-brand-blueDark mb-4">Add Timeslot</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-extrabold text-brand-blueDark/50 uppercase tracking-widest mb-1">Date</label>
                                    <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} min={format(new Date(), 'yyyy-MM-dd')} className="w-full p-2.5 bg-brand-bgLight/50 border-2 border-brand-blueDark/20 rounded-lg focus:ring-0 focus:border-brand-blueDark focus:shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] focus:bg-white outline-none text-sm font-bold text-brand-blueDark" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-extrabold text-brand-blueDark/50 uppercase tracking-widest mb-1">Start</label>
                                        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full p-2.5 bg-brand-bgLight/50 border-2 border-brand-blueDark/20 rounded-lg focus:ring-0 focus:border-brand-blueDark focus:shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] focus:bg-white outline-none text-sm font-bold text-brand-blueDark" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-extrabold text-brand-blueDark/50 uppercase tracking-widest mb-1">End</label>
                                        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full p-2.5 bg-brand-bgLight/50 border-2 border-brand-blueDark/20 rounded-lg focus:ring-0 focus:border-brand-blueDark focus:shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] focus:bg-white outline-none text-sm font-bold text-brand-blueDark" />
                                    </div>
                                </div>
                                <Button onClick={handleAddSlot} variant="destructive" className="w-full flex items-center justify-center gap-2 py-3 mt-2 rounded-lg">
                                    <Plus size={18} strokeWidth={3} /> Add Slot to Schedule
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">
                            <h4 className="text-sm font-bold text-brand-blueDark mb-4">Upcoming Schedule</h4>
                            {Object.keys(groupedSlots).length === 0 ? (
                                <div className="text-center py-10 px-4 bg-white rounded-xl border-2 border-dashed border-brand-blueDark/20">
                                    <p className="text-sm font-bold text-brand-blueDark/50">No slots defined</p>
                                    <p className="text-xs text-brand-darkBlue/70 mt-1 font-medium">Add timeslots above to get booked.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {Object.entries(groupedSlots).sort(([a], [b]) => a.localeCompare(b)).map(([date, slots]: [string, any]) => (
                                        <div key={date}>
                                            <h5 className="text-[10px] font-extrabold text-brand-blueDark/50 uppercase tracking-widest mb-2">{format(parseISO(date), 'MMM do, yyyy')}</h5>
                                            <div className="space-y-2">
                                                {slots.sort((a: any, b: any) => a.startTime - b.startTime).map((slot: any) => (
                                                    <div key={slot._id} className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${slot.isBooked ? 'bg-brand-bgLight border-brand-green/30 shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)]' : 'bg-white border-brand-blueDark/10'}`}>
                                                        <div>
                                                            <div className="font-bold text-brand-blueDark">{format(new Date(slot.startTime), 'h:mm a')} - {format(new Date(slot.endTime), 'h:mm a')}</div>
                                                            <div className={`text-xs mt-0.5 font-bold ${slot.isBooked ? 'text-brand-green' : 'text-brand-darkBlue/50'}`}>{slot.isBooked ? 'Booked' : 'Available'}</div>
                                                        </div>
                                                        {!slot.isBooked && (
                                                            <button onClick={() => removeAvailability({ availabilityId: slot._id })} className="p-2 text-brand-blueDark/40 hover:text-brand-red hover:bg-brand-red/10 rounded-md transition-colors" title="Remove slot">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
