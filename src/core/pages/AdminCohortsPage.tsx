import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { PageHeader } from "../components/ui/PageHeader";
import { useToast } from "../providers/ToastProvider";
import { format } from "date-fns";
import { Plus, Pencil, Trash2, X, Users, Calendar, CheckCircle2 } from "lucide-react";
import { z } from "zod";

type CohortStatus = "upcoming" | "active" | "past";

interface CohortDoc {
    _id: Id<"cohorts">;
    name: string;
    applicationStartDate: number;
    applicationEndDate: number;
    termStartDate: number;
    termEndDate: number;
    status: CohortStatus;
}

const STATUS_STYLES: Record<CohortStatus, string> = {
    upcoming: "bg-brand-blue/10 text-brand-blue border-brand-blue/30",
    active: "bg-brand-green/10 text-brand-green border-brand-green/30",
    past: "bg-gray-100 text-gray-500 border-gray-200",
};

const cohortSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    applicationStartDate: z.string().min(1, "Required"),
    applicationEndDate: z.string().min(1, "Required"),
    termStartDate: z.string().min(1, "Required"),
    termEndDate: z.string().min(1, "Required"),
    status: z.enum(["upcoming", "active", "past"]),
});

type FormValues = {
    name: string;
    applicationStartDate: string;
    applicationEndDate: string;
    termStartDate: string;
    termEndDate: string;
    status: CohortStatus;
};

const EMPTY_FORM: FormValues = {
    name: "",
    applicationStartDate: "",
    applicationEndDate: "",
    termStartDate: "",
    termEndDate: "",
    status: "upcoming",
};

function dateToTimestamp(dateStr: string): number {
    return new Date(dateStr).getTime();
}

function timestampToInput(ts: number): string {
    return format(new Date(ts), "yyyy-MM-dd");
}

function CohortModal({
    cohort,
    onClose,
}: {
    cohort: CohortDoc | null;
    onClose: () => void;
}) {
    const { toast } = useToast();
    const createCohort = useMutation(api.cohorts.createCohort);
    const updateCohort = useMutation(api.cohorts.updateCohort);
    const [values, setValues] = useState<FormValues>(
        cohort
            ? {
                  name: cohort.name,
                  applicationStartDate: timestampToInput(cohort.applicationStartDate),
                  applicationEndDate: timestampToInput(cohort.applicationEndDate),
                  termStartDate: timestampToInput(cohort.termStartDate),
                  termEndDate: timestampToInput(cohort.termEndDate),
                  status: cohort.status,
              }
            : EMPTY_FORM
    );
    const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
    const [saving, setSaving] = useState(false);

    const set = (key: keyof FormValues, val: string) => {
        setValues((prev) => ({ ...prev, [key]: val }));
        setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = cohortSchema.safeParse(values);
        if (!result.success) {
            const fieldErrors: Partial<Record<keyof FormValues, string>> = {};
            for (const err of result.error.issues) {
                const key = err.path[0] as keyof FormValues;
                if (!fieldErrors[key]) fieldErrors[key] = err.message;
            }
            setErrors(fieldErrors);
            return;
        }

        const appStart = dateToTimestamp(values.applicationStartDate);
        const appEnd = dateToTimestamp(values.applicationEndDate);
        const termStart = dateToTimestamp(values.termStartDate);
        const termEnd = dateToTimestamp(values.termEndDate);

        if (appEnd <= appStart) {
            setErrors((p) => ({ ...p, applicationEndDate: "End date must be after start date" }));
            return;
        }
        if (termEnd <= termStart) {
            setErrors((p) => ({ ...p, termEndDate: "Term end must be after term start" }));
            return;
        }

        setSaving(true);
        try {
            if (cohort) {
                await updateCohort({
                    cohortId: cohort._id,
                    name: values.name,
                    applicationStartDate: appStart,
                    applicationEndDate: appEnd,
                    termStartDate: termStart,
                    termEndDate: termEnd,
                    status: values.status,
                });
                toast("Cohort updated successfully.", "success");
            } else {
                await createCohort({
                    name: values.name,
                    applicationStartDate: appStart,
                    applicationEndDate: appEnd,
                    termStartDate: termStart,
                    termEndDate: termEnd,
                    status: values.status,
                });
                toast("Cohort created successfully.", "success");
            }
            onClose();
        } catch (err: any) {
            toast(err?.message ?? "Failed to save cohort.", "error");
        } finally {
            setSaving(false);
        }
    };

    const inputCls =
        "w-full p-2.5 bg-brand-bgLight border-2 border-brand-blueDark/20 rounded-lg focus:border-brand-blueDark outline-none font-medium text-brand-blueDark text-sm transition-colors";
    const labelCls = "block text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/50 mb-1";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-brand-blueDark/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-xl bg-white border-2 border-brand-blueDark rounded-tl-2xl rounded-br-2xl shadow-[8px_8px_0px_0px_rgba(10,22,48,0.3)] overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b-2 border-brand-blueDark bg-brand-blue/5">
                    <h2 className="font-display font-extrabold text-lg text-brand-blueDark">
                        {cohort ? "Edit Cohort" : "New Cohort"}
                    </h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-brand-blueDark/10 rounded-lg transition-colors">
                        <X size={18} className="text-brand-blueDark" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className={labelCls}>Cohort Name *</label>
                        <input
                            value={values.name}
                            onChange={(e) => set("name", e.target.value)}
                            placeholder="e.g. Season 10, Summer 2026"
                            className={inputCls}
                        />
                        {errors.name && <p className="text-xs text-brand-red mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className={labelCls}>Status *</label>
                        <select
                            value={values.status}
                            onChange={(e) => set("status", e.target.value)}
                            className={`${inputCls} appearance-none`}
                        >
                            <option value="upcoming">Upcoming</option>
                            <option value="active">Active</option>
                            <option value="past">Past</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Application Opens *</label>
                            <input
                                type="date"
                                value={values.applicationStartDate}
                                onChange={(e) => set("applicationStartDate", e.target.value)}
                                className={inputCls}
                            />
                            {errors.applicationStartDate && <p className="text-xs text-brand-red mt-1">{errors.applicationStartDate}</p>}
                        </div>
                        <div>
                            <label className={labelCls}>Application Closes *</label>
                            <input
                                type="date"
                                value={values.applicationEndDate}
                                onChange={(e) => set("applicationEndDate", e.target.value)}
                                className={inputCls}
                            />
                            {errors.applicationEndDate && <p className="text-xs text-brand-red mt-1">{errors.applicationEndDate}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Term Starts *</label>
                            <input
                                type="date"
                                value={values.termStartDate}
                                onChange={(e) => set("termStartDate", e.target.value)}
                                className={inputCls}
                            />
                            {errors.termStartDate && <p className="text-xs text-brand-red mt-1">{errors.termStartDate}</p>}
                        </div>
                        <div>
                            <label className={labelCls}>Term Ends *</label>
                            <input
                                type="date"
                                value={values.termEndDate}
                                onChange={(e) => set("termEndDate", e.target.value)}
                                className={inputCls}
                            />
                            {errors.termEndDate && <p className="text-xs text-brand-red mt-1">{errors.termEndDate}</p>}
                        </div>
                    </div>

                    <div className="pt-4 border-t-2 border-brand-blueDark/10">
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-brand-blue text-white font-bold rounded-lg border-2 border-brand-blueDark hover:-translate-y-0.5 transition-transform shadow-[4px_4px_0px_0px_rgba(10,22,48,0.45)] disabled:opacity-50"
                        >
                            <CheckCircle2 size={16} />
                            {saving ? "Saving..." : cohort ? "Save Changes" : "Create Cohort"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function AdminCohortsPage() {
    const { toast } = useToast();
    const cohorts = useQuery(api.cohorts.getAll) ?? [];
    const deleteCohort = useMutation(api.cohorts.deleteCohort);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<CohortDoc | null>(null);

    const handleDelete = async (cohort: CohortDoc) => {
        if (!confirm(`Delete "${cohort.name}"? This cannot be undone.`)) return;
        try {
            await deleteCohort({ cohortId: cohort._id });
            toast("Cohort deleted.", "success");
        } catch (err: any) {
            toast(err?.message ?? "Failed to delete cohort.", "error");
        }
    };

    const openCreate = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const openEdit = (cohort: CohortDoc) => {
        setEditing(cohort);
        setModalOpen(true);
    };

    const addBtn = (
        <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white text-sm font-bold border-2 border-brand-blueDark rounded-lg hover:-translate-y-0.5 transition-transform shadow-[4px_4px_0px_0px_rgba(10,22,48,0.45)]"
        >
            <Plus size={14} /> New Cohort
        </button>
    );

    const grouped = cohorts.reduce<Record<CohortStatus, CohortDoc[]>>(
        (acc, c) => {
            acc[c.status as CohortStatus].push(c as CohortDoc);
            return acc;
        },
        { active: [], upcoming: [], past: [] }
    );

    return (
        <div className="w-full space-y-8 pb-12">
            <PageHeader
                title="Cohort Management"
                subtitle="Create and manage recruitment cohorts and their timelines."
                action={addBtn}
            />

            {cohorts.length === 0 && (
                <div className="bg-white border-2 border-dashed border-brand-blueDark/20 rounded-2xl p-12 text-center">
                    <Users size={40} className="mx-auto text-brand-blueDark/20 mb-4" />
                    <p className="font-display font-extrabold text-brand-blueDark/40 text-lg">No cohorts yet</p>
                    <p className="text-sm text-brand-blueDark/30 mt-1">Create your first cohort to start the recruitment pipeline.</p>
                    <button
                        onClick={openCreate}
                        className="mt-6 flex items-center gap-2 mx-auto px-5 py-2.5 bg-brand-blue text-white font-bold rounded-lg border-2 border-brand-blueDark hover:-translate-y-0.5 transition-transform shadow-[4px_4px_0px_0px_rgba(10,22,48,0.45)]"
                    >
                        <Plus size={16} /> Create First Cohort
                    </button>
                </div>
            )}

            {(["active", "upcoming", "past"] as CohortStatus[]).map((status) => {
                if (grouped[status].length === 0) return null;
                return (
                    <div key={status}>
                        <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/40 mb-3">
                            {status === "active" ? "Active" : status === "upcoming" ? "Upcoming" : "Past"}
                        </h2>
                        <div className="space-y-3">
                            {grouped[status].map((cohort) => (
                                <div
                                    key={cohort._id}
                                    className="bg-white border-2 border-brand-blueDark/10 rounded-2xl p-5 hover:border-brand-blueDark/20 transition-colors flex flex-col sm:flex-row sm:items-center gap-4"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-display font-extrabold text-brand-blueDark text-lg">{cohort.name}</h3>
                                            <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 border rounded-lg ${STATUS_STYLES[cohort.status]}`}>
                                                {cohort.status}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-brand-blueDark/60">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={12} className="shrink-0" />
                                                <span>
                                                    Apps: {format(cohort.applicationStartDate, "MMM d")} – {format(cohort.applicationEndDate, "MMM d, yyyy")}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={12} className="shrink-0" />
                                                <span>
                                                    Term: {format(cohort.termStartDate, "MMM d")} – {format(cohort.termEndDate, "MMM d, yyyy")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => openEdit(cohort)}
                                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-brand-blue bg-brand-blue/5 hover:bg-brand-blue/10 border border-brand-blue/20 rounded-lg transition-colors"
                                        >
                                            <Pencil size={13} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cohort)}
                                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-brand-red bg-brand-red/5 hover:bg-brand-red/10 border border-brand-red/20 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={13} /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            {modalOpen && (
                <CohortModal
                    cohort={editing}
                    onClose={() => {
                        setModalOpen(false);
                        setEditing(null);
                    }}
                />
            )}
        </div>
    );
}
