import Link from "next/link";
import { ReceiptText, ArrowLeft, ShieldAlert, Award, AlertTriangle, Eye } from "lucide-react";

export default function TermsOfService() {
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
              Terms of Service
            </h1>
            <p className="text-xs text-slate-400">Last updated: June 2026</p>
          </div>

          {/* Section: Age Restriction */}
          <section className="space-y-3 flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-500 border border-rose-100 shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-slate-800">Age Restriction</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Using this application is strictly forbidden for anyone under the age of 18. By using this service, you warrant and represent that you are at least 18 years of age.
              </p>
            </div>
          </section>

          {/* Section: Purpose & Limits */}
          <section className="space-y-3 flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-500 border border-sky-100 shrink-0">
              <ReceiptText className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-slate-800">Purpose & Usage Limits</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                PatChat is a fun side project created to explore and test real-time WebSocket connection mechanics on Vercel (which are typically not natively supported on traditional serverless platforms). 
                It is provided for testing and light personal usage. It remains completely free to use as long as it is not subjected to heavy-load, spam, or high-volume commercial-scale operations.
              </p>
            </div>
          </section>

          {/* Section: License Terms */}
          <section className="space-y-3 flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-500 border border-emerald-100 shrink-0">
              <Award className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h2 className="text-sm font-bold text-slate-800">Software License</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                This software is free for personal and non-commercial use.
              </p>
              
              <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/50 space-y-3 mt-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Commercial Use Conditions</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  If you intend to use this software to generate revenue, you are granted permission to do so provided you strictly adhere to the following two conditions:
                </p>
                <ol className="list-decimal list-inside text-xs text-slate-600 space-y-2.5 pl-1">
                  <li className="leading-relaxed">
                    <span className="font-bold text-slate-700">Rebranding:</span> You must completely rebrand the application. This includes removing all existing logos, brand names, and visual identity markers associated with the original project, replacing them with your own unique branding.
                  </li>
                  <li className="leading-relaxed">
                    <span className="font-bold text-slate-700">Attribution:</span> You must provide clear attribution to the original author, Patrick MacDonald, and include a link to the GitHub profile: <a href="https://github.com/pmacdon15" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline hover:text-sky-500 font-medium">https://github.com/pmacdon15</a>. This attribution must be visible within the application (e.g., in an "About", "Credits", or "Footer" section).
                  </li>
                </ol>
                <p className="text-xs text-slate-500 leading-relaxed pt-1">
                  Upon fulfilling these conditions, you are granted a non-exclusive, royalty-free license to use, modify, and distribute the software for commercial purposes.
                </p>
              </div>
            </div>
          </section>

          {/* Section: Warranty Disclaimer */}
          <section className="space-y-3 flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-500 border border-amber-100 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-slate-800">Warranty Disclaimer</h2>
              <p className="text-[11px] text-slate-500 font-mono leading-relaxed uppercase bg-slate-50 p-3.5 rounded-2xl border border-slate-200/50">
                THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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
