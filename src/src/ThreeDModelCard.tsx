import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import UploadIcon from './controls/icons/UploadIcon';

const ThreeDModelCard: React.FC<{ t: { [key: string]: string } }> = ({ t }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [displacementScale, setDisplacementScale] = useState(0.1);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [isAutoRotating, setIsAutoRotating] = useState(true);

    const isAutoRotatingRef = useRef(isAutoRotating);
    useEffect(() => {
        isAutoRotatingRef.current = isAutoRotating;
    }, [isAutoRotating]);

    // Cleanup object URL
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    // Main Three.js effect
    useEffect(() => {
        if (!mountRef.current || !previewUrl) return;

        const currentMount = mountRef.current;
        let renderer: THREE.WebGLRenderer;
        let geometry: THREE.PlaneGeometry;
        let material: THREE.MeshStandardMaterial;
        let colorTexture: THREE.Texture;
        let displacementTexture: THREE.CanvasTexture;
        let animationFrameId: number;

        // --- Scene setup ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#111111');

        // --- Camera config ---
        const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.z = 1;

        // --- Renderer setup ---
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        currentMount.appendChild(renderer.domElement);

        // --- Lighting setup ---
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(2, 2, 5);
        scene.add(directionalLight);

        // --- Textures, Geometry, and Material ---
        const textureLoader = new THREE.TextureLoader();
        colorTexture = textureLoader.load(previewUrl);
        
        let smilePlane: THREE.Mesh;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = previewUrl;
        img.onload = () => {
            // Aspect ratio correction for the plane
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            const planeWidth = 2;
            const planeHeight = planeWidth / aspectRatio;
            
            camera.position.z = Math.max(planeHeight, 1) * 0.8;

            // Grayscale canvas for displacement map
            const grayscaleCanvas = document.createElement('canvas');
            grayscaleCanvas.width = img.naturalWidth;
            grayscaleCanvas.height = img.naturalHeight;
            const ctx = grayscaleCanvas.getContext('2d');
            if (!ctx) return;
            
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, grayscaleCanvas.width, grayscaleCanvas.height);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
                data[i] = avg;     // red
                data[i + 1] = avg; // green
                data[i + 2] = avg; // blue
            }
            ctx.putImageData(imageData, 0, 0);

            displacementTexture = new THREE.CanvasTexture(grayscaleCanvas);

            // Geometry with enough vertices for displacement
            geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, 256, 256);

            // --- Apply Smile Curve ---
            const positions = geometry.attributes.position.array as Float32Array;
            const curveIntensity = 0.15; // How strong the smile curve is

            for (let i = 0; i < positions.length; i += 3) {
                const x = positions[i];
                const y = positions[i + 1];

                // Create a falloff so the curve is strongest at the horizontal center
                const verticalFalloff = Math.exp(-Math.pow(y / (planeHeight * 0.3), 2));
                
                // Create the arc shape
                const horizontalCurve = Math.cos((x / planeWidth) * Math.PI);

                // Apply to the z-coordinate
                positions[i + 2] += horizontalCurve * verticalFalloff * curveIntensity;
            }
            geometry.attributes.position.needsUpdate = true;
            geometry.computeVertexNormals(); // Recalculate normals for correct lighting


            material = new THREE.MeshStandardMaterial({
                map: colorTexture,
                displacementMap: displacementTexture,
                displacementScale: displacementScale,
                side: THREE.DoubleSide
            });
            
            smilePlane = new THREE.Mesh(geometry, material);
            scene.add(smilePlane);
        };
        
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        let isMouseOver = false;

        const onMouseDown = (event: MouseEvent) => {
            isDragging = true;
            previousMousePosition = { x: event.clientX, y: event.clientY };
        };

        const onMouseMove = (event: MouseEvent) => {
            if (!isDragging || !smilePlane) return;
            const deltaMove = {
                x: event.clientX - previousMousePosition.x,
                y: event.clientY - previousMousePosition.y
            };
            smilePlane.rotation.y += deltaMove.x * 0.005;
            smilePlane.rotation.x += deltaMove.y * 0.005;
            previousMousePosition = { x: event.clientX, y: event.clientY };
        };

        const onMouseUp = () => { isDragging = false; };
        const onMouseOver = () => { isMouseOver = true; };
        const onMouseOut = () => { isMouseOver = false; };

        currentMount.addEventListener('mousedown', onMouseDown);
        currentMount.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        currentMount.addEventListener('mouseover', onMouseOver);
        currentMount.addEventListener('mouseout', onMouseOut);

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            if (isAutoRotatingRef.current && !isMouseOver && !isDragging && smilePlane) {
                smilePlane.rotation.y += 0.003;
            }
            if (smilePlane) {
                (smilePlane.material as THREE.MeshStandardMaterial).displacementScale = displacementScale;
            }
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (!currentMount) return;
            const width = currentMount.clientWidth;
            const height = currentMount.clientHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mouseup', onMouseUp);
            if(currentMount) {
                currentMount.removeEventListener('mousedown', onMouseDown);
                currentMount.removeEventListener('mousemove', onMouseMove);
                currentMount.removeEventListener('mouseover', onMouseOver);
                currentMount.removeEventListener('mouseout', onMouseOut);
                if (renderer.domElement.parentNode === currentMount) {
                    currentMount.removeChild(renderer.domElement);
                }
            }
            
            geometry?.dispose();
            material?.dispose();
            colorTexture?.dispose();
            displacementTexture?.dispose();
            renderer.dispose();
        };
    }, [previewUrl, displacementScale]);

    const handleFileSelect = (selectedFile: File | null) => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        if (selectedFile) {
            if (!selectedFile.type.startsWith('image/')) {
                alert('Please select an image file.');
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
        const droppedFile = e.dataTransfer.files?.[0] ?? null;
        handleFileSelect(droppedFile);
    };
    const triggerFileSelect = () => fileInputRef.current?.click();

    return (
        <div className="card">
            <h2>{t.threeDModelTitle || "3D Model Generator"}</h2>
            
            {!previewUrl ? (
                <>
                    <p>Upload a photo to convert it into a 3D model with depth.</p>
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
                        <div className="drop-zone-prompt">
                            <UploadIcon style={{ marginBottom: '12px' }} />
                            <p><strong>Drag & drop or click to upload</strong></p>
                            <p className="drop-zone-text-small">Your photo will be converted to 3D</p>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <p>Drag to rotate, or adjust the depth of your 3D photo.</p>
                    <div ref={mountRef} className="three-d-model-container" style={{ width: '100%', height: '400px', backgroundColor: '#111', borderRadius: 'var(--border-radius-card)' }}></div>
                    <label htmlFor="displacementScale" style={{ marginTop: '1rem' }}>3D Depth Scale: {displacementScale.toFixed(2)}</label>
                    <input
                        id="displacementScale"
                        type="range"
                        min="0"
                        max="0.5"
                        step="0.01"
                        value={displacementScale}
                        onChange={(e) => setDisplacementScale(parseFloat(e.target.value))}
                    />
                    <div className="action-buttons" style={{ marginTop: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                        <button onClick={() => setIsAutoRotating(p => !p)} className="icon-btn">
                            {isAutoRotating ? 'Stop Rotation' : 'Start Rotation'}
                        </button>
                        <button onClick={() => handleFileSelect(null)} className="icon-btn secondary-btn">
                            Upload a different photo
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ThreeDModelCard;