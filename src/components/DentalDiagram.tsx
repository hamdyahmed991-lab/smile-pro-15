import React from 'react';

const DentalDiagram: React.FC = () => {
    const textStyle: React.CSSProperties = {
        fontFamily: 'var(--font-family-body)',
        fill: 'var(--text-color)',
        fontSize: '15px',
        fontWeight: 500,
        textAnchor: 'middle',
    };
    const titleStyle: React.CSSProperties = { ...textStyle, fontSize: '16px', fontWeight: 600, fill: '#A9A9A9' };
    const centerTextStyle: React.CSSProperties = { ...textStyle, fill: 'white', fontWeight: 600, fontSize: '18px' };
    const centerSubTextStyle: React.CSSProperties = { ...centerTextStyle, fontSize: '14px', fontWeight: 400 };
    const iconTextStyle: React.CSSProperties = { ...textStyle, fontSize: '13px', fill: 'var(--text-color-light)' };

    return (
        <div style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
        <svg viewBox="125 0 450 520" width="100%" style={{ maxWidth: '550px', margin: '1rem auto', display: 'block' }} aria-labelledby="diagram-title" role="img">
            <title id="diagram-title">Diagram of the Perfect Dental Treatment process.</title>
            <defs>
                <linearGradient id="grad-purple-orange" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#C8A2C8" />
                    <stop offset="100%" stopColor="#FFDAB9" />
                </linearGradient>
                <linearGradient id="grad-orange-green" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFDAB9" />
                    <stop offset="100%" stopColor="#98FB98" />
                </linearGradient>
                <linearGradient id="grad-green-blue" x1="100%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#98FB98" />
                    <stop offset="100%" stopColor="#ADD8E6" />
                </linearGradient>
                <linearGradient id="grad-blue-purple" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ADD8E6" />
                    <stop offset="100%" stopColor="#C8A2C8" />
                </linearGradient>
            </defs>
            
            {/* Central Circle */}
            <g transform="translate(300, 260)">
                <circle cx="0" cy="0" r="85" fill="rgba(0,0,0,0.2)" />
                <path d="M 0 -80 A 80 80 0 0 1 80 0" stroke="url(#grad-purple-orange)" strokeWidth="5" fill="none" />
                <path d="M 80 0 A 80 80 0 0 1 0 80" stroke="url(#grad-orange-green)" strokeWidth="5" fill="none" />
                <path d="M 0 80 A 80 80 0 0 1 -80 0" stroke="url(#grad-green-blue)" strokeWidth="5" fill="none" />
                <path d="M -80 0 A 80 80 0 0 1 0 -80" stroke="url(#grad-blue-purple)" strokeWidth="5" fill="none" />
                <text y="-10" style={centerTextStyle}>Perfect Dental</text>
                <text y="15" style={centerTextStyle}>Treatment</text>
                <text y="40" style={centerSubTextStyle}>(Perfect Smile)</text>
            </g>

            {/* Branch 1: Planning (Top) */}
            <g>
                <path d="M 300 175 V 120" stroke="#C8A2C8" strokeWidth="2" />
                <text x="300" y="40" style={{...titleStyle, fill: '#C8A2C8'}}>Planning</text>
                {/* CAD Icon */}
                <g transform="translate(230, 60)">
                    <rect x="0" y="0" width="40" height="30" rx="3" stroke="var(--text-color-light)" strokeWidth="1.5" fill="none" />
                    <rect x="17" y="30" width="6" height="5" stroke="var(--text-color-light)" strokeWidth="1.5" fill="none" />
                    <path d="M 10 35 h 20" stroke="var(--text-color-light)" strokeWidth="1.5" />
                    <path d="M 5 20 l 5 -5 l 5 5 l 5 -5 l 5 5" stroke="var(--text-color-light)" strokeWidth="1.5" fill="none" />
                </g>
                <text x="250" y="110" style={iconTextStyle}>CAD</text>
                 {/* CBCT Icon */}
                <g transform="translate(330, 60)">
                    <rect x="0" y="0" width="40" height="35" rx="3" stroke="var(--text-color-light)" strokeWidth="1.5" fill="none" />
                     <circle cx="20" cy="17" r="8" stroke="var(--text-color-light)" strokeWidth="1.5" fill="none" />
                     <path d="M 18 17 l -3 -3 m 6 0 l -3 3 m 0 0 v 5" stroke="var(--text-color-light)" strokeWidth="1" fill="none" />
                </g>
                <text x="350" y="110" style={iconTextStyle}>CBCT X-ray</text>
            </g>

            {/* Branch 2: Team (Right) */}
            <g>
                <path d="M 385 260 H 450" stroke="#98FB98" strokeWidth="2" />
                <path d="M 450 260 L 480 230" stroke="#98FB98" strokeWidth="2" />
                {/* Dentist Icon */}
                <g transform="translate(470, 160)">
                    <circle cx="15" cy="7" r="5" stroke="var(--text-color-light)" strokeWidth="1.5" fill="none" />
                    <path d="M 5 25 a 10 10 0 0 1 20 0 z" stroke="var(--text-color-light)" strokeWidth="1.5" fill="none" />
                </g>
                <text x="485" y="205" style={iconTextStyle}>Dentist</text>
                {/* D. Tech / D. Assistant Icons */}
                <g transform="translate(420, 270)">
                    <circle cx="15" cy="7" r="5" stroke="var(--text-color-light)" strokeWidth="1.5" fill="none" />
                    <path d="M 5 25 a 10 10 0 0 1 20 0 z" stroke="var(--text-color-light)" strokeWidth="1.5" fill="none" />
                </g>
                <g transform="translate(520, 270)">
                    <path d="M 0 10 L 5 5 L 10 10 M 5 5 V 20 M 15 10 L 20 5 L 25 10 M 20 5 V 20 M 12.5 12 a 5 5 0 0 1 0 5 a 5 5 0 0 0 0 5" stroke="var(--text-color-light)" strokeWidth="1.5" fill="none" />
                </g>
                 <text x="435" y="315" style={iconTextStyle} textAnchor="middle">D. Tech</text>
                 <text x="535" y="315" style={iconTextStyle} textAnchor="middle">D. Assistant</text>

                {/* Thumbs up Icon */}
                <g transform="translate(480, 220)">
                    <path d="M7 10.2v6.8c0 .6.4 1 1 1h7.8c.6 0 1-.4 1-1V8.6c0-.3-.1-.5-.3-.7l-3.5-3.5c-.2-.2-.4-.3-.7-.3H8.5c-.8 0-1.5.7-1.5 1.5v4.6" stroke="#98FB98" strokeWidth="1.5" fill="none" />
                    <path d="M7 10.2H3.8c-.4 0-.8.3-.8.8v5.4c0 .4.3.8.8.8H7" stroke="#98FB98" strokeWidth="1.5" fill="none" />
                </g>
            </g>
            
            {/* Branch 3: Materials (Bottom) */}
            <g>
                <path d="M 300 345 V 400" stroke="#ADD8E6" strokeWidth="2" />
                <text x="300" y="420" style={{...titleStyle, fill: '#ADD8E6'}}>Dental Materials,</text>
                <text x="300" y="440" style={{...titleStyle, fill: '#ADD8E6'}}>Technology for Rx</text>
                 {/* CADCAM Icon */}
                <g transform="translate(230, 460)">
                    <rect x="0" y="0" width="40" height="30" rx="3" stroke="var(--text-color-light)" strokeWidth="1.5" fill="none" />
                    <rect x="5" y="5" width="30" height="20" stroke="var(--text-color-light)" strokeWidth="1" fill="none" />
                    <rect x="15" y="20" width="10" height="5" fill="var(--text-color-light)" />
                </g>
                {/* Laser Icon */}
                <g transform="translate(330, 460)">
                    <path d="M 5 5 l 15 15 l 10 -10 l -15 -15 z" stroke="var(--text-color-light)" strokeWidth="1.5" fill="none"/>
                    <path d="M 22 8 l 10 -5" stroke="var(--text-color-light)" strokeWidth="1.5" />
                </g>
                {/* Scanners Icon */}
                <g transform="translate(400, 460)">
                    <path d="M 5 5 l 20 5 l 5 -5 l -20 -5 z" stroke="var(--text-color-light)" strokeWidth="1.5" fill="none"/>
                    <path d="M 10 8 l 0 10 l 10 2 l 0 -10 z" stroke="var(--text-color-light)" strokeWidth="1.5" fill="none"/>
                </g>
            </g>

            {/* Branch 4: Patient (Left) */}
            <g>
                <path d="M 215 260 H 150" stroke="#FFDAB9" strokeWidth="2" />
                {/* Thumbs up Icon */}
                <g transform="translate(160, 210) scale(1.2)">
                    <path d="M7 10.2v6.8c0 .6.4 1 1 1h7.8c.6 0 1-.4 1-1V8.6c0-.3-.1-.5-.3-.7l-3.5-3.5c-.2-.2-.4-.3-.7-.3H8.5c-.8 0-1.5.7-1.5 1.5v4.6" stroke="#4682B4" strokeWidth="1.5" fill="none" />
                    <path d="M7 10.2H3.8c-.4 0-.8.3-.8.8v5.4c0 .4.3.8.8.8H7" stroke="#4682B4" strokeWidth="1.5" fill="none" />
                </g>
                <text x="175" y="290" style={{...textStyle, fill: '#FFDAB9'}}>Co-op Patient</text>
            </g>

        </svg>
        </div>
    );
};

export default DentalDiagram;