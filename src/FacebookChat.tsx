import React from 'react';
import FacebookIcon from './controls/icons/FacebookIcon';

const FacebookChat: React.FC = () => {
    const facebookProfileUrl = 'https://www.facebook.com/your-profile';

    const handleClick = () => {
        window.open(facebookProfileUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <button className="facebook-fab" onClick={handleClick} aria-label="Follow us on Facebook">
            <FacebookIcon />
        </button>
    );
};

export default FacebookChat;
