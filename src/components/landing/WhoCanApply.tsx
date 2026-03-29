import { GraduationCap, Briefcase, BookOpen, PenTool, Heart } from 'lucide-react';
import { Section } from '../ui/layout/Section';
import { Container } from '../ui/layout/Container';

const audiences = [
    { icon: GraduationCap, text: "Students from any discipline" },
    { icon: Briefcase,     text: "Young professionals" },
    { icon: BookOpen,      text: "Educators and researchers" },
    { icon: PenTool,       text: "Designers, developers, organizers, communicators" },
    { icon: Heart,         text: "Anyone passionate about technology, science, or community-building" },
];

export default function WhoCanApply() {
    return (
        <Section id="who-can-apply">
            <Container>
                <span className="text-[10px] font-display font-extrabold tracking-[0.3em] uppercase text-brand-wine mb-4 block">
                    05 — Eligibility
                </span>

                <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
                    {/* Left: Who list */}
                    <div>
                        <h2 className="text-4xl md:text-5xl font-display font-extrabold text-brand-blue leading-[1.1] tracking-tight mb-10">
                            Who Can<br />Apply?
                        </h2>
                        <div className="border-t-2 border-brand-blue/10">
                            {audiences.map((item, index) => (
                                <div
                                    key={index}
                                    className="group flex items-center gap-4 py-4 border-b-2 border-brand-blue/8 hover:border-brand-blue/25 transition-colors duration-150"
                                >
                                    <div className="w-9 h-9 rounded-tl-lg rounded-br-lg bg-brand-bgLight border-2 border-brand-blue/12 flex items-center justify-center flex-shrink-0 text-brand-lightBlue group-hover:bg-brand-blue group-hover:text-white group-hover:border-brand-blue transition-all duration-200 shadow-none">
                                        <item.icon size={15} />
                                    </div>
                                    <span className="text-brand-blue/80 font-semibold text-[15px] leading-snug">
                                        {item.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Key message panels */}
                    <div className="flex flex-col gap-6 lg:pt-[72px]">
                        {/* Yellow accent panel with geometric shadow */}
                        <div className="relative group">
                            {/* White offset shadow factor */}
                            <div className="absolute inset-0 translate-x-2.5 translate-y-2.5 bg-white border-2 border-brand-blue/5 rounded-tl-2xl rounded-br-2xl" />
                            
                            {/* Main content card */}
                            <div className="bg-brand-yellow rounded-tl-2xl rounded-br-2xl p-8 shadow-none relative overflow-hidden border-2 border-brand-blue/5">
                                <span className="absolute -bottom-7 -right-3 text-[110px] font-display font-extrabold text-brand-blue/[0.12] leading-none select-none pointer-events-none transform rotate-[-2deg]">
                                    YQL
                                </span>
                                <p className="text-brand-blue text-2xl font-display font-extrabold leading-tight mb-4 relative z-10">
                                    No quantum background required for many roles.
                                </p>
                                <p className="text-brand-blue/50 font-bold text-sm relative z-10">
                                    We will train you within QCSP.
                                </p>
                            </div>
                        </div>

                        {/* Dark callout with geometric shadow */}
                        <div className="relative group">
                            {/* White offset shadow factor */}
                            <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-white border-2 border-brand-blue/5 rounded-tl-xl rounded-br-xl" />
                            
                            {/* Main content card */}
                            <div className="bg-brand-blue rounded-tl-xl rounded-br-xl p-6 shadow-none relative overflow-hidden border-2 border-brand-blue/5">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-brand-yellow/8 rounded-tl-xl pointer-events-none" />
                                <p className="text-white font-display font-extrabold text-[17px] leading-snug relative z-10">
                                    Curiosity, initiative, and reliability matter most.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </Section>
    );
}
