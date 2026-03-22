import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Save } from "lucide-react";
import { Button } from "../ui/Button";

interface ProfileEditorProps {
    initialData: {
        bio?: string;
        favoriteShape?: "circle" | "square" | "triangle" | "hexagon";
        favoriteColor?: string;
        techStackIcon?: string;
    };
    onSave?: () => void;
}

const SHAPES = ["circle", "square", "triangle", "hexagon"] as const;
const PRESET_COLORS = ["#0052cc", "#00b37e", "#ffb800", "#ff5630", "#6554c0", "#172b4d"];
const ICONS = ["Terminal", "Code", "Server", "Database", "Cpu", "Layout", "Monitor", "Smartphone"];

export function ProfileEditor({ initialData, onSave }: ProfileEditorProps) {
    const [bio, setBio] = useState(initialData.bio || "");
    const [shape, setShape] = useState<"circle" | "square" | "triangle" | "hexagon">(initialData.favoriteShape || "circle");
    const [color, setColor] = useState(initialData.favoriteColor || "#0052cc");
    const [icon, setIcon] = useState(initialData.techStackIcon || "Code");
    const [isSaving, setIsSaving] = useState(false);

    const updateProfile = useMutation(api.userProfile.updateProfile);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateProfile({ bio, favoriteShape: shape, favoriteColor: color, techStackIcon: icon });
            if (onSave) onSave();
        } catch (err) {
            console.error("Failed to update profile", err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-tl-xl rounded-br-xl border-2 border-brand-blue/15 shadow-[2px_2px_0px_0px_rgba(57,103,153,0.08)]">
            {/* Bio */}
            <div>
                <label className="block text-sm font-display font-medium text-brand-blue mb-1.5">Short Bio</label>
                <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-brand-blue/25 rounded-tl-lg rounded-br-lg text-sm font-sans text-brand-blue placeholder:text-brand-blue/30 focus:outline-none focus:border-brand-lightBlue focus:shadow-[0_0_0_3px_rgba(57,103,153,0.12)] transition-all resize-none"
                    placeholder="Tell us about yourself..."
                    rows={3}
                    maxLength={150}
                />
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/40 mt-1 text-right">{bio.length}/150</p>
            </div>

            {/* Shape */}
            <div>
                <label className="block text-sm font-display font-medium text-brand-blue mb-2">Favorite Shape</label>
                <div className="flex flex-wrap gap-2">
                    {SHAPES.map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setShape(s)}
                            className={`px-4 py-2 text-sm font-bold rounded-tl-lg rounded-br-lg border-2 capitalize transition-all duration-150 ${
                                shape === s
                                    ? "bg-brand-blue text-white border-brand-blue shadow-[2px_2px_0px_0px_rgba(10,22,48,0.45)]"
                                    : "bg-white text-brand-blue border-brand-blue/25 hover:bg-brand-bgLight"
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Color */}
            <div>
                <label className="block text-sm font-display font-medium text-brand-blue mb-2">Brand Color</label>
                <div className="flex flex-wrap gap-2 items-center">
                    {PRESET_COLORS.map((c) => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => setColor(c)}
                            className={`w-9 h-9 rounded-tl-lg rounded-br-lg border-2 transition-all duration-150 ${
                                color === c
                                    ? "border-brand-blue scale-110 shadow-[2px_2px_0px_0px_rgba(57,103,153,0.25)]"
                                    : "border-brand-blue/20 hover:scale-105 hover:border-brand-blue/40"
                            }`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                    <div className="relative w-9 h-9">
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-9 h-9 p-0 border-2 border-brand-blue/20 rounded-tl-lg rounded-br-lg cursor-pointer overflow-hidden"
                            title="Custom Color"
                        />
                    </div>
                </div>
            </div>

            {/* Tech Stack Icon */}
            <div>
                <label className="block text-sm font-display font-medium text-brand-blue mb-2">Tech Stack Icon</label>
                <div className="flex flex-wrap gap-2">
                    {ICONS.map((ic) => (
                        <button
                            key={ic}
                            type="button"
                            onClick={() => setIcon(ic)}
                            className={`px-3 py-1.5 text-sm font-bold rounded-tl-lg rounded-br-lg border-2 transition-all duration-150 ${
                                icon === ic
                                    ? "bg-brand-lightBlue/10 text-brand-lightBlue border-brand-lightBlue/30"
                                    : "bg-white text-brand-blue/60 border-brand-blue/15 hover:bg-brand-bgLight hover:border-brand-blue/30"
                            }`}
                        >
                            {ic}
                        </button>
                    ))}
                </div>
            </div>

            <div className="pt-4 border-t-2 border-brand-blue/10 flex justify-end">
                <Button type="submit" variant="primary" size="md" disabled={isSaving}>
                    <Save size={16} />
                    {isSaving ? "Saving…" : "Save Profile"}
                </Button>
            </div>
        </form>
    );
}
