import React from 'react';
import YouTubeIcon from './controls/icons/YouTubeIcon';

const YouTubeChat: React.FC = () => {
    const youTubeChannelUrl = 'https://www.youtube.com/channel/your-channel-id'; 

    const handleClick = () => {
        window.open(youTubeChannelUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <button className="youtube-fab" onClick={handleClick} aria-label="Subscribe on YouTube">
            <YouTubeIcon />
        </button>
    );
};

export default YouTubeChat;