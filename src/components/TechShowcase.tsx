export default function TechShowcase() {
  const code = `// src/app/api/ws/route.ts
import { experimental_upgradeWebSocket } from "@vercel/functions";
import { connection } from "next/server";

export async function GET() {
  await connection();
  
  return experimental_upgradeWebSocket((ws) => {
    ws.on("message", (data) => {
      // Handle bidirectional events (join, send-message, typing, etc.)
      ws.send(JSON.stringify({ type: "message", text: "Echo: " + data }));
    });
    
    ws.on("close", () => console.log("WebSocket connection closed"));
  });
}`;

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="w-full space-y-3">
        <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100">
          Vercel WebSockets in Next.js
        </h3>

        <p className="text-xs text-slate-500 leading-relaxed">
          Upgrade API routes to real-time serverless WebSocket channels using
          Vercel Fluid Compute.
        </p>

        {/* Code Content */}
        <div className="rounded-xl bg-slate-900 text-slate-200 p-4 font-mono text-[10px] leading-relaxed overflow-x-auto h-[170px] custom-scrollbar">
          <pre>{code}</pre>
        </div>
      </div>

      <div className="text-[10px] text-slate-400 italic">
        *Powered by experimental_upgradeWebSocket from @vercel/functions.
      </div>
    </div>
  );
}
