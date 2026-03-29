import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useConvexAuth } from "convex/react";
import { Container, Button } from '../ui';
import { NAV_LINKS } from '../../constants';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();
    const { isAuthenticated } = useConvexAuth();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleAuthClick = () => {
        if (!isAuthenticated) {
            navigate('/login');
        } else {
            navigate('/dashboard/overview');
        }
    };

    const closeMenu = () => setIsOpen(false);

    return (
        <nav
            className={`fixed w-full z-50 h-[68px] flex items-center bg-white border-b-2 border-brand-blue/20 transition-all duration-300 ${scrolled ? 'border-brand-blue/40 shadow-[0px_3px_0px_0px_rgba(57,103,153,0.08)]' : ''}`}
        >
            <Container className="flex justify-between items-center w-full">
                <a href="/" className="flex items-center gap-2">
                    <img src="/YQL_LOGO.svg" alt="YQL Logo" className="h-9 w-auto" />
                </a>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-7">
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-brand-blue/70 hover:text-brand-blue transition-colors text-[13px] font-display font-bold tracking-wide"
                        >
                            {link.name}
                        </a>
                    ))}
                    <Button
                        onClick={handleAuthClick}
                        variant="geometric-primary"
                        size="sm"
                    >
                        {isAuthenticated ? 'Dashboard' : 'Log in'}
                    </Button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-brand-blue"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label={isOpen ? 'Close menu' : 'Open menu'}
                >
                    {isOpen ? <X /> : <Menu />}
                </button>
            </Container>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-brand-blue/15 p-6 flex flex-col gap-5 shadow-[0px_4px_12px_rgba(57,103,153,0.12)]">
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-brand-blue/75 hover:text-brand-blue text-base font-display font-bold tracking-wide"
                            onClick={closeMenu}
                        >
                            {link.name}
                        </a>
                    ))}
                    <Button
                        fullWidth
                        variant="geometric-primary"
                        size="md"
                        onClick={() => {
                            closeMenu();
                            handleAuthClick();
                        }}
                    >
                        {isAuthenticated ? 'Dashboard' : 'Log in'}
                    </Button>
                </div>
            )}
        </nav>
    );
}
