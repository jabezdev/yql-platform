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
        if (isAuthenticated) {
            navigate('/me');
        } else {
            navigate('/login');
        }
    };

    const closeMenu = () => setIsOpen(false);

    return (
        <nav
            className={`fixed w-full z-50 h-[72px] flex items-center bg-white border-b-2 border-brand-blue transition-all duration-300 ${scrolled ? 'shadow-[0px_4px_0px_0px_rgba(57,103,153,0.06)]' : ''}`}
        >
            <Container className="flex justify-between items-center w-full h-full">
                <a href="/" className="flex items-center gap-2">
                    <img src="/YQL_LOGO.svg" alt="YQL Logo" className="h-9 w-auto" />
                </a>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center h-full gap-2">
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="h-full flex items-center px-4 pt-1 text-[11px] font-display font-bold uppercase tracking-[0.2em] text-brand-blue/60 hover:text-brand-blue border-b-2 border-transparent hover:border-brand-blue transition-all duration-200"
                        >
                            {link.name}
                        </a>
                    ))}
                    <div className="ml-4">
                        <Button
                            onClick={handleAuthClick}
                            variant="geometric-primary"
                            size="sm"
                        >
                            {isAuthenticated ? 'Dashboard' : 'Log in'}
                        </Button>
                    </div>
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
                <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-brand-blue/15 p-6 flex flex-col gap-5 shadow-[0px_10px_30px_rgba(57,103,153,0.15)]">
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-brand-blue/75 hover:text-brand-blue text-[13px] font-display font-bold uppercase tracking-widest"
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
