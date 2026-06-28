"use client";

import React, { useState } from "react";

export default function TechShowcase() {
  const [activeTab, setActiveTab] = useState<"ws" | "db" | "clerk">("ws");

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="w-full space-y-3">
        <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100">
          Technical Integration Showcase
        </h3>

        {/* Tab buttons */}
        <div className="flex gap-1.5 bg-slate-100 p-0.5 rounded-xl text-xs font-semibold text-slate-500 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("ws")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === "ws" ? "bg-white text-sky-600 shadow-xs" : "hover:text-slate-700"
            }`}
          >
            Fluid WebSockets
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("db")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === "db" ? "bg-white text-sky-600 shadow-xs" : "hover:text-slate-700"
            }`}
          >
            Neon Postgres
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("clerk")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === "clerk" ? "bg-white text-sky-600 shadow-xs" : "hover:text-slate-700"
            }`}
          >
            Clerk Auth & Sync
          </button>
        </div>

        {/* Tab Content */}
        <div className="rounded-xl bg-slate-900 text-slate-200 p-4 font-mono text-[10px] leading-relaxed overflow-x-auto h-[180px] custom-scrollbar">
          {activeTab === "ws" && (
            <pre>{`// WebSocket listener inside DashboardClient.tsx
useEffect(() => {
  const socket = getSocket();
  const handleMsg = (msg: Message) => {
    if (msg.roomId === activeRoomId) {
      setWebsocketMessages(prev => [...prev, msg]);
    } else {
      toast.info(\`New message from \${msg.senderName}: "\${msg.text}"\`);
    }
  };
  socket.on("message", handleMsg);
  return () => socket.off("message", handleMsg);
}, [activeRoomId]);`}</pre>
          )}

          {activeTab === "db" && (
            <pre>{`// Neon Serverless Database Queries (queries.ts)
export async function dbAddFriendRequest(
  senderId: string,
  receiverId: string
): Promise<FriendRelation> {
  const sql = getSql();
  const rows = await sql.query(
    \`INSERT INTO friends (user_id, friend_id, status)
     VALUES ($1, $2, 'pending')
     ON CONFLICT (user_id, friend_id) DO UPDATE SET status = EXCLUDED.status
     RETURNING user_id as "userId", friend_id as "friendId", status\`,
    [senderId, receiverId]
  );
  return rows[0] as FriendRelation;
}`}</pre>
          )}

          {activeTab === "clerk" && (
            <pre>{`// Next.js 16 Route Protection via proxy.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/api/ws"]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});`}</pre>
          )}
        </div>
      </div>

      <div className="text-[10px] text-slate-400 italic">
        *Code blocks show simplified code currently in use in the application.
      </div>
    </div>
  );
}
