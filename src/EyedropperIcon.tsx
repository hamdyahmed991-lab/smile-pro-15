import React from 'react';

const EyedropperIcon: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            style={{ display: 'block' }}
        >
            <path d="m2.3 2.3 3.4 3.4" />
            <path d="M13 13 9 9l4.5-4.5a2.8 2.8 0 0 1 4 4L13 13z" />
            <path d="m13 13 6 6" />
            <path d="M7 8.5 2.5 4" />
            <path d="m14 15.5 5.5 5.5" />
        </svg>
    );
};

export default EyedropperIcon;
