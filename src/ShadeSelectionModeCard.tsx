import React, { useState, useRef, useEffect } from 'react';
import { analyzeImage } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

const ShadeSelectionModeCard = ({ t }: { t: { [key: string]: string } }) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<{ shade: string; rationale: string } | null>(null);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleFileSelect = (selectedFile: File | null) => {
        setAnalysisResult(null);
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
        } else {
            setFile(null);
            setPreviewUrl(null);
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

    const handleAnalyzeShade = async () => {
        if (!file) {
            alert("Please upload a photo of teeth first.");
            return;
        }
        setAnalysisResult(null);

        const prompt = `You are a highly specialized AI dental assistant with expertise in tooth shade matching. Your task is to analyze the provided close-up photograph of teeth and determine its shade based on the VITA Classical A1-D4 shade guide.

**Instructions:**
1.  **Analyze the Image:** Examine the central incisors in the image. Ignore any specular highlights or reflections from lighting.
2.  **Determine the Shade:** Identify the closest matching shade from the VITA shade guide (e.g., A1, A2, A3, A3.5, A4, B1, B2, B3, B4, C1, C2, C3, C4, D2, D3, D4).
3.  **Provide Rationale:** Briefly explain your choice. Mention factors like hue (A=reddish-brown, B=reddish-yellow, C=greyish, D=reddish-grey), chroma (color intensity, 1-4), and value (brightness).
4.  **Simulate Polarizing Filter:** Analyze the tooth color as if viewed through a cross-polarizing filter, which eliminates specular reflection and reveals the true internal color and characterization of the tooth.
5.  **Format the Output:** Return your analysis in a structured format. Respond ONLY with a JSON object with the following structure:
    {
      "shade": "string",
      "rationale": "string"
    }`;
        
        const resultString = await analyzeImage(prompt, file, 'gemini-2.5-pro', {}, setIsLoading);

        if (resultString) {
            try {
                const cleanedString = resultString.replace(/^```json\s*|```\s*$/g, '').trim();
                const resultJson = JSON.parse(cleanedString);
                if (resultJson.shade && resultJson.rationale) {
                    setAnalysisResult(resultJson);
                } else {
                    throw new Error("Parsed JSON is missing required 'shade' or 'rationale' keys.");
                }
            } catch (e) {
                console.error("Failed to parse shade analysis result:", e, "Raw response:", resultString);
                // Fallback: Display raw text if parsing fails
                setAnalysisResult({
                    shade: 'N/A',
                    rationale: `Could not automatically determine shade. The model responded:\n\n${resultString}`
                });
            }
        }
    };
    
    return (
        <div className="card">
            <h2>{t.aiShadeMatch}</h2>
            <p>Upload a close-up photo of teeth to automatically determine the VITA shade. For best results, use a photo taken in natural daylight without flash.</p>
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
            <button onClick={handleAnalyzeShade} className="generate-btn" disabled={isLoading || !file} style={{marginTop: '1rem'}}>
                {isLoading ? 'Analyzing...' : 'Analyze Shade'}
            </button>
            
            {isLoading && <LoadingSpinner text="Analyzing tooth shade..." />}
            
            {analysisResult && !isLoading && (
                <div className="shade-result-card">
                    <div className="shade-result-main">
                        <span className="shade-result-label">Detected Shade</span>
                        <span className="shade-result-value">{analysisResult.shade}</span>
                    </div>
                    <div className="shade-result-rationale">
                        <h4>Analysis</h4>
                        <p>{analysisResult.rationale}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShadeSelectionModeCard;