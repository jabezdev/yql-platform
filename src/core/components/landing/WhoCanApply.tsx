import { GraduationCap, Briefcase, BookOpen, PenTool, Heart } from 'lucide-react';
import { Section } from '../ui/Section';
import { SectionTitle } from '../ui/SectionTitle';
import { Container } from '../ui/Container';

export default function WhoCanApply() {
    const audiences = [
        { icon: GraduationCap, text: "Students from any discipline" },
        { icon: Briefcase, text: "Young professionals" },
        { icon: BookOpen, text: "Educators and researchers" },
        { icon: PenTool, text: "Designers, developers, organizers, communicators" },
        { icon: Heart, text: "Anyone passionate about technology, science, or community-building" },
    ];

    return (
        <Section>
            <Container>
                <div className="max-w-4xl mx-auto">
                    <SectionTitle>Who Can Apply?</SectionTitle>

                    <div className="grid md:grid-cols-2 gap-6 mb-12">
                        <div className="bg-white border-2 border-brand-blueDark rounded-tl-2xl rounded-br-2xl shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] p-8 relative overflow-hidden group hover:shadow-[6px_6px_0px_0px_rgba(57,103,153,0.2)] hover:-translate-y-0.5 transition-all duration-200">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-yellow/20 rounded-bl-full" />
                            <h3 className="text-xl font-display font-extrabold mb-6 text-brand-blueDark relative z-10">We welcome:</h3>
                            <ul className="space-y-4 relative z-10">
                                {audiences.map((item, index) => (
                                    <li key={index} className="flex items-center gap-3 text-brand-blueDark/80 font-medium">
                                        <item.icon className="w-5 h-5 text-brand-blue flex-shrink-0" />
                                        <span>{item.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-brand-blueDark text-white p-8 rounded-tl-2xl rounded-br-2xl shadow-[4px_4px_0px_0px_rgba(57,103,153,0.4)] flex flex-col justify-center relative overflow-hidden">
                            {/* Decorative geometric corners */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-yellow/10 rounded-tr-full" />

                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-brand-yellow/20 border-2 border-brand-yellow/40 rounded-tl-xl rounded-br-xl flex items-center justify-center mb-4 text-2xl">
                                    👉
                                </div>
                                <h3 className="text-2xl font-display font-extrabold mb-4 text-white">No quantum background required for many roles.</h3>
                                <p className="text-brand-bgLight/90 mb-4 text-lg font-medium">
                                    We will train you within QCSP.
                                </p>
                                <p className="font-bold text-brand-yellow text-xl">
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
