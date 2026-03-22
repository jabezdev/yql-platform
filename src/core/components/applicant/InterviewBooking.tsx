import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useToast } from "../../providers/ToastProvider";
import { format } from "date-fns";
import { CalendarDays, Clock } from "lucide-react";

export default function InterviewBooking({ applicationId }: { applicationId: Id<"applications"> }) {
    const { toast } = useToast();
    const slots = useQuery(api.interviews.getAllAvailableSlots) || [];
    const myInterviews = useQuery(api.interviews.getInterviewsForApplication, { applicationId }) || [];
    const bookSlot = useMutation(api.interviews.bookInterviewSlot);

    const [selectedSlotId, setSelectedSlotId] = useState<Id<"reviewerAvailabilities"> | "">("");
    const [isBooking, setIsBooking] = useState(false);

    const hasBooked = myInterviews.length > 0;

    const handleBook = async () => {
        if (!selectedSlotId) return;
        setIsBooking(true);
        try {
            await bookSlot({ applicationId, availabilityId: selectedSlotId });
            toast("Interview successfully scheduled!", "success");
        } catch (e) {
            console.error(e);
            toast("Failed to book interview. Please try another slot.", "error");
        } finally {
            setIsBooking(false);
        }
    };

    if (hasBooked) {
        const interview = myInterviews[0];
        return (
            <div className="bg-brand-green/10 border border-brand-green/30 p-6 rounded-lg text-brand-green">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                    <CalendarDays size={20} />
                    Interview Scheduled
                </h3>
                <p>Your interview is booked for:</p>
                <div className="font-medium mt-2 text-gray-800">
                    {format(new Date(interview.startTime), 'EEEE, MMMM do, yyyy @ h:mm a')}
                </div>
            </div>
        );
    }

    // Group available slots by date
    const grouped = slots.reduce((acc: any, slot) => {
        const d = format(new Date(slot.startTime), 'yyyy-MM-dd');
        if (!acc[d]) acc[d] = [];
        acc[d].push(slot);
        return acc;
    }, {});

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-brand-lightBlue/30">
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2 text-brand-lightBlue">
                <Clock size={24} />
                Action Required: Book Your Interview
            </h3>
            <p className="text-sm text-gray-600 mb-6">
                Congratulations on making it to Round 3! Please select an available interview slot below.
            </p>

            {Object.keys(grouped).length === 0 ? (
                <div className="text-gray-500 italic p-4 bg-gray-50 rounded">
                    No slots are currently available. Please check back later or contact support.
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(grouped)
                        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                        .map(([date, daySlots]: [string, any]) => (
                            <div key={date}>
                                <h4 className="font-medium text-gray-800 mb-3 border-b border-gray-100 pb-1">
                                    {format(new Date(daySlots[0].startTime), 'EEEE, MMM do')}
                                </h4>
                                <div className="flex flex-wrap gap-3">
                                    {daySlots
                                        .sort((a: any, b: any) => a.startTime - b.startTime)
                                        .map((slot: any) => (
                                            <button
                                                key={slot._id}
                                                onClick={() => setSelectedSlotId(slot._id)}
                                                className={`px-4 py-2 border rounded transition-colors text-sm font-medium ${selectedSlotId === slot._id
                                                        ? 'bg-brand-lightBlue text-white border-brand-lightBlue'
                                                        : 'bg-white text-gray-700 hover:border-brand-lightBlue hover:text-brand-lightBlue'
                                                    }`}
                                            >
                                                {format(new Date(slot.startTime), 'h:mm a')}
                                            </button>
                                        ))}
                                </div>
                            </div>
                        ))}

                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                        <button
                            onClick={handleBook}
                            disabled={!selectedSlotId || isBooking}
                            className="px-6 py-2 bg-brand-lightBlue text-white font-medium rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
                        >
                            {isBooking ? 'Booking...' : 'Confirm Booking'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
