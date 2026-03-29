import { Container, GeometricPattern } from '../ui';
import { Mail, Globe, Linkedin, Facebook } from 'lucide-react';

const socials = [
    { icon: Mail,     label: "yql@qcsp.ph",       href: "mailto:yql@qcsp.ph" },
    { icon: Globe,    label: "qcsp.ph",             href: "https://qcsp.ph" },
    { icon: Linkedin, label: "/company/qcsp",       href: "https://linkedin.com/company/qcsp" },
    { icon: Facebook, label: "/qcsp.ph",            href: "https://fb.com/qcsp.ph" },
];

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-brand-blue text-white overflow-hidden relative">
            <Container className="pt-14 pb-10">
                <div className="grid md:grid-cols-[1fr_auto] gap-12 items-start">
                    {/* Brand */}
                    <div className="max-w-md">
                        <img
                            src="/YQL_LOGO_WHITE.svg"
                            alt="YQL Logo"
                            className="h-14 w-auto mb-6"
                        />
                        <h2 className="text-2xl font-display font-extrabold text-white tracking-tight leading-snug mb-2">
                            Young Quantum Leaders Program
                        </h2>
                        <p className="text-white/40 text-sm font-medium leading-relaxed">
                            Empowering the next generation of quantum leaders in the Philippines.
                        </p>
                    </div>

                    {/* Links */}
                    <div className="flex flex-col gap-3 md:pt-1">
                        <p className="text-[9px] font-display font-extrabold uppercase tracking-[0.3em] text-white/25 mb-1">
                            Contact
                        </p>
                        {socials.map(({ icon: Icon, label, href }) => (
                            <a
                                key={href}
                                href={href}
                                target={href.startsWith('http') ? '_blank' : undefined}
                                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                className="group flex items-center gap-3 text-white/50 hover:text-white transition-colors duration-150"
                            >
                                <div className="w-7 h-7 rounded-tl-md rounded-br-md bg-white/8 flex items-center justify-center flex-shrink-0 group-hover:bg-white/15 transition-colors duration-150">
                                    <Icon size={13} />
                                </div>
                                <span className="text-sm font-medium">{label}</span>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Divider + copyright */}
                <div className="mt-10 pt-8 border-t border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <p className="text-[11px] font-medium text-white/30">
                        © {currentYear} Quantum Computing Society of the Philippines. All rights reserved.
                    </p>
                    <p className="text-[10px] font-display font-extrabold uppercase tracking-[0.25em] text-white/20">
                        YQL Platform
                    </p>
                </div>
            </Container>

            {/* Geometric footer strip */}
            <div className="w-full opacity-60">
                <GeometricPattern variant="footer-strip" size={60} className="w-full" />
            </div>
        </footer>
    );
}
