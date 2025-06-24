import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

function Chat() {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState([
    // Mock messages
    { id: 1, sender: "admin", text: "Hello! How can I help you?" },
    { id: 2, sender: "client", text: "I want to discuss my project." },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Scroll to bottom on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, sender: "client", text: newMessage.trim() },
    ]);
    setNewMessage("");
    // TODO: send message to backend/chat server
  };

  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col h-[80vh] border rounded">
      <h1 className="text-2xl font-bold mb-4">Chat Conversation #{conversationId}</h1>

      <div className="flex-grow overflow-auto mb-4 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded max-w-[70%] ${
              msg.sender === "client" ? "bg-blue-100 self-end" : "bg-gray-200 self-start"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-grow border p-3 rounded"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-6 rounded hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;
