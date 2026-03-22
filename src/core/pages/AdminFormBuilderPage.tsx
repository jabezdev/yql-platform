import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { PageHeader } from "../components/ui/PageHeader";
import { useToast } from "../providers/ToastProvider";
import { Plus, Trash2, Save, ChevronUp, ChevronDown, FileText } from "lucide-react";

type FieldType = "text" | "textarea" | "file" | "select" | "multiselect";

interface FormField {
    id: string;
    type: FieldType;
    label: string;
    required: boolean;
    options?: string[];
}

const FIELD_TYPES: { value: FieldType; label: string; description: string }[] = [
    { value: "text", label: "Short Text", description: "Single line answer" },
    { value: "textarea", label: "Long Text", description: "Multi-paragraph answer" },
    { value: "select", label: "Dropdown", description: "Choose one option" },
    { value: "multiselect", label: "Multi-select", description: "Choose multiple options" },
    { value: "file", label: "File Upload", description: "PDF document upload" },
];

const INPUT_CLS =
    "w-full p-2.5 bg-brand-bgLight border-2 border-brand-blue/20 rounded-lg focus:border-brand-blue outline-none font-medium text-brand-blue text-sm transition-colors";

function generateId() {
    return `field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function FieldEditor({
    field,
    index,
    total,
    onChange,
    onRemove,
    onMoveUp,
    onMoveDown,
}: {
    field: FormField;
    index: number;
    total: number;
    onChange: (updated: FormField) => void;
    onRemove: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
}) {
    const [newOption, setNewOption] = useState("");

    const addOption = () => {
        const trimmed = newOption.trim();
        if (!trimmed) return;
        onChange({ ...field, options: [...(field.options ?? []), trimmed] });
        setNewOption("");
    };

    const removeOption = (i: number) => {
        onChange({ ...field, options: field.options?.filter((_, idx) => idx !== i) });
    };

    const needsOptions = field.type === "select" || field.type === "multiselect";

    return (
        <div className="bg-white border-2 border-brand-blue/10 rounded-2xl p-5 group hover:border-brand-blue/20 transition-colors">
            <div className="flex items-start gap-3">
                {/* Reorder controls */}
                <div className="flex flex-col gap-1 pt-1 shrink-0">
                    <button
                        type="button"
                        onClick={onMoveUp}
                        disabled={index === 0}
                        className="p-1 text-brand-blue/30 hover:text-brand-blue disabled:opacity-20 transition-colors"
                    >
                        <ChevronUp size={14} />
                    </button>
                    <span className="text-[10px] font-extrabold text-brand-blue/30 text-center">{index + 1}</span>
                    <button
                        type="button"
                        onClick={onMoveDown}
                        disabled={index === total - 1}
                        className="p-1 text-brand-blue/30 hover:text-brand-blue disabled:opacity-20 transition-colors"
                    >
                        <ChevronDown size={14} />
                    </button>
                </div>

                <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px_auto] gap-3 items-start">
                        <div>
                            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 mb-1">
                                Question Label *
                            </label>
                            <input
                                value={field.label}
                                onChange={(e) => onChange({ ...field, label: e.target.value })}
                                placeholder="e.g. Why do you want to join QCSP?"
                                className={INPUT_CLS}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 mb-1">
                                Type
                            </label>
                            <select
                                value={field.type}
                                onChange={(e) =>
                                    onChange({ ...field, type: e.target.value as FieldType, options: undefined })
                                }
                                className={`${INPUT_CLS} appearance-none`}
                            >
                                {FIELD_TYPES.map((ft) => (
                                    <option key={ft.value} value={ft.value}>
                                        {ft.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="pt-6">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={field.required}
                                    onChange={(e) => onChange({ ...field, required: e.target.checked })}
                                    className="w-4 h-4 rounded border-2 border-brand-blue/30"
                                />
                                <span className="text-xs font-bold text-brand-blue">Required</span>
                            </label>
                        </div>
                    </div>

                    {needsOptions && (
                        <div>
                            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 mb-2">
                                Options
                            </label>
                            <div className="space-y-2 mb-2">
                                {(field.options ?? []).map((opt, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-brand-bgLight px-3 py-2 rounded-lg border border-brand-blue/10">
                                        <span className="flex-1 text-sm font-medium text-brand-blue">{opt}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeOption(i)}
                                            className="p-1 text-brand-red/40 hover:text-brand-red transition-colors"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    value={newOption}
                                    onChange={(e) => setNewOption(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") { e.preventDefault(); addOption(); }
                                    }}
                                    placeholder="Type option and press Enter..."
                                    className={`${INPUT_CLS} flex-1`}
                                />
                                <button
                                    type="button"
                                    onClick={addOption}
                                    className="px-3 py-2 bg-brand-lightBlue/10 text-brand-blue border-2 border-brand-lightBlue/20 rounded-lg hover:bg-brand-lightBlue/20 transition-colors font-bold text-sm"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={onRemove}
                    className="p-2 text-brand-red/30 hover:text-brand-red hover:bg-brand-red/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 shrink-0 mt-1"
                    title="Remove field"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}

export default function AdminFormBuilderPage() {
    const { toast } = useToast();
    const cohorts = useQuery(api.cohorts.getAll) ?? [];
    const createOrUpdateForm = useMutation(api.forms.createOrUpdateForm);

    const [selectedCohortId, setSelectedCohortId] = useState<Id<"cohorts"> | "">("");
    const existingForm = useQuery(
        api.forms.getFormForCohort,
        selectedCohortId ? { cohortId: selectedCohortId as Id<"cohorts"> } : "skip"
    );

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [fields, setFields] = useState<FormField[]>([]);
    const [saving, setSaving] = useState(false);
    const [loadedFor, setLoadedFor] = useState<string>("");

    // Populate from existing form when cohort changes
    if (existingForm !== undefined && loadedFor !== selectedCohortId) {
        setLoadedFor(selectedCohortId as string);
        if (existingForm) {
            setTitle(existingForm.title);
            setDescription(existingForm.description ?? "");
            setFields(existingForm.fields.map((f) => ({ ...f })) as FormField[]);
        } else {
            setTitle("");
            setDescription("");
            setFields([]);
        }
    }

    const addField = () => {
        setFields((prev) => [
            ...prev,
            { id: generateId(), type: "text", label: "", required: false },
        ]);
    };

    const updateField = (index: number, updated: FormField) => {
        setFields((prev) => prev.map((f, i) => (i === index ? updated : f)));
    };

    const removeField = (index: number) => {
        setFields((prev) => prev.filter((_, i) => i !== index));
    };

    const moveField = (index: number, direction: -1 | 1) => {
        setFields((prev) => {
            const next = [...prev];
            const target = index + direction;
            if (target < 0 || target >= next.length) return prev;
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCohortId) { toast("Select a cohort first.", "error"); return; }
        if (!title.trim()) { toast("Form title is required.", "error"); return; }
        if (fields.length === 0) { toast("Add at least one field.", "error"); return; }
        const emptyLabel = fields.some((f) => !f.label.trim());
        if (emptyLabel) { toast("All fields must have a label.", "error"); return; }

        setSaving(true);
        try {
            await createOrUpdateForm({
                formId: existingForm?._id ?? undefined,
                cohortId: selectedCohortId as Id<"cohorts">,
                title,
                description: description || undefined,
                fields,
            });
            toast("Application form saved.", "success");
            setLoadedFor(""); // force re-load confirmation
        } catch (err: any) {
            toast(err?.message ?? "Failed to save form.", "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="w-full space-y-8 pb-12">
            <PageHeader
                title="Application Form Builder"
                subtitle="Build the application form that prospective members fill out for a cohort."
            />

            {/* Cohort Selector */}
            <div className="bg-white border-2 border-brand-blue rounded-tl-2xl rounded-br-2xl shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] p-6">
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 mb-2">
                    Select Cohort *
                </label>
                <select
                    value={selectedCohortId}
                    onChange={(e) => {
                        setSelectedCohortId(e.target.value as Id<"cohorts">);
                        setLoadedFor("");
                    }}
                    className={`${INPUT_CLS} max-w-md appearance-none`}
                >
                    <option value="">— Choose a cohort —</option>
                    {cohorts.map((c) => (
                        <option key={c._id} value={c._id}>
                            {c.name} ({c.status})
                        </option>
                    ))}
                </select>
                {selectedCohortId && existingForm !== undefined && (
                    <p className={`text-xs font-bold mt-2 ${existingForm ? "text-brand-green" : "text-brand-blue/40"}`}>
                        {existingForm ? "Existing form loaded — saving will overwrite." : "No form yet — you're creating a new one."}
                    </p>
                )}
            </div>

            {/* Form Editor */}
            {selectedCohortId && (
                <form onSubmit={handleSave} className="space-y-6">
                    {/* Form metadata */}
                    <div className="bg-white border-2 border-brand-blue/10 rounded-2xl p-6 space-y-4">
                        <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50">
                            Form Details
                        </h2>
                        <div>
                            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 mb-1">
                                Form Title *
                            </label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. QCSP Season 10 Application"
                                className={INPUT_CLS}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 mb-1">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief intro shown to applicants before they fill out the form..."
                                rows={3}
                                className={`${INPUT_CLS} resize-none`}
                            />
                        </div>
                    </div>

                    {/* Fields */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-display font-extrabold text-brand-blue flex items-center gap-2">
                                <FileText size={18} className="text-brand-lightBlue" />
                                Questions
                                {fields.length > 0 && (
                                    <span className="bg-brand-blue text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">
                                        {fields.length}
                                    </span>
                                )}
                            </h2>
                        </div>

                        {fields.length === 0 ? (
                            <div className="bg-white border-2 border-dashed border-brand-blue/20 rounded-2xl p-10 text-center">
                                <FileText size={36} className="mx-auto text-brand-blue/20 mb-3" />
                                <p className="font-display font-extrabold text-brand-blue/40">No questions yet</p>
                                <p className="text-sm text-brand-blue/30 mt-1">Add your first question below.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {fields.map((field, index) => (
                                    <FieldEditor
                                        key={field.id}
                                        field={field}
                                        index={index}
                                        total={fields.length}
                                        onChange={(updated) => updateField(index, updated)}
                                        onRemove={() => removeField(index)}
                                        onMoveUp={() => moveField(index, -1)}
                                        onMoveDown={() => moveField(index, 1)}
                                    />
                                ))}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={addField}
                            className="mt-4 flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-brand-blue bg-brand-bgLight border-2 border-brand-blue/20 rounded-xl hover:border-brand-blue/40 transition-colors"
                        >
                            <Plus size={16} /> Add Question
                        </button>
                    </div>

                    <div className="flex justify-end border-t-2 border-brand-blue/10 pt-6">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-8 py-3 bg-brand-lightBlue text-white font-bold rounded-xl border-2 border-brand-blue hover:-translate-y-0.5 transition-transform shadow-[4px_4px_0px_0px_rgba(10,22,48,0.45)] disabled:opacity-50"
                        >
                            <Save size={18} />
                            {saving ? "Saving..." : "Save Form"}
                        </button>
                    </div>
                </form>
            )}

            {!selectedCohortId && cohorts.length === 0 && (
                <div className="bg-white border-2 border-dashed border-brand-blue/20 rounded-2xl p-12 text-center">
                    <FileText size={40} className="mx-auto text-brand-blue/20 mb-4" />
                    <p className="font-display font-extrabold text-brand-blue/40 text-lg">No cohorts yet</p>
                    <p className="text-sm text-brand-blue/30 mt-1">Create a cohort first, then build its application form.</p>
                </div>
            )}
        </div>
    );
}
