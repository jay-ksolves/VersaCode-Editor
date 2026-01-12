
'use client';

import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('dark');

    useEffect(() => {
        const storedTheme = localStorage.getItem('versacode-theme') as Theme | null;
        if (storedTheme) {
            setTheme(storedTheme);
            document.documentElement.classList.toggle('dark', storedTheme === 'dark');
        } else {
            document.documentElement.classList.add('dark');
        }
    }, []);

    const handleSetTheme = (newTheme: Theme) => {
        setTheme(newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        localStorage.setItem('versacode-theme', newTheme);
        document.documentElement.style.colorScheme = newTheme;
    };
    
    useEffect(() => {
        document.documentElement.className = theme;
        document.documentElement.style.colorScheme = theme;
    }, [theme])

    const value = useMemo(() => ({ theme, setTheme: handleSetTheme }), [theme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
