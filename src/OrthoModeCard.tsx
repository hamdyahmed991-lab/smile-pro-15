import React, { useState, useRef, useEffect } from 'react';
import { generateImage, toBase64, shareImage, HARMONIZATION_PROMPT } from '../services/geminiService';
import ImageRestorer from './ImageRestorer';
import ComparisonSlider from './ComparisonSlider';
import LoadingSpinner from './LoadingSpinner';
import UndoIcon from './controls/icons/UndoIcon';
import RedoIcon from './controls/icons/RedoIcon';
import MagicWandIcon from './controls/icons/MagicWandIcon';
import BrushIcon from './controls/icons/BrushIcon';
import DownloadIcon from './controls/icons/DownloadIcon';
import ShareIcon from './controls/icons/ShareIcon';
import HelpIcon from './controls/icons/HelpIcon';
import RestartIcon from './controls/icons/RestartIcon';

const OrthoModeCard = ({ onAskDentist, onImageGenerated, ctaCard, t }: { onAskDentist: (imageSrc: string) => void; onImageGenerated: (src: string, file: File | null) => void; ctaCard: React.ReactNode; t: { [key: string]: string } }) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [treatmentType, setTreatmentType] = useState('Invisible Aligners');
    const [treatmentDuration, setTreatmentDuration] = useState(6); // Default to 6 months
    const [isLoading, setIsLoading] = useState(false);
    const [isHarmonizing, setIsHarmonizing] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [opacity, setOpacity] = useState(1);

    const [beforeImage, setBeforeImage] = useState<string | null>(null);
    const [historyStack, setHistoryStack] = useState<string[]>([]);
    const [historyStackIndex, setHistoryStackIndex] = useState(-1);

    const currentImage = historyStack[historyStackIndex];
    const canUndo = historyStackIndex > 0;
    const canRedo = historyStackIndex < historyStack.length - 1;

     useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const resetState = () => {
        setFile(null);
        setPreviewUrl(null);
        setBeforeImage(null);
        setHistoryStack([]);
        setHistoryStackIndex(-1);
        setIsLoading(false);
        setIsHarmonizing(false);
        setIsRestoring(false);
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

    const updateHistory = (newImageSrc: string) => {
        const newHistoryStack = historyStack.slice(0, historyStackIndex + 1);
        setHistoryStack([...newHistoryStack, newImageSrc]);
        setHistoryStackIndex(newHistoryStack.length);
    };
    
    const handleUndo = () => canUndo && setHistoryStackIndex(historyStackIndex - 1);
    const handleRedo = () => canRedo && setHistoryStackIndex(historyStackIndex + 1);

    const handleGenerate = async () => {
        if (!file) { alert("Please upload a photo first."); return; }
        const progressDescription = treatmentDuration === 0 ? 'at the initial state before treatment begins' : `after ${treatmentDuration} months of treatment`;
        
        let applianceDetailsPrompt = '';
        switch (treatmentType) {
            case 'Invisible Aligners':
                applianceDetailsPrompt = 'Render the aligners with high-fidelity transparency, capturing the subtle sheen of polished plastic over the enamel. Include small, tooth-colored composite attachments on specific teeth if clinically plausible for the simulated stage of treatment, ensuring they blend seamlessly.';
                break;
            case 'Metal Braces':
                applianceDetailsPrompt = 'Render traditional metal brackets (e.g., stainless steel) and a thin archwire. The brackets should have a slight metallic glint and show realistic, subtle reflections based on the photo\'s ambient lighting. Ensure the scale and placement on each tooth are clinically accurate.';
                break;
            case 'Ceramic Braces':
                applianceDetailsPrompt = 'Render clear or tooth-colored ceramic brackets that are less conspicuous than metal. The brackets should have a realistic, slight sheen or semi-translucent finish, distinct from the high polish of metal. The archwire should be a thin, metallic line, also with subtle reflections.';
                break;
        }

        const prompt = `You are Ortho AI, an expert in predictive orthodontic simulations. Your task is to generate a hyper-realistic visual prediction for the uploaded photo.

1.  **Analyze Initial State:** First, carefully analyze the current state of the teeth in the photo. Identify key orthodontic issues such as crowding, spacing, rotations, overbite, etc.
2.  **Predictive Simulation:** Based on your analysis, create a photorealistic prediction of how the smile would look ${progressDescription} using the specified treatment. The tooth movement must be plausible and reflect a typical progression for the chosen duration.
3.  **Apply Treatment Appliance:**
    -   **Treatment Type:** ${treatmentType}.
    -   **Appliance Details:** ${applianceDetailsPrompt}
4.  **Critical Guidelines:**
    -   **Preserve Identity:** The person's identity, facial structure, skin tone, and surrounding lighting MUST be preserved.
    -   **Targeted Modification:** Only modify the teeth and add the specified orthodontic appliance. Do NOT alter the lips, gums (unless necessary for tooth movement), or facial expression.
    -   **Output:** Return a single, high-quality, photorealistic PNG image.`;
        
        const base64 = await toBase64(file);
        const imageParts = [{ inlineData: { data: base64, mimeType: file.type || "image/png" } }];
        const resultSrc = await generateImage(prompt, imageParts, setIsLoading);
        if (resultSrc) {
            onImageGenerated(resultSrc, file);
            setBeforeImage(URL.createObjectURL(file));
            setHistoryStack([resultSrc]);
            setHistoryStackIndex(0);
            setOpacity(1);
        }
    };
    
    const handleHarmonize = async () => {
        if (!currentImage || !beforeImage) return;
        try {
            const beforeResponse = await fetch(beforeImage);
            const beforeBlob = await beforeResponse.blob();
            const beforeFile = new File([beforeBlob], "original.png", { type: beforeBlob.type });
            const beforeBase64 = await toBase64(beforeFile);
            const currentBase64 = currentImage.split(",")[1];

            const imageParts = [
                { inlineData: { data: beforeBase64, mimeType: beforeFile.type || 'image/png' } },
                { inlineData: { data: currentBase64, mimeType: 'image/png' } }
            ];
            
            const newImageSrc = await generateImage(HARMONIZATION_PROMPT, imageParts, setIsHarmonizing);

            if (newImageSrc) {
                updateHistory(newImageSrc);
            }
        } catch (error) {
            console.error("Harmonization failed:", error);
        }
    };

    const handleAskDentist = (imageSrc: string) => {
        onAskDentist(imageSrc);
    };

    const loadingMessages = [
        'Analyzing current alignment...',
        `Simulating ${treatmentDuration} months of progress...`,
        `Applying virtual ${treatmentType}...`,
        'Perfecting the final result...'
    ];
    
    if (isRestoring && beforeImage && currentImage) {
        return (
            <div className="card">
                <ImageRestorer
                    beforeSrc={beforeImage}
                    afterSrc={currentImage}
                    onSave={(newImageSrc) => {
                        updateHistory(newImageSrc);
                        setIsRestoring(false);
                    }}
                    onCancel={() => setIsRestoring(false)}
                />
            </div>
        );
    }

    return (
      <div className="card">
        <h2>{t.orthodonticSimulation}</h2>
        <p>{t.orthoCardDescription}</p>
        <label>{t.uploadPhotoLabel}</label>
        <div 
            className="drop-zone"
            onClick={triggerFileSelect}
        >
            <input 
                type="file" 
                id="uploadInputOrtho" 
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
        
        <label htmlFor="treatmentTypeSelect">{t.chooseTreatmentTypeLabel}</label>
        <select id="treatmentTypeSelect" value={treatmentType} onChange={(e) => setTreatmentType(e.target.value)}>
          <option value="Invisible Aligners">{t.treatmentOptionAligners}</option>
          <option value="Metal Braces">{t.treatmentOptionMetalBraces}</option>
          <option value="Ceramic Braces">{t.treatmentOptionCeramicBraces}</option>
        </select>

        <label htmlFor="treatmentDuration">{t.simulateProgressLabel.replace('{duration}', treatmentDuration.toString())}</label>
        <input type="range" id="treatmentDuration" min="0" max="24" step="1" value={treatmentDuration} onChange={(e) => setTreatmentDuration(Number(e.target.value))} />
        
        <button onClick={handleGenerate} className="generate-btn" disabled={isLoading || isHarmonizing || !file}>
            <MagicWandIcon />
            {isLoading ? t.generatingButton : t.generateSimulationButton}
        </button>
        
        {isLoading && <LoadingSpinner messages={loadingMessages} />}
        
        {currentImage && beforeImage && (
            <>
                <div style={{marginTop: '20px'}}>
                    <ComparisonSlider beforeSrc={beforeImage} afterSrc={currentImage} opacity={opacity} />
                     <div className="transparency-slider-container">
                        <label htmlFor="transparency-slider-ortho">{t.transparencyLabel}</label>
                        <input
                            id="transparency-slider-ortho"
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={opacity}
                            onChange={(e) => setOpacity(parseFloat(e.target.value))}
                        />
                    </div>
                    <div className="action-buttons">
                        <button onClick={handleUndo} className="icon-btn" disabled={!canUndo} title={t.undoButton}><UndoIcon /> {t.undoButton}</button>
                        <button onClick={handleRedo} className="icon-btn" disabled={!canRedo} title={t.redoButton}><RedoIcon /> {t.redoButton}</button>
                        <button onClick={handleHarmonize} className="icon-btn" disabled={isHarmonizing}>
                            <MagicWandIcon />
                            {isHarmonizing ? t.harmonizingButton : t.harmonizeButton}
                        </button>
                        <button onClick={() => setIsRestoring(true)} className="icon-btn" disabled={isHarmonizing}><BrushIcon /> {t.restoreButton}</button>
                        <button onClick={() => { const a = document.createElement("a"); a.href = currentImage; a.download = "Ortho_AI_Simulation.png"; a.click(); }} className="icon-btn"><DownloadIcon/></button>
                        <button onClick={() => shareImage(currentImage, "Ortho_AI_Simulation.png")} className="icon-btn"><ShareIcon/></button>
                        <button onClick={() => handleAskDentist(currentImage)} className="icon-btn"><HelpIcon /> {t.askDentist}</button>
                        <button onClick={resetState} className="icon-btn secondary-btn" style={{gridColumn: '1 / -1'}}><RestartIcon /> {t.startOver}</button>
                    </div>
                </div>
                {ctaCard}
            </>
        )}
      </div>
    );
};

export default OrthoModeCard;