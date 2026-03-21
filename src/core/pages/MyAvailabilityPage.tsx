import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useAuthContext } from "../providers/AuthProvider";
import { useToast } from "../providers/ToastProvider";
import { PageHeader } from "../components/ui/PageHeader";
import { format } from "date-fns";
import { CalendarDays, Plus, Trash2, Clock, CheckCircle2 } from "lucide-react";

export default function MyAvailabilityPage() {
    const { user } = useAuthContext();
    const { toast } = useToast();

    const availabilities = useQuery(
        api.interviews.getAvailabilitiesForReviewer,
        user ? { reviewerId: user._id as Id<"users"> } : "skip"
    ) ?? [];

    const addAvailability = useMutation(api.interviews.addAvailability);
    const removeAvailability = useMutation(api.interviews.removeAvailability);

    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("10:00");
    const [adding, setAdding] = useState(false);

    if (!user) return null;

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const start = new Date(`${date}T${startTime}`).getTime();
        const end = new Date(`${date}T${endTime}`).getTime();
        if (start >= end) {
            toast("End time must be after start time.", "error");
            return;
        }
        setAdding(true);
        try {
            await addAvailability({ reviewerId: user._id as Id<"users">, startTime: start, endTime: end });
            toast("Slot added.", "success");
        } catch {
            toast("Failed to add slot.", "error");
        } finally {
            setAdding(false);
        }
    };

    const handleRemove = async (availabilityId: Id<"reviewerAvailabilities">) => {
        try {
            await removeAvailability({ availabilityId });
            toast("Slot removed.", "success");
        } catch {
            toast("Failed to remove slot.", "error");
        }
    };

    const grouped = availabilities.reduce<Record<string, typeof availabilities>>((acc, slot) => {
        const day = new Date(slot.startTime).toISOString().split("T")[0];
        if (!acc[day]) acc[day] = [];
        acc[day].push(slot);
        return acc;
    }, {});

    const upcoming = Object.entries(grouped)
        .filter(([day]) => day >= new Date().toISOString().split("T")[0])
        .sort(([a], [b]) => a.localeCompare(b));

    const bookedCount = availabilities.filter(s => s.isBooked).length;
    const openCount = availabilities.filter(s => !s.isBooked).length;

    const inputCls =
        "w-full p-2.5 bg-brand-bgLight border-2 border-brand-blueDark/20 rounded-lg focus:border-brand-blueDark outline-none font-medium text-brand-blueDark text-sm transition-colors";

    return (
        <div className="w-full space-y-8 pb-12">
            <PageHeader
                title="My Interview Availability"
                subtitle="Add timeslots when you're available to conduct interviews. Applicants will book from these slots."
            />

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-white border-2 border-brand-blueDark/10 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-9 h-9 bg-brand-blue/10 rounded-lg flex items-center justify-center shrink-0">
                        <CalendarDays size={18} className="text-brand-blue" />
                    </div>
                    <div>
                        <p className="text-2xl font-display font-extrabold text-brand-blueDark">{openCount}</p>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/40">Open Slots</p>
                    </div>
                </div>
                <div className="bg-white border-2 border-brand-green/20 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-9 h-9 bg-brand-green/10 rounded-lg flex items-center justify-center shrink-0">
                        <CheckCircle2 size={18} className="text-brand-green" />
                    </div>
                    <div>
                        <p className="text-2xl font-display font-extrabold text-brand-blueDark">{bookedCount}</p>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/40">Booked</p>
                    </div>
                </div>
                <div className="bg-white border-2 border-brand-blueDark/10 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-9 h-9 bg-brand-blueDark/5 rounded-lg flex items-center justify-center shrink-0">
                        <Clock size={18} className="text-brand-blueDark/60" />
                    </div>
                    <div>
                        <p className="text-2xl font-display font-extrabold text-brand-blueDark">{upcoming.length}</p>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/40">Upcoming Days</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
                {/* Add Slot Form */}
                <div className="bg-white border-2 border-brand-blueDark rounded-tl-2xl rounded-br-2xl shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] p-6 h-fit sticky top-8">
                    <h2 className="font-display font-extrabold text-brand-blueDark text-lg flex items-center gap-2 mb-6">
                        <Plus size={18} className="text-brand-blue" /> Add Timeslot
                    </h2>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/50 mb-1">Date</label>
                            <input
                                type="date"
                                value={date}
                                min={new Date().toISOString().split("T")[0]}
                                onChange={(e) => setDate(e.target.value)}
                                className={inputCls}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/50 mb-1">Start</label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/50 mb-1">End</label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className={inputCls}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={adding}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-brand-blue text-white font-bold rounded-xl border-2 border-brand-blueDark hover:-translate-y-0.5 transition-transform shadow-[4px_4px_0px_0px_rgba(10,22,48,0.45)] disabled:opacity-50"
                        >
                            <Plus size={16} /> {adding ? "Adding..." : "Add Slot"}
                        </button>
                    </form>
                </div>

                {/* Slot List */}
                <div className="space-y-6">
                    {upcoming.length === 0 ? (
                        <div className="bg-white border-2 border-dashed border-brand-blueDark/20 rounded-2xl p-12 text-center">
                            <CalendarDays size={40} className="mx-auto text-brand-blueDark/20 mb-4" />
                            <p className="font-display font-extrabold text-brand-blueDark/40 text-lg">No upcoming slots</p>
                            <p className="text-sm text-brand-blueDark/30 mt-1">Add timeslots on the left to make yourself available for interviews.</p>
                        </div>
                    ) : upcoming.map(([day, slots]) => (
                        <div key={day}>
                            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/40 mb-3">
                                {format(new Date(day), "EEEE, MMMM d, yyyy")}
                            </h3>
                            <div className="space-y-2">
                                {[...slots].sort((a, b) => a.startTime - b.startTime).map(slot => (
                                    <div
                                        key={slot._id}
                                        className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                                            slot.isBooked
                                                ? "bg-brand-green/5 border-brand-green/30"
                                                : "bg-white border-brand-blueDark/10 hover:border-brand-blueDark/20"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-8 rounded-full ${slot.isBooked ? "bg-brand-green" : "bg-brand-blue/30"}`} />
                                            <div>
                                                <p className="font-bold text-brand-blueDark text-sm">
                                                    {format(slot.startTime, "h:mm a")} — {format(slot.endTime, "h:mm a")}
                                                </p>
                                                <p className={`text-[10px] font-extrabold uppercase tracking-widest mt-0.5 ${slot.isBooked ? "text-brand-green" : "text-brand-blueDark/30"}`}>
                                                    {slot.isBooked ? "Booked by Applicant" : "Available"}
                                                </p>
                                            </div>
                                        </div>
                                        {!slot.isBooked && (
                                            <button
                                                onClick={() => handleRemove(slot._id)}
                                                className="p-2 text-brand-blueDark/30 hover:text-brand-red hover:bg-brand-red/10 rounded-lg transition-all"
                                                title="Remove slot"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                        {slot.isBooked && (
                                            <CheckCircle2 size={18} className="text-brand-green shrink-0" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
