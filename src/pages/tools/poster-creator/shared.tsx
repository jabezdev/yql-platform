import { YQL_PALETTE } from "./constants";

export function Label({ children }: { children: React.ReactNode }) {
    return <div className="text-[10px] font-bold uppercase tracking-wider text-brand-blue/45 mb-1">{children}</div>;
}

export function ColorRow({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
                <input
                    type="color"
                    value={value.startsWith("rgba") ? "#ffffff" : value}
                    onChange={e => onChange(e.target.value)}
                    className="w-8 h-7 rounded cursor-pointer border border-brand-blue/15 flex-shrink-0"
                />
                <input
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="flex-1 text-[11px] px-2 py-1.5 border border-brand-blue/15 rounded-tl-md rounded-br-md outline-none focus:border-brand-lightBlue/50 text-brand-blue/80 font-mono"
                />
            </div>
            <div className="flex flex-wrap gap-1">
                {YQL_PALETTE.map(c => (
                    <button
                        key={c} onClick={() => onChange(c)}
                        className="w-5 h-5 rounded-sm border border-black/10 hover:scale-110 transition-transform flex-shrink-0"
                        style={{ background: c }}
                        title={c}
                    />
                ))}
            </div>
        </div>
    );
}

export function SliderRow({ label, value, min, max, step = 1, onChange }: {
    label: string; value: number; min: number; max: number; step?: number;
    onChange: (v: number) => void;
}) {
    return (
        <div>
            <div className="flex items-center justify-between mb-0.5">
                <Label>{label}</Label>
                <span className="text-[10px] text-brand-blue/50 font-mono">{value}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={value}
                onChange={e => onChange(Number(e.target.value))}
                className="w-full h-1.5 accent-brand-lightBlue cursor-pointer"
            />
        </div>
    );
}
