import React from 'react';
import TelegramIcon from './controls/icons/TelegramIcon';

const TelegramChat: React.FC = () => {
    const telegramChannelUrl = 'https://t.me/your-channel';

    const handleClick = () => {
        window.open(telegramChannelUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <button className="telegram-fab" onClick={handleClick} aria-label="Join us on Telegram">
            <TelegramIcon />
        </button>
    );
};

export default TelegramChat;
