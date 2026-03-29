import { Target, Users, Zap, Globe, Lightbulb } from 'lucide-react';
import { Container } from '../ui/layout/Container';

const missionPoints = [
    { icon: Lightbulb, number: "01", text: "Advance quantum awareness and education" },
    { icon: Users,     number: "02", text: "Build strong academic and industry linkages" },
    { icon: Zap,       number: "03", text: "Create impactful programs and platforms" },
    { icon: Globe,     number: "04", text: "Strengthen the national quantum ecosystem" },
    { icon: Target,    number: "05", text: "Inspire more Filipinos to enter quantum and deep tech" },
];

export default function Mission() {
    return (
        <section id="mission" className="bg-brand-blue py-20 md:py-24 overflow-hidden relative">
            {/* Ghost background text */}
            <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden>
                <span className="absolute -top-10 -left-6 text-[200px] font-display font-extrabold text-white/[0.03] leading-none">
                    MISSION
                </span>
            </div>

            <Container className="relative z-10">
                {/* Header */}
                <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <span className="text-[10px] font-display font-extrabold tracking-[0.3em] uppercase text-brand-yellow mb-4 block">
                            02 — Why We Exist
                        </span>
                        <h2 className="text-4xl md:text-5xl font-display font-extrabold text-white leading-[1.1] tracking-tight">
                            Our Mission
                        </h2>
                    </div>
                    <p className="text-white/40 font-medium text-sm max-w-xs md:text-right leading-relaxed">
                        To develop a new generation of leaders who will:
                    </p>
                </div>

                {/* Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 border-t border-white/10">
                    {missionPoints.map((point, index) => (
                        <div
                            key={index}
                            className="group relative flex items-start gap-5 p-8 border-b border-r border-white/10 hover:bg-white/[0.04] transition-colors duration-200"
                        >
                            {/* Decorative number */}
                            <span className="text-[52px] font-display font-extrabold text-white/8 leading-none flex-shrink-0 tabular-nums group-hover:text-brand-yellow/25 transition-colors duration-200 -mt-1 select-none">
                                {point.number}
                            </span>
                            <div className="pt-1">
                                <div className="w-8 h-8 rounded-tl-lg rounded-br-lg bg-brand-yellow/10 border border-brand-yellow/20 flex items-center justify-center mb-4 text-brand-yellow">
                                    <point.icon size={16} />
                                </div>
                                <p className="text-white font-bold text-base leading-snug">{point.text}</p>
                            </div>
                        </div>
                    ))}

                    {/* Filler cell — maintains the grid shape */}
                    <div className="hidden lg:flex items-end p-8 border-b border-r border-white/10 bg-brand-yellow/[0.04]">
                        <p className="text-brand-yellow/50 text-xs font-display font-extrabold uppercase tracking-[0.25em] leading-loose">
                            Building<br />Tomorrow's<br />Leaders
                        </p>
                    </div>
                </div>
            </Container>
        </section>
    );
}
