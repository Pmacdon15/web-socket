import { ReceiptText } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-10 mt-12 bg-white/70 border-t border-sky-100/50 backdrop-blur-md text-slate-600 relative z-10 w-full">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <ReceiptText className="h-5 w-5 text-sky-500 animate-pulse" />
              <p className="text-sm font-bold tracking-tight text-slate-800">PatChat</p>
            </div>
            <p className="text-xs text-slate-400">
              Built for fun by Patrick Macdonald © 2026.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-6">
              <Link
                href="/terms"
                className="hover:text-sky-500 transition-colors font-medium"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="hover:text-sky-500 transition-colors font-medium"
              >
                Privacy
              </Link>
            </div>

            <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 border-slate-200 w-full md:w-auto justify-center">
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                Attribution:
              </span>
              <a
                href="https://github.com/pmacdon15"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-sky-600 hover:text-sky-500 hover:underline transition-colors font-semibold"
              >
                Patrick MacDonald
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
