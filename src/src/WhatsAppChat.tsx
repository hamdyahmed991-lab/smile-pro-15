import React from 'react';
import WhatsAppIcon from './controls/icons/WhatsAppIcon';

const WhatsAppChat: React.FC = () => {
    const phoneNumber = '201113039210';
    const message = encodeURIComponent("Hello Dr. Hamdy, I'm interested in the Hollywood Smile services.");

    const handleClick = () => {
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank', 'noopener,noreferrer');
    };

    return (
        <button className="whatsapp-fab" onClick={handleClick} aria-label="Chat with a dentist on WhatsApp">
            <WhatsAppIcon />
        </button>
    );
};

export default WhatsAppChat;
