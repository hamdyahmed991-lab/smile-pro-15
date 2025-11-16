import React, { useState, useRef, useEffect, useCallback } from 'react';
import { generateImage, toBase64, shareImage, HARMONIZATION_PROMPT } from '../services/geminiService';
import ComparisonSlider from './ComparisonSlider';
import EyedropperIcon from './controls/icons/EyedropperIcon';
import LoadingSpinner from './LoadingSpinner';
import MagicWandIcon from './controls/icons/MagicWandIcon';
import DownloadIcon from './controls/icons/DownloadIcon';
import ShareIcon from './controls/icons/ShareIcon';

const ProsthodonticModeCard = ({ ctaCard, t }: { ctaCard: React.ReactNode; t: { [key: string]: string } }) => {
    type LocationsState = { implants: Array<{ x: number; y: number }>, abutments: Array<{ x: number; y: number }> };

    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [treatmentType, setTreatmentType] = useState('dental implant prosthesis');
    
    // Marker State
    const [implantLocations, setImplantLocations] = useState<Array<{ x: number, y: number }>>([]);
    const [abutmentLocations, setAbutmentLocations] = useState<Array<{ x: number, y: number }>>([]);
    
    // History State for Undo/Redo
    const [historyStack, setHistoryStack] = useState<LocationsState[]>([{ implants: [], abutments: [] }]);
    const [historyStackIndex, setHistoryStackIndex] = useState(0);

    const [implantMaterial, setImplantMaterial] = useState('Zirconia Crown');
    const [isDropperActive, setIsDropperActive] = useState(false);
    const [pickedColor, setPickedColor] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isHarmonizing, setIsHarmonizing] = useState(false);
    const [beforeImage, setBeforeImage] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [opacity, setOpacity] = useState(1);
    
    // Dragging State
    const [draggingDot, setDraggingDot] = useState<{ type: 'implant' | 'abutment', index: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);
    
    const canUndo = historyStackIndex > 0;
    const canRedo = historyStackIndex < historyStack.length - 1;

    // --- History Management ---
    
    const updateHistory = useCallback((newLocations: LocationsState) => {
        const newHistory = historyStack.slice(0, historyStackIndex + 1);
        setHistoryStack([...newHistory, newLocations]);
        setHistoryStackIndex(newHistory.length);
    }, [historyStack, historyStackIndex]);

    // Syncs working state when history changes (undo/redo)
    useEffect(() => {
        const currentState = historyStack[historyStackIndex];
        if (currentState) {
            setImplantLocations(currentState.implants);
            setAbutmentLocations(currentState.abutments);
        }
    }, [historyStack, historyStackIndex]);

    const handleUndo = () => canUndo && setHistoryStackIndex(historyStackIndex - 1);
    const handleRedo = () => canRedo && setHistoryStackIndex(historyStackIndex + 1);
    
    // --- File & UI Handlers ---

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    // This effect updates history after a drag operation is finished
    useEffect(() => {
        if (!isDragging && draggingDot) {
            updateHistory({ implants: implantLocations, abutments: abutmentLocations });
            setDraggingDot(null);
        }
    }, [isDragging, implantLocations, abutmentLocations, draggingDot, updateHistory]);

    // This effect handles the event listeners for dragging
    useEffect(() => {
        const handleDragMove = (e: MouseEvent | TouchEvent) => {
            if (!draggingDot || !imageContainerRef.current) return;

            const rect = imageContainerRef.current.getBoundingClientRect();
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

            let x = clientX - rect.left;
            let y = clientY - rect.top;

            x = Math.max(0, Math.min(x, rect.width));
            y = Math.max(0, Math.min(y, rect.height));

            const newRelativeX = x / rect.width;
            const newRelativeY = y / rect.height;

            const updater = (prev: Array<{x: number, y: number}>) => {
                const newLocations = [...prev];
                if (newLocations[draggingDot.index]) {
                    newLocations[draggingDot.index] = { x: newRelativeX, y: newRelativeY };
                }
                return newLocations;
            };

            if (draggingDot.type === 'implant') {
                setImplantLocations(updater);
            } else {
                setAbutmentLocations(updater);
            }
        };

        const handleDragEnd = () => {
            setIsDragging(false);
        };

        if (draggingDot && isDragging) {
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('touchmove', handleDragMove);
            window.addEventListener('mouseup', handleDragEnd);
            window.addEventListener('touchend', handleDragEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('touchmove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
            window.removeEventListener('touchend', handleDragEnd);
        };
    }, [draggingDot, isDragging]);


    const handleFileSelect = (selectedFile: File | null) => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        // Reset everything on new file
        setHistoryStack([{ implants: [], abutments: [] }]);
        setHistoryStackIndex(0);
        setImplantLocations([]);
        setAbutmentLocations([]);
        setPickedColor(null);
        setImplantMaterial('Zirconia Crown');

        if (selectedFile) {
            setFile(selectedFile);
            const url = URL.createObjectURL(selectedFile);
            setPreviewUrl(url);
            setBeforeImage(url);
            setResultImage(null);
        } else {
            setFile(null);
            setPreviewUrl(null);
            setBeforeImage(null);
        }
    };

    const triggerFileSelect = () => fileInputRef.current?.click();
    
    const rgbToHex = (r: number, g: number, b: number) => {
        const toHex = (c: number) => `0${c.toString(16)}`.slice(-2);
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };

    const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!previewUrl || !file || isDragging) return;

        const containerRect = e.currentTarget.getBoundingClientRect();
        
        const img = new Image();
        img.src = previewUrl;
        img.onload = () => {
            const containerWidth = containerRect.width;
            const containerHeight = containerRect.height;
            const naturalWidth = img.naturalWidth;
            const naturalHeight = img.naturalHeight;

            const containerRatio = containerWidth / containerHeight;
            const imageRatio = naturalWidth / naturalHeight;

            let renderedWidth, renderedHeight, offsetX = 0, offsetY = 0;
            
            // This logic mirrors CSS `object-fit: cover`
            if (imageRatio > containerRatio) { // Image is wider than container, height fits, width is cropped
                renderedHeight = containerHeight;
                renderedWidth = naturalWidth * (containerHeight / naturalHeight);
                offsetX = (renderedWidth - containerWidth) / 2;
            } else { // Image is taller (or same ratio) as container, width fits, height is cropped
                renderedWidth = containerWidth;
                renderedHeight = naturalHeight * (containerWidth / naturalWidth);
                offsetY = (renderedHeight - containerHeight) / 2;
            }

            const clickX = e.clientX - containerRect.left;
            const clickY = e.clientY - containerRect.top;

            // Calculate click position relative to the actual, rendered image (not the container)
            const imageX = clickX + offsetX;
            const imageY = clickY + offsetY;

            // Calculate final percentage based on the scaled image dimensions
            const relativeX = imageX / renderedWidth;
            const relativeY = imageY / renderedHeight;
            
            // Clamp values between 0 and 1 to be safe
            const finalX = Math.max(0, Math.min(1, relativeX));
            const finalY = Math.max(0, Math.min(1, relativeY));

            if (isDropperActive) {
                const canvas = document.createElement('canvas');
                canvas.width = naturalWidth;
                canvas.height = naturalHeight;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                
                ctx.drawImage(img, 0, 0);
                const canvasX = Math.floor(finalX * naturalWidth);
                const canvasY = Math.floor(finalY * naturalHeight);
                const pixelData = ctx.getImageData(canvasX, canvasY, 1, 1).data;
                const hex = rgbToHex(pixelData[0], pixelData[1], pixelData[2]);
                
                setPickedColor(hex);
                setImplantMaterial('Match Existing');
                setIsDropperActive(false);
            } else if (treatmentType === 'dental implant prosthesis') {
                const newImplants = [...implantLocations, { x: finalX, y: finalY }];
                setImplantLocations(newImplants);
                updateHistory({ implants: newImplants, abutments: abutmentLocations });
            } else if (treatmentType === 'Implant Abutment') {
                const newAbutments = [...abutmentLocations, { x: finalX, y: finalY }];
                setAbutmentLocations(newAbutments);
                updateHistory({ implants: implantLocations, abutments: newAbutments });
            }
        };
    };

    const handleDragStart = (e: React.MouseEvent | React.TouchEvent, type: 'implant' | 'abutment', index: number) => {
        e.stopPropagation();
        setDraggingDot({ type, index });
        setIsDragging(true);
    };
    
    const handleClearMarkers = () => {
        if (implantLocations.length > 0 || abutmentLocations.length > 0) {
            const clearedState: LocationsState = { implants: [], abutments: [] };
            setImplantLocations([]);
            setAbutmentLocations([]);
            updateHistory(clearedState);
        }
    };

    const getImageWithDots = async (file: File, implantLocations: Array<{ x: number, y: number }>, abutmentLocations: Array<{ x: number, y: number }>): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    URL.revokeObjectURL(img.src);
                    return reject(new Error('Could not get canvas context'));
                }

                // Draw the original image first
                ctx.drawImage(img, 0, 0);

                // Then draw the dots on top
                implantLocations.forEach(coords => {
                    const dotX = coords.x * img.naturalWidth;
                    const dotY = coords.y * img.naturalHeight;
                    ctx.beginPath();
                    ctx.arc(dotX, dotY, img.naturalWidth * 0.015, 0, 2 * Math.PI, false); // Relative dot size
                    ctx.fillStyle = 'red';
                    ctx.fill();
                    ctx.lineWidth = img.naturalWidth * 0.005; // Relative border size
                    ctx.strokeStyle = 'white';
                    ctx.stroke();
                });

                abutmentLocations.forEach(coords => {
                    const dotX = coords.x * img.naturalWidth;
                    const dotY = coords.y * img.naturalHeight;
                    ctx.beginPath();
                    ctx.arc(dotX, dotY, img.naturalWidth * 0.015, 0, 2 * Math.PI, false);
                    ctx.fillStyle = 'black';
                    ctx.fill();
                    ctx.lineWidth = img.naturalWidth * 0.005;
                    ctx.strokeStyle = 'white';
                    ctx.stroke();
                });
                
                resolve(canvas.toDataURL('image/png').split(',')[1]);
                URL.revokeObjectURL(img.src);
            };
            img.onerror = (err) => {
                URL.revokeObjectURL(img.src);
                reject(err);
            };
        });
    };

    const handleGenerate = async () => {
        if (!file) {
            alert("Please upload a patient's photo first.");
            return;
        }
        if (implantLocations.length === 0 && abutmentLocations.length === 0) {
            alert("Please click on the photo to mark implant or abutment positions.");
            return;
        }

        const implantCount = implantLocations.length;
        const abutmentCount = abutmentLocations.length;

        let crownMaterialPrompt = '';
        if (implantCount > 0) {
            if (implantMaterial === 'Match Existing' && pickedColor) {
                crownMaterialPrompt = `The crowns must match color ${pickedColor}.`;
            } else if (implantMaterial === 'Zirconia Crown') {
                crownMaterialPrompt = 'Render monolithic zirconia crowns with natural translucency.';
            } else if (implantMaterial === 'Porcelain-fused-to-Titanium') {
                crownMaterialPrompt = 'Render porcelain crowns with a subtle greyish hue at the gumline.';
            }
        }
        
        const prompt = `
**TASK:** You are a photorealistic dental simulation expert. Modify the provided image according to the visual markers.

**INSTRUCTIONS:**
- You will see an image with colored dots on it.
- **RED DOTS (${implantCount}):** At the exact location of each RED dot, replace the existing tooth with a single, realistic ${implantMaterial}. ${crownMaterialPrompt}
- **BLACK DOTS (${abutmentCount}):** At the exact location of each BLACK dot, replace the existing tooth with a single, polished titanium implant abutment.

**CRITICAL RULES:**
1.  **PRESERVE IDENTITY:** Do NOT change the person's face, skin, lips, or anything other than the teeth at the marked locations.
2.  **NO BRIDGING:** Do NOT modify the natural teeth located between the dots. Each dot is a separate, isolated instruction.
3.  **CLEANUP:** The colored dots MUST be removed in the final output image. The final image should be clean with only the dental modifications visible.
4.  **ACCURACY:** The modifications must be precisely at the marker locations.

Generate the final, modified image. It must contain exactly ${implantCount} new crowns and ${abutmentCount} new abutments.
`;
        
        setIsLoading(true);
        try {
            const imageWithDotsBase64 = await getImageWithDots(file, implantLocations, abutmentLocations);
    
            const imageParts = [
                { inlineData: { data: imageWithDotsBase64, mimeType: "image/png" } }
            ];
            
            const generatedSrc = await generateImage(prompt, imageParts, setIsLoading);
    
            if (generatedSrc) {
                setResultImage(generatedSrc);
            }
        } catch (error) {
            console.error("Error generating image:", error);
            alert("An error occurred during image generation.");
            setIsLoading(false);
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

    const totalMarkers = implantLocations.length + abutmentLocations.length;
    let overlayText = t.overlayTextDefault;
    if (treatmentType === 'dental implant prosthesis') {
        overlayText = t.overlayTextImplant;
    } else if (treatmentType === 'Implant Abutment') {
        overlayText = t.overlayTextAbutment;
    }
    
    return (
        <div className="card">
            <h2>{t.prosthodonticSimulation}</h2>
            <p>{t.prosthoCardDescription}</p>

            <label>{t.prosthoUploadLabel}</label>
             <div 
                ref={imageContainerRef}
                className={`drop-zone interactive-image-container ${previewUrl ? 'has-image' : ''}`}
                onClick={previewUrl ? handleImageClick : triggerFileSelect}
                style={{ cursor: isDropperActive ? 'copy' : (isDragging ? 'grabbing' : (previewUrl ? 'crosshair' : 'pointer')) }}
            >
                <input 
                    type="file" 
                    ref={fileInputRef}
                    accept="image/*" 
                    onChange={(e) => handleFileSelect(e.target.files ? e.target.files[0] : null)}
                    style={{ display: 'none' }}
                />
                {previewUrl ? (
                    <>
                        <img src={previewUrl} alt="Preview" className="drop-zone-preview" />
                         {implantLocations.map((coords, index) => (
                            <div 
                                key={`implant-${index}`}
                                className="implant-dot" 
                                style={{ 
                                    left: `${coords.x * 100}%`, 
                                    top: `${coords.y * 100}%` 
                                }}
                                onMouseDown={(e) => handleDragStart(e, 'implant', index)}
                                onTouchStart={(e) => handleDragStart(e, 'implant', index)}
                            ></div>
                        ))}
                        {abutmentLocations.map((coords, index) => (
                            <div 
                                key={`abutment-${index}`}
                                className="abutment-dot"
                                style={{ 
                                    left: `${coords.x * 100}%`, 
                                    top: `${coords.y * 100}%`
                                }}
                                onMouseDown={(e) => handleDragStart(e, 'abutment', index)}
                                onTouchStart={(e) => handleDragStart(e, 'abutment', index)}
                            ></div>
                        ))}
                        {totalMarkers === 0 && !isDropperActive && (
                            <div className="image-prompt-overlay">
                                <span>{overlayText}</span>
                                <svg className="prompt-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 5v14m0 0-7-7m7 7 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        )}
                        {isDropperActive && <div className="image-prompt-overlay" style={{opacity: 1, backdropFilter: 'blur(2px)'}}>{t.eyedropperPrompt}</div>}
                    </>
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

            {(totalMarkers > 0 || canUndo) && (
                <div className="action-buttons" style={{marginTop: '1rem'}}>
                    <button onClick={handleUndo} disabled={!canUndo} title={t.undoButton}>↩️ {t.undoButton}</button>
                    <button onClick={handleRedo} disabled={!canRedo} title={t.redoButton}>↪️ {t.redoButton}</button>
                    <button onClick={handleClearMarkers} style={{flexGrow: 2}} disabled={totalMarkers === 0}>
                        {t.clearMarkersButton.replace('{count}', totalMarkers.toString())}
                    </button>
                </div>
            )}

            <label style={{marginTop: (totalMarkers > 0 || canUndo) ? '0' : '1rem'}}>{t.prosthoDetectPlaceLabel}</label>
            <select value={treatmentType} onChange={(e) => setTreatmentType(e.target.value)}>
                <option value="dental implant prosthesis">{t.prosthoOptionImplant}</option>
                <option value="Implant Abutment">{t.prosthoOptionAbutment}</option>
            </select>

            {treatmentType === 'dental implant prosthesis' && (
                <>
                    <label htmlFor="implantMaterial">{t.prosthoCrownMaterialLabel}</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '1rem' }}>
                        <select 
                            id="implantMaterial" 
                            value={implantMaterial} 
                            onChange={(e) => setImplantMaterial(e.target.value)} 
                            style={{ flexGrow: 1 }}
                        >
                            <option value="Zirconia Crown">{t.prosthoMaterialZirconia}</option>
                            <option value="Porcelain-fused-to-Titanium">{t.prosthoMaterialPFT}</option>
                            {pickedColor && <option value="Match Existing">{t.prosthoMaterialMatch.replace('{color}', pickedColor)}</option>}
                        </select>
                         <button 
                            onClick={() => setIsDropperActive(!isDropperActive)} 
                            title={isDropperActive ? t.eyedropperCancelTitle : t.eyedropperTitle}
                            disabled={!file}
                            style={{ 
                                padding: '12px', 
                                flexShrink: 0, 
                                backgroundColor: isDropperActive ? 'var(--primary-color-dark)' : 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid',
                                borderColor: isDropperActive ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.2)',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <EyedropperIcon />
                        </button>
                        {pickedColor && !isDropperActive && <div title={`Picked Color: ${pickedColor}`} style={{ width: '30px', height: '30px', backgroundColor: pickedColor, borderRadius: '50%', border: '2px solid white', flexShrink: 0, boxShadow: '0 0 5px rgba(0,0,0,0.5)' }}></div>}
                    </div>
                </>
            )}

            <button onClick={handleGenerate} className="generate-btn" disabled={isLoading || isHarmonizing || !file}>
                <MagicWandIcon />
                {isLoading ? t.generatingButton : t.generateSimulationButton}
            </button>

            {isLoading && <LoadingSpinner text="Generating Simulation..." />}

            {beforeImage && resultImage && !isLoading && (
                 <>
                    <div style={{marginTop: '20px'}}>
                        <ComparisonSlider beforeSrc={beforeImage} afterSrc={resultImage} opacity={opacity} />
                         <div className="transparency-slider-container">
                            <label htmlFor="transparency-slider-prostho">{t.transparencyLabel}</label>
                            <input
                                id="transparency-slider-prostho"
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
                            <button onClick={() => { const a = document.createElement("a"); a.href = resultImage; a.download = "Prosthodontic_Simulation.png"; a.click(); }} className="icon-btn"><DownloadIcon/></button>
                            <button onClick={() => shareImage(resultImage, "Prosthodontic_Simulation.png")} className="icon-btn"><ShareIcon/></button>
                        </div>
                    </div>
                    {ctaCard}
                 </>
            )}
        </div>
    );
};

export default ProsthodonticModeCard;