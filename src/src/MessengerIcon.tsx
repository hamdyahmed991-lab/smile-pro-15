import React from 'react';

const MessengerIcon: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
            width="28"
            height="28"
        >
            <path d="M12 2C6.48 2 2 5.79 2 10.5c0 2.57 1.48 4.89 3.75 6.22V22l3.41-2.05c1.1.33 2.29.5 3.51.5 5.52 0 10-3.79 10-8.5S17.52 2 12 2zm1.53 10.8-2.6-2.58-5.46 2.58L12.01 6l2.6 2.58 5.46-2.58L13.53 12.8z" />
        </svg>
    );
};

export default MessengerIcon;
