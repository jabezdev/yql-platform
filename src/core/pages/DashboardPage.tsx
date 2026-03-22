import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuthContext } from "../providers/AuthProvider";
import { useToast } from "../providers/ToastProvider";
import { isAdmin as checkAdmin, isManager } from "../constants/roles";
import type { Role } from "../constants/roles";
import { z } from "zod";
import {
    Plus, X, Trash2, CheckCircle2, Users,
    Megaphone, CheckSquare, Pencil, Pin,
    ClipboardList, FileText, Briefcase, TrendingUp
} from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import type { Id } from "../../../convex/_generated/dataModel";

// --- Shared Modal Component ---
function ManageModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-brand-blue/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-5xl max-h-[95%] bg-brand-bgLight border-2 border-brand-blue rounded-tl-2xl rounded-br-2xl shadow-[8px_8px_0px_0px_rgba(10,22,48,0.3)] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b-2 border-brand-blue bg-white shrink-0">
                    <h2 className="font-display font-extrabold text-xl text-brand-blue">{title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-brand-bgLight rounded-lg transition-colors">
                        <X size={20} className="text-brand-blue" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

// --- Personal To Do Section ---
function PersonalToDoSection() {
    const todos = useQuery(api.personalTodos.listPersonalTodos);
    const createTodo = useMutation(api.personalTodos.createPersonalTodo);
    const toggleTodo = useMutation(api.personalTodos.togglePersonalTodo);
    const deleteTodo = useMutation(api.personalTodos.deletePersonalTodo);
    const [newText, setNewText] = useState("");

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newText.trim()) return;
        await createTodo({ text: newText });
        setNewText("");
    };

    return (
        <div className="bg-white border-2 border-brand-blue rounded-tl-2xl rounded-br-2xl shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] flex flex-col h-full">
            <div className="p-4 border-b-2 border-brand-blue flex items-center justify-between shrink-0">
                <h3 className="font-display font-extrabold text-brand-blue flex items-center gap-2">
                    <ClipboardList size={16} className="text-brand-lightBlue" /> Personal To Do
                </h3>
            </div>
            <div className="p-4 flex-1 flex flex-col">
                <form onSubmit={handleAdd} className="flex gap-2 mb-4">
                    <input
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        placeholder="Add a task..."
                        className="flex-1 p-2 text-sm bg-brand-bgLight border-2 border-brand-blue/20 rounded-lg focus:border-brand-blue outline-none font-medium text-brand-blue"
                    />
                    <button type="submit" className="p-2 bg-brand-lightBlue text-white rounded-lg border-2 border-brand-blue hover:scale-105 transition-transform">
                        <Plus size={20} />
                    </button>
                </form>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                    {!todos ? (
                        <p className="text-xs text-brand-blue/40 text-center py-4">Loading...</p>
                    ) : todos.length === 0 ? (
                        <p className="text-xs text-brand-blue/40 italic text-center py-4">Nothing to do! Add something above.</p>
                    ) : todos.map((todo) => (
                        <div key={todo._id} className="flex items-center gap-3 p-3 bg-brand-bgLight/50 border-2 border-brand-blue/5 rounded-lg group">
                            <button
                                onClick={() => toggleTodo({ todoId: todo._id })}
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${todo.isCompleted ? "bg-brand-green border-brand-green text-white" : "border-brand-blue/20 hover:border-brand-blue/40"}`}
                            >
                                {todo.isCompleted && <CheckCircle2 size={12} />}
                            </button>
                            <span className={`flex-1 text-sm font-medium text-brand-blue ${todo.isCompleted ? "line-through opacity-40" : ""}`}>
                                {todo.text}
                            </span>
                            <button
                                onClick={() => deleteTodo({ todoId: todo._id })}
                                className="p-1 text-brand-red/40 hover:text-brand-red opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const announcementSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters."),
    content: z.string().min(10, "Content must be at least 10 characters."),
});

// --- Announcements Section ---
function AnnouncementsSection({ canManage }: { canManage: boolean }) {
    const { toast } = useToast();
    const announcements = useQuery(api.announcements.getAnnouncements);
    const createAnn = useMutation(api.announcements.createAnnouncement);
    const deleteAnn = useMutation(api.announcements.deleteAnnouncement);
    const [showModal, setShowModal] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const [newPinned, setNewPinned] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const validation = announcementSchema.safeParse({ title: newTitle, content: newContent });
        if (!validation.success) {
            const errs: Record<string, string> = {};
            validation.error.issues.forEach((err) => {
                if (err.path[0]) errs[String(err.path[0])] = err.message;
            });
            setFormErrors(errs);
            return;
        }
        setFormErrors({});
        try {
            await createAnn({ title: newTitle, content: newContent, isPinned: newPinned });
            toast("Announcement published.", "success");
            setNewTitle(""); setNewContent(""); setNewPinned(false);
        } catch {
            toast("Failed to publish announcement.", "error");
        }
    };

    return (
        <div className="bg-white border-2 border-brand-blue rounded-tl-2xl rounded-br-2xl shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b-2 border-brand-blue flex items-center justify-between shrink-0">
                <h3 className="font-display font-extrabold text-brand-blue flex items-center gap-2">
                    <Megaphone size={16} className="text-brand-lightBlue" /> Announcements
                </h3>
                {canManage && (
                    <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-lightBlue/10 hover:bg-brand-lightBlue/20 text-brand-blue text-xs font-bold border border-brand-lightBlue/30 rounded-lg transition-colors">
                        <Pencil size={12} /> Manage
                    </button>
                )}
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                {!announcements ? (
                    <p className="text-xs text-brand-blue/40 font-medium text-center py-8">Loading...</p>
                ) : announcements.length === 0 ? (
                    <p className="text-xs text-brand-blue/40 font-medium text-center py-8 italic">No announcements yet.</p>
                ) : announcements.map((ann) => (
                    <div key={ann._id} className={`p-3 rounded-lg border-2 ${ann.isPinned ? "bg-brand-yellow/10 border-brand-yellow/40" : "bg-brand-bgLight border-brand-blue/10"}`}>
                        <div className="flex items-start gap-2">
                            {ann.isPinned && <Pin size={12} className="text-brand-yellow mt-0.5 shrink-0" />}
                            <div>
                                <p className="text-sm font-bold text-brand-blue">{ann.title}</p>
                                <p className="text-xs text-brand-blue/70 mt-0.5 leading-relaxed">{ann.content}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <ManageModal title="Manage Announcements" onClose={() => setShowModal(false)}>
                    {/* Modal content remains same */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 mb-4">New Announcement</h3>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 mb-1">Title</label>
                                    <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Announcement title..." className={`w-full p-2.5 bg-white border-2 rounded-lg focus:border-brand-blue outline-none font-bold text-brand-blue text-sm placeholder:text-brand-blue/30 ${formErrors.title ? "border-brand-red" : "border-brand-blue/20"}`} />
                                    {formErrors.title && <p className="text-[10px] font-bold text-brand-red mt-1">{formErrors.title}</p>}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 mb-1">Content</label>
                                    <textarea value={newContent} onChange={e => setNewContent(e.target.value)} rows={4} placeholder="Announcement body..." className={`w-full p-2.5 bg-white border-2 rounded-lg focus:border-brand-blue outline-none font-medium text-brand-blue resize-none text-sm placeholder:text-brand-blue/30 ${formErrors.content ? "border-brand-red" : "border-brand-blue/20"}`} />
                                    {formErrors.content && <p className="text-[10px] font-bold text-brand-red mt-1">{formErrors.content}</p>}
                                </div>
                                <label className="flex items-center gap-2 text-sm font-bold text-brand-blue cursor-pointer">
                                    <input type="checkbox" checked={newPinned} onChange={e => setNewPinned(e.target.checked)} className="w-4 h-4 rounded border-2 border-brand-blue" />
                                    Pin this announcement
                                </label>
                                <button type="submit" className="w-full py-2.5 bg-brand-lightBlue text-white font-bold rounded-lg border-2 border-brand-blue hover:-translate-y-0.5 transition-transform shadow-[4px_4px_0px_0px_rgba(10,22,48,0.45)]">
                                    Publish
                                </button>
                            </form>
                        </div>
                        <div>
                            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 mb-4">Existing ({announcements?.length ?? 0})</h3>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                                {(announcements ?? []).map(ann => (
                                    <div key={ann._id} className="flex items-start gap-3 p-3 bg-white border-2 border-brand-blue/10 rounded-lg group">
                                        {ann.isPinned && <Pin size={14} className="text-brand-yellow mt-0.5 shrink-0" />}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-brand-blue truncate">{ann.title}</p>
                                            <p className="text-xs text-brand-blue/60 mt-0.5 line-clamp-2">{ann.content}</p>
                                        </div>
                                        <button onClick={() => deleteAnn({ announcementId: ann._id })} className="p-1.5 text-brand-red/40 hover:text-brand-red hover:bg-brand-red/10 rounded transition-all opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 shrink-0">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </ManageModal>
            )}
        </div>
    );
}

// --- Open Tasks Section ---
function OpenTasksSection({ canManage, userId }: { canManage: boolean; userId: Id<"users"> }) {
    const tasks = useQuery(api.openTasks.getOpenTasks, {});
    const createTask = useMutation(api.openTasks.createTask);
    const claimTask = useMutation(api.openTasks.claimTask);
    const unclaimTask = useMutation(api.openTasks.unclaimTask);
    const updateTask = useMutation(api.openTasks.updateTask);
    const deleteTask = useMutation(api.openTasks.deleteTask);

    const [showModal, setShowModal] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium");

    const activeTasks = (tasks ?? []).filter((t: any) => t.status !== "done");
    const doneTasks = (tasks ?? []).filter((t: any) => t.status === "done");

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) return;
        await createTask({ title: newTitle, description: newDesc || undefined, priority: newPriority });
        setNewTitle(""); setNewDesc("");
    };

    const priorityStyle: Record<string, string> = {
        high: "bg-brand-red/10 border-brand-red/30 text-brand-red",
        medium: "bg-brand-yellow/20 border-brand-yellow/40 text-brand-blue",
        low: "bg-brand-green/10 border-brand-green/30 text-brand-blue/70",
    };

    return (
        <div className="bg-white border-2 border-brand-blue rounded-tl-2xl rounded-br-2xl shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b-2 border-brand-blue flex items-center justify-between shrink-0">
                <h3 className="font-display font-extrabold text-brand-blue flex items-center gap-2">
                    <CheckSquare size={16} className="text-brand-lightBlue" /> Open Tasks
                    {activeTasks.length > 0 && <span className="bg-brand-blue text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">{activeTasks.length}</span>}
                </h3>
                {canManage && (
                    <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-lightBlue/10 hover:bg-brand-lightBlue/20 text-brand-blue text-xs font-bold border border-brand-lightBlue/30 rounded-lg transition-colors">
                        <Plus size={12} /> Manage Tasks
                    </button>
                )}
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar divide-y-2 divide-brand-blue/5 p-1">
                {!tasks ? (
                    <p className="text-xs text-center text-brand-blue/40 italic p-8">Loading...</p>
                ) : activeTasks.length === 0 ? (
                    <p className="text-xs text-center text-brand-blue/40 italic p-8">No open tasks right now.</p>
                ) : activeTasks.map((task: any) => {
                    const isMine = task.assignedTo?.toString() === userId.toString();
                    return (
                        <div key={task._id} className="p-4 hover:bg-brand-bgLight/50 transition-colors">
                            <div className="flex items-start gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded border ${priorityStyle[task.priority]}`}>{task.priority}</span>
                                        <p className="text-sm font-bold text-brand-blue">{task.title}</p>
                                    </div>
                                    {task.description && <p className="text-xs text-brand-blue/60 mt-1 font-medium">{task.description}</p>}
                                    <div className="flex items-center gap-3 mt-2">
                                        {task.assignedTo ? (
                                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 flex items-center gap-1">
                                                <Users size={10} /> {task.assigneeName ?? "Someone"}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-green">Unclaimed</span>
                                        )}
                                        <span className={`text-[10px] font-extrabold uppercase tracking-widest ${task.status === "in_progress" ? "text-brand-lightBlue" : "text-brand-blue/30"}`}>
                                            {task.status === "in_progress" ? "In Progress" : "Open"}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-1.5 shrink-0">
                                    {!task.assignedTo && (
                                        <button onClick={() => claimTask({ taskId: task._id })} className="px-3 py-1.5 bg-brand-lightBlue/10 hover:bg-brand-lightBlue/20 text-brand-blue text-xs font-bold border-2 border-brand-lightBlue/30 rounded-lg transition-colors">
                                            Take
                                        </button>
                                    )}
                                    {(isMine || canManage) && task.assignedTo && (
                                        <button onClick={() => unclaimTask({ taskId: task._id })} className="px-3 py-1.5 bg-brand-bgLight hover:bg-white text-brand-blue/60 text-xs font-bold border-2 border-brand-blue/20 rounded-lg transition-colors">
                                            Drop
                                        </button>
                                    )}
                                    {(isMine || canManage) && task.status === "in_progress" && (
                                        <button onClick={() => updateTask({ taskId: task._id, status: "done" })} className="px-3 py-1.5 bg-brand-green/10 hover:bg-brand-green/20 text-brand-blue text-xs font-bold border-2 border-brand-green/30 rounded-lg transition-colors">
                                            Done
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {doneTasks.length > 0 && (
                    <div className="p-3 bg-brand-bgLight/50">
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/30 mb-2">Completed ({doneTasks.length})</p>
                        <div className="space-y-1">
                            {doneTasks.map((task: any) => (
                                <div key={task._id} className="flex items-center gap-2 py-1">
                                    <CheckCircle2 size={12} className="text-brand-green shrink-0" />
                                    <span className="text-xs text-brand-blue/50 line-through">{task.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {showModal && (
                <ManageModal title="Manage Open Tasks" onClose={() => setShowModal(false)}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 mb-4">Create Task</h3>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 mb-1">Title</label>
                                    <input value={newTitle} onChange={e => setNewTitle(e.target.value)} required placeholder="Task name..." className="w-full p-2.5 bg-white border-2 border-brand-blue/20 rounded-lg focus:border-brand-blue outline-none font-bold text-brand-blue text-sm placeholder:text-brand-blue/30" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 mb-1">Description</label>
                                    <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={3} placeholder="Detail what needs to be done..." className="w-full p-2.5 bg-white border-2 border-brand-blue/20 rounded-lg focus:border-brand-blue outline-none font-medium text-brand-blue resize-none text-sm placeholder:text-brand-blue/30" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 mb-1">Priority</label>
                                    <div className="flex gap-2">
                                        {(["low", "medium", "high"] as const).map(p => (
                                            <button key={p} type="button" onClick={() => setNewPriority(p)} className={`flex-1 py-2 text-xs font-bold rounded-lg border-2 capitalize transition-all ${newPriority === p ? priorityStyle[p] : "bg-brand-bgLight border-brand-blue/20 text-brand-blue/50"}`}>
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-2.5 bg-brand-lightBlue text-white font-bold rounded-lg border-2 border-brand-blue hover:-translate-y-0.5 transition-transform shadow-[4px_4px_0px_0px_rgba(10,22,48,0.45)]">
                                    Create Task
                                </button>
                            </form>
                        </div>
                        <div>
                            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 mb-4">All Tasks ({(tasks ?? []).length})</h3>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                                {(tasks ?? []).map((task: any) => (
                                    <div key={task._id} className="flex items-center gap-3 p-3 bg-white border-2 border-brand-blue/10 rounded-lg group">
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-bold text-brand-blue ${task.status === "done" ? "line-through opacity-50" : ""}`}>{task.title}</p>
                                            <span className={`text-[10px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded border ${priorityStyle[task.priority]}`}>{task.priority}</span>
                                        </div>
                                        <select
                                            value={task.status}
                                            onChange={e => updateTask({ taskId: task._id, status: e.target.value as any })}
                                            className="text-xs font-bold text-brand-blue bg-brand-bgLight border border-brand-blue/20 rounded px-2 py-1 outline-none"
                                        >
                                            <option value="open">Open</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="done">Done</option>
                                        </select>
                                        <button onClick={() => deleteTask({ taskId: task._id })} className="p-1.5 text-brand-red/40 hover:text-brand-red hover:bg-brand-red/10 rounded transition-all opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </ManageModal>
            )}
        </div>
    );
}

// --- Admin Stats Bar ---
function AdminStatsBar() {
    const stats = useQuery(api.admin.getDashboardStats);

    const items = [
        {
            label: "Staff Members",
            value: stats?.totalStaff ?? "—",
            icon: Users,
            color: "text-brand-lightBlue",
            bg: "bg-brand-lightBlue/10",
            border: "border-brand-lightBlue/20",
        },
        {
            label: "Active Cohorts",
            value: stats?.activeCohorts ?? "—",
            icon: Briefcase,
            color: "text-brand-green",
            bg: "bg-brand-green/10",
            border: "border-brand-green/20",
        },
        {
            label: "Pending Applications",
            value: stats?.pendingApplications ?? "—",
            icon: TrendingUp,
            color: "text-brand-yellow",
            bg: "bg-brand-yellow/10",
            border: "border-brand-yellow/30",
        },
        {
            label: "HR Submissions",
            value: stats?.pendingHRSubmissions ?? "—",
            icon: FileText,
            color: "text-brand-gray",
            bg: "bg-brand-gray/10",
            border: "border-brand-gray/30",
        },
        {
            label: "Open Tasks",
            value: stats?.openTasks ?? "—",
            icon: CheckSquare,
            color: "text-brand-wine",
            bg: "bg-brand-wine/10",
            border: "border-brand-wine/20",
        },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 shrink-0">
            {items.map((item) => {
                const Icon = item.icon;
                return (
                    <div
                        key={item.label}
                        className={`bg-white border-2 ${item.border} rounded-tl-xl rounded-br-xl shadow-[2px_2px_0px_0px_rgba(57,103,153,0.10)] p-3 flex items-center gap-3`}
                    >
                        <div className={`w-8 h-8 ${item.bg} rounded-tl-lg rounded-br-lg flex items-center justify-center shrink-0`}>
                            <Icon size={16} className={item.color} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xl font-display font-extrabold text-brand-blue leading-none">{item.value}</p>
                            <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/40 mt-0.5 truncate">{item.label}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// --- Main Dashboard ---
export default function DashboardPage() {
    const { user } = useAuthContext();
    if (!user) return null;

    const isAdmin = checkAdmin(user.role as Role);
    const canManageAnnouncements = isManager(user.role as Role);
    const canManageTasks = isManager(user.role as Role);

    return (
        <div className="w-full h-full flex flex-col gap-6 overflow-hidden">
            {isAdmin && <AdminStatsBar />}

            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 flex-1 min-h-0">
                {/* Left Column: Header + Announcements */}
                <div className="flex flex-col space-y-6 h-full">
                    <PageHeader
                        title="Dashboard"
                        subtitle={`Welcome back, ${user.name.split(' ')[0]}.`}
                        variant="ghost"
                        className="mb-4 shrink-0"
                    />
                    <div className="flex-1 min-h-0">
                        <AnnouncementsSection canManage={canManageAnnouncements} />
                    </div>
                </div>

                {/* Right Column: Tasks + To Dos */}
                <div className="flex flex-col gap-6 h-full">
                    <div className="flex-1 min-h-0">
                        <OpenTasksSection canManage={canManageTasks} userId={user._id} />
                    </div>
                    <div className="flex-1 min-h-0">
                        <PersonalToDoSection />
                    </div>
                </div>
            </div>
        </div>
    );
}
