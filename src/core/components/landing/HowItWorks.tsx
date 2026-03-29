import { UserPlus, Briefcase, Lightbulb, Users, Flag } from 'lucide-react';
import { Container } from '../ui/layout/Container';

const steps = [
    {
        icon: UserPlus,
        number: "01",
        title: "Join a Functional Committee",
        desc: "Choose a committee aligned with your interests and skills.",
    },
    {
        icon: Briefcase,
        number: "02",
        title: "Contribute to Ongoing Work",
        desc: "Help execute current programs and get familiarized with QCSP.",
    },
    {
        icon: Lightbulb,
        number: "03",
        title: "Propose New Ideas",
        desc: "Pitch and lead new projects that matter to the community.",
    },
    {
        icon: Users,
        number: "04",
        title: "Self-Organized Teams",
        desc: "Form small autonomous teams to launch your own initiatives.",
    },
    {
        icon: Flag,
        number: "05",
        title: "Leadership Opportunities",
        desc: "Become a project or committee lead on major national events.",
    },
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="bg-brand-bgLight py-20 md:py-24 overflow-hidden relative">
            {/* Ghost background text */}
            <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden>
                <span className="absolute -bottom-4 -right-6 text-[180px] font-display font-extrabold text-brand-blue/[0.04] leading-none">
                    PROGRAM
                </span>
            </div>

            <Container className="relative z-10">
                {/* Header */}
                <div className="mb-12">
                    <span className="text-[10px] font-display font-extrabold tracking-[0.3em] uppercase text-brand-wine mb-4 block">
                        04 — The Process
                    </span>
                    <h2 className="text-4xl md:text-5xl font-display font-extrabold text-brand-blue leading-[1.1] tracking-tight">
                        How the Program Works
                    </h2>
                </div>

                {/* Steps list */}
                <div className="space-y-3">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className="group flex items-center gap-5 md:gap-8 bg-white border-2 border-brand-blue/12 rounded-tl-xl rounded-br-xl px-6 py-5 hover:border-brand-blue hover:shadow-[4px_4px_0px_0px_rgba(57,103,153,0.14)] hover:-translate-y-[1px] hover:-translate-x-[1px] transition-all duration-200"
                        >
                            {/* Large decorative number */}
                            <span className="text-4xl md:text-5xl font-display font-extrabold text-brand-blue/8 tabular-nums flex-shrink-0 group-hover:text-brand-blue/18 transition-colors duration-200 w-14 text-center leading-none select-none">
                                {step.number}
                            </span>

                            {/* Icon badge */}
                            <div className="w-10 h-10 rounded-tl-lg rounded-br-lg bg-brand-blue flex items-center justify-center flex-shrink-0 text-white shadow-[2px_2px_0px_0px_rgba(10,22,48,0.28)] group-hover:bg-brand-darkBlue transition-colors duration-200">
                                <step.icon size={18} />
                            </div>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-[15px] font-display font-extrabold text-brand-blue leading-snug">
                                    {step.title}
                                </h3>
                                <p className="text-brand-blue/50 text-sm font-medium mt-0.5 leading-snug">
                                    {step.desc}
                                </p>
                            </div>

                            {/* Trail arrow / final badge */}
                            <div className="hidden md:flex items-center flex-shrink-0">
                                {index < steps.length - 1 ? (
                                    <span className="text-brand-blue/18 font-display font-extrabold text-lg group-hover:text-brand-blue/35 transition-colors duration-200">
                                        →
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-display font-extrabold uppercase tracking-[0.2em] bg-brand-yellow text-brand-blue px-3 py-1.5 rounded-tl-lg rounded-br-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                                        YQL!
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    );
}
