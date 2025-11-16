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

// --- Local Storage Session Management ---

const SESSION_KEY = 'liteModeSession';

// Session data is now limited to settings to prevent localStorage quota errors.
type LiteModeSession = {
    style: string;
    resolution: string;
};

const LiteModeCard = ({ onAskDentist, onImageGenerated, ctaCard, t }: { onAskDentist: (imageSrc: string) => void; onImageGenerated: (src: string, file: File | null) => void; ctaCard: React.ReactNode; t: { [key: string]: string } }) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [style, setStyle] = useState('hollywood');
    const [resolution, setResolution] = useState('1024');
    const [isLoading, setIsLoading] = useState(false);
    const [isHarmonizing, setIsHarmonizing] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [opacity, setOpacity] = useState(1);

    const [beforeImage, setBeforeImage] = useState<string | null>(null);
    // FIX: Renamed `history` to `historyStack` and `historyIndex` to `historyStackIndex` to avoid a name collision with the browser's global `History` object.
    const [historyStack, setHistoryStack] = useState<string[]>([]);
    const [historyStackIndex, setHistoryStackIndex] = useState(-1);
    
    const currentImage = historyStack[historyStackIndex];
    const canUndo = historyStackIndex > 0;
    const canRedo = historyStackIndex < historyStack.length - 1;

    // Effect to load session settings from localStorage on initial mount
    useEffect(() => {
        const loadSession = () => {
            try {
                const savedSessionJSON = localStorage.getItem(SESSION_KEY);
                if (!savedSessionJSON) return;

                const savedSession: LiteModeSession = JSON.parse(savedSessionJSON);
                
                // Only restore settings. User will need to re-upload their image.
                setStyle(savedSession.style);
                setResolution(savedSession.resolution);
            } catch (error) {
                console.error("Could not load Lite Mode session settings:", error);
                localStorage.removeItem(SESSION_KEY);
            }
        };
        loadSession();
    }, []);

    // Effect to save settings to localStorage whenever they change
    useEffect(() => {
        const saveSession = () => {
            // Only save settings if there's an active session (i.e., a file is loaded).
            if (!file) {
                localStorage.removeItem(SESSION_KEY);
                return;
            }
            try {
                const session: LiteModeSession = {
                    style,
                    resolution,
                };
                localStorage.setItem(SESSION_KEY, JSON.stringify(session));
            } catch (error) {
                // This is unlikely with the reduced data size, but it's good practice to have it.
                console.error("Could not save Lite Mode session settings:", error);
            }
        };
        
        const timeoutId = setTimeout(saveSession, 500); // Debounce to avoid excessive writes
        return () => clearTimeout(timeoutId);

    }, [file, style, resolution]);

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
        setIsLoading(false);
        setIsHarmonizing(false);
        setIsRestoring(false);
        setOpacity(1);
        setBeforeImage(null);
        setHistoryStack([]);
        setHistoryStackIndex(-1);
    };

    const handleClearSession = () => {
        if (window.confirm(t.confirmStartOver)) {
            localStorage.removeItem(SESSION_KEY);
            resetState();
        }
    };

    const handleFileSelect = (selectedFile: File | null) => {
        // Clear previous visual state when a new file is selected
        resetState();

        if (selectedFile) {
            if (!selectedFile.type.startsWith('image/')) {
                alert('Please select an image file (PNG, JPG, WEBP).');
                return;
            }
            if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
                alert('File size should not exceed 10MB.');
                return;
            }
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDraggingOver(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDraggingOver(false); };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDraggingOver(false);
        const droppedFile = e.dataTransfer.files && e.dataTransfer.files[0];
        handleFileSelect(droppedFile);
    };
    const triggerFileSelect = () => fileInputRef.current?.click();

    const updateHistory = (newImageSrc: string) => {
        const newHistoryStack = historyStack.slice(0, historyStackIndex + 1);
        setHistoryStack([...newHistoryStack, newImageSrc]);
        setHistoryStackIndex(newHistoryStack.length);
    };
    
    const handleUndo = () => canUndo && setHistoryStackIndex(historyStackIndex - 1);
    // FIX: The redo function was incorrectly passing a boolean to setHistoryStackIndex. It has been corrected to properly increment the index.
    const handleRedo = () => canRedo && setHistoryStackIndex(historyStackIndex + 1);

    const handleGenerate = async () => {
        if (!file) { alert("Please upload a photo first."); return; }
        
        const styleDescriptions: { [key: string]: string } = {
            'porcelain': 'Porcelain Ceramic with a BL1 shade',
            'hollywood': 'Hollywood Gloss with a BL2 shade',
            'translucent': 'Translucent Pearl with an A1 shade and natural incisal edge translucency',
            'subtle bleach': 'a Subtly bleached, natural white shade',
            'natural composite': 'Natural Composite with a B1 shade',
            'composite a2': 'Composite with an A2 shade',
            'corrective': 'Corrective Natural with a B2 shade, focusing on improving alignment and shape'
        };
        const styleDescription = styleDescriptions[style] || style;

        const prompt = `
ROLE: AI Dental Aesthetician.
TASK: Modify only the smile in the provided photo according to the specified style.
STYLE: ${styleDescription}.
CRITICAL INSTRUCTIONS:
1.  **Preserve Identity:** Do NOT alter the person's face, skin, hair, or background. The result must be the same person with a new smile.
2.  **Smile Modification:**
    *   Teeth should be realistic and anatomically correct.
    *   Gingiva (gums) should be a healthy pink color (e.g., #E88A8A) with approximately 4mm of vertical exposure.
3.  **Output:**
    *   Resolution: ${resolution}x${resolution} pixels.
    *   Format: One single, photorealistic PNG image.
`;

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
            // Convert beforeImage (blob URL) to base64
            const beforeResponse = await fetch(beforeImage);
            const beforeBlob = await beforeResponse.blob();
            const beforeFile = new File([beforeBlob], "original.png", { type: beforeBlob.type });
            const beforeBase64 = await toBase64(beforeFile);

            // Extract base64 from currentImage (data URL)
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
        }
    };

    const handleAskDentist = (imageSrc: string) => {
        onAskDentist(imageSrc);
    };

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

    const loadingMessages = [
        `Generating ${style} smile...`,
        'Applying realistic textures...',
        'Matching ambient lighting...',
        'Finalizing your new look...'
    ];

    return (
        <div className="card">
            <h2>{t.smartDesignMode}</h2>
            <p>{t.liteModeDescription}</p>
            <label>{t.uploadPhotoLabel}</label>
            <div 
                className={`drop-zone ${isDraggingOver ? 'dragging-over' : ''}`}
                onClick={triggerFileSelect}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input 
                    type="file" 
                    id="uploadInputLite" 
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
                        <p><strong>{t.dropZonePromptDrag}</strong></p>
                        <p className="drop-zone-text-small">{t.dropZoneOr}</p>
                        <p className="drop-zone-text-small">{t.dropZoneHint}</p>
                    </div>
                )}
            </div>

            <label htmlFor="styleSelect">{t.styleLabel}</label>
            <select id="styleSelect" value={style} onChange={(e) => setStyle(e.target.value)}>
                <option value="porcelain">{t.stylePorcelain}</option>
                <option value="hollywood">{t.styleHollywood}</option>
                <option value="translucent">{t.styleTranslucent}</option>
                <option value="subtle bleach">{t.styleSubtleBleach}</option>
                <option value="natural composite">{t.styleNaturalComposite}</option>
                <option value="composite a2">{t.styleCompositeA2}</option>
                <option value="corrective">{t.styleCorrective}</option>
            </select>
            <label htmlFor="resolutionSelect">{t.resolutionLabel}</label>
            <select id="resolutionSelect" value={resolution} onChange={(e) => setResolution(e.target.value)}>
                <option value="512">SD</option>
                <option value="1024">HD</option>
                <option value="2048">Ultra HD</option>
            </select>
            <button onClick={handleGenerate} className="generate-btn" disabled={isLoading || isHarmonizing || !file}>
                <MagicWandIcon />
                {isLoading ? t.generatingButton : t.generateButton}
            </button>
            
            {isLoading && <LoadingSpinner messages={loadingMessages} />}
            
            {currentImage && beforeImage && (
                <>
                    <div style={{marginTop: '20px'}}>
                        <ComparisonSlider beforeSrc={beforeImage} afterSrc={currentImage} opacity={opacity} />
                         <div className="transparency-slider-container">
                            <label htmlFor="transparency-slider-lite">{t.transparencyLabel}</label>
                            <input
                                id="transparency-slider-lite"
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
                            <button onClick={() => { const a = document.createElement("a"); a.href = currentImage; a.download = "Hollywood_Smile_Lite.png"; a.click(); }} className="icon-btn"><DownloadIcon /></button>
                            <button onClick={() => shareImage(currentImage, "Hollywood_Smile_Lite.png")} className="icon-btn"><ShareIcon /></button>
                            <button onClick={() => handleAskDentist(currentImage)} className="icon-btn"><HelpIcon /> {t.askDentist}</button>
                            <button onClick={handleClearSession} className="icon-btn secondary-btn" style={{gridColumn: '1 / -1'}}><RestartIcon /> {t.startOver}</button>
                        </div>
                    </div>
                    {ctaCard}
                </>
            )}
        </div>
    );
};

export default LiteModeCard;