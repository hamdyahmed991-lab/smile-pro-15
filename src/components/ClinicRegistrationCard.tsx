import React, { useState, useRef, useEffect } from 'react';
import { generateImage, toBase64 } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import UploadIcon from './controls/icons/UploadIcon';


const SimpleComparisonSlider = ({ beforeSrc, afterSrc }: { beforeSrc: string; afterSrc: string | null }) => {
    const [sliderValue, setSliderValue] = useState(50);
    const afterImageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (afterImageRef.current) {
            afterImageRef.current.style.clipPath = `inset(0 ${100 - sliderValue}% 0 0)`;
        }
    }, [sliderValue]);
    
    // When a new afterSrc comes in (or disappears), reset the slider
    useEffect(() => {
        setSliderValue(50);
    }, [afterSrc]);


    return (
        <div className="slider-wrapper" style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', borderRadius: 'var(--border-radius-card)', marginBottom: '20px', backgroundColor: 'var(--background-color)' }}>
            <img src={beforeSrc} alt="Before treatment" style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'contain' }} />
            {afterSrc && 
                <img ref={afterImageRef} src={afterSrc} alt="After treatment" style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'contain' }} />
            }
            {afterSrc &&
                <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={sliderValue} 
                    id="slider" 
                    onChange={(e) => setSliderValue(Number(e.target.value))}
                    style={{ position: 'absolute', width: '100%', bottom: '10px', margin: 0, cursor: 'pointer' }}
                    aria-label="Before and after comparison slider"
                />
            }
        </div>
    );
};

const ClinicRegistrationCard: React.FC<{ t: { [key: string]: string } }> = ({ t }) => {
    const [beforeImage, setBeforeImage] = useState<string>("https://i.imgur.com/4I7Z9pC.jpg");
    const [afterImage, setAfterImage] = useState<string | null>("https://i.imgur.com/Bno9FIR.jpg");
    const [isLoading, setIsLoading] = useState(false);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Clean up blob URL on component unmount or when beforeImage changes
    useEffect(() => {
        return () => {
            if (beforeImage && beforeImage.startsWith('blob:')) {
                URL.revokeObjectURL(beforeImage);
            }
        };
    }, [beforeImage]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert(t.clinicRegistrationSuccess || "✅ Clinic registered successfully! You will be contacted within 24 hours to activate your free trial.");
    };

    const handleGenerate = async (file: File) => {
        setIsLoading(true);
        setAfterImage(null); // Clear previous after image while generating
        const prompt = "Instantly enhance this selfie with a perfect, natural-looking 'Hollywood' smile. Prioritize realism. Preserve identity. Return one photorealistic PNG.";
        const base64 = await toBase64(file);
        const imageParts = [{ inlineData: { data: base64, mimeType: file.type || 'image/png' } }];
        
        // The generateImage service now handles setting loading to false internally
        const resultSrc = await generateImage(prompt, imageParts, setIsLoading);

        if (resultSrc) {
            setAfterImage(resultSrc);
        } else {
            console.error("Image generation failed.");
            alert("Sorry, the smile generation failed. Please try a different photo.");
            // Revert to the original uploaded image state if generation fails
            setAfterImage(null); 
            setIsLoading(false); // Ensure loading is off on failure
        }
    };
    
    const handleFileSelect = (selectedFile: File | null) => {
        if (isLoading) return;
        if (selectedFile) {
            if (!selectedFile.type.startsWith('image/')) {
                alert('Please select an image file (PNG, JPG, WEBP).');
                return;
            }
            if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
                alert('File size should not exceed 10MB.');
                return;
            }
            // Create a URL for the selected file and set it as the before image
            const fileUrl = URL.createObjectURL(selectedFile);
            setBeforeImage(fileUrl);
            
            // Automatically trigger generation
            handleGenerate(selectedFile);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); !isLoading && setIsDraggingOver(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDraggingOver(false); };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDraggingOver(false);
        if (isLoading) return;
        const droppedFile = e.dataTransfer.files && e.dataTransfer.files[0];
        handleFileSelect(droppedFile);
    };
    const triggerFileSelect = () => !isLoading && fileInputRef.current?.click();

    return (
        <div className="card">
            <h2>{t.clinicRegistrationTitle || "Register Your Clinic with ProSmile AI"}</h2>
            <p>{t.clinicRegistrationSubtitle || "See for yourself the difference between before and after 💎"}</p>
            
            <div style={{ position: 'relative' }}>
                {beforeImage && <SimpleComparisonSlider beforeSrc={beforeImage} afterSrc={afterImage} />}
                {isLoading && 
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: '20px', // Adjust to not cover the slider input if it were visible
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        borderRadius: 'var(--border-radius-card)',
                        backdropFilter: 'blur(4px)',
                    }}>
                        <LoadingSpinner messages={["Creating your new smile...", "Applying AI magic..."]} />
                    </div>
                }
            </div>

            <label style={{marginTop: '1.5rem', textAlign: 'center', width: '100%', display: 'block'}}>Or try with your own photo!</label>
             <div 
                className={`drop-zone ${isDraggingOver ? 'dragging-over' : ''}`}
                onClick={triggerFileSelect}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{ 
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    padding: '1rem 1.5rem',
                    minHeight: 'auto',
                    marginTop: '0.5rem'
                }}
            >
                <input 
                    type="file" 
                    ref={fileInputRef}
                    accept="image/*" 
                    onChange={(e) => {
                        handleFileSelect(e.target.files ? e.target.files[0] : null);
                        e.target.value = ''; // Reset to allow re-uploading the same file
                    }}
                    style={{ display: 'none' }}
                    disabled={isLoading}
                />
                <UploadIcon size={32} />
                <div style={{textAlign: 'left', lineHeight: 1.3}}>
                    <p style={{margin:0, fontWeight: '500', color: 'var(--text-color)'}}>{t.dropZonePromptClick}</p>
                    <p className="drop-zone-text-small" style={{margin:0, opacity: 0.8}}>{t.dropZoneOr}</p>
                </div>
            </div>

            <div className="offer-box" style={{ background: 'rgba(var(--primary-color-rgb), 0.1)', border: '2px dashed var(--primary-color)', borderRadius: 'var(--border-radius-card)', padding: '15px', marginTop: '20px', marginBottom: '20px', textAlign: 'center' }}>
                <p style={{ margin: 0, color: 'var(--text-color)', fontWeight: 500 }}>{t.clinicRegistrationOffer || "🎁 Special Offer: 7-day free trial without a credit card!"}</p>
            </div>

            <form onSubmit={handleFormSubmit}>
                <input type="text" id="clinicName" placeholder={t.clinicNamePlaceholder || "Clinic Name"} required />
                <input type="text" id="country" placeholder={t.countryPlaceholder || "Country"} required />
                <input type="email" id="email" placeholder={t.emailPlaceholder || "Email"} required />
                <input type="tel" id="phone" placeholder={t.phonePlaceholder || "Phone Number (optional)"} />
                <button type="submit" className="generate-btn">{t.startFreeTrialButton || "Start Your Free Trial Now"}</button>
            </form>
            
            <a href="https://wa.me/201113039210" className="whatsapp-link" target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: '15px', color: '#25D366', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center' }}>
                {t.contactWhatsAppForHelp || "💬 Contact us on WhatsApp for help"}
            </a>
        </div>
    );
};

export default ClinicRegistrationCard;