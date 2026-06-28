import Link from "next/link";
import { EyeOff, ArrowLeft, Database, KeyRound, Info } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-slate-50 text-slate-900 relative overflow-x-hidden px-4 py-12">
      {/* Decorative background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: "2s" }}></div>

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.015)_1px,transparent_1px)] bg-size:24px_24px mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%) pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-3xl flex flex-col gap-8">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-sky-500 transition-colors group cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to PatChat
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-sky-500 flex items-center justify-center font-bold text-xs text-white">
              P
            </span>
            <span className="font-extrabold text-sm tracking-tight text-slate-800">
              PatChat
            </span>
          </div>
        </div>

        {/* Content Panel */}
        <main className="glass-panel rounded-3xl p-8 md:p-10 bg-white/75 border border-sky-100/50 shadow-xl space-y-8">
          <div className="space-y-3 pb-6 border-b border-slate-100">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-sky-500 via-sky-600 to-indigo-600">
              Privacy Policy
            </h1>
            <p className="text-xs text-slate-400">Last updated: June 2026</p>
          </div>

          {/* Section: Fun Side Project */}
          <section className="space-y-3 flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-500 border border-sky-100 shrink-0">
              <Info className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-slate-800">Fun Side Project Policy</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                PatChat is built solely for fun and demonstration purposes. We do not use, mine, share, or sell your data. We have absolutely no interest in tracking you or selling advertisement spaces.
              </p>
            </div>
          </section>

          {/* Section: Stored Data */}
          <section className="space-y-3 flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-500 border border-blue-100 shrink-0">
              <Database className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-slate-800">Minimal Data We Store</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                We only store the bare minimum details required for the application to function correctly. This is restricted to:
              </p>
              <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-1">
                <li>Your Clerk authenticated User ID, name, and profile image.</li>
                <li>Your room subscriptions and friendship relations.</li>
                <li>Your chat room messages and direct messages (so you and your friends can read them).</li>
              </ul>
            </div>
          </section>

          {/* Section: Encryption Warning */}
          <section className="space-y-3 flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-500 border border-amber-100 shrink-0">
              <EyeOff className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-slate-800 text-amber-800">No End-to-End Encryption</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Please be aware that this chat client is <span className="font-semibold text-slate-800">not end-to-end encrypted</span>. While communication between the server and your browser is secured via SSL/HTTPS, messages are stored in plain text in our database and processed by our servers. 
                <span className="font-bold text-slate-800"> Do not use this application to send sensitive personal information, passwords, financial data, or secrets.</span>
              </p>
            </div>
          </section>

          {/* Section: Infrastructure */}
          <section className="space-y-3 flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-500 border border-purple-100 shrink-0">
              <KeyRound className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-slate-800">Authentication & Infrastructure</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Authentication services are securely managed by <a href="https://clerk.com" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">Clerk</a>, and our database is hosted on <a href="https://neon.tech" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">Neon serverless Postgres</a>. We do not inspect, retain, or store credentials ourselves.
              </p>
            </div>
          </section>
        </main>

        {/* Footer info */}
        <div className="text-center text-[10px] text-slate-400">
          PatChat © 2026 • Real-time WebSockets
        </div>
      </div>
    </div>
  );
}
