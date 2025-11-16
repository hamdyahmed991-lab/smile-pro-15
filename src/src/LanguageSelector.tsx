import React, { useState, useRef, useEffect } from 'react';
import GlobeIcon from './controls/icons/GlobeIcon';

type Language = {
    code: string;
    name: string;
};

const languages: Language[] = [
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'العربية' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'es', name: 'Español' },
    { code: 'it', name: 'Italiano' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' },
    { code: 'id', name: 'Indonesia' },
    { code: 'hi', name: 'हिन्दी' }
];

const LanguageSelector: React.FC<{
    language: string;
    setLanguage: (lang: string) => void;
    className?: string;
}> = ({ language, setLanguage, className }) => {
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

    const handleLanguageChange = (langCode: string) => {
        setLanguage(langCode);
        setIsOpen(false);
    };

    return (
        <div ref={wrapperRef} className={`language-selector-wrapper ${className || ''}`}>
            <button
                className="language-selector-button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Select language"
                title="Select language"
            >
                <GlobeIcon />
            </button>
            {isOpen && (
                <div className="language-selector-menu">
                    {languages.map(lang => (
                        <button
                            key={lang.code}
                            className={`language-option ${language === lang.code ? 'active' : ''}`}
                            onClick={() => handleLanguageChange(lang.code)}
                        >
                            {lang.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
