import { Container, Button } from '../ui';

export default function ReadyToJoin() {
    return (
        <section className="bg-white py-20 relative overflow-hidden">
            <Container className="relative z-10 text-center">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-display font-extrabold text-brand-blue mb-4 tracking-tight">
                        Ready to Start Your <span className="text-brand-wine">Quantum Journey?</span>
                    </h2>
                    <p className="text-brand-blue/60 font-medium mb-10 leading-relaxed">
                        Join a community of innovators, leaders, and pioneers. Applications for the next YQL cohort are now being accepted.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button
                            as="a"
                            href="#apply"
                            variant="geometric-primary"
                            size="lg"
                            className="min-w-[200px]"
                        >
                            Become a Leader
                        </Button>
                        <Button
                            as="a"
                            href="mailto:yql@qcsp.ph"
                            variant="geometric-secondary"
                            size="lg"
                            className="min-w-[200px]"
                        >
                            Ask a Question
                        </Button>
                    </div>
                </div>
            </Container>
        </section>
    );
}
