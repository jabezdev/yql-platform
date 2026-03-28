import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Clean up expired typing indicators every 10 seconds
crons.interval(
    "cleanup expired typing indicators",
    { seconds: 10 },
    internal.chatTyping.cleanupExpired
);

// Deliver due scheduled chat messages every minute.
crons.interval(
    "send due scheduled chat messages",
    { minutes: 1 },
    internal.chatMessages.sendDueScheduledMessages
);

export default crons;
