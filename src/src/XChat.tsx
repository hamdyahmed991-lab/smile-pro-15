import React from 'react';
import XIcon from './controls/icons/XIcon';

const XChat: React.FC = () => {
    const xProfileUrl = 'https://x.com/your-username';

    const handleClick = () => {
        window.open(xProfileUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <button className="x-fab" onClick={handleClick} aria-label="Follow us on X">
            <XIcon />
        </button>
    );
};

export default XChat;