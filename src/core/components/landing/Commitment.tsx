import { Clock, Laptop, Target, BarChart, TrendingUp } from 'lucide-react';
import { Section } from '../ui/Section';
import { SectionTitle } from '../ui/SectionTitle';
import { Container } from '../ui/Container';

export default function Commitment() {
    const commitments = [
        { icon: Clock, text: "Flexible and project-based" },
        { icon: Laptop, text: "Remote-first" },
        { icon: Target, text: "Output-focused rather than time-based" },
        { icon: BarChart, text: "Members choose how much to take on" }
    ];

    const pathways = [
        "Project Leads",
        "Committee Leads",
        "National Initiative Leads",
        "Mentors for new cohorts",
        "Core QCSP leadership roles"
    ];

    return (
        <Section variant="gray" id="commitment">
            <Container>
                <div className="grid lg:grid-cols-2 gap-16">
                    <div>
                        <SectionTitle centered={false}>Commitment</SectionTitle>
                        <div className="grid sm:grid-cols-2 gap-5">
                            {commitments.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col gap-3 p-5 bg-white border-2 border-brand-blue/30 rounded-tl-xl rounded-br-xl shadow-[3px_3px_0px_0px_rgba(57,103,153,0.1)] hover:border-brand-blue hover:shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] transition-all duration-200"
                                >
                                    <item.icon className="text-brand-blue w-8 h-8" />
                                    <span className="font-extrabold text-brand-blue font-display">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <SectionTitle centered={false}>Growth Pathways</SectionTitle>
                        <div className="bg-brand-blue text-white p-8 rounded-tl-2xl rounded-br-2xl shadow-[6px_6px_0px_0px_rgba(57,103,153,0.3)] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-tl-2xl" />
                            <div className="absolute bottom-0 left-0 w-16 h-16 bg-brand-yellow/10 rounded-br-2xl" />

                            <h3 className="text-xl font-display font-extrabold mb-6 relative z-10">Members can grow into:</h3>
                            <ul className="space-y-4 relative z-10">
                                {pathways.map((path, index) => (
                                    <li key={index} className="flex items-center gap-3">
                                        <TrendingUp className="text-brand-yellow w-5 h-5 flex-shrink-0" />
                                        <span className="text-lg font-medium text-brand-bgLight/90">{path}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </Container>
        </Section>
    );
}
