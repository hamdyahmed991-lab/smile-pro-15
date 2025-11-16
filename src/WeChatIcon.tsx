import React from 'react';

const WeChatIcon: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
            width="28"
            height="28"
        >
            <path d="M12 2C6.486 2 2 6.486 2 12c0 3.323 1.633 6.253 4.155 8.077-.289.89-.982 2.59-1.379 3.522-.093.219.01.47.218.579.208.108.468.016.58-.201.73-1.423 1.815-2.88 2.264-3.553C9.574 20.8 10.76 21 12 21c5.514 0 10-4.486 10-9s-4.486-9-10-9zm-3.5 9c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5zm7 0c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5z"></path>
        </svg>
    );
};

export default WeChatIcon;
