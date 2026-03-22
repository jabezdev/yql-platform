import { CheckCircle2, Users, Layers, Calendar } from 'lucide-react';
import { Section } from '../ui/Section';
import { SectionTitle } from '../ui/SectionTitle';
import { Container } from '../ui/Container';

export default function About() {
    const features = [
        "Support ongoing QCSP programs and events",
        "Propose and launch new initiatives",
        "Work in functional teams with real responsibilities",
        "Develop leadership, technical, and organizational skills",
        "Help shape the future of quantum education and community in the country"
    ];

    return (
        <Section id="about">
            <Container>
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <SectionTitle
                            centered={false}
                            subtitle="Young Quantum Leaders is an initiative where members:"
                        >
                            What is Young Quantum Leaders?
                        </SectionTitle>

                        <ul className="space-y-4 mb-8">
                            {features.map((feature, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <CheckCircle2 className="w-6 h-6 text-brand-lightBlue flex-shrink-0 mt-0.5" />
                                    <span className="text-brand-blue/80 text-lg font-medium">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="bg-white p-6 border-2 border-brand-blue/20 rounded-tl-xl rounded-br-xl shadow-[3px_3px_0px_0px_rgba(57,103,153,0.1)]">
                            <p className="text-brand-blue font-medium text-lg leading-relaxed">
                                YQL runs year-round, with cohort-based recruitment and evolving projects.
                            </p>
                        </div>
                    </div>

                    <div className="relative flex flex-col gap-4">
                        <div className="rounded-tl-2xl rounded-br-2xl bg-brand-blue border-2 border-brand-blue shadow-[6px_6px_0px_0px_rgba(57,103,153,0.25)] p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/10 rounded-bl-full" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-tr-full" />
                            <div className="relative z-10">
                                <h3 className="text-2xl font-display font-extrabold text-white mb-1">Build. Lead. Innovate.</h3>
                                <p className="text-brand-bgLight/70 font-medium">Shape the Quantum Future of the Philippines.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { icon: Users, label: "Active Members", value: "50+" },
                                { icon: Layers, label: "Committees", value: "6" },
                                { icon: Calendar, label: "Years Running", value: "3+" },
                            ].map(({ icon: Icon, label, value }) => (
                                <div key={label} className="bg-white border-2 border-brand-blue rounded-tl-xl rounded-br-xl shadow-[3px_3px_0px_0px_rgba(57,103,153,0.12)] p-4 text-center">
                                    <Icon size={18} className="text-brand-lightBlue mx-auto mb-2" />
                                    <p className="text-2xl font-display font-extrabold text-brand-blue leading-none">{value}</p>
                                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/40 mt-1">{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Container>
        </Section>
    );
}
