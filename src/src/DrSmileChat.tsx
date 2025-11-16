// FIX: Replaced placeholder content with a functional Dr. Smile chat component. This component provides an interactive chat interface using the Gemini API for responses and fixes the module import error in index.tsx.
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import DrSmileAvatar from './DrSmileAvatar';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

type Message = {
    text: string;
    isUser: boolean;
};

interface DrSmileChatProps {
    isOpen: boolean;
    onClose: () => void;
}

const DrSmileChat: React.FC<DrSmileChatProps> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([
        { text: "Hello! I'm Dr. Smile, your AI dental assistant. How can I help you with your smile today?", isUser: false }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && !chatRef.current) {
            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: "You are Dr. Smile, a friendly and helpful AI dental assistant for the 'Hollywood Smile AI' application. Your creator is Dr. Hamdy Ahmed Sallm. You should be encouraging and provide information about cosmetic dentistry, the app's features, and general dental health. Keep your answers concise and easy to understand. Do not provide medical advice, and if asked for it, advise the user to consult a real dental professional.",
                },
            });
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { text: input, isUser: true };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            if (chatRef.current) {
                const result: GenerateContentResponse = await chatRef.current.sendMessage({ message: input });
                const botMessage: Message = { text: result.text, isUser: false };
                setMessages(prev => [...prev, botMessage]);
            }
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: Message = { text: "Sorry, I'm having a little trouble right now. Please try again later.", isUser: false };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="chat-window">
            <div className="chat-header">
                <h3>Chat with Dr. Smile</h3>
                <button onClick={onClose}>&times;</button>
            </div>
            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`chat-message ${msg.isUser ? 'user' : 'bot'}`}>
                        {!msg.isUser && <div className="chat-avatar"><DrSmileAvatar /></div>}
                        <div className="chat-bubble">{msg.text}</div>
                    </div>
                ))}
                {isLoading && (
                     <div className="chat-message bot">
                        <div className="chat-avatar"><DrSmileAvatar /></div>
                        <div className="chat-bubble typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="chat-input-area">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask a question..."
                    disabled={isLoading}
                />
                <button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>Send</button>
            </div>
        </div>
    );
};

export default DrSmileChat;