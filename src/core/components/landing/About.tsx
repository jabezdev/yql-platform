import { Users, Layers, Calendar } from 'lucide-react';
import { Section } from '../ui/layout/Section';
import { Container } from '../ui/layout/Container';

export default function About() {
    const features = [
        "Support ongoing QCSP programs and events",
        "Propose and launch new initiatives",
        "Work in functional teams with real responsibilities",
        "Develop leadership, technical, and organizational skills",
        "Help shape the future of quantum education and community in the country",
    ];

    const stats = [
        { icon: Users, label: "Active Members", value: "50+" },
        { icon: Layers, label: "Committees", value: "6" },
        { icon: Calendar, label: "Years Running", value: "3+" },
    ];

    return (
        <Section id="about">
            <Container>
                <div className="grid lg:grid-cols-[5fr_1px_6fr] gap-0 items-start">
                    {/* Left Column */}
                    <div className="pr-0 lg:pr-16">
                        <span className="text-[10px] font-display font-extrabold tracking-[0.3em] uppercase text-brand-wine mb-4 block">
                            01 — About the Program
                        </span>
                        <h2 className="text-4xl md:text-5xl font-display font-extrabold text-brand-blue leading-[1.1] mb-6 tracking-tight">
                            What is<br />
                            <span className="text-brand-wine">Young Quantum</span>
                            <br />Leaders?
                        </h2>
                        <p className="text-brand-blue/55 text-base font-medium mb-10 leading-relaxed max-w-xs">
                            YQL runs year-round, with cohort-based recruitment and continuously evolving projects.
                        </p>

                        {/* Stats */}
                        <div className="flex gap-8 pt-8 border-t-2 border-brand-blue/10">
                            {stats.map(({ label, value }) => (
                                <div key={label} className="flex flex-col gap-1">
                                    <span className="text-3xl font-display font-extrabold text-brand-blue leading-none tabular-nums">
                                        {value}
                                    </span>
                                    <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-brand-blue/35">
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Vertical Divider */}
                    <div className="hidden lg:block bg-brand-blue/10 self-stretch mx-0" />

                    {/* Right Column */}
                    <div className="pl-0 lg:pl-16 mt-12 lg:mt-0">
                        <p className="text-[10px] font-display font-extrabold uppercase tracking-[0.3em] text-brand-blue/35 mb-5">
                            Members:
                        </p>
                        <ol className="space-y-0 mb-8">
                            {features.map((feature, index) => (
                                <li
                                    key={index}
                                    className="group flex items-start gap-5 py-[14px] border-b border-brand-blue/8 last:border-none"
                                >
                                    <span className="text-[10px] font-display font-extrabold text-brand-blue/25 tabular-nums pt-1 flex-shrink-0 w-5 tracking-wider">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <span className="text-brand-blue/80 font-semibold text-[15px] leading-snug group-hover:text-brand-wine transition-colors duration-150">
                                        {feature}
                                    </span>
                                </li>
                            ))}
                        </ol>

                        {/* Tagline panel */}
                        <div className="bg-brand-blue rounded-tl-2xl rounded-br-2xl p-6 shadow-[5px_5px_0px_0px_rgba(10,22,48,0.4)] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-brand-yellow/10 rounded-tl-2xl pointer-events-none" />
                            <p className="text-xl font-display font-extrabold text-white leading-snug relative z-10">
                                Build. Lead. Innovate.
                            </p>
                            <p className="text-brand-bgLight/50 text-sm font-medium mt-1.5 relative z-10">
                                Shape the Quantum Future of the Philippines.
                            </p>
                        </div>
                    </div>
                </div>
            </Container>
        </Section>
    );
}
