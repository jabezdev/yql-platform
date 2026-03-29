import { Clock, Laptop, Target, BarChart } from 'lucide-react';
import { Container } from '../ui/layout/Container';

const commitments = [
    { icon: Clock,    text: "Flexible and project-based" },
    { icon: Laptop,   text: "Remote-first" },
    { icon: Target,   text: "Output-focused, not time-based" },
    { icon: BarChart, text: "Members choose how much to take on" },
];

const pathways = [
    { title: "Project Leads",              detail: "Own and drive individual initiatives" },
    { title: "Committee Leads",            detail: "Oversee entire functional areas" },
    { title: "National Initiative Leads",  detail: "Spearhead flagship programs" },
    { title: "Mentors for new cohorts",    detail: "Guide and shape incoming members" },
    { title: "Core QCSP leadership roles", detail: "Define the organization's direction" },
];

export default function Commitment() {
    return (
        <section id="commitment" className="bg-brand-bgLight py-20 md:py-24">
            <Container>
                <div className="grid lg:grid-cols-2 gap-16">
                    {/* Commitment */}
                    <div>
                        <span className="text-[10px] font-display font-extrabold tracking-[0.3em] uppercase text-brand-wine mb-4 block">
                            06 — Your Time
                        </span>
                        <h2 className="text-4xl font-display font-extrabold text-brand-blue leading-[1.1] tracking-tight mb-10">
                            Commitment
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            {commitments.map((item, index) => (
                                <div
                                    key={index}
                                    className="group bg-white border-2 border-brand-blue/12 rounded-tl-xl rounded-br-xl p-5 hover:border-brand-blue hover:shadow-[3px_3px_0px_0px_rgba(57,103,153,0.14)] transition-all duration-200"
                                >
                                    <div className="w-9 h-9 rounded-tl-lg rounded-br-lg bg-brand-bgLight border-2 border-brand-blue/10 flex items-center justify-center mb-4 text-brand-blue group-hover:bg-brand-blue group-hover:text-white group-hover:border-brand-blue transition-all duration-200 shadow-none">
                                        <item.icon size={15} />
                                    </div>
                                    <p className="font-display font-bold text-brand-blue text-sm leading-snug">
                                        {item.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Growth Pathways */}
                    <div>
                        <span className="text-[10px] font-display font-extrabold tracking-[0.3em] uppercase text-brand-wine mb-4 block">
                            07 — Your Path
                        </span>
                        <h2 className="text-4xl font-display font-extrabold text-brand-blue leading-[1.1] tracking-tight mb-10">
                            Growth Pathways
                        </h2>
                        <div className="border-t-2 border-brand-blue/10">
                            {pathways.map((path, index) => (
                                <div
                                    key={index}
                                    className="group flex items-start justify-between gap-4 py-[15px] border-b border-brand-blue/8 hover:border-brand-yellow transition-colors duration-150"
                                >
                                    <div>
                                        <p className="font-display font-extrabold text-brand-blue text-[15px] transition-colors duration-150">
                                            {path.title}
                                        </p>
                                        <p className="text-brand-blue/45 text-xs mt-0.5 font-medium">
                                            {path.detail}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
