import React, { useState, useRef, useEffect } from 'react';
import { generateImage } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

const MirrorModeCard = ({ setModalImage, t }: { setModalImage: (src: string | null) => void; t: { [key: string]: string } }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [smileStyle, setSmileStyle] = useState('hollywood');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    useEffect(() => {
        const startCamera = async () => {
            try {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    throw new Error("Camera API is not supported in this browser.");
                }
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Camera access error:", err);
                setError("Camera access was denied. Please enable camera permissions in your browser settings to use this feature.");
            }
        };

        // Only start the camera if we are not in the loading/captured state
        if (!capturedImage) {
            startCamera();
        }

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };
    }, [capturedImage]);

    const handleCapture = async () => {
        if (!videoRef.current || !canvasRef.current || error || isLoading) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext('2d');
        if (!context) return;
        
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageDataUrl = canvas.toDataURL('image/png');
        setCapturedImage(imageDataUrl); // Show the loading screen with the captured image
        
        const base64 = imageDataUrl.split(',')[1];
        
        const prompt = `Transform the selfie into a ${smileStyle} smile. Preserve facial identity and lighting. Teeth: realistic, ${smileStyle}, correct anatomy. Gingiva: healthy pink (#E88A8A), 4mm exposure. Output resolution: 1024×1024. Return one photorealistic PNG.`;
        
        const imageParts = [{ inlineData: { data: base64, mimeType: 'image/png' } }];
        // The generateImage function handles setting isLoading true/false
        const resultSrc = await generateImage(prompt, imageParts, setIsLoading);
        
        // After generation is complete (success or failure), reset the view
        setCapturedImage(null);
        
        if (resultSrc) {
            setModalImage(resultSrc);
        }
    };

    return (
        <div className="card">
            <h2>{t.mirrorModeTitle}</h2>
            <p>{t.mirrorModeDescription}</p>
            
            {isLoading && capturedImage ? (
                 <div className="mirror-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
                    <img src={capturedImage} alt="Captured for processing" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--border-radius-card)' }} />
                    <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.5)', padding: '2rem', borderRadius: 'var(--border-radius-card)' }}>
                        <LoadingSpinner text={t.generatingButton} />
                    </div>
                </div>
            ) : (
                <div className="mirror-container">
                    {error ? (
                        <div className="error-message">{error}</div>
                    ) : (
                        <video ref={videoRef} autoPlay playsInline muted className="mirror-video"></video>
                    )}
                    <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                </div>
            )}


            <label htmlFor="smileStyleMirror">{t.mirrorChooseStyleLabel}</label>
            <select id="smileStyleMirror" value={smileStyle} onChange={(e) => setSmileStyle(e.target.value)} disabled={!!error || isLoading}>
                 <option value="hollywood">{t.styleHollywood}</option>
                <option value="porcelain">{t.stylePorcelain}</option>
                <option value="translucent">{t.styleTranslucent}</option>
                <option value="corrective">{t.styleCorrective}</option>
            </select>
            
            <button onClick={handleCapture} className="generate-btn capture-btn" disabled={!!error || isLoading}>
                {isLoading ? t.generatingButton : t.mirrorCaptureButton}
            </button>
        </div>
    );
};

export default MirrorModeCard;