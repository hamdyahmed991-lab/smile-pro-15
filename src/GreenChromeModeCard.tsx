import React, { useState, useRef, useEffect } from 'react';
import { generateImage, toBase64, shareImage } from '../services/geminiService';
import ComparisonSlider from './ComparisonSlider';
import LoadingSpinner from './LoadingSpinner';
import MagicWandIcon from './controls/icons/MagicWandIcon';
import DownloadIcon from './controls/icons/DownloadIcon';
import ShareIcon from './controls/icons/ShareIcon';
import HelpIcon from './controls/icons/HelpIcon';
import RestartIcon from './controls/icons/RestartIcon';

const GreenChromeModeCard = ({ onAskDentist, ctaCard, t }: { onAskDentist: (imageSrc: string) => void; ctaCard: React.ReactNode; t: { [key: string]: string } }) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [beforeImage, setBeforeImage] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [opacity, setOpacity] = useState(1);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
    }, [previewUrl]);

    const resetState = () => {
        setFile(null);
        setPreviewUrl(null);
        setBeforeImage(null);
        setResultImage(null);
        setIsLoading(false);
        setOpacity(1);
    };

    const handleFileSelect = (selectedFile: File | null) => {
        resetState();
        if (selectedFile) {
            setFile(selectedFile);
            const url = URL.createObjectURL(selectedFile);
            setPreviewUrl(url);
            setBeforeImage(url);
        }
    };
    
    const triggerFileSelect = () => fileInputRef.current?.click();

    const handleGenerate = async () => {
        if (!file) {
            alert("Please upload a photo first.");
            return;
        }

        const prompt = `You are an expert image editor. Your task is to accurately isolate the main subject (person) from the background in the provided image. Replace the original background with a solid green screen color (#00FF00).
        **CRITICAL INSTRUCTIONS:**
        1.  **Precise Masking:** Create a clean and precise mask around the subject, paying close attention to details like hair and fine edges.
        2.  **Background Replacement:** The entire background must be replaced with the color green (#00FF00).
        3.  **Preserve Subject:** Do not alter the subject in any way (color, lighting, texture).
        4.  **Output:** Return a single, high-quality PNG image with the subject on the green screen background.`;
        
        const base64 = await toBase64(file);
        const imageParts = [{ inlineData: { data: base64, mimeType: file.type || "image/png" } }];
        const generatedSrc = await generateImage(prompt, imageParts, setIsLoading);

        if (generatedSrc) {
            setResultImage(generatedSrc);
        }
    };
    
    // Fallback text if translations are not available
    const t_backgroundIsolate = t.backgroundIsolate || 'Background Isolate (Green Chrome)';
    const t_greenChromeDescription = t.greenChromeDescription || 'Isolate the smile from the background with a green screen effect for professional use.';

    return (
        <div className="card">
            <h2>{t_backgroundIsolate}</h2>
            <p>{t_greenChromeDescription}</p>

            <label>{t.uploadPhotoLabel}</label>
            <div className="drop-zone" onClick={triggerFileSelect}>
                <input 
                    type="file" 
                    id="uploadInputGreenChrome"
                    ref={fileInputRef}
                    accept="image/*" 
                    onChange={(e) => handleFileSelect(e.target.files ? e.target.files[0] : null)}
                    style={{ display: 'none' }}
                />
                {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="drop-zone-preview" />
                ) : (
                    <div className="drop-zone-prompt">
                        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ stroke: 'currentColor', marginBottom: '12px', opacity: '0.5' }}>
                            <path d="M7 16a4 4 0 01-4-4 4 4 0 014-4h.5A6.5 6.5 0 0119.2 8.2a4.5 4.5 0 01-1.3 8.8h-11" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path d="M12 12v9m0 0l-3-3m3 3l3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                        <p><strong>{t.dropZonePromptClick}</strong></p>
                    </div>
                )}
            </div>
            
            <button onClick={handleGenerate} className="generate-btn" disabled={isLoading || !file} style={{ marginTop: '1rem' }}>
                <MagicWandIcon />
                {isLoading ? t.generatingButton : (t.generateButton || 'Generate')}
            </button>

            {isLoading && <LoadingSpinner text="Isolating subject..." />}

            {beforeImage && resultImage && !isLoading && (
                 <>
                    <div style={{marginTop: '20px'}}>
                        <ComparisonSlider beforeSrc={beforeImage} afterSrc={resultImage} opacity={opacity} />
                         <div className="transparency-slider-container">
                            <label htmlFor="transparency-slider-greenchrome">{t.transparencyLabel}</label>
                            <input
                                id="transparency-slider-greenchrome"
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={opacity}
                                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                            />
                        </div>
                        <div className="action-buttons">
                            <button onClick={() => { const a = document.createElement("a"); a.href = resultImage; a.download = "GreenChrome_Image.png"; a.click(); }} className="icon-btn" title={t.downloadButton}><DownloadIcon/></button>
                            <button onClick={() => shareImage(resultImage, "GreenChrome_Image.png")} className="icon-btn" title={t.shareButton}><ShareIcon/></button>
                            <button onClick={() => onAskDentist(resultImage)} className="icon-btn" title={t.askDentist}><HelpIcon/> {t.askDentist}</button>
                            <button onClick={resetState} className="icon-btn secondary-btn" style={{gridColumn: '1 / -1'}} title={t.startOver}><RestartIcon/> {t.startOver}</button>
                        </div>
                    </div>
                    {ctaCard}
                 </>
            )}
        </div>
    );
};

export default GreenChromeModeCard;
