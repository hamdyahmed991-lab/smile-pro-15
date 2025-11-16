import React, { useState, useCallback } from 'react';
import CopyIcon from './controls/icons/CopyIcon';
import CheckIcon from './controls/icons/CheckIcon';

const modelData = {
  "module": {
    "id": "exocad_integration_v1",
    "name": "🦷 Exocad Workflow Integration",
    "description": "Converts PNG smile → 3D STL/OBJ, validates, packages, and launches Exocad automatically.",
    "trigger": { "type": "button", "label": "🦷 Send to Exocad" },
    "inputs": [
      { "name": "patient_id", "type": "string", "required": true, "description": "Unique patient identifier" },
      { "name": "smile_design_png", "type": "file", "format": "image/png", "required": true },
      { "name": "upper_scan_stl", "type": "file", "format": "model/stl", "required": true },
      { "name": "lower_scan_stl", "type": "file", "format": "model/stl", "required": false },
      { "name": "alignment_matrix_json", "type": "file", "format": "application/json", "required": true },
      { "name": "export_mode", "type": "enum", "default": "FullSmile", "values": ["TeethOnly", "Teeth_Gingiva", "FullSmile"] }
    ],
    "outputs": [
      { "name": "stl_output", "type": "file", "format": "model/stl" },
      { "name": "zip_package", "type": "file", "format": "application/zip" },
      { "name": "report_json", "type": "file", "format": "application/json" }
    ],
    "system": {
      "python_script": "C:/AIStudio/scripts/auto_import_exocad.py",
      "arguments": [
        "--package",
        "C:/AIStudio/exports/exocad_package/{patient_id}_SmilePackage.zip",
        "--open"
      ]
    },
    "ui": {
      "header": "Exocad Workflow Integration",
      "description": "Click 'Send to Exocad' to align PNG, export STL, package and launch Exocad automatically.",
      "successMessage": "✅ Successfully exported and opened in Exocad!",
      "errorMessages": {
        "missing_files": "⚠️ Missing required inputs (PNG/STL/JSON).",
        "launch_failed": "❌ Could not open Exocad. Please check script path."
      }
    }
  }
};

const modelText = JSON.stringify(modelData, null, 2);

const ExocadCustomModelCard: React.FC = () => {
    const [copyButtonText, setCopyButtonText] = useState('Copy Model JSON');
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(modelText).then(() => {
            setCopyButtonText('Copied!');
            setIsCopied(true);
            setTimeout(() => {
                setCopyButtonText('Copy Model JSON');
                setIsCopied(false);
            }, 2000);
        }, (err) => {
            console.error('Could not copy text: ', err);
            alert('Failed to copy model to clipboard.');
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
            <h2>Custom Exocad Model</h2>
            <p>This is a JSON definition for a custom Exocad workflow module. You can copy it for your development needs.</p>
            <div style={preStyle} className="prompt-container">
                <code>{modelText}</code>
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

export default ExocadCustomModelCard;
