import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuthContext } from "../providers/AuthProvider";
import { useToast } from "../providers/ToastProvider";
import { isAdmin as checkAdmin } from "../constants/roles";
import type { Role } from "../constants/roles";
import { format, startOfWeek } from "date-fns";
import { z } from "zod";
import {
    X, Pencil, Save, Star, CheckCircle2, Clock, ClipboardList,
    CalendarCheck, Check, Minus, MapPin, Video, History
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { PageHeader } from "../components/ui/PageHeader";
import { RichTextEditor } from "../components/ui/RichTextEditor";

// --- Shared Modal Component ---
function ManageModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 min-h-full">
            <div className="absolute inset-0 bg-brand-blueDark/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-5xl max-h-[95%] bg-brand-bgLight border-2 border-brand-blueDark rounded-tl-2xl rounded-br-2xl shadow-[8px_8px_0px_0px_rgba(10,22,48,0.3)] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b-2 border-brand-blueDark bg-white shrink-0">
                    <h2 className="font-display font-extrabold text-xl text-brand-blueDark">{title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-brand-bgLight rounded-lg transition-colors">
                        <X size={20} className="text-brand-blueDark" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

// --- RSVP Section ---
function RSVPSection() {
    const nextMeeting = useQuery(api.calendar.getNextMeeting);
    const myRSVP = useQuery(api.calendar.getMyRSVP,
        nextMeeting?._id ? { meetingEventId: nextMeeting._id } : "skip"
    );
    const rsvpCounts = useQuery(api.calendar.getRSVPs,
        nextMeeting?._id ? { meetingEventId: nextMeeting._id } : "skip"
    );
    const submitRSVP = useMutation(api.calendar.submitRSVP);

    return (
        <div className="bg-white border-2 border-brand-blueDark rounded-tl-2xl rounded-br-2xl shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] flex flex-col overflow-hidden flex-1 min-h-0">
            <div className="p-4 border-b-2 border-brand-blueDark flex items-center gap-2 bg-white shrink-0">
                <CalendarCheck size={16} className="text-brand-blue" />
                <h3 className="font-display font-extrabold text-brand-blueDark">Weekly Meeting</h3>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                {nextMeeting === undefined ? (
                    <div className="flex flex-col gap-3 animate-pulse">
                        <div className="h-4 bg-brand-bgLight rounded w-3/4" />
                        <div className="h-3 bg-brand-bgLight rounded w-1/2" />
                        <div className="h-8 bg-brand-bgLight rounded w-full mt-2" />
                    </div>
                ) : !nextMeeting ? (
                    <p className="text-xs text-brand-blueDark/50 italic font-medium py-4 text-center">No upcoming meeting scheduled.</p>
                ) : (
                    <>
                        <p className="text-sm font-bold text-brand-blueDark">{nextMeeting.title}</p>
                        <p className="text-xs text-brand-blueDark/60 font-medium mt-0.5">{format(nextMeeting.startTime, "EEEE, MMM do • h:mm a")}</p>
                        {nextMeeting.location && <p className="text-xs text-brand-blueDark/60 flex items-center gap-1 mt-1"><MapPin size={10} />{nextMeeting.location}</p>}
                        {nextMeeting.meetLink && <a href={nextMeeting.meetLink} target="_blank" rel="noreferrer" className="text-xs text-brand-blue font-bold flex items-center gap-1 mt-1 hover:underline"><Video size={10} /> Join Link</a>}

                        <div className="mt-4 flex gap-2">
                            {(["yes", "maybe", "no"] as const).map(val => {
                                const labels = { yes: "Going", maybe: "Maybe", no: "Can't" };
                                const icons = { yes: <Check size={14} />, maybe: <Minus size={14} />, no: <X size={14} /> };
                                const colors = { yes: "brand-green", maybe: "brand-yellow", no: "brand-red" };
                                return (
                                    <button
                                        key={val}
                                        onClick={() => submitRSVP({ meetingEventId: nextMeeting._id, response: val })}
                                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold border-2 transition-all ${myRSVP?.response === val
                                            ? `bg-${colors[val]}/20 border-${colors[val]} text-brand-blueDark`
                                            : "bg-brand-bgLight border-brand-blueDark/10 text-brand-blueDark/60 hover:border-brand-blueDark/30"
                                            }`}
                                    >
                                        {icons[val]} {labels[val]}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="mt-3 flex items-center gap-3 text-[9px] font-extrabold text-brand-blueDark/40 uppercase tracking-widest bg-brand-bgLight/50 p-2 rounded-lg">
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-brand-green" />{rsvpCounts?.filter(r => r.response === "yes").length ?? 0}</span>
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-brand-yellow" />{rsvpCounts?.filter(r => r.response === "maybe").length ?? 0}</span>
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-brand-red" />{rsvpCounts?.filter(r => r.response === "no").length ?? 0}</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}


const weeklyLogSchema = z.object({
    summary: z.string().min(10, "Summary must be at least 10 characters."),
    hoursLogged: z.number().min(0).max(168).optional(),
});

// --- Weekly Log Section ---
function WeeklyLogSection({ canReview }: { canReview: boolean }) {
    const { toast } = useToast();
    const weekOf = startOfWeek(new Date(), { weekStartsOn: 1 }).getTime();
    const myLog = useQuery(api.weeklyLogs.getMyLog, { weekOf });
    const logsForReview = useQuery(api.weeklyLogs.getLogsForReview, canReview ? { weekOf } : "skip");
    const submitLog = useMutation(api.weeklyLogs.submitLog);
    const reviewLog = useMutation(api.weeklyLogs.reviewLog);

    const [showModal, setShowModal] = useState(false);
    const [summary, setSummary] = useState(myLog?.summary || "");
    const [highlights, setHighlights] = useState(myLog?.highlights || "");
    const [challenges, setChallenges] = useState(myLog?.challenges || "");
    const [hours, setHours] = useState<number | undefined>(myLog?.hoursLogged);
    const [editing, setEditing] = useState(false);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validation = weeklyLogSchema.safeParse({ summary, hoursLogged: hours });
        if (!validation.success) {
            toast(validation.error.issues[0].message, "error");
            return;
        }
        try {
            await submitLog({ weekOf, summary, highlights, challenges, hoursLogged: hours });
            toast("Weekly log submitted.", "success");
            setEditing(false);
        } catch {
            toast("Failed to submit log. Please try again.", "error");
        }
    };

    const weekLabel = format(weekOf, "MMM d") + " – " + format(weekOf + 6 * 86400000, "MMM d, yyyy");

    return (
        <div className="bg-white border-2 border-brand-blueDark rounded-tl-2xl rounded-br-2xl shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b-2 border-brand-blueDark flex items-center justify-between bg-white shrink-0">
                <div>
                    <h3 className="font-display font-extrabold text-brand-blueDark flex items-center gap-2">
                        <ClipboardList size={16} className="text-brand-blue" /> Weekly Log
                    </h3>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/40 mt-0.5">{weekLabel}</p>
                </div>
                <div className="flex items-center gap-2">
                    {myLog && !editing && (
                        <button
                            onClick={() => {
                                setSummary(myLog.summary || "");
                                setHighlights(myLog.highlights || "");
                                setChallenges(myLog.challenges || "");
                                setHours(myLog.hoursLogged);
                                setEditing(true);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-bgLight text-brand-blueDark text-xs font-bold border border-brand-blueDark/20 rounded-lg hover:bg-white transition-colors"
                        >
                            <Pencil size={12} /> Edit
                        </button>
                    )}
                    {canReview && (
                        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blueDark text-xs font-bold border border-brand-blue/30 rounded-lg transition-colors">
                            <Star size={12} /> Review Logs
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 flex flex-col p-4 lg:p-5 min-h-0">
                {(editing || !myLog) ? (
                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4 min-h-0">
                        <div className="flex-1 flex flex-col min-h-0 min-w-0">
                            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/50 mb-1 shrink-0">Weekly Summary <span className="text-brand-red">*</span></label>
                            <RichTextEditor
                                content={summary}
                                onChange={setSummary}
                                placeholder="What did you accomplish this week? (Summarize your impact, key tasks, and results...)"
                                className="flex-1"
                                editorClassName="h-full"
                            />
                        </div>

                        <div className="shrink-0 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/50 mb-1">Highlights</label>
                                    <textarea
                                        value={highlights}
                                        onChange={e => setHighlights(e.target.value)}
                                        rows={2}
                                        placeholder="Best moments..."
                                        className="w-full p-2.5 bg-brand-bgLight border-2 border-brand-blueDark/20 rounded-lg focus:border-brand-blueDark outline-none font-medium text-brand-blueDark resize-none text-sm placeholder:text-brand-blueDark/30"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/50 mb-1">Challenges</label>
                                    <textarea
                                        value={challenges}
                                        onChange={e => setChallenges(e.target.value)}
                                        rows={2}
                                        placeholder="Blockers or issues..."
                                        className="w-full p-2.5 bg-brand-bgLight border-2 border-brand-blueDark/20 rounded-lg focus:border-brand-blueDark outline-none font-medium text-brand-blueDark resize-none text-sm placeholder:text-brand-blueDark/30"
                                    />
                                </div>
                            </div>
                            <div className="flex items-end gap-4">
                                <div className="w-40">
                                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/50 mb-1">Hours Logged</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={168}
                                        step={0.5}
                                        value={hours === undefined ? "" : hours}
                                        onChange={e => setHours(e.target.value === "" ? undefined : parseFloat(e.target.value))}
                                        placeholder="Hours..."
                                        className="w-full p-2.5 bg-brand-bgLight border-2 border-brand-blueDark/20 rounded-lg focus:border-brand-blueDark outline-none font-bold text-brand-blueDark text-sm placeholder:text-brand-blueDark/30"
                                    />
                                </div>
                                <div className="flex gap-2 flex-1">
                                    {editing && myLog && (
                                        <button type="button" onClick={() => setEditing(false)} className="flex-1 py-2.5 bg-brand-bgLight text-brand-blueDark font-bold rounded-lg border-2 border-brand-blueDark/30 hover:bg-white transition-colors text-xs">
                                            Cancel
                                        </button>
                                    )}
                                    <button type="submit" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-blue text-white font-bold rounded-lg border-2 border-brand-blueDark hover:-translate-y-0.5 transition-transform shadow-[4px_4px_0px_0px_rgba(10,22,48,0.45)] text-xs">
                                        <Save size={13} /> {myLog ? "Update" : "Submit"} Log
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6">
                        <div className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-sm border-2 ${myLog.isApproved ? "bg-brand-green/10 border-brand-green/30 text-brand-green" : "bg-brand-yellow/10 border-brand-yellow/30 text-brand-blueDark/60"}`}>
                            {myLog.isApproved ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                            {myLog.isApproved ? "Approved" : "Pending Review"}
                            {myLog.isDisplayed && <><Star size={12} className="ml-1" /> Featured</>}
                        </div>

                        <div className="prose-custom">
                            <ReactMarkdown>{myLog.summary}</ReactMarkdown>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t-2 border-brand-bgLight">
                            {myLog.highlights && (
                                <div className="space-y-1">
                                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/30">Highlights</p>
                                    <p className="text-sm text-brand-blueDark/80 font-medium leading-relaxed">{myLog.highlights}</p>
                                </div>
                            )}
                            {myLog.challenges && (
                                <div className="space-y-1">
                                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/30">Challenges</p>
                                    <p className="text-sm text-brand-blueDark/80 font-medium leading-relaxed">{myLog.challenges}</p>
                                </div>
                            )}
                        </div>

                        {myLog.hoursLogged !== undefined && (
                            <div className="pt-4 flex items-center gap-2 border-t-2 border-brand-bgLight lg:justify-end">
                                <Clock size={14} className="text-brand-blueDark/30" />
                                <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/40">{myLog.hoursLogged} hours logged this week</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {showModal && (
                <ManageModal title="Review Weekly Logs" onClose={() => setShowModal(false)}>
                    <div className="space-y-4">
                        {(logsForReview ?? []).length === 0 && (
                            <p className="text-center text-brand-blueDark/40 italic py-12">No logs submitted for this week yet.</p>
                        )}
                        {(logsForReview ?? []).map((log: any) => (
                            <div key={log._id} className="bg-white border-2 border-brand-blueDark/10 rounded-2xl p-6 space-y-4 shadow-sm hover:border-brand-blue/30 transition-colors">
                                <div className="flex items-center justify-between gap-4 border-b border-brand-bgLight pb-4">
                                    <div>
                                        <p className="font-display font-extrabold text-brand-blueDark">{log.userName}</p>
                                        <p className="text-xs text-brand-blueDark/50 font-bold">{log.hoursLogged ?? 0} hours</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => reviewLog({ logId: log._id, isApproved: !log.isApproved, isDisplayed: log.isDisplayed })}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest rounded border-2 transition-all ${log.isApproved ? "bg-brand-green/20 border-brand-green text-brand-blueDark" : "bg-brand-bgLight border-brand-blueDark/10 text-brand-blueDark/40 hover:border-brand-blueDark"}`}
                                        >
                                            <CheckCircle2 size={12} /> {log.isApproved ? "Approved" : "Approve"}
                                        </button>
                                        <button
                                            onClick={() => reviewLog({ logId: log._id, isApproved: log.isApproved, isDisplayed: !log.isDisplayed })}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest rounded border-2 transition-all ${log.isDisplayed ? "bg-brand-yellow/20 border-brand-yellow text-brand-blueDark" : "bg-brand-bgLight border-brand-blueDark/10 text-brand-blueDark/40 hover:border-brand-blueDark"}`}
                                        >
                                            <Star size={12} /> {log.isDisplayed ? "Featured" : "Feature"}
                                        </button>
                                    </div>
                                </div>
                                <div className="prose-custom text-sm">
                                    <ReactMarkdown>{log.summary}</ReactMarkdown>
                                </div>
                                {(log.highlights || log.challenges) && (
                                    <div className="grid grid-cols-2 gap-4 text-xs bg-brand-bgLight/30 p-3 rounded-lg">
                                        {log.highlights && <p className="text-brand-blueDark/70"><span className="font-bold block text-[9px] uppercase tracking-tighter opacity-50 mb-1">Highlights</span> {log.highlights}</p>}
                                        {log.challenges && <p className="text-brand-blueDark/70"><span className="font-bold block text-[9px] uppercase tracking-tighter opacity-50 mb-1">Challenges</span> {log.challenges}</p>}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </ManageModal>
            )}
        </div>
    );
}

// --- Weekly History Section ---
function WeeklyHistorySection() {
    const history = useQuery(api.weeklyLogs.getMyLogsHistory);

    return (
        <div className="bg-white border-2 border-brand-blueDark rounded-tl-2xl rounded-br-2xl shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b-2 border-brand-blueDark flex items-center gap-2 bg-white shrink-0">
                <History size={16} className="text-brand-blue" />
                <h3 className="font-display font-extrabold text-brand-blueDark">Log History</h3>
            </div>
            <div className="flex-1 divide-y-2 divide-brand-blueDark/5 overflow-y-auto custom-scrollbar p-1">
                {!history ? (
                    <p className="text-xs text-center text-brand-blueDark/40 italic p-8">Loading history...</p>
                ) : history.length === 0 ? (
                    <p className="text-xs text-center text-brand-blueDark/40 italic p-8">No past logs found.</p>
                ) : history.map((log) => (
                    <div key={log._id} className="p-4 hover:bg-brand-bgLight/30 transition-colors cursor-pointer group">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[9px] font-extrabold uppercase tracking-widest text-brand-blueDark/50">
                                Week of {format(log.weekOf, "MMM d, yyyy")}
                            </p>
                            <div className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${log.isApproved ? "bg-brand-green/20 text-brand-green border border-brand-green/30" : "bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/30"}`}>
                                {log.isApproved ? "Approved" : "Pending"}
                            </div>
                        </div>
                        <p className="text-xs font-bold text-brand-blueDark line-clamp-2 group-hover:text-brand-blue transition-colors">{log.summary}</p>
                        <p className="text-[9px] font-extrabold uppercase tracking-widest text-brand-blueDark/30 mt-2">{log.hoursLogged ?? 0} hours logged</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function WeeklyHubPage() {
    const { user } = useAuthContext();
    if (!user) return null;

    const canReviewLogs = checkAdmin(user.role as Role);

    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-[0.7fr_0.3fr] gap-6 flex-1 min-h-0">
                {/* Left: Header + Main Log Activity */}
                <div className="flex flex-col space-y-6 h-full">
                    <PageHeader
                        title="Weekly Hub"
                        subtitle="Track your progress, catch up on meetings, and review your history."
                        className="!mb-0 shrink-0 text-sm md:text-base"
                    />
                    <div className="flex-1 min-h-0">
                        <WeeklyLogSection canReview={canReviewLogs} />
                    </div>
                </div>

                {/* Right: RSVPs and History */}
                <div className="flex flex-col gap-6 h-full min-h-0">
                    <RSVPSection />
                    <div className="flex-1 min-h-0">
                        <WeeklyHistorySection />
                    </div>
                </div>
            </div>
        </div>
    );
}
