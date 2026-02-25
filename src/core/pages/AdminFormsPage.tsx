import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Plus, Trash2, Save } from "lucide-react";

export default function AdminFormsPage() {
    const cohorts = useQuery(api.cohorts.getAll) || []; // NOTE: need to add getAll to cohorts
    const [selectedCohortId, setSelectedCohortId] = useState<Id<"cohorts"> | "">("");

    const form = useQuery(api.forms.getFormForCohort, selectedCohortId ? { cohortId: selectedCohortId as Id<"cohorts"> } : "skip");
    const saveForm = useMutation(api.forms.createOrUpdateForm);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [fields, setFields] = useState<any[]>([]);

    useEffect(() => {
        if (form) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTitle(form.title);
            setDescription(form.description || "");
            setFields(form.fields);
        } else {
            setTitle("");
            setDescription("");
            setFields([]);
        }
    }, [form]);

    const handleSave = async () => {
        if (!selectedCohortId) return;
        await saveForm({
            formId: form?._id,
            cohortId: selectedCohortId as Id<"cohorts">,
            title,
            description,
            fields,
        });
        alert("Form saved successfully!");
    };

    const addField = () => {
        setFields([...fields, { id: crypto.randomUUID(), type: "text", label: "New Field", required: false }]);
    };

    const updateField = (id: string, updates: any) => {
        setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const removeField = (id: string) => {
        setFields(fields.filter(f => f.id !== id));
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center bg-white p-6 sm:p-8 rounded-tl-2xl rounded-br-2xl border-2 border-brand-blueDark shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] gap-4">
                <div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold font-display leading-tight text-brand-blueDark">
                        Form Builder
                    </h1>
                    <p className="text-brand-darkBlue/70 mt-2 font-medium">Create and manage application forms for cohorts.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={!selectedCohortId}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-green/20 text-brand-blueDark text-sm font-bold border-2 border-brand-blueDark shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] hover:-translate-y-0.5 hover:shadow-[2px_4px_0px_0px_rgba(57,103,153,0.5)] transition-all rounded-lg uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)]"
                >
                    <Save size={18} strokeWidth={3} /> Save Form
                </button>
            </div>

            <div className="bg-white p-8 rounded-tl-2xl rounded-br-2xl border-2 border-brand-blueDark shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] space-y-6">
                <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/50 mb-2">Select Cohort</label>
                    <div className="relative w-full md:w-1/2">
                        <select
                            className="w-full p-3 bg-brand-bgLight/50 border-2 border-brand-blueDark/20 rounded-lg focus:ring-0 focus:border-brand-blueDark focus:shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] focus:bg-white transition-all outline-none font-bold text-brand-blueDark appearance-none"
                            value={selectedCohortId}
                            onChange={(e) => setSelectedCohortId(e.target.value as Id<"cohorts">)}
                            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%231B3B5C' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 7l5 5 5-5'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                        >
                            <option value="">-- Choose a Cohort --</option>
                            {cohorts.map((c: any) => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {selectedCohortId && (
                    <div className="space-y-6 pt-6 border-t-2 border-brand-blueDark/10">
                        <div>
                            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/50 mb-2">Form Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full p-3 bg-brand-bgLight/50 border-2 border-brand-blueDark/20 rounded-lg focus:ring-0 focus:border-brand-blueDark focus:shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] focus:bg-white transition-all outline-none font-bold text-brand-blueDark text-lg"
                                placeholder="e.g. YQL Season 10 Application"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/50 mb-2">Description <span className="text-brand-darkBlue/40 normal-case tracking-normal font-bold">(Optional)</span></label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full p-3 bg-brand-bgLight/50 border-2 border-brand-blueDark/20 rounded-lg focus:ring-0 focus:border-brand-blueDark focus:shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] focus:bg-white transition-all outline-none font-medium text-sm text-brand-blueDark resize-y custom-scrollbar"
                                placeholder="Instructions for applicants..."
                                rows={3}
                            />
                        </div>

                        <div className="pt-6 border-t-2 border-brand-blueDark/10">
                            <h3 className="text-2xl font-display font-extrabold text-brand-blueDark mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded bg-brand-yellow/20 border-2 border-brand-blueDark flex items-center justify-center text-sm">📝</span>
                                Form Fields
                            </h3>
                            <div className="space-y-6">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="p-6 bg-brand-bgLight border-2 border-brand-blueDark/20 rounded-lg relative group transition-colors hover:border-brand-blueDark/40">
                                        <div className="absolute -top-3 -left-3 w-8 h-8 bg-brand-blueDark text-white font-bold flex items-center justify-center rounded-lg shadow-sm border-2 border-white">
                                            {index + 1}
                                        </div>
                                        <button
                                            onClick={() => removeField(field.id)}
                                            className="absolute top-4 right-4 text-brand-red/50 hover:text-brand-red hover:bg-brand-red/10 p-2 rounded-md transition-colors"
                                            title="Remove Field"
                                        >
                                            <Trash2 size={18} strokeWidth={2.5} />
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mr-8 mt-2">
                                            <div>
                                                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/70 mb-2">Field Label</label>
                                                <input
                                                    type="text"
                                                    value={field.label}
                                                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                                                    className="w-full p-2.5 bg-white border-2 border-brand-blueDark/20 rounded-md focus:ring-0 focus:border-brand-blueDark focus:shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] outline-none transition-all text-sm font-bold text-brand-blueDark"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/70 mb-2">Field Type</label>
                                                <select
                                                    value={field.type}
                                                    onChange={(e) => updateField(field.id, { type: e.target.value })}
                                                    className="w-full p-2.5 bg-white border-2 border-brand-blueDark/20 rounded-md focus:ring-0 focus:border-brand-blueDark focus:shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] outline-none transition-all text-sm font-bold text-brand-blueDark appearance-none"
                                                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%231B3B5C' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 7l5 5 5-5'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
                                                >
                                                    <option value="text">Short Text</option>
                                                    <option value="textarea">Long Text</option>
                                                    <option value="file">File Upload (PDF)</option>
                                                    <option value="select">Dropdown Select</option>
                                                    <option value="multiselect">Multi-Select</option>
                                                </select>
                                            </div>
                                            <div className="col-span-full">
                                                <label className="flex items-center gap-3 text-sm font-bold text-brand-blueDark bg-white p-3 border-2 border-brand-blueDark/10 rounded-md w-fit cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={field.required}
                                                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                                        className="w-4 h-4 rounded-sm border-2 border-brand-blueDark text-brand-blueDark focus:ring-0 cursor-pointer"
                                                    />
                                                    Required field
                                                </label>
                                            </div>
                                            {(field.type === 'select' || field.type === 'multiselect') && (
                                                <div className="col-span-full bg-brand-yellow/10 p-4 border-2 border-brand-yellow/30 rounded-lg">
                                                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/70 mb-2">Options <span className="normal-case tracking-normal font-bold">(comma-separated)</span></label>
                                                    <input
                                                        type="text"
                                                        value={field.options?.join(", ") || ""}
                                                        onChange={(e) => updateField(field.id, { options: e.target.value.split(",").map((s: string) => s.trim()) })}
                                                        className="w-full p-2.5 bg-white border-2 border-brand-blueDark/20 rounded-md focus:ring-0 focus:border-brand-blueDark focus:shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] outline-none transition-all text-sm font-bold text-brand-blueDark"
                                                        placeholder="Option 1, Option 2, Option 3"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={addField}
                                className="mt-6 flex items-center justify-center gap-2 px-4 py-4 bg-brand-bgLight/50 border-2 border-dashed border-brand-blueDark/40 text-brand-blueDark font-bold rounded-lg hover:border-brand-blueDark hover:bg-white hover:shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] transition-all w-full group uppercase tracking-widest text-sm"
                            >
                                <div className="w-6 h-6 rounded bg-brand-blue/10 flex items-center justify-center group-hover:bg-brand-blue/20 transition-colors">
                                    <Plus size={16} strokeWidth={3} className="text-brand-blue" />
                                </div>
                                Add Form Field
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
