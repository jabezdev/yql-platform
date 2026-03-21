import { Award, Briefcase, Globe, Users, Smile, Star } from 'lucide-react';
import { Section } from '../ui/Section';
import { SectionTitle } from '../ui/SectionTitle';
import { Container } from '../ui/Container';

export default function Benefits() {
    const benefits = [
        { icon: Award, text: "Real leadership experience" },
        { icon: Briefcase, text: "Portfolio-worthy projects" },
        { icon: Globe, text: "National and international exposure" },
        { icon: Users, text: "Professional network in deep tech" },
        { icon: Smile, text: "Mentorship and collaboration" },
        { icon: Star, text: "Opportunity to shape the country's quantum ecosystem" },
    ];

    return (
        <Section variant="gray" className="overflow-hidden" id="benefits">
            <Container>
                <SectionTitle>What You Gain</SectionTitle>

                <div className="grid md:grid-cols-3 gap-6">
                    {benefits.map((benefit, index) => (
                        <div
                            key={index}
                            className="group relative bg-white border-2 border-brand-blueDark p-8 rounded-tl-2xl rounded-br-2xl shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] hover:shadow-[6px_6px_0px_0px_rgba(57,103,153,0.2)] hover:-translate-y-1 hover:-translate-x-0.5 transition-all duration-200"
                        >
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="w-14 h-14 bg-brand-yellow/20 border-2 border-brand-blueDark/10 rounded-tl-xl rounded-br-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 text-brand-blueDark">
                                    <benefit.icon size={28} />
                                </div>
                                <h3 className="text-lg font-display font-extrabold text-brand-blueDark">{benefit.text}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </Section>
    );
}
