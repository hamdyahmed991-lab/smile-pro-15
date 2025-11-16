import React from 'react';
import WeChatIcon from './controls/icons/WeChatIcon';

const WeChatChat: React.FC = () => {
    // WeChat QR codes are more common than direct links
    const weChatInfoUrl = 'https://www.wechat.com/add/your-id';

    const handleClick = () => {
        // This could open a modal with a QR code, or link to an info page.
        window.open(weChatInfoUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <button className="wechat-fab" onClick={handleClick} aria-label="Connect with us on WeChat">
            <WeChatIcon />
        </button>
    );
};

export default WeChatChat;
