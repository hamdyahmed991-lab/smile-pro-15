// FIX: Replaced placeholder content with a valid React component that renders an SVG avatar for Dr. Smile.
import React from 'react';

const DrSmileAvatar: React.FC = () => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            aria-label="Dr. Smile Avatar"
            role="img"
            width="40"
            height="40"
        >
            <circle cx="50" cy="50" r="48" fill="#4dabf7" stroke="#1976d2" strokeWidth="2" />
            {/* Eyes */}
            <circle cx="35" cy="40" r="5" fill="white" />
            <circle cx="65" cy="40" r="5" fill="white" />
            <circle cx="35" cy="40" r="2" fill="black" />
            <circle cx="65" cy="40" r="2" fill="black" />
            {/* Smile */}
            <path
                d="M 30 60 Q 50 80, 70 60"
                stroke="white"
                strokeWidth="4"
                fill="transparent"
                strokeLinecap="round"
            />
        </svg>
    );
};

export default DrSmileAvatar;
