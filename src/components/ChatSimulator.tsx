"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";

interface MockMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  avatarSeed: string;
}

const ROOM_MESSAGES: Record<string, MockMessage[]> = {
  "global-lounge": [
    {
      id: "g1",
      sender: "AlphaAI 🧠",
      text: "Welcome to PatChat! Open multiple tabs to test the real-time sync.",
      time: "12:00 PM",
      avatarSeed: "ai",
    },
    {
      id: "g2",
      sender: "NovaCoder 💻",
      text: "Vercel WebSockets feel extremely snappy compared to old polls.",
      time: "12:01 PM",
      avatarSeed: "coder",
    },
    {
      id: "g3",
      sender: "SkyWalker ☁️",
      text: "Is there any room limit or can we create unlimited chats?",
      time: "12:03 PM",
      avatarSeed: "sky",
    },
  ],
  "dev-chat": [
    {
      id: "d1",
      sender: "NovaCoder 💻",
      text: "Just synced Clerk session profiles with the Neon DB database using Server Actions.",
      time: "11:50 AM",
      avatarSeed: "coder",
    },
    {
      id: "d2",
      sender: "AlphaAI 🧠",
      text: "Make sure you read the new Next.js 16 proxy docs in node_modules.",
      time: "11:52 AM",
      avatarSeed: "ai",
    },
  ],
  "ai-bot": [
    {
      id: "a1",
      sender: "AlphaAI 🧠",
      text: "Hello! I am AlphaAI. Type anything and I will formulate a deep serverless thought.",
      time: "10:15 AM",
      avatarSeed: "ai",
    },
  ],
};

const RANDOM_CHATTER = [
  { sender: "SkyWalker ☁️", text: "Just tested the QR code add-friend link, it is so seamless!", avatarSeed: "sky" },
  { sender: "NovaCoder 💻", text: "Next.js 16 proxy matcher configurations are fully static.", avatarSeed: "coder" },
  { sender: "EchoBot 🤖", text: "Beep boop! Incoming packets processed in 5ms.", avatarSeed: "echo" },
  { sender: "AlphaAI 🧠", text: "WebSockets sustain duplex channels over serverless functions.", avatarSeed: "ai" },
];

export default function ChatSimulator() {
  const { user } = useUser();
  const [activeRoom, setActiveRoom] = useState<string>("global-lounge");
  const [simulatorMessages, setSimulatorMessages] = useState<MockMessage[]>([]);
  const [mockInput, setMockInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize messages for active room
  useEffect(() => {
    setSimulatorMessages(ROOM_MESSAGES[activeRoom] || []);
  }, [activeRoom]);

  // Scroll to bottom of chat simulator
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [simulatorMessages]);

  // Simulate active chat environment (periodically add messages)
  useEffect(() => {
    const interval = setInterval(() => {
      // Don't auto-send messages in AI Bot room
      if (activeRoom === "ai-bot") return;

      const chatter = RANDOM_CHATTER[Math.floor(Math.random() * RANDOM_CHATTER.length)];
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      // Simulate typing first
      setTypingUser(chatter.sender);
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);
        setSimulatorMessages((prev) => [
          ...prev,
          {
            id: `auto-${Math.random()}`,
            sender: chatter.sender,
            text: chatter.text,
            time: timeStr,
            avatarSeed: chatter.avatarSeed,
          },
        ]);
      }, 1500);

    }, 10000);

    return () => clearInterval(interval);
  }, [activeRoom]);

  const handleSendMockMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockInput.trim()) return;

    const userDisplayName = user?.fullName || user?.username || "Guest Tester";
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newMsg: MockMessage = {
      id: `user-${Math.random()}`,
      sender: `${userDisplayName} 👤`,
      text: mockInput.trim(),
      time: timeStr,
      avatarSeed: user?.id || "guest",
    };

    setSimulatorMessages((prev) => [...prev, newMsg]);
    const inputContent = mockInput.trim();
    setMockInput("");

    // Trigger simulator bot response if in AI Bot room or randomly in lounge
    if (activeRoom === "ai-bot" || Math.random() > 0.4) {
      setTimeout(() => {
        setTypingUser(activeRoom === "ai-bot" ? "AlphaAI 🧠" : "NovaCoder 💻");
        setIsTyping(true);

        setTimeout(() => {
          setIsTyping(false);
          let botReply = "";
          let botSender = "NovaCoder 💻";
          let botSeed = "coder";

          if (activeRoom === "ai-bot") {
            botSender = "AlphaAI 🧠";
            botSeed = "ai";
            const aiReplies = [
              `Deep Analysis: "${inputContent}" represents a classic web-transaction packet.`,
              "Computing latency index: Neon DB query resolved in 9.4 milliseconds.",
              "If we containerize our WebSocket hooks, do we establish stateless telemetry?",
              "AlphaAI node response finalized. Connection channel fully synced.",
            ];
            botReply = aiReplies[Math.floor(Math.random() * aiReplies.length)];
          } else {
            const coderReplies = [
              "Interesting point! I am pushing a schema migration to Neon serverless now.",
              "Agreed. WebSockets eliminate HTTP header overhead on consecutive messaging.",
              "Are you checking your browser logs? The active ws-client frames are visible there.",
            ];
            botReply = coderReplies[Math.floor(Math.random() * coderReplies.length)];
          }

          setSimulatorMessages((prev) => [
            ...prev,
            {
              id: `reply-${Math.random()}`,
              sender: botSender,
              text: botReply,
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              avatarSeed: botSeed,
            },
          ]);
        }, 1200);
      }, 600);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 active-glow"></span>
          <h3 className="text-sm font-bold text-slate-800">
            Interactive Chat Simulator
          </h3>
        </div>
        <div className="flex gap-1.5 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold text-slate-500">
          <button
            type="button"
            onClick={() => setActiveRoom("global-lounge")}
            className={`px-2 py-1 rounded-md transition-colors ${
              activeRoom === "global-lounge" ? "bg-white text-sky-600 shadow-xs" : "hover:text-slate-700"
            }`}
          >
            Lounge 🌐
          </button>
          <button
            type="button"
            onClick={() => setActiveRoom("dev-chat")}
            className={`px-2 py-1 rounded-md transition-colors ${
              activeRoom === "dev-chat" ? "bg-white text-sky-600 shadow-xs" : "hover:text-slate-700"
            }`}
          >
            Dev 💻
          </button>
          <button
            type="button"
            onClick={() => setActiveRoom("ai-bot")}
            className={`px-2 py-1 rounded-md transition-colors ${
              activeRoom === "ai-bot" ? "bg-white text-sky-600 shadow-xs" : "hover:text-slate-700"
            }`}
          >
            AI Bot 🧠
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-3 space-y-3 pr-1 text-xs">
        {simulatorMessages.map((msg) => (
          <div key={msg.id} className="flex items-start gap-2.5 animate-float" style={{ animationIterationCount: 1, animationDuration: "0.2s" }}>
            {/* biome-ignore lint/performance/noImgElement: using dynamic SVG avatar service */}
            <img
              src={`https://api.dicebear.com/7.x/bottts/svg?seed=${msg.avatarSeed}`}
              alt=""
              className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-100 p-0.5"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-slate-700">{msg.sender}</span>
                <span className="text-[9px] text-slate-400 font-mono">{msg.time}</span>
              </div>
              <p className="text-slate-600 mt-0.5 leading-relaxed bg-slate-50/50 p-2 rounded-xl border border-slate-100/50 inline-block max-w-full">
                {msg.text}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 italic text-[10px] pl-10">
            <span className="flex gap-1 items-center">
              <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce"></span>
              <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0.2s" }}></span>
              <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0.4s" }}></span>
            </span>
            {typingUser} is typing...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Send Input Form */}
      <form onSubmit={handleSendMockMessage} className="flex gap-2 pt-3 border-t border-slate-100">
        <input
          type="text"
          value={mockInput}
          onChange={(e) => setMockInput(e.target.value)}
          placeholder={`Send a mock message to #${activeRoom}...`}
          className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-sky-500 focus:bg-white transition-colors"
        />
        <button
          type="submit"
          disabled={!mockInput.trim()}
          className="px-4 py-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          Send
        </button>
      </form>
    </div>
  );
}
