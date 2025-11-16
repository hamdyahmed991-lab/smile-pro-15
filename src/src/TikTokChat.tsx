import React from 'react';
import TikTokIcon from './controls/icons/TikTokIcon';

const TikTokChat: React.FC = () => {
    const tiktokProfileUrl = 'https://www.tiktok.com/@your-username';

    const handleClick = () => {
        window.open(tiktokProfileUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <button className="tiktok-fab" onClick={handleClick} aria-label="Follow us on TikTok">
            <TikTokIcon />
        </button>
    );
};

export default TikTokChat;