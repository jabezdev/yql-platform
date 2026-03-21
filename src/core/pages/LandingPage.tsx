import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import About from "../components/landing/About";
import Mission from "../components/landing/Mission";
import Benefits from "../components/landing/Benefits";
import HowItWorks from "../components/landing/HowItWorks";
import WhoCanApply from "../components/landing/WhoCanApply";
import Commitment from "../components/landing/Commitment";
import Apply from "../components/landing/Apply";
import Footer from "../components/landing/Footer";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-brand-bgLight font-sans text-brand-blueDark">
            <Navbar />

            <main>
                <Hero />
                <About />
                <Mission />
                <Benefits />
                <HowItWorks />
                <WhoCanApply />
                <Commitment />
                <Apply />
            </main>

            <Footer />
        </div>
    );
}
