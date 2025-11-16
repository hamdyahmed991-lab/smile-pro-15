import React, { useState, useRef, useEffect } from 'react';
import { generateImage, toBase64, shareImage, HARMONIZATION_PROMPT } from '../services/geminiService';
import ComparisonSlider from './ComparisonSlider';
import LoadingSpinner from './LoadingSpinner';
import MagicWandIcon from './controls/icons/MagicWandIcon';
import DownloadIcon from './controls/icons/DownloadIcon';
import ShareIcon from './controls/icons/ShareIcon';

const PediatricModeCard = ({ ctaCard, t }: { ctaCard: React.ReactNode; t: { [key: string]: string } }) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [treatmentType, setTreatmentType] = useState('Zirconia Crown');
    const [isLoading, setIsLoading] = useState(false);
    const [isHarmonizing, setIsHarmonizing] = useState(false);
    const [beforeImage, setBeforeImage] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [opacity, setOpacity] = useState(1);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Cleanup the object URL when the component unmounts or the file changes
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleFileSelect = (selectedFile: File | null) => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setBeforeImage(URL.createObjectURL(selectedFile));
            setResultImage(null); // Reset result on new image
        } else {
            setFile(null);
            setPreviewUrl(null);
            setBeforeImage(null);
        }
    };
    
    const triggerFileSelect = () => fileInputRef.current?.click();

    const handleGenerate = async () => {
        if (!file) {
            alert("Please upload a photo of the child first.");
            return;
        }

        const treatmentPrompt = treatmentType === 'Zirconia Crown' 
            ? "The zirconia crowns must be sized and shaped appropriately for primary (baby) teeth. The shade should be a natural, healthy white, suitable for a child."
            : "The Celluloid Strip Crowns should be simulated using a composite material with a natural A2 shade. Ensure they are shaped and sized realistically for primary teeth, with a smooth, natural-looking finish.";

        const prompt = `
You are a world-class pediatric dental simulation AI. Your task is to create a hyper-realistic and age-appropriate simulation of a "${treatmentType}" smile for the child in the photo.

**CRITICAL DIRECTIVES:**
1.  **Preserve Identity:** The child's unique facial features, expression, skin texture, and the original photo's lighting are SACROSANCT. Do NOT alter them. The result must look like the same child.
2.  **Targeted Modification:** Your modification is strictly limited to the teeth.
3.  **Pediatric Realism:**
    *   ${treatmentPrompt}
    *   Ensure the smile line and gingival architecture are harmonious and look natural for a child.
4.  **Output:** Generate a single, photorealistic PNG image.
`;
        
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
            <h2>{t.pediatricModeTitle}</h2>
            <p>{t.pediatricModeDescription}</p>

            <label>{t.uploadChildPhotoLabel}</label>
            <div 
                className="drop-zone"
                onClick={triggerFileSelect}
            >
                <input 
                    type="file" 
                    id="uploadInputPediatric" 
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

            <label>{t.treatmentTypeLabel}</label>
            <div className="shade-selector" style={{marginBottom: '1rem'}}>
                 <button className={treatmentType === 'Zirconia Crown' ? 'selected' : ''} onClick={() => setTreatmentType('Zirconia Crown')}>{t.treatmentOptionZirconia}</button>
                 <button className={treatmentType === 'Celluloid Strip Crown (A2)' ? 'selected' : ''} onClick={() => setTreatmentType('Celluloid Strip Crown (A2)')}>{t.treatmentOptionCelluloid}</button>
            </div>
            
            <button onClick={handleGenerate} className="generate-btn" disabled={isLoading || isHarmonizing || !file}>
                {isLoading ? t.generatingButton : `🪄 ${t.generateSimulationButton}`}
            </button>

            {isLoading && <LoadingSpinner text="Generating Simulation..." />}

            {beforeImage && resultImage && !isLoading && (
                 <>
                    <div style={{marginTop: '20px'}}>
                        <ComparisonSlider beforeSrc={beforeImage} afterSrc={resultImage} opacity={opacity} />
                         <div className="transparency-slider-container">
                            <label htmlFor="transparency-slider-pediatric">{t.transparencyLabel}</label>
                            <input
                                id="transparency-slider-pediatric"
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
                            <button onClick={() => { const a = document.createElement("a"); a.href = resultImage; a.download = "Pediatric_Smile_Simulation.png"; a.click(); }} className="icon-btn"><DownloadIcon/></button>
                            <button onClick={() => shareImage(resultImage, "Pediatric_Smile_Simulation.png")} className="icon-btn"><ShareIcon/></button>
                        </div>
                    </div>
                    {ctaCard}
                 </>
            )}
        </div>
    );
};

export default PediatricModeCard;