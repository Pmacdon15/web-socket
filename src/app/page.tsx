import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-slate-50 text-slate-900 relative overflow-hidden px-4">
      {/* Decorative background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.015)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <main className="relative z-10 max-w-4xl w-full flex flex-col items-center text-center gap-12 py-16">
        {/* Floating App Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 bg-blue-50/50 text-blue-600 text-xs font-semibold uppercase tracking-wider active-glow">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
          Now Live on Vercel WebSockets
        </div>

        {/* Hero Headline */}
        <div className="flex flex-col gap-4 max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 animate-float">
            PatChat
          </h1>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Experience real-time messaging powered natively by Vercel Functions
            and WebSockets. Open multiple browser tabs to simulate chat
            participants instantly.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/dashboard"
            className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-white shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Enter Chat Dashboard
          </Link>
          <a
            href="https://vercel.com/docs/functions/streaming-and-websockets/websockets"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-slate-700 transition-all duration-300"
          >
            Read Vercel WebSocket Docs
          </a>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8">
          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center gap-3 text-center bg-white/60">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Lightning Bolt Icon</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              Fluid WebSockets
            </h3>
            <p className="text-sm text-slate-600">
              Real-time bidirectional streams hosted inside serverless functions
              using Vercel's Fluid Compute.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center gap-3 text-center bg-white/60">
            <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500 border border-sky-100">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Authentication Shield Icon</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              Clerk Authentication
            </h3>
            <p className="text-sm text-slate-600">
              Secure, premium user session handling and routing powered natively
              by Clerk.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center gap-3 text-center bg-white/60">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Users Icon</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              Friends & Rooms
            </h3>
            <p className="text-sm text-slate-600">
              Search and add users as friends. Create or join chat rooms
              directly by their unique Room ID.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-4 left-0 right-0 text-center text-xs text-slate-400 z-10">
        Built with Next.js & Vercel WebSockets
      </footer>
    </div>
  );
}
