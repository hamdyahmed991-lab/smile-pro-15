import React, { useState, useCallback } from 'react';
import CopyIcon from './controls/icons/CopyIcon';
import CheckIcon from './controls/icons/CheckIcon';

const promptText = `FULL PROMPT — Multi-Patient AI Studio → Exocad Workflow
You are an AI workflow system for a dental smile-design application that integrates with Exocad Smile Creator.
The goal of this workflow is to take an AI-generated Hollywood smile PNG, align it to the patient’s 3D scan, verify accuracy, export for Exocad, and provide a “🦷 Send to Exocad” button for one-click integration.

🧩 Workflow Overview

2D–3D Smile Alignment

Alignment Verification

Exocad Export Packaging

One-Click Send to Exocad Button

STEP 1 — Smile Alignment (AI Studio → Exocad format)

Detect facial landmarks in 2D smile PNG:

Pupils, nose tip, lip corners, facial midline.

Match them to 3D scan landmarks.

Compute the 4×4 transformation matrix (Procrustes alignment).

Output JSON:

{
  "patient_id": "AUTO_GENERATED_ID",
  "image_reference": "smile_image.png",
  "facial_landmarks_2d": [[x,y,0],...],
  "facial_landmarks_3d": [[x,y,z],...],
  "alignment_matrix": [[...], [...], [...], [...]],
  "smile_curve": {"arc_radius_mm": 45.2, "curve_type": "convex", "midline_angle_deg": 0.7},
  "tooth_metrics": {"central_incisor": {"width_mm": 8.5, "height_mm": 10.2}},
  "color_profile": {"shade": "BL1", "brightness": 0.85, "contrast": 1.1}
}


Convert to XML format for Exocad:

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
  <Color>
    <Shade>BL1</Shade>
    <Brightness>0.85</Brightness>
    <Contrast>1.1</Contrast>
  </Color>
</SmileDesignData>


Save outputs to:

/exports/smile_data/

STEP 2 — Alignment Verification

Input: smile_image.png, 3D scan, alignment_matrix.

Compute RMS alignment error in millimeters.

Create overlay_preview.png with color-coded landmark dots:

Green < 1.0 mm

Yellow 1.0–2.0 mm

Red > 2.0 mm

Save report:

{
  "patient_id": "AUTO_GENERATED_ID",
  "rms_error_mm": 0.78,
  "alignment_status": "PASS",
  "timestamp": "2025-11-04T12:00:00Z",
  "comments": "Perfect overlay alignment for Exocad import"
}


PASS if RMS ≤ 1.0 mm, else FAIL.

STEP 3 — Exocad Export Packaging

Condition: export only if alignment_status = PASS.

Create folder:

/exports/exocad_package/{patient_id}/


Include:

smile_image.png

smile_alignment.xml

smile_alignment.json

overlay_preview.png

alignment_verification.json

Generate manifest:

{
  "patient_id": "AUTO_GENERATED_ID",
  "export_date": "2025-11-04T12:00:00Z",
  "file_count": 5,
  "verified": true,
  "alignment_rms_error_mm": 0.78,
  "notes": "Ready for Exocad Smile Creator import."
}


Zip everything into:

/exports/exocad_package/{patient_id}_SmilePackage.zip


Console message:

✅ Exocad package created successfully.
Path: /exports/exocad_package/{patient_id}_SmilePackage.zip

STEP 4 — “🦷 Send to Exocad” Button

Add UI button:

Label: 🦷 Send to Exocad
Color: Green when PASS, Gray when disabled
Tooltip: "Export the verified smile design and open it in Exocad Smile Creator"


Show preview (overlay_preview.png) under the button.

When clicked:

Check alignment_verification.json → must be PASS.

Trigger export packaging module.

Execute this system command to run your auto-import script:

python "C:\AIStudio\scripts\auto_import_exocad.py"


Wait for confirmation message:

✅ Exocad opened with aligned Hollywood smile.

Error Handling

If no verification →

⚠️ "Run alignment verification before exporting."

If Exocad executable missing →

❌ "Exocad application not found. Please verify installation path."

If RMS error > 1.0 mm →

🚫 "Alignment accuracy too low. Manual review required."

Outputs

smile_alignment.json

smile_alignment.xml

alignment_verification.json

overlay_preview.png

package_manifest.json

{patient_id}_SmilePackage.zip

Final Expected Behavior

AI Studio aligns 2D → 3D smile.

Verifies precision and generates overlay.

Packages all files automatically.

“🦷 Send to Exocad” button appears once PASS confirmed.

User clicks → Exocad opens automatically with the smile design pre-aligned and loaded.

Console Output Example
[INFO] Facial landmarks detected.
[INFO] Alignment matrix computed.
[OK] RMS = 0.78 mm → PASS
[OK] Files packaged.
[INFO] Launching Exocad...
✅ Smile successfully sent to Exocad.

✅ How to Use

Copy-paste this entire prompt into AI Studio as your main workflow instruction.

Connect:

Input → PNG + 3D facial scan.

Output → Exocad export folder.

Add the provided auto_import_exocad.py script in C:\AIStudio\scripts.

When you click 🦷 Send to Exocad, your pipeline:

Verifies → Packages → Launches Exocad`;

const ExocadWorkflowModeCard: React.FC = () => {
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
            <h2>Exocad Workflow Integration Prompt</h2>
            <p>This prompt orchestrates a full AI Studio pipeline: 2D-3D alignment, verification, packaging, and one-click sending to Exocad.</p>
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

export default ExocadWorkflowModeCard;