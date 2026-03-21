import { Target, Users, Zap, Globe, Lightbulb } from 'lucide-react';
import { Section } from '../ui/Section';
import { SectionTitle } from '../ui/SectionTitle';
import { Container } from '../ui/Container';

export default function Mission() {
    const missionPoints = [
        {
            icon: Lightbulb,
            text: "Advance quantum awareness and education"
        },
        {
            icon: Users,
            text: "Build strong academic and industry linkages"
        },
        {
            icon: Zap,
            text: "Create impactful programs and platforms"
        },
        {
            icon: Globe,
            text: "Strengthen the national quantum ecosystem"
        },
        {
            icon: Target,
            text: "Inspire more Filipinos to enter quantum and deep tech"
        }
    ];

    return (
        <Section variant="gray" id="mission">
            <Container>
                <SectionTitle
                    subtitle="To develop a new generation of leaders who will:"
                >
                    Mission
                </SectionTitle>

                <div className="grid md:grid-cols-3 gap-6">
                    {missionPoints.map((point, index) => (
                        <div
                            key={index}
                            className="bg-white border-2 border-brand-blueDark rounded-tl-2xl rounded-br-2xl shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] p-6 flex flex-col items-center text-center h-full hover:shadow-[6px_6px_0px_0px_rgba(57,103,153,0.2)] hover:-translate-y-0.5 transition-all duration-200"
                        >
                            <div className="w-12 h-12 bg-brand-blue/10 border-2 border-brand-blue/20 rounded-tl-xl rounded-br-xl flex items-center justify-center mb-4 text-brand-blue">
                                <point.icon size={24} />
                            </div>
                            <p className="text-brand-blueDark font-bold text-lg">{point.text}</p>
                        </div>
                    ))}
                </div>
            </Container>
        </Section>
    );
}
