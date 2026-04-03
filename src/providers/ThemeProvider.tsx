import { createContext, useContext, useEffect, useState } from "react";

interface ThemeContextType {
    isDark: boolean;
    toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ isDark: false, toggle: () => {} });

export function useTheme() {
    return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [isDark, setIsDark] = useState<boolean>(() => {
        try {
            return localStorage.getItem("theme") === "dark";
        } catch {
            return false;
        }
    });

    useEffect(() => {
        document.documentElement.classList.toggle("dark", isDark);
        try {
            localStorage.setItem("theme", isDark ? "dark" : "light");
        } catch {}
    }, [isDark]);

    return (
        <ThemeContext.Provider value={{ isDark, toggle: () => setIsDark((d) => !d) }}>
            {children}
        </ThemeContext.Provider>
    );
}
