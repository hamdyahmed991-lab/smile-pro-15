import React, { useState } from "react";

export default function DrSmileChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hello! How can I help you today? 😊" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages([...messages, { from: "user", text: input }]);

    // AI placeholder response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Thanks! I'm still learning 😄" },
      ]);
    }, 600);

    setInput("");
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "#4CAF50",
          color: "white",
          border: "none",
          cursor: "pointer",
          fontSize: "18px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          zIndex: 9999,
        }}
      >
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "100px",
            right: "20px",
            width: "340px",
            height: "420px",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
            display: "flex",
            flexDirection: "column",
            zIndex: 9999,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "12px",
              background: "#4CAF50",
              color: "white",
              fontWeight: "bold",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            DrSmile Assistant
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                color: "white",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>

          {/* Chat Messages */}
          <div
            style={{
              flex: 1,
              padding: "10px",
              overflowY: "auto",
              background: "#f5f5f5",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  marginBottom: "10px",
                  textAlign: msg.from === "user" ? "right" : "left",
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    padding: "8px 12px",
                    borderRadius: "10px",
                    background:
                      msg.from === "user" ? "#4CAF50" : "#e0e0e0",
                    color: msg.from === "user" ? "white" : "black",
                    maxWidth: "80%",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div style={{ padding: "10px", display: "flex", gap: "8px" }}>
            <input
              style={{
                flex: 1,
                padding: "8px",
                border: "1px solid #aaa",
                borderRadius: "8px",
              }}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
            />
            <button
              onClick={sendMessage}
              style={{
                padding: "8px 14px",
                background: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
