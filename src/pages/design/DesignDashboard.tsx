import { useState, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Plus, Search, LayoutGrid, Users, X } from "lucide-react";

import { useToast } from "../../providers/ToastProvider";
import { useAuthContext } from "../../providers/AuthProvider";
import { FolderTree, type FolderNode } from "./components/FolderTree";
import { FolderModal } from "./components/FolderModal";
import { DesignCard, GalleryCard, type DesignItem } from "./components/DesignCard";
import { MoveToFolderModal } from "./components/MoveToFolderModal";
import { ShareDesignModal } from "./components/ShareDesignModal";

// ── Tree builder ──────────────────────────────────────────────────────────────
function buildFolderTree(
    rawFolders: any[],
    counts: Record<string, number>,
    parentId?: string
): FolderNode[] {
    return rawFolders
        .filter(f => (f.parentId ?? "root") === (parentId ?? "root"))
        .map(f => ({
            ...f,
            designCount: counts[f._id] ?? 0,
            children: buildFolderTree(rawFolders, counts, f._id),
        }));
}

// ── Breadcrumb for current folder ─────────────────────────────────────────────
function folderBreadcrumb(folders: any[], folderId: string): string {
    const parts: string[] = [];
    let current: any = folders.find(f => f._id === folderId);
    while (current) {
        parts.unshift(current.name);
        current = current.parentId ? folders.find(f => f._id === current.parentId) : null;
    }
    return parts.join(" / ") || "";
}

// ─────────────────────────────────────────────────────────────────────────────

export default function DesignDashboard() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuthContext();
    const [searchParams, setSearchParams] = useSearchParams();

    // Active folder: null = all designs, "root" = unfiled, <id> = specific folder
    const activeFolderParam = searchParams.get("f");
    const activeSection = (searchParams.get("s") ?? "mine") as "mine" | "gallery";

    const setActiveFolder = (folderId: string | null) => {
        const p: Record<string, string> = { s: activeSection };
        if (folderId !== null) p.f = folderId;
        setSearchParams(p);
    };
    const setSection = (s: "mine" | "gallery") => setSearchParams({ s });

    const [search, setSearch] = useState("");

    // Modal state
    const [folderModal, setFolderModal] = useState<{
        mode: "create" | "rename";
        parentId?: Id<"posterFolders">;
        folder?: FolderNode;
    } | null>(null);

    const [moveModal, setMoveModal] = useState<{
        designId: Id<"posterDesigns">;
        designTitle: string;
        currentFolderId?: Id<"posterFolders">;
    } | null>(null);

    const [shareModal, setShareModal] = useState<{
        designId: Id<"posterDesigns">;
        designTitle: string;
        slug?: string;
        isPrivate: boolean;
    } | null>(null);

    const [deleteFolderConfirm, setDeleteFolderConfirm] = useState<FolderNode | null>(null);

    // ── Convex data ───────────────────────────────────────────────────────────
    // Determine folderId arg for getMyDesigns
    const folderArg = activeFolderParam === null
        ? undefined
        : activeFolderParam === "root"
        ? null
        : activeFolderParam as unknown as Id<"posterFolders">;

    const myDesigns = useQuery(api.posterDesigns.getMyDesigns, { folderId: folderArg }) ?? [];
    const allDesigns = useQuery(api.posterDesigns.getMyDesigns, {}) ?? [];
    const publicDesigns = useQuery(api.posterDesigns.getPublicDesigns) ?? [];
    const myFoldersRaw = useQuery(api.posterFolders.getMyFolders) ?? [];
    const folderCounts = useQuery(api.posterFolders.getFolderDesignCounts) ?? {};
    const likedIds = useQuery(api.posterDesigns.getMyLikedDesignIds) ?? [];

    const createFolderMutation = useMutation(api.posterFolders.createFolder);
    const renameFolderMutation = useMutation(api.posterFolders.renameFolder);
    const deleteFolderMutation = useMutation(api.posterFolders.deleteFolder);
    const moveToFolderMutation = useMutation(api.posterDesigns.moveToFolder);
    const toggleLikeMutation = useMutation(api.posterDesigns.toggleLike);
    const updatePrivacyMutation = useMutation(api.posterDesigns.updateDesignPrivacy);

    // Build folder tree
    const folderTree = useMemo(() =>
        buildFolderTree(myFoldersRaw, folderCounts as Record<string, number>),
        [myFoldersRaw, folderCounts]
    );

    const totalDesignCount = activeFolderParam !== null ? allDesigns.length : myDesigns.length;

    const rootDesignCount = (folderCounts as any)["root"] ?? 0;

    // Filter by search
    const filteredMyDesigns = useMemo(() => {
        const q = search.toLowerCase();
        return q ? myDesigns.filter(d => d.title.toLowerCase().includes(q)) : myDesigns;
    }, [myDesigns, search]);

    const filteredPublicDesigns = useMemo(() => {
        const q = search.toLowerCase();
        return q ? publicDesigns.filter(d => d.title.toLowerCase().includes(q)) : publicDesigns;
    }, [publicDesigns, search]);

    // ── Folder name lookup ────────────────────────────────────────────────────
    const getFolderName = useCallback((folderId?: Id<"posterFolders">) => {
        if (!folderId) return undefined;
        return myFoldersRaw.find(f => f._id === folderId)?.name;
    }, [myFoldersRaw]);

    // ── Section title ─────────────────────────────────────────────────────────
    const sectionTitle = activeFolderParam === null
        ? "All Designs"
        : activeFolderParam === "root"
        ? "Unfiled"
        : folderBreadcrumb(myFoldersRaw, activeFolderParam);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleToggleLike = async (designId: Id<"posterDesigns">) => {
        try { await toggleLikeMutation({ designId }); }
        catch { toast("Failed to update like", "error"); }
    };

    const handleMove = async (folderId: Id<"posterFolders"> | null) => {
        if (!moveModal) return;
        try {
            await moveToFolderMutation({ designId: moveModal.designId, folderId: folderId ?? undefined });
            toast("Moved successfully", "success");
        } catch { toast("Failed to move", "error"); }
        setMoveModal(null);
    };

    const handleCreateFolder = async (name: string, color: string, parentId?: Id<"posterFolders">) => {
        try {
            await createFolderMutation({ name, color, parentId });
            toast(`Folder "${name}" created`, "success");
        } catch { toast("Failed to create folder", "error"); }
        setFolderModal(null);
    };

    const handleRenameFolder = async (name: string, color: string) => {
        if (!folderModal?.folder) return;
        try {
            await renameFolderMutation({ folderId: folderModal.folder._id, name, color });
            toast("Folder renamed", "success");
        } catch { toast("Failed to rename", "error"); }
        setFolderModal(null);
    };

    const handleDeleteFolder = async (folder: FolderNode) => {
        try {
            await deleteFolderMutation({ folderId: folder._id, moveContentsToRoot: true });
            toast(`Deleted "${folder.name}" — designs moved to root`, "info");
            if (activeFolderParam === folder._id) setActiveFolder(null);
        } catch { toast("Failed to delete folder", "error"); }
        setDeleteFolderConfirm(null);
    };

    // ═════════════════════════════════════════════════════════════════════════
    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden bg-white select-none">

            {/* ── Top bar ───────────────────────────────────────────────────── */}
            <header className="flex-shrink-0 flex items-center gap-4 px-5 py-3 border-b-2 border-brand-blue/8 bg-white shadow-sm">
                {/* Brand */}
                <div className="flex items-center gap-2.5 flex-shrink-0">
                    <div className="w-8 h-8 rounded-tl-xl rounded-br-xl bg-brand-blue flex items-center justify-center shadow-sm">
                        <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                            <rect x="1" y="1" width="5" height="5" rx="1" fill="white" opacity="0.9"/>
                            <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.6"/>
                            <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.6"/>
                            <rect x="8" y="8" width="5" height="5" rx="1" fill="#FED432"/>
                        </svg>
                    </div>
                    <div>
                        <div className="text-[13px] font-black text-brand-blue tracking-tight leading-none">YQL Design Studio</div>
                        <div className="text-[9px] text-brand-blue/35 leading-none font-medium uppercase tracking-wider mt-0.5">
                            {user?.name ?? ""}
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="flex-1 max-w-sm relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-blue/30 pointer-events-none" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search designs…"
                        className="w-full pl-9 pr-8 py-2 text-sm bg-brand-bgLight border border-brand-blue/12 rounded-tl-xl rounded-br-xl outline-none focus:border-brand-lightBlue/50 text-brand-blue placeholder:text-brand-blue/30 font-medium"
                    />
                    {search && (
                        <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-blue/30 hover:text-brand-blue transition-colors">
                            <X size={13} />
                        </button>
                    )}
                </div>

                <div className="flex-1" />

                {/* New Design */}
                <button
                    onClick={() => navigate("/design/new")}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white text-sm font-bold rounded-tl-xl rounded-br-xl hover:bg-brand-blue/90 transition-colors shadow-sm"
                >
                    <Plus size={15} /> New Design
                </button>
            </header>

            {/* ── Body ──────────────────────────────────────────────────────── */}
            <div className="flex-1 flex overflow-hidden">

                {/* ── Left sidebar ────────────────────────────────────────── */}
                <aside className="w-56 flex-shrink-0 flex flex-col bg-white border-r-2 border-brand-blue/6 overflow-hidden">
                    {/* Section tabs */}
                    <div className="flex border-b border-brand-blue/8">
                        <button
                            onClick={() => setSection("mine")}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[11px] font-bold transition-colors border-b-2 ${
                                activeSection === "mine"
                                    ? "border-brand-blue text-brand-blue"
                                    : "border-transparent text-brand-blue/40 hover:text-brand-blue/70"
                            }`}
                        >
                            <LayoutGrid size={12} /> My Work
                        </button>
                        <button
                            onClick={() => setSection("gallery")}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[11px] font-bold transition-colors border-b-2 ${
                                activeSection === "gallery"
                                    ? "border-brand-blue text-brand-blue"
                                    : "border-transparent text-brand-blue/40 hover:text-brand-blue/70"
                            }`}
                        >
                            <Users size={12} /> Team
                        </button>
                    </div>

                    {/* Folder tree (only shown in "mine" section) */}
                    {activeSection === "mine" && (
                        <div className="flex-1 overflow-y-auto p-2.5">
                            <FolderTree
                                folders={folderTree}
                                activeFolderId={activeFolderParam}
                                totalDesignCount={myDesigns.length}
                                rootDesignCount={rootDesignCount}
                                onSelect={setActiveFolder}
                                onCreateFolder={parentId => setFolderModal({ mode: "create", parentId })}
                                onRenameFolder={folder => setFolderModal({ mode: "rename", folder })}
                                onDeleteFolder={folder => setDeleteFolderConfirm(folder)}
                            />
                        </div>
                    )}

                    {activeSection === "gallery" && (
                        <div className="flex-1 flex items-center justify-center p-4">
                            <div className="text-center">
                                <div className="text-2xl mb-2">🌐</div>
                                <div className="text-[11px] text-brand-blue/40 leading-relaxed">
                                    Public designs from your YQL teammates
                                </div>
                            </div>
                        </div>
                    )}
                </aside>

                {/* ── Main content ──────────────────────────────────────── */}
                <main className="flex-1 overflow-y-auto bg-[#f7f9fc]">
                    {activeSection === "mine" ? (
                        <div className="p-6">
                            {/* Section header */}
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h1 className="text-lg font-black text-brand-blue">{sectionTitle}</h1>
                                    <p className="text-xs text-brand-blue/40 mt-0.5">
                                        {filteredMyDesigns.length} {filteredMyDesigns.length === 1 ? "design" : "designs"}
                                        {search && ` matching "${search}"`}
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigate("/design/new")}
                                    className="flex items-center gap-1.5 text-xs font-bold text-brand-blue/60 hover:text-brand-blue border border-brand-blue/15 hover:border-brand-lightBlue/40 rounded-lg px-3 py-1.5 transition-all"
                                >
                                    <Plus size={12} /> New Design
                                </button>
                            </div>

                            {/* Empty state */}
                            {filteredMyDesigns.length === 0 && !search && (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-16 h-16 rounded-tl-3xl rounded-br-3xl bg-brand-blue/6 flex items-center justify-center mb-4">
                                        <svg width="28" height="28" viewBox="0 0 14 14" fill="none">
                                            <rect x="1" y="1" width="5" height="5" rx="1" fill="#3d8ccb" opacity="0.4"/>
                                            <rect x="8" y="1" width="5" height="5" rx="1" fill="#3d8ccb" opacity="0.25"/>
                                            <rect x="1" y="8" width="5" height="5" rx="1" fill="#3d8ccb" opacity="0.25"/>
                                            <rect x="8" y="8" width="5" height="5" rx="1" fill="#fed432" opacity="0.6"/>
                                        </svg>
                                    </div>
                                    <h3 className="text-base font-bold text-brand-blue mb-1">No designs yet</h3>
                                    <p className="text-sm text-brand-blue/40 mb-5 max-w-xs leading-relaxed">
                                        Create your first design and it will appear here. You can organise designs into folders.
                                    </p>
                                    <button
                                        onClick={() => navigate("/design/new")}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-tl-xl rounded-br-xl hover:bg-brand-blue/90 transition-colors shadow-sm"
                                    >
                                        <Plus size={15} /> Create First Design
                                    </button>
                                </div>
                            )}

                            {filteredMyDesigns.length === 0 && search && (
                                <div className="text-center py-16 text-sm text-brand-blue/40">
                                    No designs match "<strong>{search}</strong>"
                                </div>
                            )}

                            {/* Design grid */}
                            {filteredMyDesigns.length > 0 && (
                                <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
                                    {filteredMyDesigns.map(design => (
                                        <DesignCard
                                            key={design._id}
                                            design={design as DesignItem}
                                            isLiked={likedIds.includes(design._id as string)}
                                            folderName={getFolderName(design.folderId)}
                                            onToggleLike={() => handleToggleLike(design._id)}
                                            onMoveToFolder={() => setMoveModal({
                                                designId: design._id,
                                                designTitle: design.title,
                                                currentFolderId: design.folderId,
                                            })}
                                            onShare={() => setShareModal({
                                                designId: design._id,
                                                designTitle: design.title,
                                                slug: design.slug,
                                                isPrivate: design.isPrivate,
                                            })}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* ── Team Gallery ─────────────────────────────────── */
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h1 className="text-lg font-black text-brand-blue">Team Gallery</h1>
                                    <p className="text-xs text-brand-blue/40 mt-0.5">
                                        {filteredPublicDesigns.length} public {filteredPublicDesigns.length === 1 ? "design" : "designs"} from your team
                                    </p>
                                </div>
                            </div>

                            {filteredPublicDesigns.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="text-3xl mb-3">🌐</div>
                                    <h3 className="text-base font-bold text-brand-blue mb-1">No public designs yet</h3>
                                    <p className="text-sm text-brand-blue/40 max-w-xs leading-relaxed">
                                        When team members make their designs public, they'll appear here.
                                    </p>
                                </div>
                            )}

                            {filteredPublicDesigns.length > 0 && (
                                <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
                                    {filteredPublicDesigns.map(design => (
                                        <GalleryCard
                                            key={design._id}
                                            design={design as any}
                                            isLiked={likedIds.includes(design._id as string)}
                                            onToggleLike={() => handleToggleLike(design._id)}
                                            onFork={() => navigate(`/design/new?fork=${design.slug ?? ""}`)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* ── Modals ────────────────────────────────────────────────────── */}

            <FolderModal
                open={!!folderModal}
                mode={folderModal?.mode ?? "create"}
                defaultName={folderModal?.folder?.name}
                defaultColor={folderModal?.folder?.color}
                parentId={folderModal?.parentId}
                onClose={() => setFolderModal(null)}
                onConfirm={(name, color, parentId) =>
                    folderModal?.mode === "rename"
                        ? handleRenameFolder(name, color)
                        : handleCreateFolder(name, color, parentId)
                }
            />

            <MoveToFolderModal
                open={!!moveModal}
                designTitle={moveModal?.designTitle ?? ""}
                currentFolderId={moveModal?.currentFolderId}
                folders={folderTree}
                onClose={() => setMoveModal(null)}
                onConfirm={handleMove}
            />

            {shareModal && (
                <ShareDesignModal
                    open={!!shareModal}
                    onClose={() => setShareModal(null)}
                    designId={shareModal.designId}
                    designTitle={shareModal.designTitle}
                    slug={shareModal.slug}
                    isPrivate={shareModal.isPrivate}
                    onPrivacyChange={async (priv) => {
                        await updatePrivacyMutation({ designId: shareModal.designId, isPrivate: priv });
                        setShareModal(m => m ? { ...m, isPrivate: priv } : null);
                    }}
                    onSlugChange={(newSlug) => setShareModal(m => m ? { ...m, slug: newSlug } : null)}
                />
            )}

            {/* Delete folder confirmation */}
            {deleteFolderConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteFolderConfirm(null)} />
                    <div className="relative bg-white rounded-tl-2xl rounded-br-2xl shadow-2xl w-full max-w-xs mx-4 p-6 space-y-4">
                        <div className="text-sm font-bold text-brand-blue">Delete "{deleteFolderConfirm.name}"?</div>
                        <p className="text-xs text-brand-blue/55 leading-relaxed">
                            Designs inside this folder will be moved to root. Subfolders will also be deleted.
                        </p>
                        <div className="flex gap-2">
                            <button onClick={() => setDeleteFolderConfirm(null)}
                                className="flex-1 py-2.5 text-xs font-bold text-brand-blue/60 border-2 border-brand-blue/12 rounded-lg hover:border-brand-blue/25 transition-colors">
                                Cancel
                            </button>
                            <button onClick={() => handleDeleteFolder(deleteFolderConfirm)}
                                className="flex-1 py-2.5 text-xs font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">
                                Delete Folder
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
