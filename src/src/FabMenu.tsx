import React, { useState } from 'react';

type FabAction = {
    name: string;
    className: string;
    icon: React.ReactNode;
    action: () => void;
};

interface FabMenuProps {
    actions: FabAction[];
}

const FabMenu: React.FC<FabMenuProps> = ({ actions }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    const radius = 120; // The radius of the circle on which the items are placed
    const angleStep = 90 / (actions.length - 1); // Spread items over a 90-degree arc

    return (
        <div className="fab-menu-container">
            <div className={`fab-options-container ${isOpen ? 'open' : ''}`}>
                {actions.map((action, index) => {
                    const angle = -90 + (index * angleStep);
                    const radians = angle * (Math.PI / 180);
                    const x = radius * Math.cos(radians);
                    const y = radius * Math.sin(radians);

                    return (
                        <button
                            key={action.name}
                            className={`fab-option ${action.className}`}
                            title={action.name}
                            onClick={() => {
                                action.action();
                                setIsOpen(false);
                            }}
                            style={{
                                '--tx': `${x}px`,
                                '--ty': `${y}px`,
                                transitionDelay: `${index * 0.03}s`
                            } as React.CSSProperties}
                        >
                            {action.icon}
                        </button>
                    );
                })}
            </div>
             <button className={`fab-main ${isOpen ? 'open' : ''}`} onClick={toggleMenu} aria-label="Open contact menu">
                <span>+</span>
            </button>
        </div>
    );
};

export default FabMenu;
