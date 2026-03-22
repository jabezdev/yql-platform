import { useState } from "react";
import { useAuthContext } from "../providers/AuthProvider";
import { useToast } from "../providers/ToastProvider";
import { isAdmin as checkAdmin } from "../constants/roles";
import type { Role } from "../constants/roles";
import {
    FileText, UserMinus, ArrowUpDown, ShoppingCart, Key,
    Users, Star, MessageSquare, AlertTriangle, X, ChevronRight,
    Send, CheckCircle2, Shield, Archive, Clock, History
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { format } from "date-fns";
import { PageHeader } from "../components/ui/PageHeader";

interface HRForm {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
    bg: string;
    border: string;
    fields: FormField[];
}

interface FormField {
    id: string;
    label: string;
    type: "text" | "textarea" | "select" | "date" | "email";
    required?: boolean;
    options?: string[];
    placeholder?: string;
}

const HR_FORMS: HRForm[] = [
    {
        id: "loa",
        title: "Leave of Absence",
        description: "Request time off for personal, medical, or other reasons.",
        icon: UserMinus,
        color: "text-brand-lightBlue",
        bg: "bg-brand-lightBlue/10",
        border: "border-brand-lightBlue/30",
        fields: [
            { id: "leave_type", label: "Leave Type", type: "select", required: true, options: ["Personal", "Medical", "Family Emergency", "Academic", "Other"] },
            { id: "start_date", label: "Start Date", type: "date", required: true },
            { id: "end_date", label: "End Date", type: "date", required: true },
            { id: "reason", label: "Reason / Details", type: "textarea", required: true, placeholder: "Please provide details about your leave request..." },
            { id: "coverage", label: "Coverage Plan", type: "textarea", placeholder: "Who will cover your responsibilities?" },
        ],
    },
    {
        id: "role_change",
        title: "Role Change Request",
        description: "Request a change in your role, responsibilities, or team assignment.",
        icon: ArrowUpDown,
        color: "text-brand-green",
        bg: "bg-brand-green/10",
        border: "border-brand-green/30",
        fields: [
            { id: "current_role", label: "Current Role / Assignment", type: "text", required: true },
            { id: "requested_role", label: "Requested Role / Assignment", type: "text", required: true },
            { id: "justification", label: "Justification", type: "textarea", required: true, placeholder: "Why are you requesting this change?" },
            { id: "effective_date", label: "Requested Effective Date", type: "date" },
        ],
    },
    {
        id: "purchase_request",
        title: "Purchase Request",
        description: "Request approval to purchase materials, tools, or services.",
        icon: ShoppingCart,
        color: "text-brand-yellow",
        bg: "bg-brand-yellow/10",
        border: "border-brand-yellow/30",
        fields: [
            { id: "item_name", label: "Item / Service", type: "text", required: true, placeholder: "What needs to be purchased?" },
            { id: "estimated_cost", label: "Estimated Cost (PHP)", type: "text", required: true, placeholder: "e.g. 1,500" },
            { id: "vendor", label: "Vendor / Supplier", type: "text", placeholder: "Where will this be purchased?" },
            { id: "purpose", label: "Purpose / Justification", type: "textarea", required: true, placeholder: "Why is this needed?" },
            { id: "urgency", label: "Urgency", type: "select", options: ["Low – Within the month", "Medium – Within 2 weeks", "High – Within a week", "Urgent – ASAP"] },
        ],
    },
    {
        id: "account_access",
        title: "Account Access Request",
        description: "Request access to platforms, tools, or accounts.",
        icon: Key,
        color: "text-purple-600",
        bg: "bg-purple-50",
        border: "border-purple-200",
        fields: [
            { id: "platform", label: "Platform / Tool", type: "text", required: true, placeholder: "e.g. Notion, Figma, GitHub Org..." },
            { id: "access_level", label: "Access Level Needed", type: "select", required: true, options: ["View Only", "Edit / Contributor", "Admin"] },
            { id: "reason", label: "Reason for Access", type: "textarea", required: true, placeholder: "Why do you need this access?" },
        ],
    },
    {
        id: "peer_eval",
        title: "Peer Evaluation",
        description: "Provide feedback on a fellow team member's performance.",
        icon: Users,
        color: "text-brand-lightBlue",
        bg: "bg-brand-lightBlue/10",
        border: "border-brand-lightBlue/30",
        fields: [
            { id: "evaluatee", label: "Who are you evaluating?", type: "text", required: true, placeholder: "Name of the team member" },
            { id: "collaboration", label: "Collaboration & Teamwork", type: "select", required: true, options: ["1 – Needs Improvement", "2 – Below Expectations", "3 – Meets Expectations", "4 – Exceeds Expectations", "5 – Outstanding"] },
            { id: "communication", label: "Communication", type: "select", required: true, options: ["1 – Needs Improvement", "2 – Below Expectations", "3 – Meets Expectations", "4 – Exceeds Expectations", "5 – Outstanding"] },
            { id: "initiative", label: "Initiative & Ownership", type: "select", required: true, options: ["1 – Needs Improvement", "2 – Below Expectations", "3 – Meets Expectations", "4 – Exceeds Expectations", "5 – Outstanding"] },
            { id: "strengths", label: "Key Strengths", type: "textarea", placeholder: "What does this person do particularly well?" },
            { id: "improvements", label: "Areas for Growth", type: "textarea", placeholder: "What could they improve on?" },
        ],
    },
    {
        id: "self_eval",
        title: "Self-Evaluation",
        description: "Reflect on your own performance and growth this term.",
        icon: Star,
        color: "text-brand-yellow",
        bg: "bg-brand-yellow/10",
        border: "border-brand-yellow/40",
        fields: [
            { id: "accomplishments", label: "Key Accomplishments", type: "textarea", required: true, placeholder: "What are you most proud of this term?" },
            { id: "challenges", label: "Biggest Challenges", type: "textarea", required: true, placeholder: "What was difficult and how did you handle it?" },
            { id: "growth_areas", label: "Areas for Growth", type: "textarea", placeholder: "What skills or habits do you want to improve?" },
            { id: "overall_rating", label: "Self-Rating", type: "select", required: true, options: ["1 – Needs Improvement", "2 – Below Expectations", "3 – Meets Expectations", "4 – Exceeds Expectations", "5 – Outstanding"] },
            { id: "goals_next", label: "Goals for Next Term", type: "textarea", placeholder: "What do you plan to accomplish?" },
        ],
    },
    {
        id: "suggestion",
        title: "Suggestions Inbox",
        description: "Share ideas, suggestions, or feedback to improve the organization.",
        icon: MessageSquare,
        color: "text-brand-green",
        bg: "bg-brand-green/10",
        border: "border-brand-green/30",
        fields: [
            { id: "category", label: "Category", type: "select", options: ["Operations", "Events", "Culture & Wellbeing", "Tools & Systems", "Communication", "Other"] },
            { id: "suggestion", label: "Your Suggestion", type: "textarea", required: true, placeholder: "Share your idea or feedback..." },
            { id: "anon", label: "Submit Anonymously?", type: "select", options: ["No – Include my name", "Yes – Keep it anonymous"] },
        ],
    },
    {
        id: "incident",
        title: "Incident Reporting",
        description: "Report an incident, concern, or conduct issue confidentially.",
        icon: AlertTriangle,
        color: "text-brand-red",
        bg: "bg-brand-red/10",
        border: "border-brand-red/20",
        fields: [
            { id: "incident_type", label: "Incident Type", type: "select", required: true, options: ["Misconduct", "Harassment", "Safety Issue", "Data Breach / Security", "Policy Violation", "Other"] },
            { id: "date_of_incident", label: "Date of Incident", type: "date" },
            { id: "description", label: "Describe what happened", type: "textarea", required: true, placeholder: "Provide as much detail as possible..." },
            { id: "parties_involved", label: "Parties Involved", type: "textarea", placeholder: "Who was involved? (optional)" },
            { id: "desired_outcome", label: "Desired Outcome", type: "textarea", placeholder: "What would you like to see happen?" },
        ],
    },
];

function FormField({ field, value, onChange }: { field: FormField; value: string; onChange: (v: string) => void }) {
    const base = "w-full p-2.5 bg-brand-bgLight border-2 border-brand-blue/20 rounded-lg focus:border-brand-blue outline-none font-medium text-brand-blue text-sm transition-colors";
    return (
        <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 mb-1">
                {field.label} {field.required && <span className="text-brand-red normal-case tracking-normal">*</span>}
            </label>
            {field.type === "textarea" ? (
                <textarea value={value} onChange={e => onChange(e.target.value)} required={field.required} placeholder={field.placeholder} rows={3} className={`${base} resize-none`} />
            ) : field.type === "select" ? (
                <select value={value} onChange={e => onChange(e.target.value)} required={field.required} className={`${base} appearance-none`}>
                    <option value="">– Select –</option>
                    {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            ) : (
                <input type={field.type} value={value} onChange={e => onChange(e.target.value)} required={field.required} placeholder={field.placeholder} className={base} />
            )}
        </div>
    );
}

function FormModal({ form, onClose }: { form: HRForm; onClose: () => void }) {
    const { toast } = useToast();
    const submitHRForm = useMutation(api.hrForms.submitHRForm);
    const [values, setValues] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const Icon = form.icon;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await submitHRForm({
                formId: form.id,
                responses: values
            });
            setSubmitted(true);
        } catch (err) {
            console.error("Submission failed:", err);
            toast("Failed to submit form. Please try again.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 min-h-full">
            <div className="absolute inset-0 bg-brand-blue/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl max-h-[95%] bg-white border-2 border-brand-blue rounded-tl-2xl rounded-br-2xl shadow-[8px_8px_0px_0px_rgba(10,22,48,0.3)] flex flex-col overflow-hidden">
                {/* Header */}
                <div className={`p-5 border-b-2 border-brand-blue ${form.bg} shrink-0`}>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 ${form.border} bg-white`}>
                                <Icon size={18} className={form.color} />
                            </div>
                            <div>
                                <h2 className="font-display font-extrabold text-lg text-brand-blue">{form.title}</h2>
                                <p className="text-xs text-brand-blue/60 font-medium">{form.description}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-1.5 hover:bg-brand-blue/10 rounded-lg transition-colors shrink-0">
                            <X size={18} className="text-brand-blue" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {submitted ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto bg-brand-green/10 rounded-full flex items-center justify-center mb-4 border-2 border-brand-green/30">
                                <CheckCircle2 size={28} className="text-brand-green" />
                            </div>
                            <h3 className="text-xl font-display font-extrabold text-brand-blue mb-2">Form Submitted</h3>
                            <p className="text-sm text-brand-blue/60 font-medium">Your {form.title} has been submitted and will be reviewed by the admin team.</p>
                            <button onClick={onClose} className="mt-6 px-6 py-2.5 bg-brand-blue text-white font-bold rounded-lg border-2 border-brand-blue hover:-translate-y-0.5 transition-transform shadow-[4px_4px_0px_0px_rgba(10,22,48,0.45)]">
                                Close
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {form.fields.map(field => (
                                <FormField
                                    key={field.id}
                                    field={field}
                                    value={values[field.id] ?? ""}
                                    onChange={v => setValues(prev => ({ ...prev, [field.id]: v }))}
                                />
                            ))}
                            <div className="pt-4 border-t-2 border-brand-blue/10">
                                <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 py-3 bg-brand-lightBlue text-white font-bold rounded-lg border-2 border-brand-blue hover:-translate-y-0.5 transition-transform shadow-[4px_4px_0px_0px_rgba(10,22,48,0.45)] disabled:opacity-50">
                                    <Send size={16} /> {submitting ? "Submitting..." : "Submit Form"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

const STATUS_STYLES: Record<string, string> = {
    pending: "bg-brand-yellow/10 text-brand-yellow border-brand-yellow/30",
    reviewed: "bg-brand-green/10 text-brand-green border-brand-green/30",
    archived: "bg-gray-100 text-gray-500 border-gray-200",
};

export default function AdminFormsPage() {
    const { user } = useAuthContext();
    const [showManage, setShowManage] = useState(false);
    const [selectedForm, setSelectedForm] = useState<HRForm | null>(null);
    const mySubmissions = useQuery(api.hrForms.getMyHRSubmissions) ?? [];
    const canManage = user ? checkAdmin(user.role as Role) : false;

    const manageBtn = canManage && (
        <button
            onClick={() => setShowManage(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-wine/10 hover:bg-brand-wine/20 text-brand-wine text-sm font-bold border-2 border-brand-wine/30 rounded-lg transition-colors"
        >
            <Shield size={14} /> Manage Submissions
        </button>
    );

    return (
        <div className="w-full space-y-8 pb-12">
            <PageHeader
                title="HR Forms"
                subtitle="Submit requests, evaluations, and reports to the admin team."
                action={manageBtn || undefined}
            />

            {/* Info Banner */}
            <div className="bg-brand-lightBlue/5 border-2 border-brand-lightBlue/20 rounded-xl p-4 flex items-start gap-3">
                <FileText size={18} className="text-brand-lightBlue mt-0.5 shrink-0" />
                <div>
                    <p className="text-sm font-bold text-brand-blue">All submissions are confidential</p>
                    <p className="text-xs text-brand-blue/60 font-medium mt-0.5">Forms are reviewed by the admin team. Responses are handled with care and discretion.</p>
                </div>
            </div>

            {/* Form Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {HR_FORMS.map(form => {
                    const Icon = form.icon;
                    return (
                        <button
                            key={form.id}
                            onClick={() => setSelectedForm(form)}
                            className="group bg-white border-2 border-brand-blue rounded-tl-2xl rounded-br-2xl p-5 shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] hover:shadow-[8px_8px_0px_0px_rgba(10,22,48,0.3)] hover:-translate-y-1.5 transition-all text-left flex flex-col gap-4"
                        >
                            <div className="flex items-center justify-between">
                                <div className={`w-11 h-11 rounded-xl border-2 ${form.border} ${form.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <Icon size={20} className={form.color} />
                                </div>
                                <ChevronRight size={18} className="text-brand-blue/20 group-hover:text-brand-blue group-hover:translate-x-1 transition-all" />
                            </div>
                            <div>
                                <h3 className="font-display font-extrabold text-brand-blue text-base leading-tight">{form.title}</h3>
                                <p className="text-xs text-brand-blue/60 font-medium mt-1 leading-relaxed">{form.description}</p>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* My Submission History */}
            {mySubmissions.length > 0 && (
                <div>
                    <h2 className="flex items-center gap-2 text-base font-display font-extrabold text-brand-blue mb-4">
                        <History size={18} /> My Recent Submissions
                    </h2>
                    <div className="space-y-2">
                        {mySubmissions.slice(0, 10).map(s => {
                            const form = HR_FORMS.find(f => f.id === s.formId);
                            const Icon = form?.icon ?? FileText;
                            return (
                                <div key={s._id} className="bg-white border-2 border-brand-blue/10 rounded-xl px-4 py-3 flex items-center gap-4 hover:border-brand-blue/20 transition-colors">
                                    <div className={`w-9 h-9 rounded-lg border-2 ${form?.border ?? "border-gray-200"} ${form?.bg ?? "bg-gray-50"} flex items-center justify-center shrink-0`}>
                                        <Icon size={16} className={form?.color ?? "text-gray-500"} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-brand-blue truncate">{form?.title ?? s.formId.replace(/_/g, " ")}</p>
                                        <p className="text-xs text-brand-blue/40 font-medium flex items-center gap-1 mt-0.5">
                                            <Clock size={11} /> {format(s.createdAt, "MMM d, yyyy 'at' h:mm a")}
                                        </p>
                                    </div>
                                    <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 border rounded-lg ${STATUS_STYLES[s.status]}`}>
                                        {s.status}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {selectedForm && <FormModal form={selectedForm} onClose={() => setSelectedForm(null)} />}
            {showManage && <ManageSubmissionsModal onClose={() => setShowManage(false)} />}
        </div>
    );
}

function ManageSubmissionsModal({ onClose }: { onClose: () => void }) {
    const [statusFilter, setStatusFilter] = useState<"pending" | "reviewed" | "archived">("pending");
    const submissions = useQuery(api.hrForms.getHRSubmissions, { status: statusFilter });
    const updateStatus = useMutation(api.hrForms.updateHRSubmissionStatus);
    const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 min-h-full">
            <div className="absolute inset-0 bg-brand-blue/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-5xl h-[90%] bg-brand-bgLight border-2 border-brand-blue rounded-tl-2xl rounded-br-2xl shadow-[8px_8px_0px_0px_rgba(10,22,48,0.3)] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b-2 border-brand-blue bg-white shrink-0">
                    <div className="flex items-center gap-4">
                        <h2 className="font-display font-extrabold text-xl text-brand-blue">HR Form Submissions</h2>
                        <div className="flex bg-brand-bgLight p-1 rounded-lg border border-brand-blue/10">
                            {(["pending", "reviewed", "archived"] as const).map(s => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={`px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest transition-all ${statusFilter === s ? "bg-brand-blue text-white" : "text-brand-blue/50 hover:text-brand-blue"}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-brand-bgLight rounded-lg transition-colors">
                        <X size={20} className="text-brand-blue" />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex">
                    {/* Sidebar / List */}
                    <div className="w-1/3 border-r-2 border-brand-blue/10 flex flex-col bg-white">
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                            {!submissions ? (
                                <p className="text-center py-8 text-xs text-brand-blue/40">Loading...</p>
                            ) : submissions.length === 0 ? (
                                <p className="text-center py-8 text-xs text-brand-blue/40 font-medium italic">No submissions found.</p>
                            ) : submissions.map(s => (
                                <button
                                    key={s._id}
                                    onClick={() => setSelectedSubmission(s)}
                                    className={`w-full text-left p-3 rounded-xl border-2 transition-all ${selectedSubmission?._id === s._id ? "bg-brand-lightBlue/5 border-brand-lightBlue shadow-[3px_3px_0px_0px_rgba(57,103,153,0.2)]" : "bg-white border-brand-blue/5 hover:border-brand-blue/20"}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-[10px] font-extrabold text-brand-lightBlue uppercase tracking-tight">{s.formId.replace(/_/g, " ")}</p>
                                        <p className="text-[10px] font-medium text-brand-blue/40">{format(s.createdAt, "MMM d, h:mm a")}</p>
                                    </div>
                                    <p className="text-sm font-bold text-brand-blue truncate">{s.userName}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content / Detail */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-brand-bgLight/30">
                        {selectedSubmission ? (
                            <div className="max-w-2xl mx-auto space-y-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-2xl font-display font-extrabold text-brand-blue">{selectedSubmission.userName}</h3>
                                        <p className="text-sm font-medium text-brand-blue/60">{selectedSubmission.email}</p>
                                        <div className="flex items-center gap-3 mt-4">
                                            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 bg-brand-blue text-white rounded-lg">
                                                {selectedSubmission.formId.replace(/_/g, " ")}
                                            </span>
                                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/40">
                                                Submitted {format(selectedSubmission.createdAt, "PPP 'at' p")}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {selectedSubmission.status !== "reviewed" && (
                                            <button onClick={() => updateStatus({ submissionId: selectedSubmission._id, status: "reviewed" })} className="flex items-center gap-1.5 px-3 py-2 bg-brand-green/10 hover:bg-brand-green/20 text-brand-green text-xs font-bold border border-brand-green/30 rounded-lg transition-colors">
                                                <CheckCircle2 size={14} /> Mark Reviewed
                                            </button>
                                        )}
                                        {selectedSubmission.status !== "archived" && (
                                            <button onClick={() => updateStatus({ submissionId: selectedSubmission._id, status: "archived" })} className="flex items-center gap-1.5 px-3 py-2 bg-brand-bgLight hover:bg-brand-blue/10 text-brand-blue/60 text-xs font-bold border border-brand-blue/20 rounded-lg transition-colors">
                                                <Archive size={14} /> Archive
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white border-2 border-brand-blue rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(10,22,48,0.45)]">
                                    <div className="space-y-6">
                                        {Object.entries(selectedSubmission.responses).map(([key, val]: [string, any]) => (
                                            <div key={key}>
                                                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/40 mb-1">{key.replace(/_/g, " ")}</label>
                                                <p className="text-sm font-medium text-brand-blue leading-relaxed">{val || <span className="italic text-brand-blue/20">Empty</span>}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-brand-blue/20 italic">
                                <FileText size={48} className="mb-4 opacity-5" />
                                <p>Select a submission to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
