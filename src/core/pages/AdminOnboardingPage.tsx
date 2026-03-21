import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { FileText, ArrowUp, ArrowDown, Edit2, Trash2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { PageHeader } from "../components/ui/PageHeader";

export default function AdminOnboardingPage() {
    const modules = useQuery(api.onboarding.getModules);
    const createModule = useMutation(api.onboarding.createModule);
    const updateModule = useMutation(api.onboarding.updateModule);
    const deleteModule = useMutation(api.onboarding.deleteModule);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        content: "",
        isRequired: true,
    });

    if (modules === undefined) {
        return <div className="p-8">Loading modules...</div>;
    }

    const resetForm = () => {
        setEditingId(null);
        setFormData({ title: "", description: "", content: "", isRequired: true });
    };

    const handleEdit = (mod: any) => {
        setEditingId(mod._id);
        setFormData({
            title: mod.title,
            description: mod.description || "",
            content: mod.content,
            isRequired: mod.isRequired,
        });
    };

    const handleSave = async () => {
        if (!formData.title || !formData.content) return;

        if (editingId) {
            await updateModule({
                moduleId: editingId as any,
                ...formData,
            });
        } else {
            const nextOrder = modules.length > 0 ? Math.max(...modules.map((m: any) => m.order)) + 1 : 1;
            await createModule({
                ...formData,
                order: nextOrder,
            });
        }
        resetForm();
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this module?")) {
            await deleteModule({ moduleId: id as any });
        }
    };

    const handleMove = async (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index > 0) {
            const current = modules[index];
            const prev = modules[index - 1];
            await updateModule({ moduleId: current._id, order: prev.order });
            await updateModule({ moduleId: prev._id, order: current.order });
        } else if (direction === 'down' && index < modules.length - 1) {
            const current = modules[index];
            const next = modules[index + 1];
            await updateModule({ moduleId: current._id, order: next.order });
            await updateModule({ moduleId: next._id, order: current.order });
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <PageHeader
                title="Onboarding CMS"
                subtitle="Create and manage content modules for new Staff onboarding."
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* List of Modules */}
                <div className="space-y-4">
                    <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/50 mb-4 flex items-center gap-2">
                        <FileText size={16} className="text-brand-blue" /> Existing Modules
                    </h2>
                    {modules.length === 0 ? (
                        <div className="text-center py-10 px-4 bg-white rounded-xl border-2 border-dashed border-brand-blueDark/20">
                            <p className="text-sm font-bold text-brand-blueDark/50">No modules created yet.</p>
                        </div>
                    ) : (
                        modules.map((mod: any, idx: number) => (
                            <div key={mod._id} className="bg-white border-2 border-brand-blueDark shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] rounded-tl-xl rounded-br-xl p-5 flex flex-col gap-2 transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(10,22,48,0.3)]">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <h3 className="font-display font-extrabold text-lg text-brand-blueDark">{mod.title}</h3>
                                        {mod.description && <p className="text-sm text-brand-darkBlue/70 font-medium mt-1 mb-3">{mod.description}</p>}
                                        <div className={`mt-2 text-[10px] font-extrabold px-3 py-1 border rounded-sm inline-block uppercase tracking-widest ${mod.isRequired ? 'bg-brand-red/10 text-brand-red border-brand-red/20' : 'bg-brand-blue/10 text-brand-blueDark border-brand-blueDark/20'}`}>
                                            {mod.isRequired ? "Required" : "Optional"}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 shrink-0">
                                        <div className="flex gap-1 justify-end">
                                            <button onClick={() => handleMove(idx, 'up')} disabled={idx === 0} className="w-8 h-8 flex items-center justify-center bg-brand-bgLight rounded border border-brand-blueDark/20 text-brand-blueDark hover:bg-white transition-colors disabled:opacity-30">
                                                <ArrowUp className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleMove(idx, 'down')} disabled={idx === modules.length - 1} className="w-8 h-8 flex items-center justify-center bg-brand-bgLight rounded border border-brand-blueDark/20 text-brand-blueDark hover:bg-white transition-colors disabled:opacity-30">
                                                <ArrowDown className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex gap-1 justify-end mt-1">
                                            <button onClick={() => handleEdit(mod)} className="w-8 h-8 flex items-center justify-center bg-brand-yellow/20 rounded border border-brand-yellow/30 text-brand-blueDark hover:bg-brand-yellow/30 transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(mod._id)} className="w-8 h-8 flex items-center justify-center bg-brand-red/10 rounded border border-brand-red/20 text-brand-red hover:bg-brand-red/20 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Editor Form */}
                <div className="bg-white border-2 border-brand-blueDark shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] rounded-tl-2xl rounded-br-2xl p-6 h-fit sticky top-8">
                    <h2 className="text-xl font-display font-extrabold text-brand-blueDark mb-6 flex items-center gap-2">
                        {editingId ? <><Edit2 size={20} className="text-brand-yellow" /> Edit Module</> : <><FileText size={20} className="text-brand-green" /> Create New Module</>}
                    </h2>
                    <div className="space-y-4">
                        <Input
                            label="Title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Welcome to YQL"
                            required
                        />
                        <Input
                            label="Brief Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Short summary of this module."
                        />
                        <div>
                            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/50 mb-1.5">
                                Content (Markdown) <span className="text-brand-red ml-1">*</span>
                            </label>
                            <textarea
                                className="w-full h-64 p-3 bg-brand-bgLight/50 border-2 border-brand-blueDark/20 rounded-lg focus:border-brand-blueDark focus:shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] focus:bg-white outline-none resize-y font-medium text-sm text-brand-blueDark custom-scrollbar"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="# Header&#10;Write your markdown content here..."
                                required
                            />
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-brand-blue/5 border-2 border-brand-blueDark/10 rounded-lg">
                            <input
                                type="checkbox"
                                id="isRequired"
                                checked={formData.isRequired}
                                onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                                className="w-4 h-4 rounded-sm border-2 border-brand-blueDark focus:ring-0 text-brand-blueDark bg-white cursor-pointer"
                            />
                            <label htmlFor="isRequired" className="text-sm font-bold text-brand-blueDark cursor-pointer">
                                Highlight as Required Module
                            </label>
                        </div>
                        <div className="pt-6 flex gap-4 border-t-2 border-brand-blueDark/10">
                            <Button onClick={handleSave} variant="geometric-primary" className="flex-1 py-3">
                                {editingId ? "Update Module" : "Create Module"}
                            </Button>
                            {editingId && (
                                <Button variant="geometric-secondary" onClick={resetForm} className="py-3 px-6">
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
