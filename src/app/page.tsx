import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { Suspense } from "react";
import ChatSimulator from "@/components/ChatSimulator";
import HomePageUserSection from "@/components/home-page-user-section";
import SystemStatus from "@/components/SystemStatus";
import TechShowcase from "@/components/TechShowcase";
import { Footer } from "@/components/Footer";

export default async function Home() {
  const userPromise = currentUser();

  return (
    <div className="flex flex-col flex-1 items-center justify-start min-h-screen bg-slate-50 text-slate-900 relative overflow-x-hidden px-4 py-8">
      {/* Decorative background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.015)_1px,transparent_1px)] bg-size:24px_24px mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%) pointer-events-none"></div>

      <header className="relative z-10 max-w-6xl w-full flex flex-col items-center text-center gap-6 py-6">
        {/* Floating App Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-200 bg-sky-50/50 text-sky-600 text-xs font-semibold uppercase tracking-wider active-glow">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping"></span>
          Now Live: WebSockets & QR Codes
        </div>

        {/* Hero Headline */}
        <div className="flex flex-col gap-3 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-sky-500 via-sky-600 to-indigo-600 animate-float">
            PatChat
          </h1>
          <p className="text-sm md:text-base text-slate-600 leading-relaxed max-w-xl mx-auto">
            Experience premium real-time messaging powered natively by Vercel
            WebSockets, Neon serverless Postgres, and Clerk Authentication.
          </p>
        </div>
      </header>

      {/* Bento Grid */}
      <main className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        {/* COMPONENT 1: Interactive Chat Simulator (Big - 2 cols on lg) */}
        <section className="glass-panel rounded-3xl p-6 lg:col-span-2 flex flex-col h-105 bg-white/75 relative">
          <ChatSimulator />
        </section>

        {/* COMPONENT 2: Auth Profile Card & QR Code (Medium - 1 col) */}
        <section className="glass-panel rounded-3xl p-6 bg-white/75 flex flex-col justify-between items-center text-center h-105 border border-sky-100">
          <div className="w-full flex flex-col items-center justify-start flex-1 gap-4">
            <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100 w-full">
              User Profile & Connect
            </h3>
            <Suspense>
              <Show when="signed-in">
                <Suspense>
                  <HomePageUserSection userPromise={userPromise} />
                </Suspense>
              </Show>
            </Suspense>
            <Suspense>
              <Show when="signed-out">
                <div className="flex-1 flex flex-col items-center justify-center gap-4 py-4 px-2">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-500 border border-sky-100">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <title>User Lock Icon</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-700">
                      Authentication Required
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Sign in to start creating rooms, adding friends, and
                      scanning QR codes.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 w-full mt-2">
                    <SignInButton mode="modal">
                      <button
                        type="button"
                        className="py-2.5 px-4 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active-glow"
                      >
                        Log In / Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button
                        type="button"
                        className="py-2 px-4 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Create Account
                      </button>
                    </SignUpButton>
                  </div>
                </div>
              </Show>
            </Suspense>
          </div>
          <Suspense>
            <Show when="signed-in">
              <Link
                href="/dashboard"
                className="py-2.5 px-4 w-full bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-sky-500/10 hover:shadow-sky-500/25 active-glow"
              >
                Enter Chat Dashboard
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>Arrow Right</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
            </Show>
          </Suspense>
        </section>

        {/* COMPONENT 3: Live System Status (Small - 1 col) */}
        <section className="glass-panel rounded-3xl p-6 bg-white/75 flex flex-col justify-between h-90 border border-sky-100/50">
          <SystemStatus />
        </section>

        {/* COMPONENT 4: Tech Stack Integration Showcase (Big - 2 cols on lg) */}
        <section className="glass-panel rounded-3xl p-6 lg:col-span-2 flex flex-col justify-between h-90 bg-white/75">
          <TechShowcase />
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
