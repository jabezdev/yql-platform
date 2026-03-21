import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { UserProfile } from "../../providers/AuthProvider";
import { useToast } from "../../providers/ToastProvider";
import { Button } from "../ui/Button";
import { Plus, Trash2, CalendarDays, X } from "lucide-react";

interface Props {
    user: UserProfile;
    isOpen: boolean;
    onClose: () => void;
}

export function AvailabilityDrawer({ user, isOpen, onClose }: Props) {
    const { toast } = useToast();
    const availabilities = useQuery(api.interviews.getAvailabilitiesForReviewer, { reviewerId: user._id as Id<"users"> }) ?? [];
    const addAvailability = useMutation(api.interviews.addAvailability);
    const removeAvailability = useMutation(api.interviews.removeAvailability);

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("10:00");

    if (!isOpen) return null;

    const handleAddSlot = async () => {
        const start = new Date(`${selectedDate}T${startTime}`).getTime();
        const end = new Date(`${selectedDate}T${endTime}`).getTime();
        if (start >= end) {
            toast("End time must be after start time.", "error");
            return;
        }
        try {
            await addAvailability({ reviewerId: user._id as Id<"users">, startTime: start, endTime: end });
            toast("Timeslot added.", "success");
        } catch {
            toast("Failed to add timeslot.", "error");
        }
    };

    const groupedSlots = availabilities.reduce<Record<string, typeof availabilities>>((acc, slot) => {
        const day = new Date(slot.startTime).toISOString().split("T")[0];
        if (!acc[day]) acc[day] = [];
        acc[day].push(slot);
        return acc;
    }, {});

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-gray-900/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white border-l-4 border-brand-blueDark h-full shadow-[-12px_0px_0px_0px_rgba(37,99,235,0.2)] flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="p-6 border-b-2 border-brand-blueDark flex justify-between items-center bg-brand-bgLight shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-bgLight border-2 border-brand-blueDark rounded-lg flex items-center justify-center">
                            <CalendarDays size={16} className="text-brand-blueDark" />
                        </div>
                        <div>
                            <h3 className="text-xl font-display font-extrabold text-brand-blueDark">My Availability</h3>
                            <p className="text-sm font-medium text-brand-darkBlue/70 mt-0.5">Manage interview slots</p>
                        </div>
                    </div>
                    <Button variant="geometric-secondary" onClick={onClose} className="px-3 py-3 flex items-center justify-center">
                        <X size={20} strokeWidth={3} />
                    </Button>
                </div>

                {/* Add Slot Form */}
                <div className="p-6 bg-white border-b-2 border-brand-blueDark/10 shrink-0">
                    <h4 className="text-sm font-bold text-brand-blueDark mb-4">Add Timeslot</h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-extrabold text-brand-blueDark/50 uppercase tracking-widest mb-1">Date</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={e => setSelectedDate(e.target.value)}
                                min={new Date().toISOString().split("T")[0]}
                                className="w-full p-2.5 bg-brand-bgLight/50 border-2 border-brand-blueDark/20 rounded-lg focus:border-brand-blueDark outline-none text-sm font-bold text-brand-blueDark"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-extrabold text-brand-blueDark/50 uppercase tracking-widest mb-1">Start</label>
                                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full p-2.5 bg-brand-bgLight/50 border-2 border-brand-blueDark/20 rounded-lg focus:border-brand-blueDark outline-none text-sm font-bold text-brand-blueDark" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-extrabold text-brand-blueDark/50 uppercase tracking-widest mb-1">End</label>
                                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full p-2.5 bg-brand-bgLight/50 border-2 border-brand-blueDark/20 rounded-lg focus:border-brand-blueDark outline-none text-sm font-bold text-brand-blueDark" />
                            </div>
                        </div>
                        <Button onClick={handleAddSlot} variant="geometric-primary" className="w-full flex items-center justify-center gap-2 py-3">
                            <Plus size={18} strokeWidth={3} /> Add Slot
                        </Button>
                    </div>
                </div>

                {/* Slot List */}
                <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">
                    <h4 className="text-sm font-bold text-brand-blueDark mb-4">Upcoming Schedule</h4>
                    {Object.keys(groupedSlots).length === 0 ? (
                        <div className="text-center py-10 px-4 bg-white rounded-xl border-2 border-dashed border-brand-blueDark/20">
                            <p className="text-sm font-bold text-brand-blueDark/50">No slots defined</p>
                            <p className="text-xs text-brand-darkBlue/70 mt-1 font-medium">Add timeslots above to get booked.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(groupedSlots).sort(([a], [b]) => a.localeCompare(b)).map(([date, slots]) => (
                                <div key={date}>
                                    <h5 className="text-[10px] font-extrabold text-brand-blueDark/50 uppercase tracking-widest mb-2">{date}</h5>
                                    <div className="space-y-2">
                                        {slots.sort((a, b) => a.startTime - b.startTime).map(slot => (
                                            <div key={slot._id} className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${slot.isBooked ? "bg-brand-bgLight border-brand-green/30" : "bg-white border-brand-blueDark/10"}`}>
                                                <div>
                                                    <div className="font-bold text-brand-blueDark">
                                                        {new Date(slot.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} — {new Date(slot.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                    </div>
                                                    <div className={`text-xs mt-0.5 font-bold ${slot.isBooked ? "text-brand-green" : "text-brand-darkBlue/50"}`}>
                                                        {slot.isBooked ? "Booked" : "Available"}
                                                    </div>
                                                </div>
                                                {!slot.isBooked && (
                                                    <button
                                                        onClick={() => removeAvailability({ availabilityId: slot._id })}
                                                        className="p-2 text-brand-blueDark/40 hover:text-brand-red hover:bg-brand-red/10 rounded-md transition-colors"
                                                        title="Remove slot"
                                                    >
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
    );
}
