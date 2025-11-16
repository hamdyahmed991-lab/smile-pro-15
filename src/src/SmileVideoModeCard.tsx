import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import LoadingSpinner from './LoadingSpinner';

const loadingMessages = [
    "Contacting the digital film crew...",
    "Setting up the virtual camera...",
    "Directing your smile performance...",
    "Rendering the final cut...",
    "Applying cinematic lighting...",
    "This can take a few minutes, great smiles take time!",
];

const SmileVideoModeCard = () => {
    // Component State
    const [apiKeySelected, setApiKeySelected] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    
    // Workflow State
    const [capturedImage, setCapturedImage] = useState<string | null>(null); // base64 data URL
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [smileStyle, setSmileStyle] = useState('a natural, happy smile');
    const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');


    // Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Check for API key on component mount
    useEffect(() => {
        const checkKey = async () => {
            if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
                try {
                    const hasKey = await window.aistudio.hasSelectedApiKey();
                    setApiKeySelected(hasKey);
                } catch (e) {
                    console.error("Error checking for API key:", e);
                    setError("Could not verify API key status. Please try again later.");
                    setApiKeySelected(false);
                }
            } else {
                setError("API key management is not available in this environment.");
                setApiKeySelected(false);
            }
        };
        checkKey();
    }, []);

    // Start camera when API key is confirmed
    useEffect(() => {
        const startCamera = async () => {
            if (apiKeySelected && !stream) {
                try {
                    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
                    setStream(mediaStream);
                    if (videoRef.current) {
                        videoRef.current.srcObject = mediaStream;
                    }
                } catch (err) {
                    console.error("Camera access error:", err);
                    setError("Camera access was denied. Please enable camera permissions.");
                }
            }
        };
        startCamera();

        // Cleanup function to stop camera stream
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [apiKeySelected, stream]);

    // Cycle through loading messages
    useEffect(() => {
        let interval: number;
        if (isLoading) {
            let messageIndex = 0;
            interval = window.setInterval(() => {
                messageIndex = (messageIndex + 1) % loadingMessages.length;
                setLoadingMessage(loadingMessages[messageIndex]);
            }, 3000);
        }
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isLoading]);

    const handleSelectKey = async () => {
        try {
            await window.aistudio.openSelectKey();
            // Assume success to avoid potential race condition on check after selection
            setApiKeySelected(true);
        } catch (e) {
            console.error("Error opening select key dialog:", e);
            setError("Could not open the API key selection dialog.");
        }
    };

    const handleCapture = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (!context) return;
        
        // Flip the image horizontally for a mirror effect
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageDataUrl);
    };

    const handleGenerateVideo = async () => {
        if (!capturedImage) return;

        setIsLoading(true);
        setLoadingMessage(loadingMessages[0]);

        try {
            // Re-initialize the client right before the call to ensure the latest key is used.
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const prompt = `Animate this person's face into a short, photorealistic video. They should start with their current expression and then break into ${smileStyle}. The background should remain static. The person's identity, hair, and clothing must be preserved.`;
            const base64Data = capturedImage.split(',')[1];

            let operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: prompt,
                image: {
                    imageBytes: base64Data,
                    mimeType: 'image/jpeg',
                },
                config: {
                    numberOfVideos: 1,
                    resolution: resolution,
                    aspectRatio: '9:16'
                }
            });

            // Polling for the result
            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 5000));
                operation = await ai.operations.getVideosOperation({ operation: operation });
            }

            if (operation.response?.generatedVideos?.[0]?.video?.uri) {
                const downloadLink = operation.response.generatedVideos[0].video.uri;
                // The API key must be appended to the download URI to fetch the video bytes
                setGeneratedVideoUrl(`${downloadLink}&key=${process.env.API_KEY}`);
            } else {
                throw new Error("Video generation completed but no video URI was found.");
            }

        } catch (err) {
            console.error("Video generation failed:", err);
            let errorMessage = "An unknown error occurred during video generation.";
            if (err instanceof Error) {
                errorMessage = err.message;
                 // Specific error handling for invalid API keys
                if (err.message.includes("Requested entity was not found")) {
                    errorMessage = "The selected API key is invalid or lacks permissions for the Veo API. Please select a valid key.";
                    setApiKeySelected(false); // Reset to prompt for key selection again
                }
            }
            alert(`Video Generation Failed: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleReset = () => {
        setCapturedImage(null);
        setGeneratedVideoUrl(null);
        setError(null);
    };

    const renderContent = () => {
        if (apiKeySelected === null) {
            return <div className="spinner"></div>;
        }

        if (!apiKeySelected) {
            return (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <h3>Feature requires API Key</h3>
                    <p>The Smile Video feature uses the powerful Veo model, which requires you to select your own API key.</p>
                    <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>This is a one-time step. Your key is stored securely.</p>
                    <button onClick={handleSelectKey} className="generate-btn">Select API Key</button>
                    <p style={{ marginTop: '1rem', fontSize: '0.8rem' }}>
                        For more information on billing, please visit the{' '}
                        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer">
                            official documentation
                        </a>.
                    </p>
                </div>
            );
        }
        
        if (error) {
            return <div className="error-message">{error}</div>;
        }

        if (isLoading) {
            return (
                <div style={{ textAlign: 'center', padding: '2rem', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <LoadingSpinner text={loadingMessage} />
                </div>
            );
        }

        if (generatedVideoUrl) {
            return (
                <div>
                    <h4>Your Smile Video is Ready!</h4>
                    <video src={generatedVideoUrl} controls autoPlay loop style={{ width: '100%', borderRadius: 'var(--border-radius-card)' }} />
                    <div className="action-buttons">
                        <button onClick={handleReset} className="secondary-btn">Start Over</button>
                        <a href={generatedVideoUrl} download="smile_video.mp4" className="generate-btn" style={{ textDecoration: 'none', textAlign: 'center' }}>Download Video</a>
                    </div>
                </div>
            );
        }

        if (capturedImage) {
            return (
                <div>
                    <img src={capturedImage} alt="Captured frame" style={{ width: '100%', borderRadius: 'var(--border-radius-card)' }} />
                    <label htmlFor="smileStyleVideo">Choose Smile Style</label>
                    <select id="smileStyleVideo" value={smileStyle} onChange={(e) => setSmileStyle(e.target.value)}>
                        <option value="a natural, happy smile">Natural Happy Smile</option>
                        <option value="a wide, joyful Hollywood smile">Hollywood Smile</option>
                        <option value="a gentle, subtle smile">Subtle Smile</option>
                        <option value="a cheerful laugh">Cheerful Laugh</option>
                    </select>

                    <label htmlFor="videoResolution">Choose Video Resolution</label>
                    <select id="videoResolution" value={resolution} onChange={(e) => setResolution(e.target.value as '720p' | '1080p')}>
                        <option value="720p">HD (720p)</option>
                        <option value="1080p">Full HD (1080p)</option>
                    </select>
                    
                    <div className="action-buttons">
                        <button onClick={() => setCapturedImage(null)} className="secondary-btn">Retake</button>
                        <button onClick={handleGenerateVideo} className="generate-btn">Generate Video</button>
                    </div>
                </div>
            );
        }

        return (
            <div>
                 <div className="mirror-container">
                    <video ref={videoRef} autoPlay playsInline muted className="mirror-video"></video>
                    <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                </div>
                <button onClick={handleCapture} className="generate-btn capture-btn" disabled={!stream}>
                    📸 Capture Frame
                </button>
            </div>
        );
    };

    return (
        <div className="card">
            <h2>🎬 Smile Video</h2>
            <p>Animate your photo into a beautiful smile!</p>
            {renderContent()}
        </div>
    );
};

export default SmileVideoModeCard;