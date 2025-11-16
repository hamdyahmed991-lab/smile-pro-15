import React from 'react';
import GmailIcon from './controls/icons/GmailIcon';

const GmailChat: React.FC = () => {
    const recipientEmail = 'drahmedsallm@gmail.com';
    const subject = encodeURIComponent("Inquiry from Smile Pro App");
    const body = encodeURIComponent("Hello Dr. Hamdy,\n\nI'm using the Smile Pro app and I would like to inquire about your services.\n\n");

    const handleClick = () => {
        window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
    };

    return (
        <button className="gmail-fab" onClick={handleClick} aria-label="Contact us via Gmail">
            <GmailIcon />
        </button>
    );
};

export default GmailChat;