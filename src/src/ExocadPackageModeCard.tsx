import React, { useState, useCallback } from 'react';
import CopyIcon from './controls/icons/CopyIcon';
import CheckIcon from './controls/icons/CheckIcon';

const promptText = `🧩 Prompt Title:

Automatic 2D–3D Smile Alignment Export for Exocad

🧠 Prompt Content:

You are a dental AI integration system that prepares data for Exocad Smile Creator.
Your task is to automatically align a 2D smile design image (PNG) with the patient’s 3D facial scan and export all alignment data in JSON + XML formats compatible with Exocad.

Input Data

A PNG image showing the designed Hollywood smile (smile_image.png).

A 3D facial scan or its extracted landmarks (JSON or coordinate list).

Steps to Perform

Facial Landmark Detection (2D)

Detect key points on the PNG:

Left and right pupils

Left and right lip commissures

Nose tip

Facial midline

Output their 2D coordinates as [x, y, 0.0] (use consistent pixel scale).

Facial Landmark Mapping (3D)

Identify corresponding 3D coordinates from the facial scan for the same points.

Use those 3D positions as [x, y, z] in millimeters.

Compute Alignment Matrix (2D → 3D)

Calculate a similarity (Procrustes) transformation matrix that best aligns 2D to 3D points.

Output a 4×4 transformation matrix:

[R11 R12 R13 Tx]
[R21 R22 R23 Ty]
[R31 R32 R33 Tz]
[  0   0   0  1]


Ensure scaling and orientation are correct for the Exocad facial coordinate system.

Generate Output JSON
Save a JSON file with this structure:

{
  "patient_id": "AUTO_GENERATED_ID",
  "image_reference": "smile_image.png",
  "facial_landmarks_2d": [[x,y,0], ...],
  "facial_landmarks_3d": [[x,y,z], ...],
  "alignment_matrix": [[...], [...], [...], [...]],
  "smile_curve": {"arc_radius_mm": 45.2, "curve_type": "convex", "midline_angle_deg": 0.7},
  "tooth_metrics": {
    "central_incisor": {"width_mm": 8.5, "height_mm": 10.2}
  },
  "color_profile": {"shade": "BL1", "brightness": 0.85, "contrast": 1.1}
}


Generate Exocad-Compatible XML

Convert the JSON into this XML format:

<SmileDesignData>
  <Patient>
    <ID>AUTO_GENERATED_ID</ID>
    <ReferenceImage>smile_image.png</ReferenceImage>
  </Patient>
  <AlignmentMatrix>
    <Row>R11 R12 R13 Tx</Row>
    <Row>R21 R22 R23 Ty</Row>
    <Row>R31 R32 R33 Tz</Row>
    <Row>0 0 0 1</Row>
  </AlignmentMatrix>
  <SmileParameters>
    <SmileArc curvature="convex" radius="45.2"/>
    <Midline angle="0.7"/>
  </SmileParameters>
  <Teeth>
    <Tooth id="11">
      <Width>8.5</Width>
      <Height>10.2</Height>
    </Tooth>
  </Teeth>
  <Color>
    <Shade>BL1</Shade>
    <Brightness>0.85</Brightness>
    <Contrast>1.1</Contrast>
  </Color>
</SmileDesignData>


Export Files

Save both smile_alignment.json and smile_alignment.xml to the project’s output folder:

/exports/smile_data/


Include the original PNG (smile_image.png) in the same folder.

Final Result

A perfectly aligned PNG reference that matches the 3D face scan in Exocad.

All data (landmarks, alignment, smile parameters) saved for automatic import.

Quality Check

Validate alignment visually (overlay PNG on 3D face).

Report the root-mean-square alignment error (RMSD) — must be under 1.0 mm for clinical accuracy.

Output Deliverables

smile_alignment.json

smile_alignment.xml

smile_image.png (final aligned reference)

Console log: “✅ PNG successfully aligned to 3D facial scan for Exocad import.”

✅ How to Use in AI Studio

Add this entire prompt as the System or Workflow Instruction for your smile alignment module.

Connect the PNG output from your smile design model and the 3D facial scan landmarks as inputs.

The model will automatically generate:

smile_alignment.json

smile_alignment.xml

smile_image.png

Import the XML + PNG into Exocad Smile Creator — it will load in the correct position automatically.`;

const ExocadPackageModeCard: React.FC = () => {
    const [copyButtonText, setCopyButtonText] = useState('Copy Prompt');
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(promptText).then(() => {
            setCopyButtonText('Copied!');
            setIsCopied(true);
            setTimeout(() => {
                setCopyButtonText('Copy Prompt');
                setIsCopied(false);
            }, 2000);
        }, (err) => {
            console.error('Could not copy text: ', err);
            alert('Failed to copy prompt to clipboard.');
        });
    }, []);

    const preStyle: React.CSSProperties = {
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: '1rem',
        borderRadius: '8px',
        maxHeight: '400px',
        overflowY: 'auto',
        textAlign: 'left',
        fontFamily: 'monospace',
        fontSize: '0.9rem',
    };

    return (
        <div className="card">
            <h2>Exocad File Package Prompt</h2>
            <p>This prompt instructs an AI pipeline to generate a complete file package for Exocad, including JSON and XML alignment data.</p>
            <div style={preStyle} className="prompt-container">
                <code>{promptText}</code>
            </div>
            <style>{`
              .prompt-container {
                background-color: rgba(0,0,0,0.2);
              }
              body.light-mode .prompt-container {
                background-color: #F7F8FA;
                border: 1px solid #D8DCE1;
              }
            `}</style>

            <button onClick={handleCopy} className="generate-btn" style={{ marginTop: '1rem' }}>
                {isCopied ? <CheckIcon /> : <CopyIcon />}
                {copyButtonText}
            </button>
        </div>
    );
};

export default ExocadPackageModeCard;