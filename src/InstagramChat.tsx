import React from 'react';
import InstagramIcon from './controls/icons/InstagramIcon';

const InstagramChat: React.FC = () => {
    const instagramProfileUrl = 'https://www.instagram.com/dr.hamdy.sallm/';

    const handleClick = () => {
        window.open(instagramProfileUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <button className="instagram-fab" onClick={handleClick} aria-label="Follow us on Instagram">
            <InstagramIcon />
        </button>
    );
};

export default InstagramChat;