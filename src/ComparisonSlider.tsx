import React, { useState, useRef, useEffect, useCallback } from 'react';

const ComparisonSlider: React.FC<{ beforeSrc: string; afterSrc: string; opacity: number; }> = ({ beforeSrc, afterSrc, opacity }) => {
    const [leftPosition, setLeftPosition] = useState(0);
    const [rightPosition, setRightPosition] = useState(100);
    const [bottomPosition, setBottomPosition] = useState(100);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const activeHandle = useRef<'left' | 'right' | 'bottom' | null>(null);
    const animationFrameId = useRef<number | null>(null);

    const positionsRef = useRef({ left: 0, right: 100, bottom: 100 });
    useEffect(() => {
        positionsRef.current = { left: leftPosition, right: rightPosition, bottom: bottomPosition };
    }, [leftPosition, rightPosition, bottomPosition]);

    const getXPercentage = useCallback((clientX: number) => {
        if (!containerRef.current) return 0;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        return Math.max(0, Math.min(100, (x / rect.width) * 100));
    }, []);

    const getYPercentage = useCallback((clientY: number) => {
        if (!containerRef.current) return 0;
        const rect = containerRef.current.getBoundingClientRect();
        const y = clientY - rect.top;
        return Math.max(0, Math.min(100, (y / rect.height) * 100));
    }, []);

    const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!activeHandle.current) return;
        if (e.cancelable) e.preventDefault();

        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);

        animationFrameId.current = requestAnimationFrame(() => {
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
            const { left, right } = positionsRef.current;

            switch (activeHandle.current) {
                case 'left':
                    setLeftPosition(Math.min(getXPercentage(clientX), right - 1));
                    break;
                case 'right':
                    setRightPosition(Math.max(getXPercentage(clientX), left + 1));
                    break;
                case 'bottom':
                    setBottomPosition(getYPercentage(clientY));
                    break;
            }
        });
    }, [getXPercentage, getYPercentage]);

    const handleRelease = useCallback(() => {
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
        activeHandle.current = null;
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleRelease);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', handleRelease);
    }, [handleMove]);
    
    const handlePress = (handle: 'left' | 'right' | 'bottom') => (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        activeHandle.current = handle;
        window.addEventListener('mousemove', handleMove, { passive: false });
        window.addEventListener('mouseup', handleRelease);
        window.addEventListener('touchmove', handleMove, { passive: false });
        window.addEventListener('touchend', handleRelease);
    };

    useEffect(() => {
        return () => { // Cleanup on unmount
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleRelease);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleRelease);
        }
    }, [handleMove, handleRelease]);

    const SMILE_CURVE_DEPTH = 15; // How much the smile dips
    const midX = (leftPosition + rightPosition) / 2;
    const curveY = bottomPosition;
    const controlY = bottomPosition + SMILE_CURVE_DEPTH;
    const effectiveControlY = Math.min(controlY, 100);
    const dividerPathD = `M ${leftPosition} ${curveY} Q ${midX} ${effectiveControlY} ${rightPosition} ${curveY}`;

    return (
        <div className="comparison-slider-container" ref={containerRef}>
            <svg width="0" height="0" style={{ position: 'absolute' }}>
                <defs>
                    <clipPath id="smile-clip" clipPathUnits="objectBoundingBox">
                        <path d={`M ${leftPosition / 100} 0 L ${rightPosition / 100} 0 L ${rightPosition / 100} ${curveY / 100} Q ${midX / 100} ${effectiveControlY / 100} ${leftPosition / 100} ${curveY / 100} Z`} />
                    </clipPath>
                </defs>
            </svg>

            <img src={beforeSrc} alt="Before" className="comparison-image-background" />
            <div className="comparison-image-foreground" style={{ clipPath: 'url(#smile-clip)', opacity: opacity }}>
                <img src={afterSrc} alt="After" />
            </div>
            
            <div 
                className="comparison-divider-vertical" 
                style={{ left: `${leftPosition}%` }}
                onMouseDown={handlePress('left')}
                onTouchStart={handlePress('left')}
            />

            <div 
                className="comparison-divider-vertical" 
                style={{ left: `${rightPosition}%` }}
                onMouseDown={handlePress('right')}
                onTouchStart={handlePress('right')}
            />

            <svg 
                className="comparison-divider-horizontal-svg"
                preserveAspectRatio="none"
                viewBox="0 0 100 100" 
            >
                <path 
                    d={dividerPathD} 
                    className="horizontal-grab-area"
                    onMouseDown={handlePress('bottom')}
                    onTouchStart={handlePress('bottom')}
                />
                <path 
                    d={dividerPathD} 
                    className="horizontal-visible-line"
                />
            </svg>
        </div>
    );
};

export default ComparisonSlider;
