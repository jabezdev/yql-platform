import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuthContext } from "../providers/AuthProvider";
import { isManager } from "../constants/roles";
import type { Role } from "../constants/roles";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, isToday, addMonths, subMonths } from "date-fns";
import { Calendar as CalendarIcon, Clock, Trash2, Shield, ChevronLeft, ChevronRight, X, MapPin, Video, List, Grid2X2 } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";

type EventType = "workshop" | "interview" | "milestone" | "social" | "meeting";

const EVENT_COLORS: Record<EventType, { bg: string; text: string; border: string; dot: string }> = {
    workshop: { bg: "bg-brand-lightBlue/10", text: "text-brand-blue", border: "border-brand-lightBlue/30", dot: "bg-brand-lightBlue" },
    interview: { bg: "bg-brand-yellow/20", text: "text-brand-blue", border: "border-brand-yellow/40", dot: "bg-brand-yellow" },
    milestone: { bg: "bg-brand-green/10", text: "text-brand-blue", border: "border-brand-green/30", dot: "bg-brand-green" },
    social: { bg: "bg-brand-red/10", text: "text-brand-red", border: "border-brand-red/20", dot: "bg-brand-red" },
    meeting: { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200", dot: "bg-purple-500" },
};

const LIST_VIEW_NOW = Date.now();

// Event Detail Popup
function EventPopup({ event, onClose }: { event: any; onClose: () => void }) {
    const colors = EVENT_COLORS[event.type as EventType] ?? EVENT_COLORS.workshop;
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 min-h-full">
            <div className="absolute inset-0 bg-brand-blue/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white border-2 border-brand-blue rounded-tl-2xl rounded-br-2xl shadow-[8px_8px_0px_0px_rgba(10,22,48,0.3)] overflow-hidden">
                <div className={`p-5 border-b-2 border-brand-blue ${colors.bg}`}>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded border-2 ${colors.bg} ${colors.border} ${colors.text}`}>
                                {event.type}
                            </span>
                            <h3 className="font-display font-extrabold text-xl text-brand-blue mt-2">{event.title}</h3>
                        </div>
                        <button onClick={onClose} className="p-1.5 hover:bg-brand-blue/10 rounded-lg transition-colors shrink-0">
                            <X size={18} className="text-brand-blue" />
                        </button>
                    </div>
                </div>
                <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-brand-blue">
                        <div className="w-7 h-7 rounded-lg bg-brand-bgLight flex items-center justify-center border border-brand-blue/20">
                            <CalendarIcon size={14} className="text-brand-lightBlue" />
                        </div>
                        {format(event.startTime, "EEEE, MMMM do, yyyy")}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-brand-blue">
                        <div className="w-7 h-7 rounded-lg bg-brand-bgLight flex items-center justify-center border border-brand-blue/20">
                            <Clock size={14} className="text-brand-lightBlue" />
                        </div>
                        {format(event.startTime, "h:mm a")} – {format(event.endTime, "h:mm a")}
                    </div>
                    {event.location && (
                        <div className="flex items-center gap-2 text-sm font-medium text-brand-blue/80">
                            <div className="w-7 h-7 rounded-lg bg-brand-bgLight flex items-center justify-center border border-brand-blue/20">
                                <MapPin size={14} className="text-brand-lightBlue" />
                            </div>
                            {event.location}
                        </div>
                    )}
                    {event.meetLink && (
                        <a href={event.meetLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-brand-lightBlue hover:underline">
                            <div className="w-7 h-7 rounded-lg bg-brand-bgLight flex items-center justify-center border border-brand-blue/20">
                                <Video size={14} className="text-brand-lightBlue" />
                            </div>
                            Join Meeting
                        </a>
                    )}
                    {event.description && (
                        <p className="text-sm text-brand-blue/70 font-medium leading-relaxed pt-2 border-t-2 border-brand-blue/10">
                            {event.description}
                        </p>
                    )}
                    {event.isPrivate && (
                        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-brand-wine bg-brand-wine/10 border border-brand-wine/30 px-3 py-1.5 rounded-lg w-fit">
                            <Shield size={12} /> Staff Only
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Calendar Grid View
function CalendarView({ events }: { events: any[] }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

    const days = useMemo(() => {
        const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
        const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
        return eachDayOfInterval({ start, end });
    }, [currentMonth]);

    const getEventsForDay = (day: Date) => events.filter(e => isSameDay(new Date(e.startTime), day));
    const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <div>
            {/* Month Navigator */}
            <div className="flex items-center justify-between mb-4">
                <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="p-2 hover:bg-brand-bgLight rounded-lg border-2 border-brand-blue/20 hover:border-brand-blue transition-colors">
                    <ChevronLeft size={18} className="text-brand-blue" />
                </button>
                <h2 className="text-xl font-display font-extrabold text-brand-wine">{format(currentMonth, "MMMM yyyy")}</h2>
                <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="p-2 hover:bg-brand-bgLight rounded-lg border-2 border-brand-blue/20 hover:border-brand-blue transition-colors">
                    <ChevronRight size={18} className="text-brand-blue" />
                </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-px mb-1">
                {DAY_HEADERS.map(d => (
                    <div key={d} className="text-center text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/40 py-2">{d}</div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px bg-brand-blue/10 border-2 border-brand-blue/10 rounded-xl overflow-hidden">
                {days.map((day, i) => {
                    const dayEvents = getEventsForDay(day);
                    const inMonth = isSameMonth(day, currentMonth);
                    const today = isToday(day);
                    return (
                        <div key={i} className={`bg-white min-h-[90px] p-1.5 ${!inMonth ? "opacity-40" : ""}`}>
                            <div className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${today ? "bg-brand-blue text-white" : "text-brand-blue"}`}>
                                {format(day, "d")}
                            </div>
                            <div className="space-y-0.5">
                                {dayEvents.slice(0, 3).map(evt => {
                                    const c = EVENT_COLORS[evt.type as EventType] ?? EVENT_COLORS.workshop;
                                    return (
                                        <button
                                            key={evt._id}
                                            onClick={() => setSelectedEvent(evt)}
                                            className={`w-full text-left text-[10px] font-bold px-1.5 py-0.5 rounded truncate ${c.bg} ${c.text} hover:opacity-80 transition-opacity`}
                                        >
                                            {evt.title}
                                        </button>
                                    );
                                })}
                                {dayEvents.length > 3 && (
                                    <p className="text-[10px] text-brand-blue/40 font-bold px-1">+{dayEvents.length - 3} more</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedEvent && <EventPopup event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
        </div>
    );
}

// List View
function ListView({ events }: { events: any[] }) {
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
    const upcoming = useMemo(() =>
        [...events].filter(e => e.endTime > LIST_VIEW_NOW - 86400000).sort((a, b) => a.startTime - b.startTime),
        [events]);

    const grouped = upcoming.reduce((acc: Record<string, any[]>, event) => {
        const key = format(event.startTime, "MMMM yyyy");
        if (!acc[key]) acc[key] = [];
        acc[key].push(event);
        return acc;
    }, {});

    if (upcoming.length === 0) return (
        <div className="text-center py-16">
            <CalendarIcon size={40} className="mx-auto text-brand-blue/20 mb-4" />
            <p className="font-bold text-brand-blue/40">No upcoming events.</p>
        </div>
    );

    return (
        <div className="space-y-10">
            {Object.entries(grouped).map(([month, monthEvents]) => (
                <div key={month}>
                    <h2 className="text-lg font-display font-extrabold text-brand-wine border-b-2 border-brand-wine/20 pb-2 mb-4">{month}</h2>
                    <div className="space-y-3">
                        {monthEvents.map(event => {
                            const c = EVENT_COLORS[event.type as EventType] ?? EVENT_COLORS.workshop;
                            return (
                                <button
                                    key={event._id}
                                    onClick={() => setSelectedEvent(event)}
                                    className={`w-full text-left bg-white border-2 border-brand-blue rounded-tl-xl rounded-br-xl p-4 shadow-[4px_4px_0px_0px_rgba(57,103,153,0.1)] hover:shadow-[4px_4px_0px_0px_rgba(57,103,153,0.8)] hover:-translate-y-0.5 transition-all flex gap-4`}
                                >
                                    <div className={`w-1 rounded-full shrink-0 ${c.dot}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded border ${c.bg} ${c.border} ${c.text}`}>{event.type}</span>
                                            {event.isPrivate && <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded border bg-brand-wine/10 border-brand-wine/30 text-brand-wine">Staff Only</span>}
                                        </div>
                                        <h3 className="font-display font-extrabold text-brand-blue">{event.title}</h3>
                                        {event.description && <p className="text-xs text-brand-blue/60 font-medium mt-1 line-clamp-2">{event.description}</p>}
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-xs font-bold text-brand-blue/70 flex items-center gap-1"><CalendarIcon size={11} />{format(event.startTime, "EEE, MMM do")}</span>
                                            <span className="text-xs font-bold text-brand-blue/70 flex items-center gap-1"><Clock size={11} />{format(event.startTime, "h:mm a")} – {format(event.endTime, "h:mm a")}</span>
                                            {event.location && <span className="text-xs font-bold text-brand-blue/70 flex items-center gap-1"><MapPin size={11} />{event.location}</span>}
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className="text-brand-blue/20 shrink-0 self-center" />
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
            {selectedEvent && <EventPopup event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
        </div>
    );
}

// Manage Events Modal
function ManageEventsModal({ events, onClose }: { events: any[]; onClose: () => void }) {
    const createEvent = useMutation(api.calendar.createEvent);
    const deleteEvent = useMutation(api.calendar.deleteEvent);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<EventType>("workshop");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const [location, setLocation] = useState("");
    const [meetLink, setMeetLink] = useState("");

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        await createEvent({
            title, description: description || undefined,
            type, startTime: new Date(startTime).getTime(),
            endTime: new Date(endTime).getTime(),
            isPrivate, location: location || undefined,
            meetLink: meetLink || undefined,
        });
        setTitle(""); setDescription(""); setStartTime(""); setEndTime(""); setLocation(""); setMeetLink(""); setIsPrivate(false);
    };

    const sortedEvents = [...events].sort((a, b) => b.startTime - a.startTime);
    const typeColors: Record<EventType, string> = {
        workshop: "bg-brand-lightBlue/10 text-brand-blue border-brand-lightBlue/30",
        interview: "bg-brand-yellow/20 text-brand-blue border-brand-yellow/40",
        milestone: "bg-brand-green/10 text-brand-blue border-brand-green/30",
        social: "bg-brand-red/10 text-brand-red border-brand-red/20",
        meeting: "bg-purple-100 text-purple-800 border-purple-200",
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 min-h-full">
            <div className="absolute inset-0 bg-brand-blue/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-5xl max-h-[95%] bg-brand-bgLight border-2 border-brand-blue rounded-tl-2xl rounded-br-2xl shadow-[8px_8px_0px_0px_rgba(10,22,48,0.3)] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b-2 border-brand-blue bg-white shrink-0">
                    <h2 className="font-display font-extrabold text-xl text-brand-blue">Manage Events</h2>
                    <button onClick={onClose} className="p-2 hover:bg-brand-bgLight rounded-lg transition-colors">
                        <X size={20} className="text-brand-blue" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Create Form */}
                        <div>
                            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 mb-4">New Event</h3>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 mb-1">Title</label>
                                    <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Event name..." className="w-full p-2.5 bg-white border-2 border-brand-blue/20 rounded-lg focus:border-brand-blue outline-none font-bold text-brand-blue" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 mb-1">Type</label>
                                        <select value={type} onChange={e => setType(e.target.value as EventType)} className="w-full p-2.5 bg-white border-2 border-brand-blue/20 rounded-lg focus:border-brand-blue outline-none font-bold text-brand-blue appearance-none">
                                            <option value="meeting">Meeting</option>
                                            <option value="workshop">Workshop</option>
                                            <option value="milestone">Milestone</option>
                                            <option value="social">Social</option>
                                            <option value="interview">Interview</option>
                                        </select>
                                    </div>
                                    <div className="flex items-end pb-1">
                                        <label className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-brand-wine cursor-pointer">
                                            <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} className="w-4 h-4 rounded border-2 border-brand-wine" />
                                            Staff Only
                                        </label>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 mb-1">Start</label>
                                        <input type="datetime-local" required value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full p-2.5 bg-white border-2 border-brand-blue/20 rounded-lg focus:border-brand-blue outline-none font-bold text-brand-blue text-xs" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 mb-1">End</label>
                                        <input type="datetime-local" required value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full p-2.5 bg-white border-2 border-brand-blue/20 rounded-lg focus:border-brand-blue outline-none font-bold text-brand-blue text-xs" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 mb-1">Location <span className="normal-case tracking-normal font-bold text-brand-blue/40">(optional)</span></label>
                                    <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Room / venue..." className="w-full p-2.5 bg-white border-2 border-brand-blue/20 rounded-lg focus:border-brand-blue outline-none font-medium text-brand-blue" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 mb-1">Meet Link <span className="normal-case tracking-normal font-bold text-brand-blue/40">(optional)</span></label>
                                    <input value={meetLink} onChange={e => setMeetLink(e.target.value)} placeholder="https://meet.google.com/..." className="w-full p-2.5 bg-white border-2 border-brand-blue/20 rounded-lg focus:border-brand-blue outline-none font-medium text-brand-blue" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 mb-1">Description</label>
                                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Details..." className="w-full p-2.5 bg-white border-2 border-brand-blue/20 rounded-lg focus:border-brand-blue outline-none font-medium text-brand-blue resize-none text-sm" />
                                </div>
                                <button type="submit" className="w-full py-2.5 bg-brand-lightBlue text-white font-bold rounded-lg border-2 border-brand-blue hover:-translate-y-0.5 transition-transform shadow-[4px_4px_0px_0px_rgba(10,22,48,0.45)]">
                                    Publish Event
                                </button>
                            </form>
                        </div>

                        {/* Event List */}
                        <div>
                            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 mb-4">All Events ({sortedEvents.length})</h3>
                            <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                                {sortedEvents.map(event => (
                                    <div key={event._id} className="flex items-center gap-3 p-3 bg-white border-2 border-brand-blue/10 rounded-lg group">
                                        <div className={`w-2 h-10 rounded-full shrink-0 ${EVENT_COLORS[event.type as EventType]?.dot ?? "bg-brand-lightBlue"}`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded border ${typeColors[event.type as EventType] ?? "bg-brand-bgLight border-brand-blue/20 text-brand-blue"}`}>{event.type}</span>
                                            </div>
                                            <p className="font-bold text-brand-blue text-sm mt-0.5 truncate">{event.title}</p>
                                            <p className="text-[10px] font-extrabold text-brand-blue/50 uppercase tracking-widest">{format(event.startTime, "MMM d, h:mm a")}</p>
                                        </div>
                                        <button onClick={() => deleteEvent({ eventId: event._id })} className="p-1.5 text-brand-red/40 hover:text-brand-red hover:bg-brand-red/10 rounded transition-all opacity-0 group-hover:opacity-100 shrink-0">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                {sortedEvents.length === 0 && <p className="text-xs text-brand-blue/40 italic text-center py-4">No events yet</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function GlobalCalendarPage() {
    const { user } = useAuthContext();
    const [activeTab, setActiveTab] = useState<"calendar" | "list">("calendar");
    const [showManage, setShowManage] = useState(false);

    const canManage = user ? isManager(user.role as Role) : false;
    const canSeePrivate = canManage || user?.specialRoles?.includes("Evaluator");

    const events = useQuery(api.calendar.getEvents, { includePrivate: !!canSeePrivate });

    const manageBtn = canManage && (
        <button
            onClick={() => setShowManage(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-lightBlue/10 hover:bg-brand-lightBlue/20 text-brand-blue text-sm font-bold border-2 border-brand-lightBlue/30 rounded-lg transition-colors"
        >
            <Shield size={14} /> Manage Events
        </button>
    );

    if (events === undefined) return <div className="w-full p-8 text-brand-blue/40 font-bold">Loading calendar...</div>;

    return (
        <div className="w-full space-y-8 pb-12">
            <PageHeader
                title="YQL Calendar"
                subtitle="Workshops, interviews, meetings, and milestones across the network."
                action={manageBtn}
            />

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-brand-bgLight border border-brand-blue/15 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab("calendar")}
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === "calendar" ? "bg-brand-yellow text-brand-blue shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)]" : "text-brand-blue/50 hover:text-brand-blue hover:bg-white"}`}
                >
                    <Grid2X2 size={15} /> Calendar View
                </button>
                <button
                    onClick={() => setActiveTab("list")}
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === "list" ? "bg-brand-yellow text-brand-blue shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)]" : "text-brand-blue/50 hover:text-brand-blue hover:bg-white"}`}
                >
                    <List size={15} /> List View
                </button>
            </div>

            {activeTab === "calendar" ? <CalendarView events={events} /> : <ListView events={events} />}

            {showManage && <ManageEventsModal events={events} onClose={() => setShowManage(false)} />}
        </div>
    );
}
