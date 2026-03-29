import { Award, Briefcase, Globe, Users, Smile, Star } from 'lucide-react';
import { Section } from '../ui/layout/Section';
import { Container } from '../ui/layout/Container';

const benefits = [
    {
        icon: Award,
        text: "Real leadership experience",
        desc: "Take on actual ownership and accountability in a live organization.",
        accent: true,
    },
    {
        icon: Briefcase,
        text: "Portfolio-worthy projects",
        desc: "Build work you can proudly showcase.",
        accent: false,
    },
    {
        icon: Globe,
        text: "National and international exposure",
        desc: "Represent quantum education at scale.",
        accent: false,
    },
    {
        icon: Users,
        text: "Professional network in deep tech",
        desc: "Connect with leaders across the industry.",
        accent: false,
    },
    {
        icon: Smile,
        text: "Mentorship and collaboration",
        desc: "Learn from experienced practitioners.",
        accent: false,
    },
    {
        icon: Star,
        text: "Shape the country's quantum ecosystem",
        desc: "Leave a lasting national impact.",
        accent: false,
    },
];

export default function Benefits() {
    return (
        <Section id="benefits" className="overflow-hidden">
            <Container>
                {/* Header */}
                <div className="mb-12">
                    <span className="text-[10px] font-display font-extrabold tracking-[0.3em] uppercase text-brand-wine mb-4 block">
                        03 — Member Benefits
                    </span>
                    <h2 className="text-4xl md:text-5xl font-display font-extrabold text-brand-blue leading-[1.1] tracking-tight">
                        What You Gain
                    </h2>
                </div>

                {/* Top row — larger featured cards */}
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                    {benefits.slice(0, 3).map((benefit, index) => (
                        <div
                            key={index}
                            className="group relative bg-white border-2 border-brand-blue rounded-tl-2xl rounded-br-2xl shadow-[4px_4px_0px_0px_rgba(10,22,48,0.14)] hover:shadow-[7px_7px_0px_0px_rgba(10,22,48,0.18)] hover:-translate-y-[2px] hover:-translate-x-[2px] transition-all duration-200 p-8 overflow-hidden"
                        >
                            {/* Ghost number */}
                            <span className="absolute top-3 right-5 text-[64px] font-display font-extrabold text-brand-blue/5 leading-none select-none tabular-nums pointer-events-none">
                                {String(index + 1).padStart(2, '0')}
                            </span>

                            <div className="w-11 h-11 bg-brand-yellow rounded-tl-xl rounded-br-xl flex items-center justify-center mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.12)] text-brand-blue group-hover:scale-105 transition-transform duration-200 flex-shrink-0">
                                <benefit.icon size={20} />
                            </div>
                            <h3 className="text-[17px] font-display font-extrabold text-brand-blue mb-2 leading-snug">
                                {benefit.text}
                            </h3>
                            <p className="text-brand-blue/45 text-sm font-medium leading-relaxed">
                                {benefit.desc}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Bottom row — compact supplementary */}
                <div className="grid md:grid-cols-3 gap-4">
                    {benefits.slice(3).map((benefit, index) => (
                        <div
                            key={index + 3}
                            className="group flex items-center gap-4 bg-brand-bgLight border-2 border-brand-blue/12 rounded-tl-xl rounded-br-xl p-5 hover:border-brand-blue hover:bg-white hover:shadow-[4px_4px_0px_0px_rgba(57,103,153,0.14)] hover:-translate-y-[1px] hover:-translate-x-[1px] transition-all duration-200"
                        >
                            <div className="w-10 h-10 bg-brand-blue rounded-tl-lg rounded-br-lg flex items-center justify-center flex-shrink-0 text-white shadow-[2px_2px_0px_0px_rgba(10,22,48,0.25)] group-hover:bg-brand-darkBlue transition-colors duration-200">
                                <benefit.icon size={18} />
                            </div>
                            <div className="min-w-0">
                                <p className="font-display font-bold text-brand-blue text-sm leading-snug">
                                    {benefit.text}
                                </p>
                                <p className="text-brand-blue/40 text-xs mt-0.5 truncate">
                                    {benefit.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </Section>
    );
}
