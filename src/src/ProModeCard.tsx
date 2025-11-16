import React, { useState, useRef, useEffect, useCallback } from 'react';
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

const ProModeCard = ({ onAskDentist, onImageGenerated, ctaCard, t }: { onAskDentist: (imageSrc: string) => void; onImageGenerated: (src: string, file: File | null) => void; ctaCard: React.ReactNode; t: { [key: string]: string } }) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [smileStyle, setSmileStyle] = useState('Hollywood Gloss');
    const [toothShape, setToothShape] = useState('Natural');
    const [surfaceTexture, setSurfaceTexture] = useState('Smooth Enamel');
    const [selectedShade, setSelectedShade] = useState('A1');
    const [toothWear, setToothWear] = useState(0);
    const [selectedGum, setSelectedGum] = useState('G3');
    const [gumShape, setGumShape] = useState('Natural Arch');
    const [gumExposure, setGumExposure] = useState(50);
    const [lipThickness, setLipThickness] = useState(0);
    const [finishingTouch, setFinishingTouch] = useState<string | null>(null);
    const [resolution, setResolution] = useState('1024');
    const [isLoading, setIsLoading] = useState(false);
    const [isHarmonizing, setIsHarmonizing] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [opacity, setOpacity] = useState(1);

    const [beforeImage, setBeforeImage] = useState<string | null>(null);
    const [historyStack, setHistoryStack] = useState<string[]>([]);
    const [historyStackIndex, setHistoryStackIndex] = useState(-1);

    const toothShades = ['BL1','BL2','A1','A2','A3','B1','B2','B3','C1','C2','D2'];
    const gingivaShades = ['G1','G2','G3','G4','G5','G6','G7','G8'];
    
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
        setIsLoading(false);
        setIsHarmonizing(false);
        setIsRestoring(false);
        setOpacity(1);
        setBeforeImage(null);
        setHistoryStack([]);
        setHistoryStackIndex(-1);
        setLipThickness(0);
    };

    const handleFileSelect = (selectedFile: File | null) => {
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
            const url = URL.createObjectURL(selectedFile);
            setPreviewUrl(url);
            setBeforeImage(url);
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
    const handleRedo = () => canRedo && setHistoryStackIndex(historyStackIndex + 1);

    const handleGenerate = async () => {
        if (!file) { alert("Please upload a photo first."); return; }
        
        let finishingTouchPrompt = 'None.';
        if (finishingTouch) {
            switch (finishingTouch) {
                case 'Bleaching':
                    finishingTouchPrompt = 'Apply a professional bleaching effect for a brilliant, natural-looking white.';
                    break;
                case 'Polishing':
                    finishingTouchPrompt = 'Give the teeth a high-gloss, polished finish with beautiful light reflection.';
                    break;
                case 'Composite':
                    finishingTouchPrompt = 'Apply a subtle composite bonding effect to perfect shapes and surfaces flawlessly.';
                    break;
            }
        }

       const prompt = `
ROLE: World-class dental aesthetic AI.
TASK: Generate a hyper-realistic smile simulation.
PRIMARY DIRECTIVE: Preserve the subject's core identity. Do NOT alter facial structure, skin, or hair, EXCEPT for the lips as specified. Modify ONLY the teeth, gums, and lips as specified. The result must look like a realistic, high-end dental procedure performed on the original person.

AESTHETIC SPECIFICATIONS:
- Smile Style: ${smileStyle}
- Tooth Shape: ${toothShape}
- Tooth Shade (VITA Standard): ${selectedShade}
- Tooth Surface Texture: ${surfaceTexture}
- Tooth Wear / Attrition: ${toothWear}% (0% is pristine, 100% is significant flattening).
- Gingiva (Gum) Shade: ${selectedGum}
- Gingiva (Gum) Contour/Shape: ${gumShape}
- Gum Exposure (Vertical Position): ${gumExposure}%
- Lip Fullness Adjustment: ${lipThickness}% (-30% is thinner, 0% is original, 30% is fuller).
- Finishing Effect: ${finishingTouchPrompt}
- Resolution: ${resolution}x${resolution}

FINAL INSTRUCTION: Synthesize all parameters into a single, cohesive, photorealistic PNG image.
`;

        const base64 = await toBase64(file);
        const imageParts = [{ inlineData: { data: base64, mimeType: file.type || "image/png" } }];
        const resultSrc = await generateImage(prompt, imageParts, setIsLoading);
        if (resultSrc) {
            onImageGenerated(resultSrc, file);
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
    
    const loadingMessages = [
        'Crafting your custom smile design...',
        'Adjusting tooth shapes and shades...',
        'Perfecting gum contours...',
        'Applying final polish...'
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
        <h2>{t.advancedDesignStudio}</h2>
        <p>{t.proModeDescription}</p>
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
                id="uploadInputPro" 
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
                </div>
            )}
        </div>
        
        <h3>{t.smileToothDesignLabel}</h3>
        <label htmlFor="smileStylePro">{t.smileStyleLabel}</label>
        <select id="smileStylePro" value={smileStyle} onChange={(e) => setSmileStyle(e.target.value)}>
          <option>Natural White</option>
          <option>Hollywood Gloss</option>
          <option>Youthful Curve</option>
          <option>Balanced Aesthetic</option>
          <option>Celebrity Glamour</option>
          <option>Acrylic Denture</option>
          <option>Porcelain Veneer</option>
          <option>E-Max Veneer</option>
          <option>Zirconia Crown</option>
          <option>Metal Gold</option>
          <option>Snap-On Smile</option>
        </select>
        <label htmlFor="toothShapePro">{t.toothShapeLabel}</label>
        <select id="toothShapePro" value={toothShape} onChange={(e) => setToothShape(e.target.value)}>
            <option>Natural</option>
            <option>Ovoid</option>
            <option>Tapered</option>
            <option>Square-Round</option>
            <option>Bold</option>
        </select>
        <label htmlFor="surfaceTexturePro">{t.toothSurfaceTextureLabel}</label>
        <select id="surfaceTexturePro" value={surfaceTexture} onChange={(e) => setSurfaceTexture(e.target.value)}>
            <option>Smooth Enamel</option>
            <option>Subtle Natural Texture</option>
            <option>High Gloss Polish</option>
            <option>Matte Finish</option>
        </select>
        <label>{t.toothShadeLabel}</label>
        <div className="shade-selector">
          {toothShades.map(shade => <button key={shade} className={selectedShade === shade ? 'selected' : ''} onClick={() => setSelectedShade(shade)}>{shade}</button>)}
        </div>
        <label htmlFor="toothWear">{t.toothWearLabel.replace('{wear}', toothWear.toString())}</label>
        <input type="range" id="toothWear" min="0" max="100" value={toothWear} onChange={(e) => setToothWear(Number(e.target.value))} />

        <h3>{t.gumGingivaDetailsLabel}</h3>
        <label>{t.gingivaShadeLabel}</label>
        <div className="shade-selector">
          {gingivaShades.map(shade => <button key={shade} className={selectedGum === shade ? 'selected' : ''} onClick={() => setSelectedGum(shade)}>{shade}</button>)}
        </div>
        <label htmlFor="gumShapePro">{t.gumShapeLabel}</label>
        <select id="gumShapePro" value={gumShape} onChange={(e) => setGumShape(e.target.value)}>
            <option>Natural Arch</option>
            <option>High Smile Line</option>
            <option>Low Smile Line</option>
            <option>Even/Flat Line</option>
        </select>
        <label htmlFor="gumExposure">{t.gumExposureLabel.replace('{exposure}', gumExposure.toString())}</label>
        <input type="range" id="gumExposure" min="0" max="100" value={gumExposure} onChange={(e) => setGumExposure(Number(e.target.value))} />
        <label htmlFor="lipThickness">{t.lipThicknessLabel.replace('{thickness}', lipThickness.toString())}</label>
        <input 
            type="range" 
            id="lipThickness" 
            min="-30" 
            max="30" 
            value={lipThickness} 
            onChange={(e) => setLipThickness(Number(e.target.value))}
            title="Adjusts the fullness of the lips. Negative values make them thinner, positive values make them fuller."
        />
        
        <h3>{t.finalPolishLabel}</h3>
        <label>{t.finishingTouchesLabel}</label>
        <div className="finishing-touch-selector">
          <button className={finishingTouch === 'Bleaching' ? 'selected' : ''} onClick={() => setFinishingTouch(finishingTouch === 'Bleaching' ? null : 'Bleaching')}>Bleaching</button>
          <button className={finishingTouch === 'Polishing' ? 'selected' : ''} onClick={() => setFinishingTouch(finishingTouch === 'Polishing' ? null : 'Polishing')}>Polishing</button>
          <button className={finishingTouch === 'Composite' ? 'selected' : ''} onClick={() => setFinishingTouch(finishingTouch === 'Composite' ? null : 'Composite')}>Composite</button>
        </div>
        <label htmlFor="resolutionPro">{t.resolutionProLabel}</label>
        <select id="resolutionPro" value={resolution} onChange={(e) => setResolution(e.target.value)}>
          <option value="512">SD</option>
          <option value="1024">HD</option>
          <option value="2048">Ultra HD</option>
        </select>
        <button onClick={handleGenerate} className="generate-btn" disabled={isLoading || isHarmonizing || !file}>
            <MagicWandIcon/>
            {isLoading ? t.generatingButton : t.generateButton}
        </button>
        
        {isLoading && <LoadingSpinner messages={loadingMessages} />}

        {currentImage && beforeImage && (
            <>
                <div style={{marginTop: '20px'}}>
                    <ComparisonSlider beforeSrc={beforeImage} afterSrc={currentImage} opacity={opacity} />
                    <div className="transparency-slider-container">
                        <label htmlFor="transparency-slider-pro">{t.transparencyLabel}</label>
                        <input
                            id="transparency-slider-pro"
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={opacity}
                            onChange={(e) => setOpacity(parseFloat(e.target.value))}
                        />
                    </div>
                    <div className="action-buttons">
                        <button onClick={handleUndo} className="icon-btn" disabled={!canUndo} title={t.undoButton}><UndoIcon/> {t.undoButton}</button>
                        <button onClick={handleRedo} className="icon-btn" disabled={!canRedo} title={t.redoButton}><RedoIcon/> {t.redoButton}</button>
                        <button onClick={handleHarmonize} className="icon-btn" disabled={isHarmonizing}>
                            <MagicWandIcon />
                            {isHarmonizing ? t.harmonizingButton : t.harmonizeButton}
                        </button>
                        <button onClick={() => setIsRestoring(true)} className="icon-btn" disabled={isHarmonizing}><BrushIcon/> {t.restoreButton}</button>
                        <button onClick={() => { const a = document.createElement("a"); a.href = currentImage; a.download = "Hollywood_Smile_Pro.png"; a.click(); }} className="icon-btn"><DownloadIcon/></button>
                        <button onClick={() => shareImage(currentImage, "Hollywood_Smile_Pro.png")} className="icon-btn"><ShareIcon/></button>
                        <button onClick={() => onAskDentist(currentImage)} className="icon-btn"><HelpIcon /> {t.askDentist}</button>
                        <button onClick={resetState} className="icon-btn secondary-btn" style={{gridColumn: '1 / -1'}}><RestartIcon/> {t.startOver}</button>
                    </div>
                </div>
                {ctaCard}
            </>
        )}
      </div>
    );
};

export default ProModeCard;