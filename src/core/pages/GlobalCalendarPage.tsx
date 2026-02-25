import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuthContext } from "../providers/AuthProvider";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Users } from "lucide-react";

export default function GlobalCalendarPage() {
    const { user } = useAuthContext();
    const canSeePrivate = user?.role === "Admin" || (user?.role === "Staff" && user?.staffSubRole === "Reviewer");
    const events = useQuery(api.calendar.getEvents, { includePrivate: !!canSeePrivate });

    const [now] = useState(() => Date.now());

    if (events === undefined) {
        return <div className="p-8">Loading calendar...</div>;
    }

    const upcomingEvents = events
        .filter((e: any) => e.endTime > now - 24 * 60 * 60 * 1000) // Keep events from the last 24 hours
        .sort((a: any, b: any) => a.startTime - b.startTime);

    const groupedEvents = upcomingEvents.reduce((acc: any, event: any) => {
        // Group by month and year
        const date = new Date(event.startTime);
        const groupKey = format(date, "MMMM yyyy");
        if (!acc[groupKey]) acc[groupKey] = [];
        acc[groupKey].push(event);
        return acc;
    }, {} as Record<string, typeof events>);

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold font-display text-brand-blueDark">YQL Global Calendar</h1>
                    <p className="text-gray-600">Upcoming workshops, interviews, and milestones.</p>
                </div>
            </div>

            {upcomingEvents.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-brand-blueDark shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] max-w-2xl mx-auto">
                    <div className="w-20 h-20 mx-auto bg-brand-yellow/20 rounded-tl-xl rounded-br-xl border-2 border-brand-blueDark flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(57,103,153,0.1)]">
                        <CalendarIcon className="w-10 h-10 text-brand-blueDark" />
                    </div>
                    <h3 className="text-2xl font-display font-extrabold text-brand-blueDark mb-2">No Upcoming Events</h3>
                    <p className="text-brand-darkBlue/70 font-medium">Looks like the schedule is clear for now.</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {Object.entries(groupedEvents).map(([month, monthEvents]) => (
                        <div key={month} className="space-y-6">
                            <h2 className="text-2xl font-bold font-display text-brand-wine border-b-2 border-brand-wine/20 pb-2">
                                {month}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {(monthEvents as any[]).map((event: any) => {
                                    const typeColors = {
                                        workshop: "bg-brand-blue/10 text-brand-blueDark border-brand-blueDark/20",
                                        interview: "bg-brand-yellow/20 text-brand-blueDark border-brand-yellow/30",
                                        milestone: "bg-brand-green/20 text-brand-blueDark border-brand-green/30",
                                        social: "bg-brand-red/10 text-brand-red border-brand-red/20",
                                    };

                                    return (
                                        <div key={event._id} className={`flex flex-col h-full bg-white border-2 border-brand-blueDark shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] rounded-tl-2xl rounded-br-2xl hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(57,103,153,1)] transition-all relative overflow-hidden`}>
                                            {event.isPrivate && <div className="absolute top-0 right-0 w-16 h-16 bg-brand-wine/10 rounded-bl-full -mr-4 -mt-4 border-l border-b border-brand-wine/20" />}
                                            <div className="p-6 flex-1 flex flex-col relative z-10">
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className={`text-[10px] uppercase tracking-widest px-3 py-1 rounded-sm border-2 font-extrabold ${typeColors[event.type as keyof typeof typeColors] || typeColors.workshop}`}>
                                                        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                                                    </span>
                                                    {event.isPrivate && (
                                                        <span className="text-[10px] px-3 py-1 rounded-sm bg-brand-wine/10 text-brand-wine border border-brand-wine/50 font-extrabold flex items-center gap-1 uppercase tracking-widest">
                                                            <Users className="w-3 h-3" /> Staff Only
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 className="font-display font-extrabold text-xl text-brand-blueDark mb-3 line-clamp-2">
                                                    {event.title}
                                                </h3>

                                                {event.description && (
                                                    <p className="text-sm text-brand-darkBlue/70 font-medium mb-6 line-clamp-3 flex-1">
                                                        {event.description}
                                                    </p>
                                                )}

                                                <div className="mt-auto pt-5 border-t-2 border-brand-blueDark/10 space-y-3">
                                                    <div className="flex items-center text-sm font-bold text-brand-blueDark">
                                                        <div className="w-6 h-6 rounded bg-brand-bgLight flex items-center justify-center mr-3 border border-brand-blueDark/20">
                                                            <CalendarIcon className="w-3.5 h-3.5 text-brand-blue" />
                                                        </div>
                                                        {format(new Date(event.startTime), "EEEE, MMM do")}
                                                    </div>
                                                    <div className="flex items-center text-sm font-bold text-brand-blueDark">
                                                        <div className="w-6 h-6 rounded bg-brand-bgLight flex items-center justify-center mr-3 border border-brand-blueDark/20">
                                                            <Clock className="w-3.5 h-3.5 text-brand-blue" />
                                                        </div>
                                                        {format(new Date(event.startTime), "h:mm a")} - {format(new Date(event.endTime), "h:mm a")}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
