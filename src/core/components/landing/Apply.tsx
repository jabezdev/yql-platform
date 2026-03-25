import { Section } from '../ui/layout/Section';
import { SectionTitle } from '../ui/typography/SectionTitle';
import { Container } from '../ui/layout/Container';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/primitives/Button';

export default function Apply() {
    const navigate = useNavigate();

    // Hardcoded steps for display
    const steps = [
        { stage: 0, title: "Choose a Functional Committee" },
        { stage: 1, title: "Submit your application form" },
        { stage: 2, title: "Demonstrate your skills" },
        { stage: 3, title: "Interview" },
        { stage: 4, title: "Onboarding" },
    ];

    return (
        <Section variant="gray" id="apply">
            <Container>
                <SectionTitle>How to Apply</SectionTitle>

                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col md:grid md:grid-cols-5 gap-8 md:gap-4 mb-12">
                        {steps.map((step, index) => (
                            <div key={index} className="relative flex flex-col items-center">
                                {/* Connecting Line - Desktop Horizontal */}
                                {index < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-brand-blue/20" />
                                )}

                                {/* Connecting Line - Mobile Vertical */}
                                {index < steps.length - 1 && (
                                    <div className="md:hidden absolute top-12 left-1/2 w-0.5 h-full bg-brand-blue/20 transform -translate-x-1/2" />
                                )}

                                <div className="w-12 h-12 rounded-tl-xl rounded-br-xl bg-white border-2 border-brand-blue flex items-center justify-center font-display font-extrabold text-brand-blue relative z-10 shadow-[3px_3px_0px_0px_rgba(57,103,153,0.15)] mb-4">
                                    {index + 1}
                                </div>

                                <h3 className="text-center font-display font-extrabold text-brand-blue leading-tight text-sm">
                                    {step.title}
                                </h3>
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <div className="inline-block bg-brand-yellow border-2 border-brand-blue/30 text-brand-blue px-8 py-3 rounded-tl-2xl rounded-br-2xl font-display font-extrabold text-lg shadow-[3px_3px_0px_0px_rgba(57,103,153,0.2)] mb-8">
                            Reach Stage 4 to be a YQL!
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xl font-display font-extrabold mb-4 text-brand-blue">
                                    Applications Open
                                </h3>
                                <p className="text-brand-blue/60 font-medium mb-6 max-w-lg mx-auto">
                                    The recruitment season is officially open. Start your journey with us today.
                                </p>
                                <Button
                                    onClick={() => navigate('/register')}
                                    variant="geometric-primary"
                                    size="lg"
                                >
                                    Apply Now
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </Section>
    );
}
