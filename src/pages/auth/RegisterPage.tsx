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

                <div className="w-full pb-8">
                    <SignUp
                        routing="path"
                        path="/register"
                        fallbackRedirectUrl="/dashboard/overview"
                        signInUrl="/login"
                        appearance={{
                            elements: {
                                card: "shadow-[8px_8px_0px_0px_rgba(10,22,48,0.4)] border-4 border-brand-blue bg-white rounded-none p-8",
                                headerTitle: "hidden",
                                headerSubtitle: "hidden",
                                formButtonPrimary: "bg-brand-blue hover:bg-brand-lightBlue text-white font-bold py-3 px-4 rounded-none border-2 border-transparent hover:border-brand-blue shadow-[4px_4px_0px_0px_rgba(254,212,50,1)] transition-all active:translate-y-1 active:translate-x-1 active:shadow-none",
                                formFieldInput: "rounded-none border-2 border-brand-gray/30 focus:ring-brand-lightBlue focus:border-brand-lightBlue bg-brand-bgLight py-3",
                                formFieldLabel: "text-brand-darkBlue font-medium mb-1",
                                dividerLine: "bg-brand-gray/20",
                                dividerText: "text-brand-gray font-medium",
                                socialButtonsBlockButton: "rounded-none border-2 border-brand-gray/30 hover:border-brand-blue hover:bg-brand-bgLight transition-colors py-3 shadow-[2px_2px_0px_0px_rgba(57,103,153,0.2)]",
                                socialButtonsBlockButtonText: "text-brand-darkBlue font-bold",
                                footerActionLink: "text-brand-wine hover:text-brand-wine/80 font-bold hover:underline",
                                footer: "bg-white",
                                identityPreviewEditButtonIcon: "text-brand-blue",
                                formFieldSuccessText: "text-green-600",
                                formFieldErrorText: "text-brand-red",
                                internal_bpxf07: "hidden" // Hides the "Secured by Clerk" badge
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
