import { SignUp } from "@clerk/clerk-react";
import GeometricPattern from "../../components/ui/geometry/GeometricPattern";
import { Link } from "react-router-dom";

export default function RegisterPage() {
    return (
        <div className="min-h-screen relative flex items-center justify-center bg-brand-bgLight py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
            {/* Background Geometric Accents */}
            <div className="absolute top-0 right-0 hidden lg:block opacity-50">
                <GeometricPattern variant="hero-top-right" size={80} />
            </div>
            <div className="absolute bottom-0 left-0 hidden lg:block opacity-50">
                <GeometricPattern variant="hero-bottom-left" size={80} />
            </div>

            <div className="w-full max-w-md space-y-8 flex flex-col items-center relative z-10">
                <div className="text-center mb-4 flex flex-col items-center">
                    <Link to="/">
                        <img src="/YQL_LOGO.svg" alt="YQL Logo" className="h-16 w-auto mb-6 hover:scale-105 transition-transform" />
                    </Link>
                    <h2 className="text-4xl font-display font-extrabold text-brand-darkBlue">
                        Join YQL
                    </h2>
                    <p className="mt-2 text-md text-brand-gray font-medium">
                        Create an account to get started
                    </p>
                </div>

                <div className="w-full pb-8 flex justify-center">
                    <SignUp
                        routing="path"
                        path="/register"
                        fallbackRedirectUrl="/dashboard/overview"
                        signInUrl="/login"
                        appearance={{
                            elements: {
                                card: "shadow-brand-ink border-2 border-brand-blue/20 bg-white brand-lg",
                                headerTitle: "text-brand-darkBlue font-display",
                                headerSubtitle: "text-brand-gray",
                                formButtonPrimary: "bg-brand-blue hover:bg-brand-lightBlue text-white brand-md transition-all active:scale-[0.98]",
                                formFieldInput: "brand-sm border-brand-gray/30 focus:border-brand-blue bg-brand-bgLight",
                                footerActionLink: "text-brand-blue hover:text-brand-lightBlue font-bold",
                                internal_bpxf07: "hidden" // Hides the "Secured by Clerk" badge
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
