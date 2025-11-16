import React, { useState } from 'react';

const AskDentistModal: React.FC<{
  imageSrc?: string;
  onClose: () => void;
  onSubmit: (data: { name: string; email: string; message: string }) => void;
}> = ({ imageSrc, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
        alert("Please enter your name and email.");
        return;
    }
    onSubmit({ name, email, message });
  };

  return (
    <div className="ask-dentist-modal-overlay" onClick={onClose}>
      <div className="ask-dentist-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="ask-dentist-modal-close" onClick={onClose}>&times;</button>
        <h3>{imageSrc ? "Ask a Dentist" : "Contact Us"}</h3>
        <p>
            {imageSrc 
                ? "A local dental professional will review your smile preview and contact you shortly."
                : "Have a question? A local professional will get back to you shortly."
            }
        </p>
        {imageSrc && <img src={imageSrc} alt="Smile Preview" className="ask-dentist-modal-image" />}
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="email" placeholder="Your Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <textarea placeholder="Your message (optional)" value={message} onChange={(e) => setMessage(e.target.value)} rows={3}></textarea>
          <button type="submit" className="generate-btn">Send to Dentist</button>
        </form>
      </div>
    </div>
  );
};

export default AskDentistModal;