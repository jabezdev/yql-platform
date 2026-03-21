import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { PageHeader } from "../components/ui/PageHeader";
import { useToast } from "../providers/ToastProvider";
import { Plus, Trash2, Save, SlidersHorizontal } from "lucide-react";
import { z } from "zod";

type Round = "round1" | "round2" | "round3" | "round4";

const ROUNDS: { value: Round; label: string }[] = [
    { value: "round1", label: "Round 1 — Initial Screen" },
    { value: "round2", label: "Round 2 — Skills Assessment" },
    { value: "round3", label: "Round 3 — Live Interview" },
    { value: "round4", label: "Round 4 — Final Review" },
];

interface Criterion {
    name: string;
    description: string;
    maxScore: number;
}

const criterionSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    maxScore: z.number().min(1, "Max score must be at least 1").max(100),
});

const rubricSchema = z.object({
    criteria: z.array(criterionSchema).min(1, "Add at least one criterion"),
});

const INPUT_CLS =
    "w-full p-2.5 bg-brand-bgLight border-2 border-brand-blueDark/20 rounded-lg focus:border-brand-blueDark outline-none font-medium text-brand-blueDark text-sm transition-colors";

function CriterionRow({
    criterion,
    index,
    onChange,
    onRemove,
    error,
}: {
    criterion: Criterion;
    index: number;
    onChange: (updated: Criterion) => void;
    onRemove: () => void;
    error?: Partial<Record<keyof Criterion, string>>;
}) {
    return (
        <div className="bg-brand-bgLight/50 border-2 border-brand-blueDark/10 rounded-xl p-4 space-y-3 group">
            <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/40">
                    Criterion {index + 1}
                </span>
                <button
                    type="button"
                    onClick={onRemove}
                    className="p-1.5 text-brand-red/40 hover:text-brand-red hover:bg-brand-red/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                    <Trash2 size={14} />
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_100px] gap-3">
                <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/50 mb-1">
                        Name *
                    </label>
                    <input
                        value={criterion.name}
                        onChange={(e) => onChange({ ...criterion, name: e.target.value })}
                        placeholder="e.g. Technical Depth"
                        className={`${INPUT_CLS} ${error?.name ? "border-brand-red" : ""}`}
                    />
                    {error?.name && <p className="text-xs text-brand-red mt-1">{error.name}</p>}
                </div>
                <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/50 mb-1">
                        Description *
                    </label>
                    <input
                        value={criterion.description}
                        onChange={(e) => onChange({ ...criterion, description: e.target.value })}
                        placeholder="What does this criterion measure?"
                        className={`${INPUT_CLS} ${error?.description ? "border-brand-red" : ""}`}
                    />
                    {error?.description && <p className="text-xs text-brand-red mt-1">{error.description}</p>}
                </div>
                <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/50 mb-1">
                        Max Score *
                    </label>
                    <input
                        type="number"
                        min={1}
                        max={100}
                        value={criterion.maxScore}
                        onChange={(e) =>
                            onChange({ ...criterion, maxScore: parseInt(e.target.value) || 1 })
                        }
                        className={`${INPUT_CLS} ${error?.maxScore ? "border-brand-red" : ""}`}
                    />
                    {error?.maxScore && <p className="text-xs text-brand-red mt-1">{error.maxScore}</p>}
                </div>
            </div>
        </div>
    );
}

export default function AdminRubricPage() {
    const { toast } = useToast();
    const cohorts = useQuery(api.cohorts.getAll) ?? [];
    const saveRubric = useMutation(api.scoring.saveRubric);

    const [selectedCohortId, setSelectedCohortId] = useState<Id<"cohorts"> | "">("");
    const [selectedRound, setSelectedRound] = useState<Round>("round1");

    const existingRubric = useQuery(
        api.scoring.getRubric,
        selectedCohortId ? { cohortId: selectedCohortId as Id<"cohorts">, round: selectedRound } : "skip"
    );

    const [criteria, setCriteria] = useState<Criterion[]>([
        { name: "", description: "", maxScore: 10 },
    ]);
    const [criterionErrors, setCriterionErrors] = useState<
        Array<Partial<Record<keyof Criterion, string>>>
    >([]);
    const [saving, setSaving] = useState(false);
    const [loadedFor, setLoadedFor] = useState<string>(""); // track which rubric we loaded

    // When the rubric loads, populate criteria from existing data
    const rubricKey = `${selectedCohortId}:${selectedRound}`;
    if (existingRubric !== undefined && loadedFor !== rubricKey) {
        setLoadedFor(rubricKey);
        if (existingRubric) {
            setCriteria(existingRubric.criteria.map((c) => ({ ...c })));
        } else {
            setCriteria([{ name: "", description: "", maxScore: 10 }]);
        }
        setCriterionErrors([]);
    }

    const handleAddCriterion = () => {
        setCriteria((prev) => [...prev, { name: "", description: "", maxScore: 10 }]);
    };

    const handleRemoveCriterion = (index: number) => {
        setCriteria((prev) => prev.filter((_, i) => i !== index));
        setCriterionErrors((prev) => prev.filter((_, i) => i !== index));
    };

    const handleChangeCriterion = (index: number, updated: Criterion) => {
        setCriteria((prev) => prev.map((c, i) => (i === index ? updated : c)));
        setCriterionErrors((prev) => prev.map((e, i) => (i === index ? {} : e)));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCohortId) {
            toast("Select a cohort first.", "error");
            return;
        }

        const result = rubricSchema.safeParse({ criteria });
        if (!result.success) {
            const errs: Array<Partial<Record<keyof Criterion, string>>> = criteria.map(() => ({}));
            for (const err of result.error.issues) {
                const [, idx, field] = err.path as [string, number, keyof Criterion];
                if (idx !== undefined && field) {
                    if (!errs[idx]) errs[idx] = {};
                    errs[idx][field] = err.message;
                }
            }
            setCriterionErrors(errs);
            toast("Fix validation errors before saving.", "error");
            return;
        }

        setSaving(true);
        try {
            await saveRubric({
                rubricId: existingRubric?._id ?? undefined,
                cohortId: selectedCohortId as Id<"cohorts">,
                round: selectedRound,
                criteria,
            });
            toast("Rubric saved successfully.", "success");
            setLoadedFor(""); // force re-load
        } catch (err: any) {
            toast(err?.message ?? "Failed to save rubric.", "error");
        } finally {
            setSaving(false);
        }
    };

    const totalMaxScore = criteria.reduce((sum, c) => sum + (c.maxScore || 0), 0);
    const selectedCohort = cohorts.find((c) => c._id === selectedCohortId);

    return (
        <div className="w-full space-y-8 pb-12">
            <PageHeader
                title="Rubric Management"
                subtitle="Define scoring criteria for each evaluation round."
            />

            {/* Cohort + Round Selector */}
            <div className="bg-white border-2 border-brand-blueDark rounded-tl-2xl rounded-br-2xl shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] p-6 space-y-5">
                <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/50 mb-2">
                        Select Cohort *
                    </label>
                    <select
                        value={selectedCohortId}
                        onChange={(e) => {
                            setSelectedCohortId(e.target.value as Id<"cohorts">);
                            setLoadedFor("");
                        }}
                        className={`${INPUT_CLS} appearance-none max-w-md`}
                    >
                        <option value="">— Choose a cohort —</option>
                        {cohorts.map((c) => (
                            <option key={c._id} value={c._id}>
                                {c.name} ({c.status})
                            </option>
                        ))}
                    </select>
                </div>

                {selectedCohortId && (
                    <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/50 mb-2">
                            Round
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {ROUNDS.map((r) => (
                                <button
                                    key={r.value}
                                    type="button"
                                    onClick={() => {
                                        setSelectedRound(r.value);
                                        setLoadedFor("");
                                    }}
                                    className={`px-4 py-2 text-sm font-bold rounded-lg border-2 transition-all ${
                                        selectedRound === r.value
                                            ? "bg-brand-yellow text-brand-blueDark border-brand-yellow shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)]"
                                            : "bg-white text-brand-blueDark border-brand-blueDark/20 hover:border-brand-blueDark/50"
                                    }`}
                                >
                                    {r.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Criteria Editor */}
            {selectedCohortId && (
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-display font-extrabold text-brand-blueDark text-lg flex items-center gap-2">
                                <SlidersHorizontal size={18} className="text-brand-blue" />
                                Scoring Criteria
                                <span className="text-brand-blue/60 font-bold text-sm ml-1">
                                    — {selectedCohort?.name} / {ROUNDS.find((r) => r.value === selectedRound)?.label}
                                </span>
                            </h2>
                            {existingRubric ? (
                                <p className="text-xs text-brand-green font-bold mt-1">Rubric exists — editing will overwrite.</p>
                            ) : (
                                <p className="text-xs text-brand-blueDark/40 font-medium mt-1">No rubric yet for this round. Define one below.</p>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/40">Total</p>
                                <p className="text-2xl font-display font-extrabold text-brand-blueDark">{totalMaxScore} pts</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {criteria.map((criterion, index) => (
                            <CriterionRow
                                key={index}
                                criterion={criterion}
                                index={index}
                                onChange={(updated) => handleChangeCriterion(index, updated)}
                                onRemove={() => handleRemoveCriterion(index)}
                                error={criterionErrors[index]}
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={handleAddCriterion}
                            className="flex items-center gap-2 px-4 py-2.5 bg-brand-bgLight text-brand-blueDark text-sm font-bold border-2 border-brand-blueDark/20 rounded-xl hover:border-brand-blueDark/40 transition-colors"
                        >
                            <Plus size={16} /> Add Criterion
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-brand-blue text-white font-bold rounded-xl border-2 border-brand-blueDark hover:-translate-y-0.5 transition-transform shadow-[4px_4px_0px_0px_rgba(10,22,48,0.45)] disabled:opacity-50"
                        >
                            <Save size={16} />
                            {saving ? "Saving..." : "Save Rubric"}
                        </button>
                    </div>
                </form>
            )}

            {!selectedCohortId && cohorts.length === 0 && (
                <div className="bg-white border-2 border-dashed border-brand-blueDark/20 rounded-2xl p-12 text-center">
                    <SlidersHorizontal size={40} className="mx-auto text-brand-blueDark/20 mb-4" />
                    <p className="font-display font-extrabold text-brand-blueDark/40 text-lg">No cohorts exist yet</p>
                    <p className="text-sm text-brand-blueDark/30 mt-1">Create a cohort first, then define rubrics for its evaluation rounds.</p>
                </div>
            )}
        </div>
    );
}
