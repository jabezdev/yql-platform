import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { format } from "date-fns";
import { Plus, Edit2, Trash2, Calendar as CalendarIcon, Clock, Users } from "lucide-react";
import { Button } from "../../components/ui/primitives/Button";
import { PageHeader } from "../../components/ui/structure/PageHeader";

export default function AdminCalendarPage() {
    const events = useQuery(api.calendar.getEvents, { includePrivate: true });
    // Note: We're not filtering by cohort in the admin view for simplicity, just showing all.
    // In a full implementation, you might want a cohort selector.
    const createEvent = useMutation(api.calendar.createEvent);
    const updateEvent = useMutation(api.calendar.updateEvent);
    const deleteEvent = useMutation(api.calendar.deleteEvent);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        type: "workshop" as const,
        isPrivate: false,
    });

    if (events === undefined) {
        return <div className="p-8">Loading calendar...</div>;
    }

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            title: "",
            description: "",
            startTime: "",
            endTime: "",
            type: "workshop",
            isPrivate: false,
        });
    };

    const handleEdit = (event: any) => {
        setEditingId(event._id);
        const formatDateTimeLocal = (ts: number) => {
            const date = new Date(ts);
            // Formats to YYYY-MM-DDThh:mm (which datetime-local expects)
            // Note: Simplistic conversion, ignores local timezone drift for this demo
            date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
            return date.toISOString().slice(0, 16);
        };

        setFormData({
            title: event.title,
            description: event.description || "",
            startTime: formatDateTimeLocal(event.startTime),
            endTime: formatDateTimeLocal(event.endTime),
            type: event.type,
            isPrivate: event.isPrivate,
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.startTime || !formData.endTime) return;

        const startTs = new Date(formData.startTime).getTime();
        const endTs = new Date(formData.endTime).getTime();

        const payload = {
            title: formData.title,
            description: formData.description,
            startTime: startTs,
            endTime: endTs,
            type: formData.type as any,
            isPrivate: formData.isPrivate,
        };

        if (editingId) {
            await updateEvent({ eventId: editingId as any, ...payload });
        } else {
            await createEvent(payload);
        }
        resetForm();
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this event?")) {
            await deleteEvent({ eventId: id as any });
        }
    };

    const sortedEvents = [...events].sort((a, b) => a.startTime - b.startTime);

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <PageHeader
                title="Calendar Management"
                subtitle="Schedule cohort events, workshops, and milestones."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Event Form */}
                <div className="lg:col-span-1">
                    <div className="p-6 sticky top-8 bg-white border-2 border-brand-blue rounded-tl-xl rounded-br-xl shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)]">
                        <h2 className="text-2xl font-display font-extrabold text-brand-blue mb-6 flex items-center">
                            <span className="w-8 h-8 rounded bg-brand-yellow/20 border-2 border-brand-blue flex items-center justify-center mr-3">
                                <Plus size={16} strokeWidth={3} className="text-brand-blue" />
                            </span>
                            {editingId ? "Edit Event" : "Create Event"}
                        </h2>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 mb-2">Event Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    className="w-full p-3 bg-brand-bgLight/50 border-2 border-brand-blue/20 rounded-lg focus:ring-0 focus:border-brand-blue focus:shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] focus:bg-white transition-all outline-none font-bold text-brand-blue"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 mb-2">Event Type</label>
                                <select
                                    className="w-full p-3 bg-brand-bgLight/50 border-2 border-brand-blue/20 rounded-lg focus:ring-0 focus:border-brand-blue focus:shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] focus:bg-white transition-all outline-none font-bold text-brand-blue appearance-none"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%231B3B5C' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 7l5 5 5-5'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                                >
                                    <option value="workshop">Workshop</option>
                                    <option value="meeting">Team Meeting</option>
                                    <option value="interview">Interview Period</option>
                                    <option value="milestone">Milestone</option>
                                    <option value="social">Social Event</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 mb-2">Start Time</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        className="w-full p-2.5 bg-brand-bgLight/50 border-2 border-brand-blue/20 rounded-lg focus:ring-0 focus:border-brand-blue focus:shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] focus:bg-white transition-all outline-none text-xs font-bold text-brand-blue"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 mb-2">End Time</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        className="w-full p-2.5 bg-brand-bgLight/50 border-2 border-brand-blue/20 rounded-lg focus:ring-0 focus:border-brand-blue focus:shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] focus:bg-white transition-all outline-none text-xs font-bold text-brand-blue"
                                        value={formData.endTime}
                                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 mb-2">Description <span className="normal-case tracking-normal font-bold text-brand-darkBlue/40">(Optional)</span></label>
                                <textarea
                                    className="w-full p-3 bg-brand-bgLight/50 border-2 border-brand-blue/20 rounded-lg focus:ring-0 focus:border-brand-blue focus:shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] focus:bg-white transition-all outline-none font-medium text-sm text-brand-blue resize-y custom-scrollbar"
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center gap-3 bg-brand-lightBlue/5 p-3 rounded-lg border-2 border-brand-blue/10">
                                <input
                                    type="checkbox"
                                    id="isPrivate"
                                    checked={formData.isPrivate}
                                    onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                                    className="w-4 h-4 rounded-sm border-2 border-brand-blue text-brand-blue focus:ring-0 cursor-pointer"
                                />
                                <div className="leading-none flex flex-col justify-center">
                                    <label htmlFor="isPrivate" className="text-sm font-bold cursor-pointer flex items-center gap-1 text-brand-blue select-none">
                                        Private Event
                                    </label>
                                    <span className="text-[10px] font-extrabold text-brand-darkBlue/50 mt-1 uppercase tracking-widest">Admins & Staff only</span>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button type="submit" variant="geometric-primary" className="flex-1 py-3 justify-center">
                                    {editingId ? "Update" : "Create"}
                                </Button>
                                {editingId && (
                                    <Button type="button" variant="geometric-secondary" onClick={resetForm} className="py-3 justify-center text-sm font-bold">
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Event List */}
                <div className="lg:col-span-2 space-y-4">
                    {sortedEvents.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border-2 border-brand-blue border-dashed shadow-sm">
                            <div className="w-16 h-16 mx-auto bg-brand-lightBlue/10 rounded-xl flex items-center justify-center mb-4">
                                <CalendarIcon className="w-8 h-8 text-brand-lightBlue" />
                            </div>
                            <h3 className="text-xl font-display font-extrabold text-brand-blue">No Events Scheduled</h3>
                            <p className="text-brand-darkBlue/70 font-medium mt-1">Create one to get started.</p>
                        </div>
                    ) : (
                        sortedEvents.map((event) => {
                            const badgeConfig: Record<string, { bg: string, text: string, border: string }> = {
                                workshop: { bg: "bg-brand-lightBlue/10", text: "text-brand-blue", border: "border-brand-blue/20" },
                                meeting: { bg: "bg-brand-wine/10", text: "text-brand-wine", border: "border-brand-wine/20" },
                                interview: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
                                milestone: { bg: "bg-brand-green/20", text: "text-brand-blue", border: "border-brand-blue/20" },
                                social: { bg: "bg-brand-yellow/20", text: "text-brand-blue", border: "border-brand-blue/20" },
                            };

                            const badge = badgeConfig[event.type || "workshop"] || badgeConfig.workshop;

                            return (
                                <div key={event._id} className="bg-white border-2 border-brand-blue rounded-tl-xl rounded-br-xl shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(10,22,48,0.3)] transition-all relative overflow-hidden flex flex-col sm:flex-row gap-4 justify-between p-5">
                                    <div className={`absolute top-0 left-0 bottom-0 w-2 ${event.isPrivate ? "bg-brand-wine" : "bg-brand-lightBlue"}`} />
                                    <div className="flex-1 min-w-0 pl-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-[10px] px-2.5 py-1 rounded-sm border ${badge.bg} ${badge.text} ${badge.border} font-extrabold uppercase tracking-widest`}>
                                                {event.type}
                                            </span>
                                            {event.isPrivate && (
                                                <span className="text-[10px] px-2.5 py-1 rounded-sm bg-brand-wine/10 text-brand-wine border border-brand-wine/20 font-extrabold uppercase tracking-widest flex items-center gap-1">
                                                    <Users className="w-3 h-3" strokeWidth={3} /> Private
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-extrabold font-display text-brand-blue truncate">{event.title}</h3>
                                        <div className="flex flex-col sm:flex-row sm:items-center text-sm font-bold text-brand-darkBlue/70 gap-2 sm:gap-4 mt-2 bg-brand-bgLight/50 p-2 rounded-lg border border-brand-blue/10 w-fit">
                                            <span className="flex items-center gap-1.5">
                                                <CalendarIcon className="w-4 h-4 text-brand-lightBlue" />
                                                {format(new Date(event.startTime), "MMM d, yyyy")}
                                            </span>
                                            <span className="hidden sm:inline text-brand-blue/20">•</span>
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="w-4 h-4 text-brand-lightBlue" />
                                                {format(new Date(event.startTime), "h:mm a")} - {format(new Date(event.endTime), "h:mm a")}
                                            </span>
                                        </div>
                                        {event.description && (
                                            <p className="mt-3 text-sm text-brand-blue/80 font-medium line-clamp-2">{event.description}</p>
                                        )}
                                    </div>
                                    <div className="flex sm:flex-col gap-2 justify-end shrink-0 pl-3">
                                        <button onClick={() => handleEdit(event)} className="p-2 sm:px-4 sm:py-2 flex items-center justify-center font-bold text-sm bg-brand-bgLight/50 border-2 border-brand-blue/20 rounded-lg hover:border-brand-blue hover:bg-white transition-all text-brand-blue">
                                            <Edit2 size={16} className="sm:mr-2" strokeWidth={2.5} />
                                            <span className="hidden sm:inline">Edit</span>
                                        </button>
                                        <button onClick={() => handleDelete(event._id)} className="p-2 sm:px-4 sm:py-2 text-brand-red border-2 border-brand-red/20 bg-brand-red/5 rounded-lg hover:bg-brand-red/10 hover:border-brand-red/40 font-bold text-sm flex items-center justify-center transition-all">
                                            <Trash2 size={16} className="sm:mr-2" strokeWidth={2.5} />
                                            <span className="hidden sm:inline">Delete</span>
                                        </button>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
