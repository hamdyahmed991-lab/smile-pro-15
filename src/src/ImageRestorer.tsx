import React, { useState, useRef, useEffect, useCallback } from 'react';

const ImageRestorer: React.FC<{
    beforeSrc: string;
    afterSrc: string;
    onSave: (dataUrl: string) => void;
    onCancel: () => void;
}> = ({ beforeSrc, afterSrc, onSave, onCancel }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDrawingRef = useRef(false);
    const [brushSize, setBrushSize] = useState(40);

    const drawAfterImage = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const afterImg = new Image();
        afterImg.crossOrigin = 'anonymous';
        afterImg.src = afterSrc;
        afterImg.onload = () => {
            const container = containerRef.current;
            if (!container) return;
            
            canvas.width = afterImg.naturalWidth;
            canvas.height = afterImg.naturalHeight;
            
            ctx.drawImage(afterImg, 0, 0, afterImg.naturalWidth, afterImg.naturalHeight);
        };
    }, [afterSrc]);

    useEffect(() => {
        drawAfterImage();
        const handleResize = () => drawAfterImage();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [drawAfterImage]);

    const getCoords = (e: React.MouseEvent | React.TouchEvent): { x: number, y: number } | null => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        
        let clientX, clientY;
        if (e.nativeEvent instanceof MouseEvent) {
            clientX = e.nativeEvent.clientX;
            clientY = e.nativeEvent.clientY;
        } else if (e.nativeEvent instanceof TouchEvent && e.nativeEvent.touches[0]) {
            clientX = e.nativeEvent.touches[0].clientX;
            clientY = e.nativeEvent.touches[0].clientY;
        } else {
            return null;
        }

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        const ctx = canvasRef.current?.getContext('2d');
        if(!ctx) return;
        isDrawingRef.current = true;
        const coords = getCoords(e);
        if (coords) {
            ctx.beginPath();
            ctx.moveTo(coords.x, coords.y);
        }
        draw(e);
    };

    const stopDrawing = () => {
        isDrawingRef.current = false;
        const ctx = canvasRef.current?.getContext('2d');
        if(ctx) ctx.beginPath();
    };
    
    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawingRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const coords = getCoords(e);
        if (!ctx || !coords) return;
        
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
    };
    
    const handleSave = () => {
        const finalCanvas = document.createElement('canvas');
        const canvas = canvasRef.current;
        if(!canvas) return;

        const beforeImg = new Image();
        beforeImg.crossOrigin = "anonymous";
        beforeImg.src = beforeSrc;
        beforeImg.onload = () => {
            finalCanvas.width = canvas.width;
            finalCanvas.height = canvas.height;
            const finalCtx = finalCanvas.getContext('2d');
            if (!finalCtx) return;
            
            finalCtx.drawImage(beforeImg, 0, 0, canvas.width, canvas.height);
            finalCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
            
            onSave(finalCanvas.toDataURL('image/png'));
        };
    };

    return (
        <div className="image-restorer-container">
            <h3>Brush Restore</h3>
            <p>Use the brush to reveal the original image underneath.</p>
            <div 
                ref={containerRef} 
                className="image-restorer-canvas-wrapper" 
                style={{ position: 'relative', width: '100%', maxWidth: '500px', margin: '0 auto', touchAction: 'none' }}
            >
                <img src={beforeSrc} alt="Before" style={{ width: '100%', height: 'auto', display: 'block' }} />
                <canvas 
                    ref={canvasRef} 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    onMouseDown={startDrawing}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onMouseMove={draw}
                    onTouchStart={startDrawing}
                    onTouchEnd={stopDrawing}
                    onTouchMove={draw}
                />
            </div>
            <div className="image-restorer-controls">
                <label htmlFor="brushSize">Brush Size: {brushSize}px</label>
                <input 
                    type="range" 
                    id="brushSize" 
                    min="10" 
                    max="100" 
                    value={brushSize} 
                    onChange={(e) => setBrushSize(Number(e.target.value))} 
                />
                <div className="image-restorer-buttons">
                    <button onClick={onCancel} className="secondary-btn">Cancel</button>
                    <button onClick={handleSave} className="generate-btn">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

export default ImageRestorer;
