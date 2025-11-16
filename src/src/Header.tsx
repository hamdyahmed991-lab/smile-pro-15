import React from 'react';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import HomeIcon from './controls/icons/HomeIcon';
import { translations } from '../translations';

export type Mode = 'landing' | 'lite' | 'pro' | 'ortho' | 'mirror' | 'cheese' | 'ai-edit' | 'pediatric' | 'prosthodontic' | 'video' | 'jaw-surgery' | 'genioplasty' | 'shade-selection' | 'greenchrome' | 'exocad-export' | 'clinic-registration' | '3d-model' | 'gum-analysis';
export type User = { role: 'guest' | 'free' | 'premium' | 'admin'; email: string | null };

interface HeaderProps {
    mode: Mode;
    setMode: (mode: Mode) => void;
    language: string;
    setLanguage: (lang: string) => void;
    theme: string;
    setTheme: (theme: string) => void;
    user: User;
    handleLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ mode, setMode, language, setLanguage, theme, setTheme, user, handleLogout }) => {
    const t = translations[language] || translations.en;

    const modeTitles: { [key in Mode]?: string } = {
        'lite': t.smartDesignMode,
        'pro': t.advancedDesignStudio,
        'ortho': t.orthodonticSimulation,
        'mirror': t.smileMirror,
        'cheese': t.instantSmile,
        'ai-edit': t.smartEdit,
        'pediatric': t.pediatricSimulation,
        'prosthodontic': t.prosthodonticSimulation,
        'video': t.smileAnimation,
        'jaw-surgery': t.jawSurgeryPlanner,
        'genioplasty': t.genioplastySimulation,
        'shade-selection': t.aiShadeMatch,
        'greenchrome': t.backgroundIsolate,
        'gum-analysis': t.gumAnalysis,
        'exocad-export': t.exportToExocad,
        'clinic-registration': t.clinicRegistrationTitle,
        '3d-model': t.threeDModelTitle,
    };

    const title = modeTitles[mode] || t.appTitle;
    
    const userStatusKey = `status${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`;
    const translatedStatus = t[userStatusKey] || user.role;

    return (
        <header className="app-header">
            <div className="header-left">
                <button 
                    onClick={() => setMode('landing')} 
                    className="header-btn" 
                    aria-label={t.backToHome}
                    title={t.backToHome}
                >
                    <HomeIcon />
                </button>
            </div>
            <h2 className="header-title">{title}</h2>
            <div className="header-right">
                {user.role !== 'guest' && (
                    <div className="user-session-info">
                        <span className="user-status">{t.statusLabel}{translatedStatus}</span>
                        <button onClick={handleLogout} className="logout-btn">{t.logout}</button>
                    </div>
                )}
                <LanguageSelector language={language} setLanguage={setLanguage} />
                <ThemeToggle theme={theme} setTheme={setTheme} />
            </div>
        </header>
    );
};

export default Header;