"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const websocket = new WebSocket(
      `${protocol}//${window.location.host}/api/ws1`,
    );

    websocket.onopen = () => {
      console.log("✅ Connected");
      setConnected(true);
    };

    websocket.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    websocket.onclose = () => {
      console.log("❌ Disconnected");
      setConnected(false);
    };

    websocket.onerror = (error) => {
      console.error("⚠️ Error:", error);
    };

    setWs(websocket);

    return () => websocket.close();
  }, []);

  const handleSend = () => {
    if (!message.trim() || !ws) return;
    ws.send(message);
    setMessage("");
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">WebSocket Test</h1>
      <div
        className={`mb-4 p-2 rounded ${connected ? "bg-green-100" : "bg-red-100"}`}
      >
        Status: {connected ? "✅ Connected" : "❌ Disconnected"}
      </div>

      <div className="border p-4 h-64 overflow-y-auto mb-4 bg-gray-50">
        {messages.map((msg, i) => (
          <div key={i} className="text-sm mb-2 p-2 bg-white border rounded">
            {msg}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 border px-3 py-2 rounded"
        />
        <button
          type="button"
          onClick={handleSend}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}
