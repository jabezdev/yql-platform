import { Container } from '../ui/layout/Container';
import { Button } from '../ui/primitives/Button';
import { useNavigate } from 'react-router-dom';

const steps = [
    { number: "01", title: "Choose a Functional Committee" },
    { number: "02", title: "Submit your application form" },
    { number: "03", title: "Demonstrate your skills" },
    { number: "04", title: "Interview" },
    { number: "05", title: "Onboarding" },
];

export default function Apply() {
    const navigate = useNavigate();

    return (
        <section id="apply" className="bg-brand-blue py-20 md:py-24 overflow-hidden relative">
            {/* Ghost background text */}
            <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden>
                <span className="absolute -top-6 -right-8 text-[200px] font-display font-extrabold text-white/[0.03] leading-none">
                    APPLY
                </span>
            </div>

            <Container className="relative z-10">
                {/* Header */}
                <div className="mb-14">
                    <span className="text-[10px] font-display font-extrabold tracking-[0.3em] uppercase text-brand-yellow mb-4 block">
                        08 — Get Started
                    </span>
                    <h2 className="text-4xl md:text-5xl font-display font-extrabold text-white leading-[1.1] tracking-tight">
                        How to Apply
                    </h2>
                </div>

                {/* Steps */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-y-10 gap-x-4 mb-16 relative">
                    {steps.map((step, index) => {
                        const isLast = index === steps.length - 1;
                        return (
                            <div key={index} className="relative flex flex-col items-center text-center group">
                                {/* Connector line (Visible on screens where it makes sense) */}
                                {!isLast && (
                                    <div className="hidden md:block absolute top-6 left-[calc(50%+32px)] w-[calc(100%-64px)] h-0.5 bg-white/10 z-0" />
                                )}

                                <div
                                    className={`w-12 h-12 rounded-tl-xl rounded-br-xl flex items-center justify-center font-display font-extrabold text-sm mb-4 flex-shrink-0 relative z-10 transition-all duration-200 ${
                                        isLast
                                            ? 'bg-brand-yellow text-brand-blue shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)] scale-110'
                                            : 'bg-white/10 border-2 border-white/20 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)]'
                                    }`}
                                >
                                    {step.number}
                                </div>
                                <p
                                    className={`text-[12px] font-display font-bold leading-tight px-2 ${
                                        isLast ? 'text-brand-yellow uppercase tracking-wider' : 'text-white/60'
                                    }`}
                                >
                                    {step.title}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* CTA panel */}
                <div className="bg-white/5 border-2 border-white/10 rounded-tl-2xl rounded-br-2xl p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-brand-yellow text-brand-blue text-[10px] font-display font-extrabold uppercase tracking-[0.2em] px-3 py-1.5 rounded-tl-lg rounded-br-lg mb-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-blue/60 flex-shrink-0" />
                            Recruitment Open
                        </div>
                        <h3 className="text-2xl md:text-3xl font-display font-extrabold text-white mb-2 leading-tight">
                            Applications Are Now Open
                        </h3>
                        <p className="text-white/45 font-medium text-sm max-w-sm leading-relaxed">
                            The recruitment season is officially open. Start your journey with us today.
                        </p>
                    </div>
                    <div className="flex-shrink-0">
                        <Button
                            onClick={() => navigate('/register')}
                            variant="white"
                            size="lg"
                        >
                            Apply Now →
                        </Button>
                    </div>
                </div>
            </Container>
        </section>
    );
}
