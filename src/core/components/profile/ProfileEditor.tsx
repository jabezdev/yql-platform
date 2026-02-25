import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Save } from "lucide-react";

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
            await updateProfile({
                bio,
                favoriteShape: shape,
                favoriteColor: color,
                techStackIcon: icon,
            });
            if (onSave) onSave();
        } catch (err) {
            console.error("Failed to update profile", err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Short Bio</label>
                <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                    placeholder="Tell us about yourself..."
                    rows={3}
                    maxLength={150}
                />
                <p className="text-xs text-gray-500 mt-1 text-right">{bio.length}/150</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Favorite Shape</label>
                <div className="flex gap-4">
                    {SHAPES.map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setShape(s)}
                            className={`px-4 py-2 text-sm font-medium rounded-md border capitalize transition-colors ${shape === s
                                    ? "bg-gray-900 text-white border-gray-900"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Brand Color</label>
                <div className="flex flex-wrap gap-3">
                    {PRESET_COLORS.map((c) => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => setColor(c)}
                            className={`w-10 h-10 rounded-full border-2 transition-transform ${color === c ? "border-gray-900 scale-110" : "border-transparent hover:scale-105"
                                }`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                    <div className="relative">
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-10 h-10 p-0 border-0 rounded-full cursor-pointer overflow-hidden"
                            title="Custom Color"
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Tech Stack Icon</label>
                <div className="flex flex-wrap gap-2">
                    {ICONS.map((ic) => (
                        <button
                            key={ic}
                            type="button"
                            onClick={() => setIcon(ic)}
                            className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${icon === ic
                                    ? "bg-brand-blue/10 text-brand-blue border-brand-blue/20 font-medium"
                                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                }`}
                        >
                            {ic}
                        </button>
                    ))}
                </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 font-medium"
                >
                    <Save size={18} />
                    {isSaving ? "Saving..." : "Save Profile"}
                </button>
            </div>
        </form>
    );
}
