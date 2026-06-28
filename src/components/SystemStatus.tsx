"use client";

import React, { useState, useEffect } from "react";

export default function SystemStatus() {
  const [latency, setLatency] = useState(12);

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency((prev) => {
        const diff = Math.floor(Math.random() * 5) - 2; // change by -2 to +2
        const next = prev + diff;
        return next < 5 ? 5 : next > 25 ? 25 : next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100 w-full flex items-center justify-between">
          <span>System Status</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 active-glow"></span>
        </h3>

        <div className="space-y-4 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">WebSocket Node</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              ONLINE
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Neon Database</span>
            <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
              CONNECTED
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Mock Latency</span>
            <span className="text-xs font-mono font-bold text-slate-700">
              {latency}ms
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Active Clients</span>
            <span className="text-xs font-bold text-slate-700">
              142 sessions
            </span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100">
        <a
          href="https://vercel.com/docs/functions/streaming-and-websockets/websockets"
          target="_blank"
          rel="noopener noreferrer"
          className="py-2 px-4 w-full border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
        >
          Vercel WebSockets Docs
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <title>External Link Icon</title>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}
