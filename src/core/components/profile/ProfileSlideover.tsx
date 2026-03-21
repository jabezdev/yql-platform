import { useState, useRef } from "react";
import { X, LogOut, Upload, ImageIcon, Save, Loader2, CheckCircle2 } from "lucide-react";
import { useClerk, useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { UserProfile } from "../../providers/AuthProvider";

interface ProfileSlideoverProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserProfile;
}

const ROLE_LABELS: Record<string, string> = {
    "Super Admin": "Super Admin",
    T1: "T1 — Director",
    T2: "T2 — Manager",
    T3: "T3 — Coordinator",
    T4: "T4 — Associate",
    T5: "T5 — Volunteer",
    Applicant: "Applicant",
};

export function ProfileSlideover({ isOpen, onClose, user }: ProfileSlideoverProps) {
    const { signOut } = useClerk();
    const { user: clerkUser } = useUser();

    const generateUploadUrl = useMutation(api.users.generateUploadUrl);
    const saveProfileChip = useMutation(api.users.saveProfileChip);
    const updateProfile = useMutation(api.users.updateProfile);

    const [bio, setBio] = useState(user.bio ?? "");
    const [chipPreview, setChipPreview] = useState<string | null>(user.profileChipUrl ?? null);
    const [chipFile, setChipFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleChipSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setChipFile(file);
        setChipPreview(URL.createObjectURL(file));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Upload chip if a new one was selected
            if (chipFile) {
                const uploadUrl = await generateUploadUrl();
                const res = await fetch(uploadUrl, {
                    method: "POST",
                    headers: { "Content-Type": chipFile.type },
                    body: chipFile,
                });
                const { storageId } = await res.json();
                await saveProfileChip({ storageId });
            }
            // Save bio
            await updateProfile({ bio });
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (err) {
            console.error("Failed to save profile", err);
        } finally {
            setSaving(false);
        }
    };

    const avatarUrl = clerkUser?.imageUrl;
    const displayRole = ROLE_LABELS[user.role] ?? user.role;
    const displaySpecial = user.specialRoles?.join(" · ");

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-brand-blueDark/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div
                className="relative w-full max-w-sm bg-white h-full border-l-4 border-brand-blueDark shadow-[-8px_0px_0px_0px_rgba(10,22,48,0.2)] flex flex-col animate-in slide-in-from-right duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Header ── */}
                <div className="flex items-center justify-between px-6 py-5 border-b-2 border-gray-100 shrink-0">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-brand-blueDark/50">Your Profile</span>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border-2 border-brand-blueDark/20 text-brand-blueDark hover:bg-brand-bgLight hover:border-brand-blueDark transition-all"
                    >
                        <X size={16} strokeWidth={2.5} />
                    </button>
                </div>

                {/* ── Scrollable body ── */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">

                    {/* Identity block */}
                    <div className="px-6 py-6 flex items-center gap-4 border-b-2 border-gray-100">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={user.name}
                                className="w-14 h-14 rounded-tl-xl rounded-br-xl object-cover border-2 border-brand-blueDark shadow-[2px_2px_0px_0px_rgba(10,22,48,0.25)] flex-shrink-0"
                            />
                        ) : (
                            <div className="w-14 h-14 bg-brand-yellow border-2 border-brand-blueDark rounded-tl-xl rounded-br-xl flex items-center justify-center text-brand-blueDark font-extrabold text-2xl shadow-[2px_2px_0px_0px_rgba(10,22,48,0.25)] flex-shrink-0">
                                {user.name.charAt(0)}
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="font-display font-extrabold text-brand-blueDark text-lg leading-tight truncate">{user.name}</p>
                            <p className="text-xs font-bold text-brand-blue mt-0.5">{displayRole}</p>
                            {displaySpecial && (
                                <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/70 mt-0.5">{displaySpecial}</p>
                            )}
                            <p className="text-xs text-brand-darkBlue/50 font-medium mt-1 truncate">{user.email}</p>
                        </div>
                    </div>

                    {/* Profile Chip */}
                    <div className="px-6 py-6 border-b-2 border-gray-100 space-y-4">
                        <div>
                            <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/50 mb-1">Profile Chip</p>
                            <p className="text-xs text-brand-darkBlue/60 font-medium">
                                Upload a 3:1 horizontal image — your personal card design shown on the Network page.
                            </p>
                        </div>

                        {/* Chip preview */}
                        <div
                            className="w-full aspect-[3/1] rounded-tl-xl rounded-br-xl border-2 border-dashed border-brand-blueDark/30 overflow-hidden bg-brand-bgLight flex items-center justify-center cursor-pointer hover:border-brand-blueDark transition-colors group relative"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {chipPreview ? (
                                <>
                                    <img
                                        src={chipPreview}
                                        alt="Profile chip"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-brand-blueDark/0 group-hover:bg-brand-blueDark/40 transition-all flex items-center justify-center">
                                        <Upload size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-brand-blueDark/30 group-hover:text-brand-blue transition-colors">
                                    <ImageIcon size={28} />
                                    <span className="text-xs font-bold">Click to upload</span>
                                </div>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleChipSelect}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-brand-blueDark/20 rounded-lg text-sm font-bold text-brand-blueDark hover:bg-brand-bgLight hover:border-brand-blueDark transition-all"
                        >
                            <Upload size={15} />
                            {chipPreview ? "Replace image" : "Upload image"}
                        </button>
                    </div>

                    {/* Bio */}
                    <div className="px-6 py-6 border-b-2 border-gray-100 space-y-3">
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/50">About</p>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell the team a little about yourself..."
                            rows={4}
                            maxLength={200}
                            className="w-full px-4 py-3 bg-brand-bgLight/60 border-2 border-brand-blueDark/20 focus:border-brand-blueDark rounded-lg text-sm font-medium text-brand-blueDark placeholder:text-brand-blueDark/30 focus:outline-none focus:ring-0 transition-colors resize-none"
                        />
                        <p className="text-right text-xs text-brand-darkBlue/40 font-medium">{bio.length}/200</p>
                    </div>

                    {/* Save */}
                    <div className="px-6 py-6">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-brand-blueDark text-white font-bold rounded-tl-xl rounded-br-xl border-2 border-brand-blueDark shadow-[3px_3px_0px_0px_rgba(10,22,48,0.45)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(10,22,48,0.45)] active:translate-y-[3px] active:shadow-none transition-all disabled:opacity-60"
                        >
                            {saving ? (
                                <><Loader2 size={16} className="animate-spin" /> Saving…</>
                            ) : saved ? (
                                <><CheckCircle2 size={16} className="text-brand-yellow" /> Saved!</>
                            ) : (
                                <><Save size={16} /> Save Changes</>
                            )}
                        </button>
                    </div>
                </div>

                {/* ── Footer: Sign Out ── */}
                <div className="px-6 py-5 border-t-2 border-gray-100 bg-gray-50/50 shrink-0">
                    <button
                        onClick={() => signOut({ redirectUrl: "/" })}
                        className="w-full flex items-center justify-center gap-3 py-3 text-brand-wine hover:bg-brand-wine/10 border-2 border-brand-wine/30 hover:border-brand-wine rounded-xl transition-all font-bold text-sm uppercase tracking-widest"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
