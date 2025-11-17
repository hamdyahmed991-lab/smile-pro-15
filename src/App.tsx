import React, { useState, useEffect } from 'react';
import DrSmileChat from './components/DrSmileChat';
import LiteModeCard from './components/LiteModeCard';
import ProModeCard from './components/ProModeCard';
import OrthoModeCard from './components/OrthoModeCard';
import MirrorModeCard from './components/MirrorModeCard';
import CheeseModeCard from './components/CheeseModeCard';
import AIEditModeCard from './components/AIEditModeCard';
import AskDentistModal from './components/AskDentistModal';
import { generateImage, toBase64 } from './services/geminiService';
import PediatricModeCard from './components/PediatricModeCard';
import ProsthodonticModeCard from './components/ProsthodonticModeCard';
import SmileVideoModeCard from './components/SmileVideoModeCard';
import ThemeToggle from './components/ThemeToggle';
import JawSurgeryModeCard from './components/JawSurgeryModeCard';
import GenioplastyModeCard from './components/GenioplastyModeCard';
import ShadeSelectionModeCard from './components/ShadeSelectionModeCard';
import GreenChromeModeCard from './components/GreenChromeModeCard';
import GreenchomaModeCard from './components/GreenchomaModeCard';
import ExocadExportModeCard from './components/ExocadExportModeCard';
import { translations } from './translations';
import LanguageSelector from './components/LanguageSelector';
import WhatsAppIcon from './components/controls/icons/WhatsAppIcon';
import GmailIcon from './components/controls/icons/GmailIcon';
import InstagramIcon from './components/controls/icons/InstagramIcon';
import SnapchatIcon from './components/controls/icons/SnapchatIcon';
import TikTokIcon from './components/controls/icons/TikTokIcon';
import XIcon from './components/controls/icons/XIcon';
import YouTubeIcon from './components/controls/icons/YouTubeIcon';
import FacebookIcon from './components/controls/icons/FacebookIcon';
import WeChatIcon from './components/controls/icons/WeChatIcon';
import TelegramIcon from './components/controls/icons/TelegramIcon';
import MessengerIcon from './components/controls/icons/MessengerIcon';
import FabMenu from './components/FabMenu';
import Header from './components/Header';
import RobotIcon from './components/controls/icons/RobotIcon';
import HelpIcon from './components/controls/icons/HelpIcon';
import DentalDiagram from './components/DentalDiagram';
import DownloadIcon from './components/controls/icons/DownloadIcon';
import ClinicRegistrationCard from './components/ClinicRegistrationCard';
import ThreeDModelCard from './components/ThreeDModelCard';

// --- Reusable & Login Components ---

// New reusable component for the CTA card
const CallToActionCard: React.FC<{
    t: { [key: string]: string };
    onWhatsApp: () => void;
    onTelegram: () => void;
    onGmail: () => void;
    onSnapchat: () => void;
    onMessenger: () => void;
}> = ({ t, onWhatsApp, onTelegram, onGmail, onSnapchat, onMessenger }) => {
    const [showLearnMoreButtons, setShowLearnMoreButtons] = useState(false);

    return (
        <div className="card love-your-smile-card" style={{ marginTop: '2rem' }}>
            <h3>{t.loveYourSmileTitle}</h3>
            <p style={{ color: 'var(--text-color-light)' }}>{t.loveYourSmileSub1}</p>
            <p style={{ color: 'var(--primary-color)', fontWeight: '600', fontSize: '1.1rem' }}>{t.loveYourSmileSub2}</p>
            <p style={{ color: 'var(--text-color-light)', fontStyle: 'italic', marginBottom: '1.5rem' }}>{t.loveYourSmileSub3}</p>
            
            {!showLearnMoreButtons ? (
                <div className="card-buttons-grid">
                    <button onClick={() => setShowLearnMoreButtons(true)} className="card-btn card-btn-3d">
                        <span>{t.learnTheSteps}</span>
                    </button>
                    <button onClick={onSnapchat} className="card-btn card-btn-3d">
                        <span>{t.bookConsultation}</span>
                    </button>
                </div>
            ) : (
                <div className="social-cta-container">
                    <button className="social-cta-btn whatsapp" onClick={onWhatsApp}>
                        <WhatsAppIcon /><span>{t.connectOnWhatsApp}</span>
                    </button>
                    <button className="social-cta-btn messenger" onClick={onMessenger}>
                        <MessengerIcon /><span>{t.connectOnMessenger}</span>
                    </button>
                    <button className="social-cta-btn telegram" onClick={onTelegram}>
                        <TelegramIcon /><span>{t.connectOnTelegram}</span>
                    </button>
                    <button className="social-cta-btn snapchat" onClick={onSnapchat}>
                        <SnapchatIcon /><span>{t.connectOnSnapchat}</span>
                    </button>
                    <button className="social-cta-btn gmail" onClick={onGmail}>
                        <GmailIcon /><span>{t.connectOnGmail}</span>
                    </button>
                    <button onClick={() => setShowLearnMoreButtons(false)} className="card-btn" style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.1)' }}>
                        <span>{t.backButton}</span>
                    </button>
                </div>
            )}

            <div className="styled-footer" style={{ marginTop: '2.5rem', background: 'transparent' }}>
                <span className="footer-title" style={{ fontSize: '1.8rem' }}>{t.footerTitle}</span>
                <span className="footer-by-styled" style={{ fontSize: '1rem' }}>{t.footerBy}</span>
                <span className="footer-doctor-styled" style={{ fontSize: '1.3rem' }}>{t.footerDoctorName}</span>
            </div>
        </div>
    );
};


// Login Popup Component
interface LoginPopupProps {
    t: { [key: string]: string };
    onClose: () => void;
    onLogin: (email: string, password: string, rememberMe: boolean) => void;
    rememberedEmail?: string;
}
const LoginPopup: React.FC<LoginPopupProps> = ({ t, onClose, onLogin, rememberedEmail }) => {
    const [email, setEmail] = useState(rememberedEmail || '');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(!!rememberedEmail);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            alert("Please enter both email and password.");
            return;
        }
        onLogin(email, password, rememberMe);
    };

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                <h3>{t.loginPopupTitle}</h3>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder={t.loginPopupEmailPlaceholder}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder={t.loginPopupPasswordPlaceholder}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <label className="popup-remember-me">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        {t.loginPopupRememberMe}
                    </label>
                    <div className="popup-buttons">
                        <button type="button" className="card-btn cancel-btn" onClick={onClose}>{t.loginPopupCancelButton}</button>
                        <button type="submit" className="generate-btn">{t.login}</button>
                    </div>
                </form>
                <div className="styled-footer" style={{ marginTop: '2rem', background: 'transparent' }}>
                    <span className="footer-title" style={{ fontSize: '1.5rem' }}>{t.footerTitle}</span>
                    <span className="footer-by-styled" style={{ fontSize: '0.9rem' }}>{t.footerBy}</span>
                    <span className="footer-doctor-styled" style={{ fontSize: '1.1rem' }}>{t.footerDoctorName}</span>
                </div>
            </div>
        </div>
    );
};

// Upgrade Popup Component
interface UpgradePopupProps {
    onClose: () => void;
    onUpgrade: () => void;
}
const UpgradePopup: React.FC<UpgradePopupProps> = ({ onClose, onUpgrade }) => {
    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                <h3>🔒 Premium Feature Locked</h3>
                <p>This is a Premium feature. Upgrade now to unlock full access.</p>
                <div className="popup-buttons">
                    <button type="button" className="card-btn cancel-btn" onClick={onClose}>Cancel</button>
                    <button type="button" className="generate-btn" onClick={onUpgrade}>Upgrade Now</button>
                </div>
            </div>
        </div>
    );
};

// Toast Notification Component
interface ToastProps {
    message: string;
    onClose: () => void;
}
const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 2900); // Slightly less than animation to avoid flicker

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="toast-notification">
            {message}
        </div>
    );
};

// Contact Us Popup Component
interface ContactUsPopupProps {
    t: { [key: string]: string };
    onClose: () => void;
    onSubmit: (data: { name: string; email: string; message: string }) => void;
}
const ContactUsPopup: React.FC<ContactUsPopupProps> = ({ t, onClose, onSubmit }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) {
            alert("Please enter your name and email.");
            return;
        }
        onSubmit({ name, email, message });
    };

    return (
        <div className="contact-us-modal-overlay" onClick={onClose}>
            <div className="contact-us-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="contact-us-modal-close" onClick={onClose}>&times;</button>
                <h3>{t.contactUsTitle}</h3>
                <p>{t.contactUsSubtitle}</p>
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder={t.contactUsNamePlaceholder} value={name} onChange={(e) => setName(e.target.value)} required />
                    <input type="email" placeholder={t.contactUsEmailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <textarea placeholder={t.contactUsMessagePlaceholder} value={message} onChange={(e) => setMessage(e.target.value)} rows={3}></textarea>
                    <button type="submit" className="generate-btn">{t.contactUsSendButton}</button>
                </form>
            </div>
        </div>
    );
};

// Image Preview Modal for Mirror Mode
interface ImagePreviewModalProps {
    t: { [key: string]: string };
    imageSrc: string;
    onClose: () => void;
}
const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ t, imageSrc, onClose }) => (
    <div className="modal" onClick={onClose}>
        <img src={imageSrc} alt="Generated Smile Preview" onClick={(e) => e.stopPropagation()} style={{ border: '2px solid var(--primary-color)', boxShadow: 'var(--shadow-glow)' }}/>
        <div className="action-buttons" style={{ marginTop: '1rem', background: 'transparent', display: 'flex', gap: '1rem' }}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    const a = document.createElement("a");
                    a.href = imageSrc;
                    a.download = "Smile_Mirror_Result.png";
                    a.click();
                }}
                className="icon-btn"
                style={{ backgroundColor: 'var(--primary-color)', color: 'white', padding: '10px 20px' }}
            >
                <DownloadIcon /> {t.downloadButton || 'Download'}
            </button>
        </div>
        <p className="close-hint">Click anywhere outside the image to close</p>
    </div>
);


// --- Main App Component ---

const App = () => {
    type Mode = 'landing' | 'lite' | 'pro' | 'ortho' | 'mirror' | 'cheese' | 'ai-edit' | 'pediatric' | 'prosthodontic' | 'video' | 'jaw-surgery' | 'genioplasty' | 'shade-selection' | 'greenchrome' | 'exocad-export' | 'clinic-registration' | '3d-model' | 'gum-analysis';
    type UserRole = 'guest' | 'free' | 'premium' | 'admin';
    type User = { role: UserRole; email: string | null };

    // App State
    const [mode, setMode] = useState<Mode>('landing');
    const [theme, setTheme] = useState('dark');
    const [language, setLanguage] = useState('en');
    
    // User & Auth State
    const [user, setUser] = useState<User>({ role: 'guest', email: null });
    const [isLoginPopupOpen, setLoginPopupOpen] = useState(false);
    const [isUpgradePopupOpen, setUpgradePopupOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [rememberedEmail, setRememberedEmail] = useState<string>('');
    
    // Feature-specific State
    const [isAskDentistModalOpen, setIsAskDentistModalOpen] = useState(false);
    const [isContactUsPopupOpen, setContactUsPopupOpen] = useState(false);
    const [imageForDentist, setImageForDentist] = useState<string | null>(null);
    const [isDrSmileChatOpen, setIsDrSmileChatOpen] = useState(false);
    const [cheeseState, setCheeseState] = useState<{ before: string | null; history: string[]; index: number }>({ before: null, history: [], index: -1 });
    const [isGeneratingCheese, setIsGeneratingCheese] = useState(false);
    const [modalImageSrc, setModalImageSrc] = useState<string | null>(null); // State for the new image modal

    // --- Helper Functions ---
    
    const showToast = (message: string) => {
        setToastMessage(message);
    };

    // --- Effects ---

    // Load remembered email on initial mount
    useEffect(() => {
        try {
            const savedEmail = localStorage.getItem('rememberedEmail');
            if (savedEmail) {
                setRememberedEmail(savedEmail);
            }
        } catch (e) {
            console.error("Failed to read remembered email", e);
        }
    }, []);

    // Session persistence on load
    useEffect(() => {
        let sessionUser = null;
        let isRemembered = false;
        try {
            const rememberedUserJSON = localStorage.getItem('userSession');
            if (rememberedUserJSON) {
                const rememberedUser = JSON.parse(rememberedUserJSON);
                if (rememberedUser.remember) {
                    sessionUser = rememberedUser;
                    isRemembered = true;
                }
            } else {
                const tempUserJSON = sessionStorage.getItem('userSession');
                if (tempUserJSON) {
                    sessionUser = JSON.parse(tempUserJSON);
                }
            }
        } catch (e) {
            console.error("Failed to parse user session", e);
            localStorage.removeItem('userSession');
            sessionStorage.removeItem('userSession');
        }

        if (sessionUser && sessionUser.role && sessionUser.email) {
            setUser({ role: sessionUser.role, email: sessionUser.email });
            let welcomeMsg = 'Welcome back!';
            if (sessionUser.role === 'admin') welcomeMsg = 'Welcome back, Admin!';
            else if (sessionUser.role === 'premium') welcomeMsg = 'Welcome back, Premium User!';
            else if (isRemembered) welcomeMsg = 'Welcome back!';
            showToast(welcomeMsg);
        }
    }, []);

    // Theme management
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
    }, []);

    useEffect(() => {
        localStorage.setItem('theme', theme);
        document.body.classList.remove('light-mode', 'pro-mode', 'golden-pro-mode');
        if (theme === 'light') {
            document.body.classList.add('light-mode');
        } else if (theme === 'pro') {
            document.body.classList.add('pro-mode');
        } else if (theme === 'golden-pro') {
            document.body.classList.add('golden-pro-mode');
        }
    }, [theme]);
    
    // Pro & Golden Pro Mode Effects
    useEffect(() => {
        if (theme !== 'pro' && theme !== 'golden-pro') {
            // Find and remove any leftover elements if the theme is switched off
            const canvas = document.getElementById('space-background');
            if (canvas) canvas.remove();
            document.querySelectorAll('.star-cursor-main, .star-cursor-trail').forEach(el => el.remove());
            return;
        }

        // --- Create Elements ---
        const canvas = document.createElement('canvas');
        canvas.id = 'space-background';
        document.body.prepend(canvas);

        const cursorMain = document.createElement('div');
        cursorMain.className = 'star-cursor-main';
        document.body.appendChild(cursorMain);
        cursorMain.style.opacity = '0';
        cursorMain.style.transition = 'opacity 0.3s ease-in-out';

        const trailCount = 4;
        const trailElements = Array.from({ length: trailCount }, () => {
            const el = document.createElement('div');
            el.className = 'star-cursor-trail';
            el.style.opacity = '0';
            el.style.transition = 'opacity 0.3s ease-in-out';
            document.body.appendChild(el);
            return el;
        });

        // --- State and Config ---
        let animationFrameId: number;
        const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        const trailPoints = Array.from({ length: trailCount + 1 }, () => ({ x: mouse.x, y: mouse.y }));
        
        // --- Theme-specific Config ---
        const themeConfig = {
            starColor: '#ffffff',
            nebulaColors: [
                ['#8A2BE2', '#FF1493'], // pro default
                ['#FF1493', '#4b0082'],
                ['#8A2BE2', '#00000000']
            ]
        };
    
        if (theme === 'golden-pro') {
            themeConfig.starColor = '#FFD700';
            themeConfig.nebulaColors = [
                ['#FFA500', '#FF634780'],
                ['#FF6347', '#1a0c0000'],
                ['#FFD700', '#1a0c0000']
            ];
        }

        // --- Canvas Setup ---
        const ctx = canvas.getContext('2d');
        let stars: any[] = [];
        let nebulas: any[] = [];

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            stars = [];
            for (let i = 0; i < 200; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: Math.random() * 1.5 + 0.5,
                    alpha: Math.random(),
                    twinkleSpeed: Math.random() * 0.03 + 0.01,
                });
            }

            nebulas = [];
            const nebulaBaseColors = themeConfig.nebulaColors;
            for (let i = 0; i < 5; i++) {
                nebulas.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: Math.random() * 200 + 100,
                    colors: nebulaBaseColors[i % nebulaBaseColors.length],
                    vx: (Math.random() - 0.5) * 0.1,
                    vy: (Math.random() - 0.5) * 0.1,
                });
            }
        };

        // --- Animation Loop ---
        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const parallaxX = (mouse.x - canvas.width / 2) * 0.005;
            const parallaxY = (mouse.y - canvas.height / 2) * 0.005;

            nebulas.forEach(nebula => {
                nebula.x += nebula.vx;
                nebula.y += nebula.vy;
                if (nebula.x < -nebula.radius || nebula.x > canvas.width + nebula.radius) nebula.vx *= -1;
                if (nebula.y < -nebula.radius || nebula.y > canvas.height + nebula.radius) nebula.vy *= -1;

                const gradient = ctx.createRadialGradient(nebula.x + parallaxX * 20, nebula.y + parallaxY * 20, 0, nebula.x + parallaxX * 20, nebula.y + parallaxY * 20, nebula.radius);
                gradient.addColorStop(0, `rgba(${parseInt(nebula.colors[0].slice(1, 3), 16)}, ${parseInt(nebula.colors[0].slice(3, 5), 16)}, ${parseInt(nebula.colors[0].slice(5, 7), 16)}, 0.2)`);
                gradient.addColorStop(1, `rgba(${parseInt(nebula.colors[1].slice(1, 3), 16)}, ${parseInt(nebula.colors[1].slice(3, 5), 16)}, ${parseInt(nebula.colors[1].slice(5, 7), 16)}, 0)`);
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(nebula.x + parallaxX * 20, nebula.y + parallaxY * 20, nebula.radius, 0, Math.PI * 2);
                ctx.fill();
            });
            
            const starRgb = themeConfig.starColor.startsWith('#')
                ? `${parseInt(themeConfig.starColor.slice(1, 3), 16)}, ${parseInt(themeConfig.starColor.slice(3, 5), 16)}, ${parseInt(themeConfig.starColor.slice(5, 7), 16)}`
                : '255, 255, 255';

            stars.forEach(star => {
                star.alpha += star.twinkleSpeed;
                if (star.alpha > 1) { star.alpha = 1; star.twinkleSpeed *= -1; } 
                else if (star.alpha < 0) { star.alpha = 0; star.twinkleSpeed *= -1; }
                
                ctx.fillStyle = `rgba(${starRgb}, ${star.alpha})`;
                ctx.beginPath();
                ctx.arc(star.x + parallaxX * 5, star.y + parallaxY * 5, star.radius, 0, Math.PI * 2);
                ctx.fill();
            });

            trailPoints[0] = { ...mouse };
            for (let i = 1; i < trailPoints.length; i++) {
                const leader = trailPoints[i-1];
                const follower = trailPoints[i];
                follower.x += (leader.x - follower.x) * 0.3;
                follower.y += (leader.y - follower.y) * 0.3;
            }
            
            cursorMain.style.transform = `translate(${trailPoints[0].x - 10}px, ${trailPoints[0].y - 10}px)`;
            trailElements.forEach((el, i) => {
                const size = 16 - i * 2;
                el.style.width = `${size}px`;
                el.style.height = `${size}px`;
                el.style.transform = `translate(${trailPoints[i+1].x - size/2}px, ${trailPoints[i+1].y - size/2}px)`;
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (cursorMain.style.opacity !== '1') {
                cursorMain.style.opacity = '1';
                trailElements.forEach(el => el.style.opacity = '1');
            }
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };
        
        const createExplosion = (clientX: number, clientY: number) => {
             for (let i = 0; i < 12; i++) {
                const particle = document.createElement('div');
                particle.className = 'click-explosion-particle';
                const size = Math.random() * 10 + 5;
                particle.style.width = `${size}px`; particle.style.height = `${size}px`;
                particle.style.left = `${clientX}px`; particle.style.top = `${clientY}px`;
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * 50 + 20;
                particle.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
                particle.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
                particle.style.animation = `click-explosion 0.5s ${Math.random() * 0.1}s ease-out forwards`;
                document.body.appendChild(particle);
                setTimeout(() => particle.remove(), 600);
            }
        };

        const handleMouseClick = (e: MouseEvent) => {
            createExplosion(e.clientX, e.clientY);
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (cursorMain.style.opacity !== '0') {
                cursorMain.style.opacity = '0';
                trailElements.forEach(el => el.style.opacity = '0');
            }
        };

        const handleTouchStart = (e: TouchEvent) => {
            if (cursorMain.style.opacity !== '0') {
                cursorMain.style.opacity = '0';
                trailElements.forEach(el => el.style.opacity = '0');
            }
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                createExplosion(touch.clientX, touch.clientY);
            }
        };
        
        const handleHover = (e: MouseEvent) => {
            if ((e.target as HTMLElement).closest('button, a, input, select')) {
                cursorMain.classList.add('hover');
                trailElements.forEach(el => el.classList.add('hover'));
            } else {
                cursorMain.classList.remove('hover');
                trailElements.forEach(el => el.classList.remove('hover'));
            }
        };

        resizeCanvas();
        animate();

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseClick);
        document.body.addEventListener('mouseover', handleHover);
        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchmove', handleTouchMove);
        
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseClick);
            document.body.removeEventListener('mouseover', handleHover);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            canvas.remove();
            cursorMain.remove();
            trailElements.forEach(el => el.remove());
        };

    }, [theme]);


    // Language direction
    useEffect(() => {
        document.body.dir = language === 'ar' ? 'rtl' : 'ltr';
    }, [language]);
    
    // Pro mode body class
    useEffect(() => {
        document.body.classList.toggle('pro-mode-active', mode === 'pro');
    }, [mode]);

    // --- Event Handlers ---

    const handleLoginSubmit = (email: string, password: string, rememberMe: boolean) => {
        let sessionData: User;
        const lowerEmail = email.toLowerCase();

        // FIX: Consolidated admin and premium accounts to a single 'premium' role with the user's specified password.
        if (lowerEmail === 'hamdyahmed991@gmail.com' && password === 'asd123456789') {
            sessionData = { role: 'premium', email };
            showToast('Welcome back, Premium User! Full access granted.');
        } else {
            sessionData = { role: 'free', email };
            showToast('Logged in as Free User.');
        }

        if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
            setRememberedEmail(email);
        } else {
            // Only remove the remembered email if the user explicitly unchecks the box
            if (localStorage.getItem('rememberedEmail') === email) {
                 localStorage.removeItem('rememberedEmail');
                 setRememberedEmail('');
            }
        }

        setUser(sessionData);
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('userSession', JSON.stringify({ ...sessionData, remember: rememberMe }));
        
        setLoginPopupOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('userSession');
        sessionStorage.removeItem('userSession');
        setUser({ role: 'guest', email: null });
        showToast("You've been logged out.");
        setMode('landing'); // Go back to landing page on logout
    };
    
    const handleUpgrade = () => {
        if (user.email) {
            const sessionData: User = { role: 'premium', email: user.email };
            setUser(sessionData);
            localStorage.setItem('userSession', JSON.stringify({ ...sessionData, remember: true }));
            setUpgradePopupOpen(false);
            showToast('✅ Upgrade successful! You now have Premium access.');
        }
    };
    
    const handleContactUsSubmit = (data: { name: string; email: string; message: string }) => {
        console.log("Contact form submitted:", data); // For debugging
        showToast(t.contactUsSuccessToast);
        setContactUsPopupOpen(false);
    };

    const handlePremiumClick = (action: () => void) => {
        if (user.role === 'admin' || user.role === 'premium') {
            action();
        } else if (user.role === 'free') {
            setUpgradePopupOpen(true);
        } else { // guest
            setLoginPopupOpen(true);
        }
    };

    const handleAskDentist = (imageSrc: string) => {
        handlePremiumClick(() => {
            setImageForDentist(imageSrc);
            setIsAskDentistModalOpen(true);
        });
    };

    const handleOpenContactModal = () => {
        handlePremiumClick(() => {
            setImageForDentist(null);
            setIsAskDentistModalOpen(true);
        });
    };

    const handleCheeseGenerateFromFile = async (file: File) => {
        if (isGeneratingCheese) return;
        setMode('cheese');
        setIsGeneratingCheese(true);
        const beforeSrc = URL.createObjectURL(file);
        setCheeseState({ before: beforeSrc, history: [], index: -1 });

        const prompt = "Instantly enhance this selfie with a perfect, natural-looking 'Hollywood' smile. Prioritize realism. Preserve identity. Return one photorealistic PNG.";
        const base64 = await toBase64(file);
        const imageParts = [{ inlineData: { data: base64, mimeType: file.type || 'image/png' } }];
        
        const resultSrc = await generateImage(prompt, imageParts, setIsGeneratingCheese);

        if (resultSrc) {
            setCheeseState({ before: beforeSrc, history: [resultSrc], index: 0 });
        } else {
            setCheeseState({ before: null, history: [], index: -1 });
            alert("Sorry, the instant smile generation failed.");
            setMode('landing');
        }
    };
    
    // ... other handlers for social links etc. ...
    const handleWhatsAppClick = () => window.open(`https://wa.me/201113039210?text=${encodeURIComponent("Hello Dr. Hamdy, I'm interested in the Hollywood Smile services.")}`, '_blank', 'noopener,noreferrer');
    const handleSnapchatClick = () => window.open('https://www.snapchat.com/add/your-username', '_blank', 'noopener,noreferrer');
    const handleMessengerClick = () => window.open('https://m.me/your-profile', '_blank', 'noopener,noreferrer');
    const handleTikTokClick = () => window.open('https://www.tiktok.com/@your-username', '_blank', 'noopener,noreferrer');
    const handleXClick = () => window.open('https://x.com/your-username', '_blank', 'noopener,noreferrer');
    const handleYouTubeClick = () => window.open('https://www.youtube.com/channel/your-channel-id', '_blank', 'noopener,noreferrer');
    const handleFacebookClick = () => window.open('https://www.facebook.com/your-profile', '_blank', 'noopener,noreferrer');
    const handleWeChatClick = () => window.open('https://www.wechat.com/add/your-id', '_blank', 'noopener,noreferrer');
    const handleTelegramClick = () => window.open('https://t.me/your-channel', '_blank', 'noopener,noreferrer');
    const handleGmailClick = () => {
        const recipientEmail = 'drahmedsallm@gmail.com';
        const subject = encodeURIComponent("Inquiry from Smile Pro App");
        const body = encodeURIComponent("Hello Dr. Hamdy,\n\nI'm using the Smile Pro app and I would like to inquire about your services.\n\n");
        window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
    };

    // --- Render Logic ---
    
    const t = translations[language] || translations.en;
    
    const fabActions = [
        { name: t.contactAI, className: 'contact', icon: <RobotIcon />, action: () => setIsDrSmileChatOpen(true) },
        { name: t.askDentist, className: 'contact', icon: <HelpIcon />, action: handleOpenContactModal },
        { name: 'WhatsApp', className: 'whatsapp', icon: <WhatsAppIcon />, action: handleWhatsAppClick },
        { name: 'Facebook', className: 'facebook', icon: <FacebookIcon />, action: handleFacebookClick },
    ];

    const ctaCardElement = <CallToActionCard 
        t={t} 
        onWhatsApp={handleWhatsAppClick}
        onTelegram={handleTelegramClick}
        onGmail={handleGmailClick}
        onSnapchat={handleSnapchatClick}
        onMessenger={handleMessengerClick}
    />;
    
    const userStatusKey = `status${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`;
    const translatedStatus = t[userStatusKey] || user.role;


    const LandingPage = () => (
        <div className="app-card landing-card">
            <div className="landing-top-bar">
                <LanguageSelector language={language} setLanguage={setLanguage} />
                 {user.role === 'guest' ? (
                    <button className="login-btn-landing" style={{ opacity: 1, cursor: 'pointer' }} onClick={() => setLoginPopupOpen(true)}>
                        {t.login}
                    </button>
                ) : (
                    <div className="user-session-info">
                        <span className="user-status">{t.statusLabel}{translatedStatus}</span>
                        <button className="logout-btn" onClick={handleLogout}>
                            {t.logout}
                        </button>
                    </div>
                )}
                <ThemeToggle theme={theme} setTheme={setTheme} />
            </div>
            <h1>{t.appTitle}</h1>
            <div className="landing-tagline">
                <span className="tagline-part1">{t.tagline_part1}</span>
                <span className="tagline-part2">{t.tagline_part2}</span>
            </div>

            <div className="primary-action-grid">
                <button onClick={() => setMode('mirror')} className="primary-action-btn">
                    <span className="primary-action-btn-emoji">🪞</span>
                    <div className="primary-action-btn-text-content">
                        <span className="primary-action-btn-title">{t.liveSmileMirrorTitle}</span>
                        <span className="primary-action-btn-subtitle">{t.liveSmileMirrorSubtitle}</span>
                    </div>
                </button>
                <label htmlFor="cheeseUpload" className="primary-action-btn" style={{ cursor: 'pointer' }}>
                    <span className="primary-action-btn-emoji">🧀</span>
                     <div className="primary-action-btn-text-content">
                        <span className="primary-action-btn-title">{t.quickSmileTitle}</span>
                        <span className="primary-action-btn-subtitle">{t.quickSmileSubtitle}</span>
                        <span className="primary-action-btn-note">{t.quickSmileNote}</span>
                    </div>
                </label>
                <input id="cheeseUpload" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => e.target.files?.[0] && handleCheeseGenerateFromFile(e.target.files[0])} />
            </div>

            <div className="mode-section">
                <h3>{t.smileDesignMode}</h3>
                <div className="card-buttons-grid">
                    <button onClick={() => setMode('lite')} className="card-btn">
                        <span>{t.smartDesignMode}</span>
                        <span className="card-btn-subtitle">{t.smartDesignModeSubtitle}</span>
                    </button>
                    <button onClick={() => setMode('pro')} className="card-btn">
                        <span>{t.advancedDesignStudio}</span>
                        <span className="card-btn-subtitle">{t.advancedDesignStudioSubtitle}</span>
                    </button>
                </div>
            </div>

            <div className="mode-section">
                <div className="card-buttons-grid">
                    <button onClick={() => setMode('shade-selection')} className="card-btn full-width">
                        <span>{t.aiShadeMatch}</span>
                        <span className="card-btn-subtitle">{t.aiShadeMatchSubtitle}</span>
                    </button>
                </div>
            </div>
            
            {ctaCardElement}

            <div className="mode-section">
                <h3>{t.clinicalSimulations}</h3>
                <div className="card-buttons-grid">
                    <button onClick={() => handlePremiumClick(() => setMode('ortho'))} className="card-btn premium-btn">
                        <span className="premium-crown">👑</span>
                        <span>{t.orthodonticSimulation}</span>
                        <span className="card-btn-subtitle">{t.orthodonticSimulationSubtitle}</span>
                    </button>
                    <button onClick={() => handlePremiumClick(() => setMode('prosthodontic'))} className="card-btn premium-btn">
                         <span className="premium-crown">👑</span>
                         <span>{t.prosthodonticSimulation}</span>
                         <span className="card-btn-subtitle">{t.prosthodonticSimulationSubtitle}</span>
                    </button>
                    <button onClick={() => handlePremiumClick(() => setMode('jaw-surgery'))} className="card-btn premium-btn">
                         <span className="premium-crown">👑</span>
                         <span>{t.jawSurgeryPlanner}</span>
                         <span className="card-btn-subtitle">{t.jawSurgeryPlannerSubtitle}</span>
                    </button>
                    <button onClick={() => handlePremiumClick(() => setMode('genioplasty'))} className="card-btn premium-btn">
                         <span className="premium-crown">👑</span>
                         <span>{t.genioplastySimulation}</span>
                         <span className="card-btn-subtitle">{t.genioplastySimulationSubtitle}</span>
                    </button>
                    <button onClick={() => handlePremiumClick(() => setMode('gum-analysis'))} className="card-btn premium-btn">
                         <span className="premium-crown">👑</span>
                         <span>{t.gumAnalysis}</span>
                         <span className="card-btn-subtitle">{t.gumAnalysisSubtitle}</span>
                    </button>
                    <button onClick={() => handlePremiumClick(() => setMode('pediatric'))} className="card-btn premium-btn">
                        <span className="premium-crown">👑</span>
                        <span>{t.pediatricSimulation}</span>
                        <span className="card-btn-subtitle">{t.pediatricSimulationSubtitle}</span>
                    </button>
                </div>
            </div>

            <div className="mode-section">
                <h3>{t.aiUtilities}</h3>
                <div className="card-buttons-grid">
                    <button onClick={() => handlePremiumClick(() => setMode('ai-edit'))} className="card-btn premium-btn">
                        <span className="premium-crown">👑</span>
                        <span>{t.smartEdit}</span>
                        <span className="card-btn-subtitle">{t.smartEditSubtitle}</span>
                    </button>
                    <button onClick={() => handlePremiumClick(() => setMode('exocad-export'))} className="card-btn premium-btn">
                        <span className="premium-crown">👑</span>
                        <span>{t.exportToExocad}</span>
                        <span className="card-btn-subtitle">{t.exportToExocadSubtitle}</span>
                    </button>
                    <button onClick={() => handlePremiumClick(() => setMode('3d-model'))} className="card-btn premium-btn full-width">
                        <span className="premium-crown">👑</span>
                        <span>{t.threeDModelTitle}</span>
                        <span className="card-btn-subtitle">{t.threeDModelSubtitle}</span>
                    </button>
                </div>
            </div>

            <div className="mode-section">
                <h3>{t.forClinicsTitle}</h3>
                <div className="card-buttons-grid">
                    <button onClick={() => setMode('clinic-registration')} className="card-btn full-width">
                        <span>{t.registerClinicButton}</span>
                        <span className="card-btn-subtitle">{t.registerClinicSubtitle}</span>
                    </button>
                </div>
            </div>
            
            <div className="mode-section">
                <h3>{t.getHelp}</h3>
                <div className="card-buttons-grid">
                    <button onClick={handleOpenContactModal} className="card-btn full-width premium-btn">
                        <span className="premium-crown">👑</span>
                        {t.askDentist}
                    </button>
                </div>
                <div className="card-buttons-grid contact-grid">
                     <button onClick={handleWhatsAppClick} className="card-btn">{t.contactWhatsApp}</button>
                     <button onClick={() => setIsDrSmileChatOpen(true)} className="card-btn">{t.contactAI}</button>
                </div>
            </div>

            <div className="mode-section">
                 <h3>{t.connectWithUs}</h3>
                 <div className="social-cta-container">
                    <button className="social-cta-btn whatsapp" onClick={handleWhatsAppClick}><WhatsAppIcon /><span>{t.connectOnWhatsApp}</span></button>
                    <button className="social-cta-btn telegram" onClick={handleTelegramClick}><TelegramIcon /><span>{t.connectOnTelegram}</span></button>
                    <button className="social-cta-btn wechat" onClick={handleWeChatClick}><WeChatIcon /><span>{t.connectOnWeChat}</span></button>
                    <button className="social-cta-btn facebook" onClick={handleFacebookClick}><FacebookIcon /><span>{t.connectOnFacebook}</span></button>
                    <button className="social-cta-btn snapchat" onClick={handleSnapchatClick}><SnapchatIcon /><span>{t.connectOnSnapchat}</span></button>
                    <button className="social-cta-btn tiktok" onClick={handleTikTokClick}><TikTokIcon /><span>{t.connectOnTikTok}</span></button>
                    <button className="social-cta-btn x-twitter" onClick={handleXClick}><XIcon /><span>{t.connectOnX}</span></button>
                    <button className="social-cta-btn youtube" onClick={handleYouTubeClick}><YouTubeIcon /><span>{t.connectOnYouTube}</span></button>
                    <button className="social-cta-btn dentist-cta" onClick={handleOpenContactModal}><HelpIcon /><span>{t.connectOnAskDentist}</span></button>
                 </div>
            </div>
            
            <div className="mode-section">
                <h3>{t.ourPhilosophy}</h3>
                <DentalDiagram />
                <p className="landing-tagline" style={{fontSize: '0.9rem', marginTop: '1rem', fontStyle: 'italic', whiteSpace: 'pre-line', lineHeight: 1.5, opacity: 0.8}}>{t.hiddenFooterText}</p>
            </div>

            <div className="styled-footer">
                <span className="footer-title">{t.footerTitle}</span>
                <span className="footer-by-styled">{t.footerBy}</span>
                <span className="footer-doctor-styled">{t.footerDoctorName}</span>
            </div>
        </div>
    );
    
    if (mode === 'landing') {
        return (
            <>
                <LandingPage />
                <DrSmileChat isOpen={isDrSmileChatOpen} onClose={() => setIsDrSmileChatOpen(false)} />
                {isLoginPopupOpen && <LoginPopup t={t} onClose={() => setLoginPopupOpen(false)} onLogin={handleLoginSubmit} rememberedEmail={rememberedEmail} />}
                {isUpgradePopupOpen && <UpgradePopup onClose={() => setUpgradePopupOpen(false)} onUpgrade={handleUpgrade} />}
                {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
                {isContactUsPopupOpen && <ContactUsPopup t={t} onClose={() => setContactUsPopupOpen(false)} onSubmit={handleContactUsSubmit} />}
                {modalImageSrc && <ImagePreviewModal t={t} imageSrc={modalImageSrc} onClose={() => setModalImageSrc(null)} />}
            </>
        );
    }

    return (
        <div>
             <Header 
                mode={mode}
                setMode={setMode}
                language={language}
                setLanguage={setLanguage}
                theme={theme}
                setTheme={setTheme}
                user={user}
                handleLogout={handleLogout}
             />

            {mode === 'lite' && <LiteModeCard t={t} onAskDentist={handleAskDentist} onImageGenerated={() => {}} ctaCard={ctaCardElement} />}
            {mode === 'pro' && <ProModeCard t={t} onAskDentist={handleAskDentist} onImageGenerated={() => {}} ctaCard={ctaCardElement} />}
            {mode === 'ortho' && <OrthoModeCard t={t} onAskDentist={handleAskDentist} onImageGenerated={() => {}} ctaCard={ctaCardElement} />}
            {mode === 'mirror' && <MirrorModeCard t={t} setModalImage={setModalImageSrc} />}
            {mode === 'cheese' && <CheeseModeCard t={t} cheeseState={cheeseState} setCheeseState={setCheeseState} isGenerating={isGeneratingCheese} onAskDentist={handleAskDentist} onFileSelectForCheese={handleCheeseGenerateFromFile} ctaCard={ctaCardElement} />}
            {/* FIX: Removed `t={t}` prop from AIEditModeCard as it's not defined in the component's props, causing a type error. */}
            {mode === 'ai-edit' && <AIEditModeCard ctaCard={ctaCardElement} />}
            {mode === 'shade-selection' && <ShadeSelectionModeCard t={t} />}
            {mode === 'pediatric' && <PediatricModeCard t={t} ctaCard={ctaCardElement} />}
            {mode === 'prosthodontic' && <ProsthodonticModeCard t={t} ctaCard={ctaCardElement} />}
            {mode === 'video' && <SmileVideoModeCard />}
            {mode === 'jaw-surgery' && <JawSurgeryModeCard t={t} onAskDentist={handleAskDentist} ctaCard={ctaCardElement} />}
            {mode === 'genioplasty' && <GenioplastyModeCard t={t} onAskDentist={handleAskDentist} ctaCard={ctaCardElement} />}
            {mode === 'greenchrome' && <GreenChromeModeCard t={t} onAskDentist={handleAskDentist} ctaCard={ctaCardElement} />}
            {mode === 'gum-analysis' && <GreenchomaModeCard t={t} onAskDentist={handleAskDentist} ctaCard={ctaCardElement} />}
            {mode === 'exocad-export' && <ExocadExportModeCard />}
            {mode === 'clinic-registration' && <ClinicRegistrationCard t={t} />}
            {mode === '3d-model' && <ThreeDModelCard t={t} />}

            <FabMenu actions={fabActions} />
            <DrSmileChat isOpen={isDrSmileChatOpen} onClose={() => setIsDrSmileChatOpen(false)} />

            {isLoginPopupOpen && <LoginPopup t={t} onClose={() => setLoginPopupOpen(false)} onLogin={handleLoginSubmit} rememberedEmail={rememberedEmail} />}
            {isUpgradePopupOpen && <UpgradePopup onClose={() => setUpgradePopupOpen(false)} onUpgrade={handleUpgrade} />}
            {isAskDentistModalOpen && <AskDentistModal imageSrc={imageForDentist || undefined} onClose={() => setIsAskDentistModalOpen(false)} onSubmit={() => {}}/>}
            {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
            {isContactUsPopupOpen && <ContactUsPopup t={t} onClose={() => setContactUsPopupOpen(false)} onSubmit={handleContactUsSubmit} />}
            {modalImageSrc && <ImagePreviewModal t={t} imageSrc={modalImageSrc} onClose={() => setModalImageSrc(null)} />}
        </div>
    );
};

export default App;