import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export type ImagePart = { inlineData: { data: string, mimeType: string } };
export type ImageAndTextResult = { image: string | null; text: string | null };

/**
 * Adds a watermark to a base64 encoded image with a style matching the app's branding.
 * The watermark is rendered on multiple lines to match the footer style.
 * @param base64Image The base64 data URL of the image.
 * @returns A promise that resolves with the watermarked image as a base64 data URL.
 */
export async function addWatermark(base64Image: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const lines = [
            { text: "Smile pro", sizeMultiplier: 1.5, weight: '800' },
            { text: "By", sizeMultiplier: 0.8, weight: '500' },
            { text: "Dr.Hamdy Ahmed sallm", sizeMultiplier: 1.2, weight: '800' },
        ];

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Could not get canvas context'));
            }

            // Draw the original image
            ctx.drawImage(img, 0, 0);

            // --- Define base styling ---
            const baseFontSize = Math.max(14, Math.round(canvas.width / 60));
            const padding = Math.max(20, Math.round(canvas.width / 30)); // Approximately 1cm from edge
            const lineHeightFactor = 1.2;
            
            ctx.textAlign = 'left';
            ctx.textBaseline = 'bottom';
            
            // --- Shadow/Glow (matches CSS) ---
            ctx.shadowColor = 'rgba(51, 193, 255, 0.4)';
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            // --- Gradient Fill (matches CSS) ---
            let maxWidth = 0;
            lines.forEach(line => {
                const fontSize = baseFontSize * line.sizeMultiplier;
                ctx.font = `${line.weight} ${fontSize}px Poppins, sans-serif`;
                const metrics = ctx.measureText(line.text);
                if (metrics.width > maxWidth) {
                    maxWidth = metrics.width;
                }
            });

            const gradient = ctx.createLinearGradient(padding, 0, padding + maxWidth, 0);
            const primaryColor = '#33C1FF';
            const whiteColor = '#FFFFFF';
            gradient.addColorStop(0, primaryColor);
            gradient.addColorStop(0.5, whiteColor);
            gradient.addColorStop(1, primaryColor);
            ctx.fillStyle = gradient;

            // --- Draw text lines from bottom to top ---
            let currentY = canvas.height - padding;
            
            for (let i = lines.length - 1; i >= 0; i--) {
                const line = lines[i];
                const fontSize = baseFontSize * line.sizeMultiplier;
                ctx.font = `${line.weight} ${fontSize}px Poppins, sans-serif`;
                
                ctx.fillText(line.text, padding, currentY);
                
                // Move Y position up for the next line
                currentY -= (fontSize * lineHeightFactor);
            }

            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => {
            reject(new Error('Failed to load image for watermarking'));
        };
        img.src = base64Image;
    });
}


export async function generateImage(prompt: string, imageParts: ImagePart[], setLoading: (loading: boolean) => void): Promise<string | null> {
  setLoading(true);
  try {
    const textPart = { text: prompt };
    const parts = [...imageParts, textPart]; 

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: parts },
        config: { responseModalities: [Modality.IMAGE] }
    });

    let imgBase64 = null;
    if (result.candidates?.[0]?.content?.parts) {
        for (const part of result.candidates[0].content.parts) {
          if (part.inlineData) {
            imgBase64 = part.inlineData.data;
            break;
          }
        }
    }

    if (!imgBase64) {
        const textResponse = result.text;
        if (textResponse) {
            throw new Error(`Image generation failed. The model responded with: ${textResponse}`);
        }
        const blockReason = result.promptFeedback?.blockReason;
        if (blockReason) {
            throw new Error(`Image generation was blocked. Reason: ${blockReason}. Please adjust your prompt or image and try again.`);
        }
        const finishReason = result.candidates?.[0]?.finishReason;
        if (finishReason && finishReason !== 'STOP') {
             throw new Error(`Image generation failed. Reason: ${finishReason}.`);
        }
        throw new Error("No image data returned from API, and no text explanation was provided. The request may have been blocked due to safety policies.");
    }
    const watermarkedImage = await addWatermark("data:image/png;base64," + imgBase64);
    return watermarkedImage;
  } catch (err)
 {
    console.error("Generation failed:", err);
    alert("Generation failed: " + (err instanceof Error ? err.message : "An unknown error occurred."));
    return null;
  } finally {
    setLoading(false);
  }
}

export async function generateImageAndText(prompt: string, imageParts: ImagePart[], setLoading: (loading: boolean) => void): Promise<ImageAndTextResult> {
  setLoading(true);
  try {
    const textPart = { text: prompt };
    const parts = [...imageParts, textPart]; 

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: parts },
        config: { responseModalities: [Modality.IMAGE] }
    });

    const response: ImageAndTextResult = { image: null, text: null };
    
    response.text = result.text;

    let imgBase64 = null;
    if (result.candidates?.[0]?.content?.parts) {
        for (const part of result.candidates[0].content.parts) {
          if (part.inlineData) {
            imgBase64 = part.inlineData.data;
            break;
          }
        }
    }
    
    if (imgBase64) {
        response.image = await addWatermark("data:image/png;base64," + imgBase64);
    }
    
    if (!response.image) {
        if (response.text) {
            throw new Error(`Image generation failed. The model responded with: ${response.text}`);
        }
        const blockReason = result.promptFeedback?.blockReason;
        if (blockReason) {
            throw new Error(`Image generation was blocked. Reason: ${blockReason}. Please adjust your prompt or image and try again.`);
        }
        const finishReason = result.candidates?.[0]?.finishReason;
        if (finishReason && finishReason !== 'STOP') {
            throw new Error(`Image generation failed. Reason: ${finishReason}.`);
        }
        throw new Error("No image data returned from API, and no text explanation was provided. The request may have been blocked due to safety policies.");
    }

    return response;
  } catch (err)
 {
    console.error("Generation failed:", err);
    alert("Generation failed: " + (err instanceof Error ? err.message : "An unknown error occurred."));
    return { image: null, text: null };
  } finally {
    setLoading(false);
  }
}

export async function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(",")[1]);
      } else {
        reject(new Error('File could not be read as a data URL string.'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
}

export async function shareImage(imgSrc: string, filename: string) {
  if (!navigator.share) {
    alert("Share functionality is not supported on your browser.");
    return;
  }
  try {
    const response = await fetch(imgSrc);
    const blob = await response.blob();
    const file = new File([blob], filename, { type: blob.type });
    await navigator.share({
      title: "My Hollywood Smile",
      text: "Check out my new smile generated by AI!",
      files: [file],
    });
  } catch (error) {
    console.error("Error sharing:", error);
    if (error instanceof Error && error.name !== 'AbortError') {
      alert("Could not share the image.");
    }
  }
}

export async function analyzeImage(prompt: string, file: File, model: 'gemini-2.5-flash-lite' | 'gemini-2.5-pro', config: any, setLoading: (loading: boolean) => void): Promise<string | null> {
    setLoading(true);
    try {
        const base64 = await toBase64(file);
        const imagePart = {
            inlineData: {
                mimeType: file.type,
                data: base64,
            },
        };
        const textPart = { text: prompt };

        const result = await ai.models.generateContent({
            model: model,
            contents: { parts: [imagePart, textPart] },
            config: config,
        });

        return result.text;
    } catch (err) {
        console.error("Image analysis failed:", err);
        alert("Image analysis failed: " + (err instanceof Error ? err.message : "An unknown error occurred."));
        return null;
    } finally {
        setLoading(false);
    }
}

export const HARMONIZATION_PROMPT = `You are an expert AI image harmonization model specializing in dental photo-realism. You will be given two images: [Image 1: Original Photo] and [Image 2: Edited Smile].

**Your Task:**
1.  Analyze the ambient lighting, color temperature, shadows, and grain of the **[Image 1: Original Photo]**.
2.  Identify the digitally inserted smile from **[Image 2: Edited Smile]**.
3.  Seamlessly integrate the smile from [Image 2] into [Image 1].
4.  **Crucially, adjust ONLY the lighting, color balance, and shadows of the inserted smile to perfectly match the ambient conditions of the original photo.**
5.  Do not alter tooth shape, gum contour, or facial structure. The goal is purely photorealistic lighting and color integration.
6.  The final output should be the original photo but with the new smile perfectly harmonized into its environment.`;