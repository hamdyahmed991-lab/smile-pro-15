import React, { useState, useEffect } from 'react';

const defaultMessages = ["Processing...", "This might take a moment...", "Analyzing details...", "Almost there..."];

const LoadingSpinner: React.FC<{ messages?: string[] }> = ({ messages = defaultMessages }) => {
    const [countdown, setCountdown] = useState(60);
    const [currentMessage, setCurrentMessage] = useState(messages[0]);

    useEffect(() => {
        setCountdown(60); // Reset timer on mount
        const timer = setInterval(() => {
            setCountdown(prevCount => (prevCount > 0 ? prevCount - 1 : 0));
        }, 1000);

        let messageIndex = 0;
        setCurrentMessage(messages[0]); // Ensure the first message shows immediately

        const messageInterval = setInterval(() => {
            messageIndex = (messageIndex + 1) % messages.length;
            setCurrentMessage(messages[messageIndex]);
        }, 3000);

        return () => {
            clearInterval(timer);
            clearInterval(messageInterval);
        };
    }, [messages]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', margin: '20px 0' }}>
            <div className="spinner-container">
                <svg className="drill-spinner-svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                    {/* Handle */}
                    <path d="M32,60 V42 C26,42 22,38 22,32 S26,22 32,22 C38,22 42,26 42,32 S38,42 32,42" stroke="#9E9E9E" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    {/* Head */}
                    <circle cx="32" cy="16" r="8" fill="#BDBDBD"/>
                    {/* Spinning Burr */}
                    <g className="drill-spinner-burr">
                        <line x1="32" y1="16" x2="32" y2="4" stroke="var(--primary-color)" strokeWidth="4" strokeLinecap="round"/>
                    </g>
                </svg>
                <div className="sparkle one"></div>
                <div className="sparkle two"></div>
                <div className="sparkle three"></div>
                <div className="sparkle four"></div>
            </div>
            <p style={{ margin: 0 }}>{currentMessage}</p>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{countdown}s</p>
        </div>
    );
};

export default LoadingSpinner;
