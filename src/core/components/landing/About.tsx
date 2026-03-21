import { CheckCircle2 } from 'lucide-react';
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
                                    <CheckCircle2 className="w-6 h-6 text-brand-blue flex-shrink-0 mt-0.5" />
                                    <span className="text-brand-blueDark/80 text-lg font-medium">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="bg-white p-6 border-2 border-brand-blueDark/20 rounded-tl-xl rounded-br-xl shadow-[3px_3px_0px_0px_rgba(57,103,153,0.1)]">
                            <p className="text-brand-blueDark font-medium text-lg leading-relaxed">
                                YQL runs year-round, with cohort-based recruitment and evolving projects.
                            </p>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="aspect-square rounded-tl-2xl rounded-br-2xl bg-white border-2 border-brand-blueDark shadow-[6px_6px_0px_0px_rgba(57,103,153,0.15)] relative z-10 p-8 flex items-center justify-center overflow-hidden">
                            {/* Decorative geometric elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/20 rounded-bl-full" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-blue/10 rounded-tr-full" />

                            <div className="text-center relative z-10">
                                <h3 className="text-2xl font-display font-extrabold text-brand-blueDark mb-2">Build. Lead. Innovate.</h3>
                                <p className="text-brand-blueDark/60 font-medium">Shape the Quantum Future of the Philippines.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </Section>
    );
}
