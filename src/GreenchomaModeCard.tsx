import React, { useState, useRef, useEffect } from 'react';
import { generateImage, toBase64, shareImage, HARMONIZATION_PROMPT } from '../services/geminiService';
import ComparisonSlider from './ComparisonSlider';
import LoadingSpinner from './LoadingSpinner';
import MagicWandIcon from './controls/icons/MagicWandIcon';
import DownloadIcon from './controls/icons/DownloadIcon';
import ShareIcon from './controls/icons/ShareIcon';
import HelpIcon from './controls/icons/HelpIcon';
import RestartIcon from './controls/icons/RestartIcon';

const GreenchomaModeCard = ({ onAskDentist, ctaCard, t }: { onAskDentist: (imageSrc: string) => void; ctaCard: React.ReactNode; t: { [key: string]: string } }) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isHarmonizing, setIsHarmonizing] = useState(false);
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
        setIsHarmonizing(false);
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
            alert("Please upload a photo showing the gums first.");
            return;
        }

        const prompt = `You are a specialized dental AI focused on aesthetic procedures. Your task is to simulate a 'gum depigmentation' (gum bleaching) and a 'teeth polishing' procedure on the provided photograph.
**Instructions:**
1.  **Identify Gingiva and Teeth:** Accurately detect the gum tissues and teeth in the smile.
2.  **Gum Color Transformation:** Change the color of any dark, brown, or black pigmented areas of the gums to a uniform, healthy, natural pink color (e.g., a shade like #E88A8A).
3.  **Teeth Polishing:** Apply a subtle polishing effect to the teeth. This should make them appear cleaner and slightly glossier by enhancing specular highlights realistically. Do NOT change the fundamental tooth color (shade) or shape. The effect should be equivalent to a professional dental cleaning and polishing.
4.  **Preserve Everything Else:** This is critical. Do NOT alter the lips, skin, or any other part of the image besides the gums and the surface texture of the teeth. The original lighting must be preserved.
5.  **Realism:** The final result must be hyper-realistic, with natural textures and seamless blending.
Output a single, high-quality PNG image.`;
        
        const base64 = await toBase64(file);
        const imageParts = [{ inlineData: { data: base64, mimeType: file.type || "image/png" } }];
        const generatedSrc = await generateImage(prompt, imageParts, setIsLoading);

        if (generatedSrc) {
            setResultImage(generatedSrc);
        }
    };
    
    const handleHarmonize = async () => {
        if (!resultImage || !beforeImage) return;
        try {
            const beforeResponse = await fetch(beforeImage);
            const beforeBlob = await beforeResponse.blob();
            const beforeFile = new File([beforeBlob], "original.png", { type: beforeBlob.type });
            const beforeBase64 = await toBase64(beforeFile);
            const currentBase64 = resultImage.split(",")[1];

            const imageParts = [
                { inlineData: { data: beforeBase64, mimeType: beforeFile.type || 'image/png' } },
                { inlineData: { data: currentBase64, mimeType: 'image/png' } }
            ];
            
            const newImageSrc = await generateImage(HARMONIZATION_PROMPT, imageParts, setIsHarmonizing);

            if (newImageSrc) {
                setResultImage(newImageSrc);
            }
        } catch (error) {
            console.error("Harmonization failed:", error);
        }
    };

    return (
        <div className="card">
            <h2>{t.gumAnalysis || 'Gum Depigmentation & Teeth Polishing'}</h2>
            <p>{t.gumAnalysisDescription || 'Visualize the results of gum depigmentation and teeth polishing.'}</p>

            <label>{t.uploadPhotoLabel}</label>
            <div className="drop-zone" onClick={triggerFileSelect}>
                <input 
                    type="file" 
                    id="uploadInputGreenchoma" 
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
                        <p className="drop-zone-text-small">{t.gumAnalysisHint || 'A clear photo of your smile works best'}</p>
                    </div>
                )}
            </div>
            
            <button onClick={handleGenerate} className="generate-btn" disabled={isLoading || isHarmonizing || !file} style={{ marginTop: '1rem' }}>
                <MagicWandIcon />
                {isLoading ? t.generatingButton : t.generateSimulationButton}
            </button>

            {isLoading && <LoadingSpinner text={t.gumAnalysisLoading || 'Simulating gum & teeth treatment...'} />}

            {beforeImage && resultImage && !isLoading && (
                 <>
                    <div style={{marginTop: '20px'}}>
                        <ComparisonSlider beforeSrc={beforeImage} afterSrc={resultImage} opacity={opacity} />
                         <div className="transparency-slider-container">
                            <label htmlFor="transparency-slider-greenchoma">{t.transparencyLabel}</label>
                            <input
                                id="transparency-slider-greenchoma"
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={opacity}
                                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                            />
                        </div>
                        <div className="action-buttons">
                            <button onClick={handleHarmonize} className="icon-btn" disabled={isHarmonizing}>
                                <MagicWandIcon />
                                {isHarmonizing ? t.harmonizingButton : t.harmonizeButton}
                            </button>
                            <button onClick={() => { const a = document.createElement("a"); a.href = resultImage; a.download = "Gum_Treatment_Simulation.png"; a.click(); }} className="icon-btn"><DownloadIcon/></button>
                            <button onClick={() => shareImage(resultImage, "Gum_Treatment_Simulation.png")} className="icon-btn"><ShareIcon/></button>
                            <button onClick={() => onAskDentist(resultImage)} className="icon-btn"><HelpIcon/> {t.askSpecialistButton}</button>
                            <button onClick={resetState} className="icon-btn secondary-btn" style={{gridColumn: '1 / -1'}}><RestartIcon/> {t.startOver}</button>
                        </div>
                    </div>
                    {ctaCard}
                 </>
            )}
        </div>
    );
};

export default GreenchomaModeCard;