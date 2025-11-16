import React, { useState, useRef, useEffect } from 'react';
import { generateImage, generateImageAndText, analyzeImage, toBase64, shareImage } from '../services/geminiService';
import ComparisonSlider from './ComparisonSlider';
import LoadingSpinner from './LoadingSpinner';

const AIEditModeCard = ({ ctaCard }: { ctaCard: React.ReactNode }) => {
    type AITool = 'visualizer' | 'generator';
    const [activeTool, setActiveTool] = useState<AITool>('visualizer');

    // --- Visualizer States ---
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingTool, setLoadingTool] = useState<'contour' | 'outline' | 'hollywood' | 'aesthetic' | null>(null);
    const [activeResult, setActiveResult] = useState<'contour' | 'outline' | 'hollywood' | 'aesthetic' | null>(null);
    
    // Result states
    const [analysisResultImage, setAnalysisResultImage] = useState<string | null>(null);
    const [analysisResultText, setAnalysisResultText] = useState<string | null>(null);
    const [blackOutlineLayer, setBlackOutlineLayer] = useState<string | null>(null);
    const [blueOutlineLayer, setBlueOutlineLayer] = useState<string | null>(null);
    const [showBlackLayer, setShowBlackLayer] = useState(true);
    const [showBlueLayer, setShowBlueLayer] = useState(true);
    const [aestheticAnalysisResultText, setAestheticAnalysisResultText] = useState<string | null>(null);

    // --- Generator States ---
    const [generatorPrompt, setGeneratorPrompt] = useState('');
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    // --- Visualizer Handlers ---
    const handleFileSelect = (selectedFile: File | null) => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setAnalysisResultImage(null);
        setAnalysisResultText(null);
        setBlackOutlineLayer(null);
        setBlueOutlineLayer(null);
        setAestheticAnalysisResultText(null);
        setActiveResult(null);
        setFile(selectedFile);
        if (selectedFile) {
            setPreviewUrl(URL.createObjectURL(selectedFile));
        } else {
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

    const handleMakeHollywoodSmile = async () => {
        if (!file) {
            alert("Please upload an image first.");
            return;
        }
        setAnalysisResultImage(null);
        setAnalysisResultText(null);
        setBlackOutlineLayer(null);
        setBlueOutlineLayer(null);
        setAestheticAnalysisResultText(null);
        setActiveResult('hollywood');
        setLoadingTool('hollywood');
        
        const prompt = "Transform the smile in this photo into a perfect, photorealistic 'Hollywood Smile'. Preserve the person's identity, facial structure, and lighting. Only modify the teeth and gums.";
        const base64 = await toBase64(file);
        const imagePart = { inlineData: { data: base64, mimeType: file.type } };
        
        const image = await generateImage(prompt, [imagePart], setIsLoading);

        setAnalysisResultImage(image);
        setLoadingTool(null);
    };

    const handleAestheticAnalysis = async () => {
        if (!file) {
            alert("Please upload an image first.");
            return;
        }
        setAnalysisResultImage(null);
        setAnalysisResultText(null);
        setBlackOutlineLayer(null);
        setBlueOutlineLayer(null);
        setAestheticAnalysisResultText(null);
        setActiveResult('aesthetic');
        setLoadingTool('aesthetic');

        const prompt = `You are “Smile Aesthetic Analyst GPT” — a professional digital aesthetics expert specializing in smile evaluation and facial harmony.

Your primary task is to analyze smiles in uploaded photos and provide detailed, constructive aesthetic feedback.

### Core Objectives:
- Evaluate the smile’s **aesthetic quality** based on professional photography and cosmetic standards.
- Focus strictly on **visual and artistic criteria** — never on medical, dental, or diagnostic issues.
- Deliver insights that help users understand the strengths and improvement areas of their smile presentation.

### Analysis Framework:
For each image provided, follow these steps:

1. **Initial Impression**
   - Give a concise, elegant summary of your first visual impression (tone: encouraging and aesthetic).

2. **Detailed Breakdown**
   Evaluate and comment on:
   - **Smile Symmetry:** Balance of left and right sides, proportionality of corners.
   - **Tooth Display:** Visibility, shape consistency, and natural spacing.
   - **Gum Exposure:** Amount shown during smiling, evenness of gum line.
   - **Lip Contour & Arc:** Curve, thickness, and relation to teeth visibility.
   - **Color & Contrast:** Brightness of teeth vs. skin tone and lips.
   - **Overall Harmony:** How well the smile integrates with facial features.

3. **Aesthetic Rating**
   - Rate the overall aesthetic harmony of the smile from **1 (needs improvement)** to **10 (excellent harmony)**.

4. **Professional Suggestions**
   - Provide **clear, non-medical suggestions** to enhance smile presentation (e.g., “adjust lighting,” “try a softer smile angle,” “consider whitening for photographic balance”).

5. **Quality Check**
   - If the image is blurry, low-resolution, or obstructed, politely explain how to improve the photo for better analysis.

### Communication Style:
- Always positive, professional, and empathetic.
- Avoid judgmental or overly clinical language.
- Begin by highlighting at least one positive feature before suggesting improvements.`;
        
        const textResult = await analyzeImage(prompt, file, 'gemini-2.5-pro', {}, setIsLoading);
        
        setAestheticAnalysisResultText(textResult);
        setLoadingTool(null);
    };
    
    const handleGenerateContour = async () => {
        if (!file) {
            alert("Please upload an image first.");
            return;
        }
        setAnalysisResultImage(null);
        setAnalysisResultText(null);
        setBlackOutlineLayer(null);
        setBlueOutlineLayer(null);
        setAestheticAnalysisResultText(null);
        setActiveResult('contour');
        setLoadingTool('contour');
        
        const prompt = `You are an expert AI visualizer for smile aesthetics.
Task:
1. Analyze the uploaded facial image.
2. Detect the current teeth contour (the person’s real teeth outline).
3. Generate an ideal “Hollywood smile” outline — symmetrical, bright, and harmonized with the facial proportions, based on the golden ratio.
4. On the same image:
   - Draw the **old (current) teeth outline in black**.
   - Draw the **new (Hollywood) teeth outline in blue**.
5. Ensure both outlines align precisely with the facial geometry.
6. Maintain realistic proportions and preserve all facial features.
7. Output the final image with both outlines clearly visible.
8. Do NOT alter the face itself — only show outlines as visual guides.
Output format:
- Return the **original image** with both outlines visible.
- Optionally include a brief analysis text: “Old Smile vs. Hollywood Smile comparison.”
Color codes:
- Old teeth outline: #000000 (black)
- New smile outline: #007BFF (blue)`;

        const base64 = await toBase64(file);
        const imagePart = { inlineData: { data: base64, mimeType: file.type } };
        const { image, text } = await generateImageAndText(prompt, [imagePart], setIsLoading);
        
        setAnalysisResultImage(image);
        setAnalysisResultText(text);
        setLoadingTool(null);
    };
    
    const handleGenerateOutlines = async () => {
        if (!file) {
            alert("Please upload an image first.");
            return;
        }
        setAnalysisResultImage(null);
        setAnalysisResultText(null);
        setBlackOutlineLayer(null);
        setBlueOutlineLayer(null);
        setAestheticAnalysisResultText(null);
        setActiveResult('outline');
        setLoadingTool('outline');
        setIsLoading(true);

        try {
            const base64 = await toBase64(file);
            const imagePart = { inlineData: { data: base64, mimeType: file.type } };

            const blackOutlinePrompt = `You are an expert AI visualizer for smile aesthetics. Task: Analyze the uploaded facial image. Detect the current teeth contour (the person’s real teeth outline). Draw ONLY this outline in black (#000000). The background MUST be transparent. Ensure the output image dimensions match the input image to guarantee perfect alignment. Do not alter the face or add any other elements. Output a single PNG image.`;
            const blueOutlinePrompt = `You are an expert AI visualizer for smile aesthetics. Task: Analyze the uploaded facial image. Generate an ideal “Hollywood smile” outline based on the golden ratio, harmonized with the facial proportions. Draw ONLY this new outline in blue (#007BFF). The background MUST be transparent. Ensure the output image dimensions match the input image to guarantee perfect alignment. Do not alter the face or add any other elements. Output a single PNG image.`;
            
            const setLoadingNoOp = () => {};

            const [blackResult, blueResult] = await Promise.all([
                generateImage(blackOutlinePrompt, [imagePart], setLoadingNoOp),
                generateImage(blueOutlinePrompt, [imagePart], setLoadingNoOp)
            ]);
            
            setBlackOutlineLayer(blackResult);
            setBlueOutlineLayer(blueResult);

        } catch (err) {
            console.error("Layer generation failed:", err);
            alert("Failed to generate smile analysis layers.");
        } finally {
            setIsLoading(false);
            setLoadingTool(null);
        }
    };
    
    // --- Generator Handler ---
    const handleGenerateImage = async () => {
        if (!generatorPrompt.trim()) {
            alert("Please enter a text prompt to generate an image.");
            return;
        }
        setGeneratedImageUrl(null);
        const resultSrc = await generateImage(generatorPrompt, [], setIsGeneratingImage);
        if (resultSrc) {
            setGeneratedImageUrl(resultSrc);
        }
    };

    return (
      <div className="card">
        <h2>AI Edit Suite</h2>
        <div className="tool-selector">
            <button className={activeTool === 'visualizer' ? 'active' : ''} onClick={() => setActiveTool('visualizer')}>Visualizers</button>
            <button className={activeTool === 'generator' ? 'active' : ''} onClick={() => setActiveTool('generator')}>Generate Image</button>
        </div>

        {activeTool === 'visualizer' && (
            <>
                <p>Analyze your smile with advanced AI visualizers.</p>
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
                        <img src={previewUrl} alt="Upload preview for analysis" className="drop-zone-preview" />
                    ) : (
                        <div className="drop-zone-prompt">
                            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ stroke: 'currentColor', marginBottom: '12px', opacity: '0.5' }}>
                                <path d="M7 16a4 4 0 01-4-4 4 4 0 014-4h.5A6.5 6.5 0 0119.2 8.2a4.5 4.5 0 01-1.3 8.8h-11" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                <path d="M12 12v9m0 0l-3-3m3 3l3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                            </svg>
                            {isDraggingOver ? (
                                <p><strong>Drop image to analyze</strong></p>
                            ) : (
                                <p><strong>Drag &amp; drop or click to upload</strong></p>
                            )}
                        </div>
                    )}
                </div>

                {file && (
                    <div className="action-buttons" style={{ gridTemplateColumns: '1fr 1fr', display: 'grid' }}>
                        <button onClick={handleMakeHollywoodSmile} disabled={isLoading}>
                            {isLoading && loadingTool === 'hollywood' ? 'Generating...' : 'Make Hollywood Smile'}
                        </button>
                        <button onClick={handleAestheticAnalysis} disabled={isLoading}>
                            {isLoading && loadingTool === 'aesthetic' ? 'Analyzing...' : 'Smile Aesthetic Analysis'}
                        </button>
                        <button onClick={handleGenerateContour} disabled={isLoading}>
                            {isLoading && loadingTool === 'contour' ? 'Analyzing...' : 'Smile Contour'}
                        </button>
                        <button onClick={handleGenerateOutlines} disabled={isLoading}>
                            {isLoading && loadingTool === 'outline' ? 'Analyzing...' : 'Teeth Outline'}
                        </button>
                    </div>
                )}

                {isLoading && <LoadingSpinner text={
                    loadingTool === 'hollywood' ? 'Generating Smile...' :
                    loadingTool === 'aesthetic' ? 'Analyzing Smile...' :
                    loadingTool === 'contour' ? 'Analyzing Contour...' :
                    loadingTool === 'outline' ? 'Generating Outlines...' :
                    'Processing...'
                } />}

                {activeResult === 'hollywood' && analysisResultImage && !isLoading && (
                    <div style={{ marginTop: '20px' }}>
                        <h4>Hollywood Smile Result:</h4>
                        <ComparisonSlider beforeSrc={previewUrl!} afterSrc={analysisResultImage} opacity={1} />
                        <div className="action-buttons">
                            <button onClick={() => { const a = document.createElement("a"); a.href = analysisResultImage; a.download = "Hollywood_Smile_AI_Edit.png"; a.click(); }} className="download-btn">⬇️ Download</button>
                            <button onClick={() => shareImage(analysisResultImage, "Hollywood_Smile_AI_Edit.png")} className="share-btn">🔗 Share</button>
                        </div>
                        {ctaCard}
                    </div>
                )}

                {activeResult === 'aesthetic' && aestheticAnalysisResultText && !isLoading && (
                    <div style={{ marginTop: '20px' }}>
                        <h4>Aesthetic Analysis Result:</h4>
                        <div className="analysis-result">
                            <p>{aestheticAnalysisResultText}</p>
                        </div>
                    </div>
                )}

                {activeResult === 'contour' && analysisResultImage && !isLoading && (
                    <div style={{ marginTop: '20px' }}>
                        <h4>Contour Analysis Result:</h4>
                        <img src={analysisResultImage} alt="Analysis result" style={{ width: '100%', borderRadius: 'var(--border-radius-card)' }} />
                        {analysisResultText && (
                            <div className="analysis-result">
                                <p>{analysisResultText}</p>
                            </div>
                        )}
                        <div className="action-buttons">
                            <button onClick={() => { const a = document.createElement("a"); a.href = analysisResultImage; a.download = "AI_Smile_Contour.png"; a.click(); }} className="download-btn">⬇️ Download</button>
                            <button onClick={() => shareImage(analysisResultImage, "AI_Smile_Contour.png")} className="share-btn">🔗 Share</button>
                        </div>
                        {ctaCard}
                    </div>
                )}

                {activeResult === 'outline' && (blackOutlineLayer || blueOutlineLayer) && !isLoading && (
                    <div style={{ marginTop: '20px' }}>
                        <h4>Layered Outline Result:</h4>
                        <div className="layered-image-container">
                            <img src={previewUrl!} alt="Original" className="layered-image-base" />
                            {blackOutlineLayer && <img src={blackOutlineLayer} alt="Current smile outline" className="layered-image-overlay" style={{ opacity: showBlackLayer ? 1 : 0 }} />}
                            {blueOutlineLayer && <img src={blueOutlineLayer} alt="Ideal smile outline" className="layered-image-overlay" style={{ opacity: showBlueLayer ? 1 : 0 }} />}
                        </div>
                        
                        <div className="layer-controls">
                            <label>
                                <input type="checkbox" checked={showBlackLayer} onChange={() => setShowBlackLayer(!showBlackLayer)} />
                                Current Outline (Black)
                            </label>
                            <label>
                                <input type="checkbox" checked={showBlueLayer} onChange={() => setShowBlueLayer(!showBlueLayer)} />
                                Ideal Outline (Blue)
                            </label>
                        </div>
                        {ctaCard}
                    </div>
                )}
            </>
        )}

        {activeTool === 'generator' && (
            <>
                <p>Create a new image from a text description.</p>
                <label htmlFor="generatorPrompt">Your Prompt</label>
                <textarea 
                    id="generatorPrompt" 
                    rows={4} 
                    value={generatorPrompt} 
                    onChange={(e) => setGeneratorPrompt(e.target.value)}
                    placeholder="e.g., A photorealistic image of a perfect smile with bright, white teeth"
                />
                <button onClick={handleGenerateImage} className="generate-btn" disabled={isGeneratingImage}>
                    {isGeneratingImage ? 'Generating...' : '🪄 Generate Image'}
                </button>
                {isGeneratingImage && <LoadingSpinner text="Generating Image..." />}
                {generatedImageUrl && (
                    <div style={{ marginTop: '20px' }}>
                        <h4>Generated Image:</h4>
                        <img src={generatedImageUrl} alt="Generated from prompt" style={{ width: '100%', borderRadius: 'var(--border-radius-card)' }} />
                        <div className="action-buttons">
                            <button onClick={() => { const a = document.createElement("a"); a.href = generatedImageUrl!; a.download = "AI_Generated_Image.png"; a.click(); }} className="download-btn">⬇️ Download</button>
                            <button onClick={() => shareImage(generatedImageUrl!, "AI_Generated_Image.png")} className="share-btn">🔗 Share</button>
                        </div>
                        {ctaCard}
                    </div>
                )}
            </>
        )}
      </div>
    );
};

export default AIEditModeCard;