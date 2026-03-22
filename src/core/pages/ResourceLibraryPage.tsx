import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuthContext } from "../providers/AuthProvider";
import { isAdmin } from "../constants/roles";
import { PageHeader } from "../components/ui/PageHeader";
import {
    Globe, FileText, Video, Plus, Trash2, ExternalLink, X, Tag,
    Search, Package
} from "lucide-react";

type ResourceType = "link" | "document" | "video" | "other";

const TYPE_CONFIG: Record<ResourceType, { label: string; icon: React.ReactNode; color: string }> = {
    link: { label: "Link", icon: <Globe size={14} />, color: "bg-brand-lightBlue/10 text-brand-lightBlue border-brand-lightBlue/30" },
    document: { label: "Document", icon: <FileText size={14} />, color: "bg-brand-green/10 text-brand-blue border-brand-green/30" },
    video: { label: "Video", icon: <Video size={14} />, color: "bg-brand-wine/10 text-brand-wine border-brand-wine/30" },
    other: { label: "Other", icon: <Package size={14} />, color: "bg-brand-yellow/20 text-brand-blue border-brand-yellow/40" },
};

const ALL_TYPES: ResourceType[] = ["link", "document", "video", "other"];

export default function ResourceLibraryPage() {
    const { user } = useAuthContext();
    const canManage = user ? isAdmin(user.role) : false;

    const [filterType, setFilterType] = useState<ResourceType | "all">("all");
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);

    const resources = useQuery(api.resources.listResources, {});
    const createResource = useMutation(api.resources.createResource);
    const deleteResource = useMutation(api.resources.deleteResource);

    const [form, setForm] = useState({
        title: "",
        description: "",
        url: "",
        type: "link" as ResourceType,
        tags: "",
    });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim() || !form.url.trim()) return;
        await createResource({
            title: form.title,
            description: form.description || undefined,
            url: form.url,
            type: form.type,
            tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : undefined,
        });
        setForm({ title: "", description: "", url: "", type: "link", tags: "" });
        setShowForm(false);
    };

    const filtered = (resources ?? []).filter(r => {
        const matchesType = filterType === "all" || r.type === filterType;
        const matchesSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) ||
            r.description?.toLowerCase().includes(search.toLowerCase()) ||
            r.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
        return matchesType && matchesSearch;
    });

    return (
        <div className="w-full h-full flex flex-col space-y-6 overflow-hidden">
            <div className="flex items-start justify-between gap-4 shrink-0">
                <PageHeader
                    title="Resource Library"
                    subtitle="Tools, references, and learning materials for the team."
                    variant="ghost"
                    className="mb-6"
                />
                {canManage && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-brand-lightBlue text-white font-bold text-sm border-2 border-brand-blue rounded-tl-xl rounded-br-xl shadow-[3px_3px_0px_0px_rgba(10,22,48,0.45)] hover:-translate-y-0.5 transition-transform shrink-0"
                    >
                        <Plus size={16} strokeWidth={3} /> Add Resource
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-blue/40" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search resources..."
                        className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-brand-blue/20 rounded-lg focus:border-brand-blue outline-none text-sm font-medium text-brand-blue"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {(["all", ...ALL_TYPES] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setFilterType(t)}
                            className={`px-3 py-2 text-xs font-bold border-2 rounded-lg transition-all capitalize ${filterType === t
                                ? "bg-brand-blue text-white border-brand-blue"
                                : "bg-white text-brand-blue/60 border-brand-blue/20 hover:border-brand-blue"
                                }`}
                        >
                            {t === "all" ? "All" : TYPE_CONFIG[t].label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Resource Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {!resources ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-36 bg-white border-2 border-brand-blue/10 rounded-tl-xl rounded-br-xl animate-pulse" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-brand-blue/40 text-center">
                        <div className="w-16 h-16 bg-brand-bgLight border-2 border-dashed border-brand-blue/20 rounded-tl-2xl rounded-br-2xl flex items-center justify-center mb-4">
                            <Globe size={28} />
                        </div>
                        <p className="font-bold text-brand-blue/50">No resources found</p>
                        <p className="text-xs mt-1 font-medium">
                            {canManage ? "Add the first resource using the button above." : "Check back later."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                        {filtered.map(r => {
                            const config = TYPE_CONFIG[r.type];
                            return (
                                <div
                                    key={r._id}
                                    className="bg-white border-2 border-brand-blue rounded-tl-xl rounded-br-xl shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] hover:shadow-[6px_6px_0px_0px_rgba(57,103,153,0.25)] hover:-translate-y-[2px] hover:-translate-x-[2px] transition-all flex flex-col"
                                >
                                    <div className="p-4 flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded border ${config.color}`}>
                                                {config.icon} {config.label}
                                            </span>
                                            {canManage && (
                                                <button
                                                    onClick={() => deleteResource({ resourceId: r._id })}
                                                    className="p-1.5 text-brand-red/30 hover:text-brand-red hover:bg-brand-red/10 rounded transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <h3 className="font-display font-extrabold text-brand-blue text-base leading-tight mb-1">{r.title}</h3>
                                        {r.description && (
                                            <p className="text-xs text-brand-blue/60 font-medium leading-relaxed line-clamp-2">{r.description}</p>
                                        )}
                                        {r.tags && r.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-3">
                                                {r.tags.map(tag => (
                                                    <span key={tag} className="inline-flex items-center gap-0.5 text-[10px] font-extrabold uppercase tracking-widest bg-brand-bgLight border border-brand-blue/10 text-brand-blue/50 px-2 py-0.5 rounded-sm">
                                                        <Tag size={8} /> {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {r.url && (
                                        <div className="px-4 pb-4">
                                            <a
                                                href={r.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center justify-center gap-2 w-full py-2 bg-brand-bgLight border-2 border-brand-blue/20 rounded-lg text-xs font-bold text-brand-blue hover:border-brand-blue hover:bg-white transition-all"
                                            >
                                                <ExternalLink size={13} strokeWidth={2.5} /> Open Resource
                                            </a>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add Resource Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-brand-blue/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
                    <div className="relative w-full max-w-lg bg-white border-2 border-brand-blue rounded-tl-2xl rounded-br-2xl shadow-[8px_8px_0px_0px_rgba(10,22,48,0.3)] overflow-hidden">
                        <div className="flex items-center justify-between p-5 border-b-2 border-brand-blue bg-brand-bgLight">
                            <h2 className="font-display font-extrabold text-xl text-brand-blue">Add Resource</h2>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white rounded-lg transition-colors">
                                <X size={20} className="text-brand-blue" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 mb-1">Title <span className="text-brand-red">*</span></label>
                                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Resource name..." className="w-full p-2.5 bg-brand-bgLight border-2 border-brand-blue/20 rounded-lg focus:border-brand-blue outline-none font-bold text-brand-blue text-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 mb-1">URL <span className="text-brand-red">*</span></label>
                                <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} required placeholder="https://..." className="w-full p-2.5 bg-brand-bgLight border-2 border-brand-blue/20 rounded-lg focus:border-brand-blue outline-none font-medium text-brand-blue text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 mb-1">Type</label>
                                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as ResourceType })} className="w-full p-2.5 bg-brand-bgLight border-2 border-brand-blue/20 rounded-lg focus:border-brand-blue outline-none font-bold text-brand-blue text-sm appearance-none">
                                        {ALL_TYPES.map(t => <option key={t} value={t}>{TYPE_CONFIG[t].label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 mb-1">Tags <span className="font-medium normal-case tracking-normal text-brand-blue/30">(comma-separated)</span></label>
                                    <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="ai, tools, intro..." className="w-full p-2.5 bg-brand-bgLight border-2 border-brand-blue/20 rounded-lg focus:border-brand-blue outline-none font-medium text-brand-blue text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 mb-1">Description</label>
                                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Brief description..." className="w-full p-2.5 bg-brand-bgLight border-2 border-brand-blue/20 rounded-lg focus:border-brand-blue outline-none font-medium text-brand-blue resize-none text-sm" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 bg-brand-bgLight text-brand-blue font-bold rounded-lg border-2 border-brand-blue/20 hover:bg-white transition-colors text-sm">Cancel</button>
                                <button type="submit" className="flex-1 py-2.5 bg-brand-lightBlue text-white font-bold rounded-tl-xl rounded-br-xl border-2 border-brand-blue shadow-[3px_3px_0px_0px_rgba(10,22,48,0.45)] hover:-translate-y-0.5 transition-transform text-sm">Add Resource</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
