import React, { useState, useRef } from 'react';
import { generateImage, toBase64, shareImage, HARMONIZATION_PROMPT } from '../services/geminiService';
import ImageRestorer from './ImageRestorer';
import LoadingSpinner from './LoadingSpinner';
import UndoIcon from './controls/icons/UndoIcon';
import RedoIcon from './controls/icons/RedoIcon';
import MagicWandIcon from './controls/icons/MagicWandIcon';
import BrushIcon from './controls/icons/BrushIcon';
import DownloadIcon from './controls/icons/DownloadIcon';
import ShareIcon from './controls/icons/ShareIcon';
import HelpIcon from './controls/icons/HelpIcon';
import RestartIcon from './controls/icons/RestartIcon';
import UploadIcon from './controls/icons/UploadIcon';
import ComparisonSlider from './ComparisonSlider';

const CheeseModeCard = ({ cheeseState, setCheeseState, isGenerating, onAskDentist, onFileSelectForCheese, ctaCard, t }: {
    cheeseState: { before: string | null; history: string[]; index: number; };
    setCheeseState: React.Dispatch<React.SetStateAction<{ before: string | null; history: string[]; index: number; }>>;
    isGenerating: boolean;
    onAskDentist: (imageSrc: string) => void;
    onFileSelectForCheese: (file: File) => void;
    ctaCard: React.ReactNode;
    t: { [key: string]: string };
}) => {
    const [isRestoring, setIsRestoring] = useState(false);
    const [isHarmonizing, setIsHarmonizing] = useState(false);
    const [opacity, setOpacity] = useState(1);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { before, history, index } = cheeseState;
    const currentImage = history[index];
    const canUndo = index > 0;
    const canRedo = index < history.length - 1;

    // Functions to update state via setCheeseState
    const updateHistory = (newImageSrc: string) => {
        const newHistory = history.slice(0, index + 1);
        setCheeseState(prevState => ({
            ...prevState,
            history: [...newHistory, newImageSrc],
            index: newHistory.length,
        }));
    };

    const handleUndo = () => {
        if (canUndo) {
            setCheeseState(prevState => ({ ...prevState, index: prevState.index - 1 }));
        }
    };
    
    const handleRedo = () => {
        if (canRedo) {
            setCheeseState(prevState => ({ ...prevState, index: prevState.index + 1 }));
        }
    };

    const handleHarmonize = async () => {
        if (!currentImage || !before) return;
        
        try {
            const beforeResponse = await fetch(before);
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
        } catch(error) {
             console.error("Harmonization failed:", error);
             alert("Harmonization failed. Please try again.");
        }
    };

    const handleClearSession = () => {
        if (window.confirm(t.confirmStartOver)) {
            setCheeseState({ before: null, history: [], index: -1 });
        }
    };

    if (isGenerating) {
        return (
            <div className="card">
                <LoadingSpinner messages={["Generating your instant smile...", "Applying a touch of magic...", "Almost ready to say cheese!"]} />
                {before && <img src={before} alt="Processing..." style={{width: '100%', borderRadius: 'var(--border-radius-card)', opacity: 0.5}}/>}
            </div>
        );
    }
    
    if (isRestoring && before && currentImage) {
        return (
            <div className="card">
                <ImageRestorer
                    beforeSrc={before}
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

    if (!before || !currentImage) {
        return (
            <div className="card">
                 <h2>{t.cheeseModeTitle}</h2>
                 <p>{t.cheeseModeDescription}</p>
                 <div className="drop-zone" onClick={() => fileInputRef.current?.click()}>
                     <input
                         type="file"
                         ref={fileInputRef}
                         accept="image/*"
                         onChange={(e) => {
                             if (e.target.files && e.target.files[0]) {
                                 onFileSelectForCheese(e.target.files[0]);
                             }
                             e.target.value = ''; // Reset to allow same file selection
                         }}
                         style={{ display: 'none' }}
                     />
                    <div className="drop-zone-prompt">
                        <UploadIcon style={{ marginBottom: '12px' }} />
                        <p><strong>{t.dropZonePromptClick}</strong></p>
                        <p className="drop-zone-text-small">Or go back to the home page to start again.</p>
                    </div>
                 </div>
            </div>
        );
    }
    
    return (
        <div className="card">
            <h2>{t.cheeseModeTitle} Result</h2>
            <div style={{marginTop: '20px'}}>
                <ComparisonSlider beforeSrc={before} afterSrc={currentImage} opacity={opacity} />
                 <div className="transparency-slider-container">
                    <label htmlFor="transparency-slider-cheese">{t.transparencyLabel}</label>
                    <input
                        id="transparency-slider-cheese"
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
                    <button onClick={() => { const a = document.createElement("a"); a.href = currentImage; a.download = "Hollywood_Smile_Cheese.png"; a.click(); }} className="icon-btn" title={t.downloadButton}><DownloadIcon /></button>
                    <button onClick={() => shareImage(currentImage, "Hollywood_Smile_Cheese.png")} className="icon-btn" title={t.shareButton}><ShareIcon /></button>
                    <button onClick={() => onAskDentist(currentImage)} className="icon-btn" title={t.askDentist}><HelpIcon /> {t.askDentist}</button>
                    <button onClick={handleClearSession} className="icon-btn secondary-btn" style={{ gridColumn: '1 / -1' }} title={t.startOver}><RestartIcon /> {t.startOver}</button>
                </div>
            </div>
            {ctaCard}
        </div>
    );
};

export default CheeseModeCard;