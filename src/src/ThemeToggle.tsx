import React, { useState, useRef, useEffect } from 'react';
import SunIcon from './controls/icons/SunIcon';
import MoonIcon from './controls/icons/MoonIcon';
import StarIcon from './controls/icons/StarIcon';
import DiamondIcon from './controls/icons/DiamondIcon';

const themes = [
    { code: 'light', name: 'Light', icon: <SunIcon /> },
    { code: 'dark', name: 'Dark', icon: <MoonIcon /> },
    { code: 'pro', name: 'Pro', icon: <StarIcon /> },
    { code: 'golden-pro', name: 'Golden Pro', icon: <DiamondIcon /> },
];

const ThemeToggle: React.FC<{
    theme: string;
    setTheme: (theme: string) => void;
    className?: string;
}> = ({ theme, setTheme, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleThemeChange = (themeCode: string) => {
        setTheme(themeCode);
        setIsOpen(false);
    };

    const currentIcon = () => {
        if (theme === 'light') return <SunIcon />;
        if (theme === 'pro') return <StarIcon />;
        if (theme === 'golden-pro') return <DiamondIcon />;
        return <MoonIcon />;
    };
    
    return (
        <div ref={wrapperRef} className={`theme-selector-wrapper ${className || ''}`}>
            <button
                className="theme-toggle-button"
                onClick={() => setIsOpen(!isOpen)}
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-label={`Current theme: ${theme}. Select to change.`}
                title="Select theme"
            >
                {currentIcon()}
            </button>
            {isOpen && (
                <div className="theme-selector-menu">
                    {themes.map(th => (
                        <button
                            key={th.code}
                            className={`theme-option ${theme === th.code ? 'active' : ''}`}
                            onClick={() => handleThemeChange(th.code)}
                        >
                            {th.icon}
                            <span>{th.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ThemeToggle;