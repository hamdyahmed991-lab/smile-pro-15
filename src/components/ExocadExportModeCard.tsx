import React, { useState, useRef, useEffect } from 'react';
import CubeIcon from './controls/icons/CubeIcon';
import UploadIcon from './controls/icons/UploadIcon';

const ExocadExportModeCard = () => {
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
    const [stlFile, setStlFile] = useState<File | null>(null);
    const [exportMode, setExportMode] = useState('FullSmile');
    
    const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
    const [isDraggingStl, setIsDraggingStl] = useState(false);

    const photoInputRef = useRef<HTMLInputElement>(null);
    const stlInputRef = useRef<HTMLInputElement>(null);
    
    const exportOptions = ['TeethOnly', 'Teeth_Gingiva', 'FullSmile'];

    useEffect(() => {
        return () => {
            if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
        }
    }, [photoPreviewUrl]);

    const handlePhotoFileSelect = (selectedFile: File | null) => {
        if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
        if (selectedFile && !selectedFile.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }
        setPhotoFile(selectedFile);
        setPhotoPreviewUrl(selectedFile ? URL.createObjectURL(selectedFile) : null);
    };
    
    const handleStlFileSelect = (selectedFile: File | null) => {
        if (selectedFile && !selectedFile.name.toLowerCase().endsWith('.stl')) {
            alert('Please select an STL file (.stl).');
            return;
        }
        setStlFile(selectedFile);
    };

    const createDragHandlers = (
        fileSetter: (file: File | null) => void, 
        setIsDragging: (isDragging: boolean) => void
    ) => ({
        onDragOver: (e: React.DragEvent<HTMLDivElement>) => e.preventDefault(),
        onDragEnter: (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); },
        onDragLeave: (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); },
        onDrop: (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsDragging(false);
            const droppedFile = e.dataTransfer.files?.[0] ?? null;
            if (droppedFile) fileSetter(droppedFile);
        },
    });

    const photoDragHandlers = createDragHandlers(handlePhotoFileSelect, setIsDraggingPhoto);
    const stlDragHandlers = createDragHandlers(handleStlFileSelect, setIsDraggingStl);
    
    return (
        <div className="card">
            <h2>2D to 3D Exocad Exporter</h2>
            <p>This professional tool will convert your 2D smile simulation into a 3D model, ready for Exocad. It requires both the patient's photo and their intraoral scan (STL file).</p>

            <label>1. Upload Patient Photo</label>
            <div
                className={`drop-zone ${isDraggingPhoto ? 'dragging-over' : ''}`}
                onClick={() => photoInputRef.current?.click()}
                {...photoDragHandlers}
            >
                <input
                    type="file"
                    ref={photoInputRef}
                    accept="image/*"
                    onChange={(e) => handlePhotoFileSelect(e.target.files?.[0] ?? null)}
                    style={{ display: 'none' }}
                />
                {photoPreviewUrl ? (
                     <img src={photoPreviewUrl} alt="Patient photo preview" className="drop-zone-preview" />
                ) : (
                    <div className="drop-zone-prompt">
                        <UploadIcon style={{ marginBottom: '12px' }} />
                        <p><strong>Drag & drop or click to upload</strong></p>
                        <p className="drop-zone-text-small">Patient's facial photo</p>
                    </div>
                )}
            </div>
            
            <label>2. Upload Intraoral Scan (.stl)</label>
            <div
                className={`drop-zone ${isDraggingStl ? 'dragging-over' : ''}`}
                onClick={() => stlInputRef.current?.click()}
                {...stlDragHandlers}
            >
                <input
                    type="file"
                    ref={stlInputRef}
                    accept=".stl,model/stl"
                    onChange={(e) => handleStlFileSelect(e.target.files?.[0] ?? null)}
                    style={{ display: 'none' }}
                />
                <div className="drop-zone-prompt">
                    <CubeIcon />
                    {stlFile ? (
                        <>
                            <p><strong>{stlFile.name}</strong></p>
                            <p className="drop-zone-text-small">({(stlFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                        </>
                    ) : (
                        <>
                            <p><strong>Drag & drop or click to upload</strong></p>
                            <p className="drop-zone-text-small">Intraoral Scan (.STL)</p>
                        </>
                    )}
                </div>
            </div>

            <label htmlFor="exportModeSelect">3. Select Export Mode</label>
            <select 
                id="exportModeSelect" 
                value={exportMode} 
                onChange={(e) => setExportMode(e.target.value)}
                style={{ marginBottom: '1rem' }}
            >
                {exportOptions.map(option => (
                    <option key={option} value={option}>{option.replace(/_/g, ' & ')}</option>
                ))}
            </select>

            <button className="generate-btn" disabled>
                Generate 3D Model
            </button>
            <p style={{textAlign: 'center', marginTop: '1rem', opacity: 0.7, fontSize: '0.9rem'}}>
                <strong>Note:</strong> The 3D model generation feature is currently in beta and will be enabled soon.
            </p>
        </div>
    );
};

export default ExocadExportModeCard;