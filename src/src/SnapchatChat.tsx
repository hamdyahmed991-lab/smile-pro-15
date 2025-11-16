import React from 'react';
import SnapchatIcon from './controls/icons/SnapchatIcon';

const SnapchatChat: React.FC = () => {
    const snapchatProfileUrl = 'https://www.snapchat.com/add/your-username';

    const handleClick = () => {
        window.open(snapchatProfileUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <button className="snapchat-fab" onClick={handleClick} aria-label="Add us on Snapchat">
            <SnapchatIcon />
        </button>
    );
};

export default SnapchatChat;