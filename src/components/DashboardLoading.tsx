// Inline fallback loader UI for Suspense transitions
export function DashboardLoading() {
  return (
    <div className="fixed inset-0 flex bg-background text-slate-900 overflow-hidden font-sans w-full">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Sidebar Skeleton (hidden on mobile, matches real sidebar structure) */}
      <aside className="hidden md:flex flex-col w-80 border-r border-slate-200 bg-white shrink-0 h-full">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-sky-500 flex items-center justify-center font-bold text-sm text-white">
              P
            </span>
            <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-linear-to-r from-sky-500 to-sky-600">
              PatChat
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 animate-pulse" />
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              syncing
            </span>
          </div>
        </div>

        {/* User Profile Area Skeleton */}
        <div className="p-4 border-b border-slate-200 bg-white flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
              <div className="flex flex-col gap-1.5">
                <div className="h-3 w-20 bg-slate-200 rounded-sm animate-pulse" />
                <div className="h-2 w-16 bg-slate-100 rounded-sm animate-pulse" />
              </div>
            </div>
            <div className="h-6 w-14 bg-slate-100 border border-slate-200/60 rounded animate-pulse" />
          </div>
        </div>

        {/* Channels / Scrollable list skeleton */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-6">
          {/* Friends Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs uppercase font-extrabold text-slate-300 tracking-wider">
                Friends
              </span>
              <div className="w-4 h-4 rounded bg-slate-100 animate-pulse" />
            </div>
            <div className="space-y-2">
              {[{ id: 1 }, { id: 2 }, { id: 3 }].map((i) => (
                <div key={i.id} className="flex items-center gap-3 px-2 py-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 animate-pulse relative">
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white bg-slate-300 animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div
                      className={`h-3 bg-slate-200 rounded-sm animate-pulse ${i.id === 1 ? "w-24" : i.id === 2 ? "w-28" : "w-20"}`}
                    />
                    <div className="h-2.5 w-16 bg-slate-100 rounded-sm animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Groups Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs uppercase font-extrabold text-slate-300 tracking-wider">
                Chat Rooms
              </span>
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded bg-slate-100 animate-pulse" />
                <div className="w-4 h-4 rounded bg-slate-100 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              {[{ id: 1 }, { id: 2 }, { id: 3 }].map((i) => (
                <div key={i.id} className="flex items-center gap-3 px-2 py-1.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-300 font-bold">
                    #
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div
                      className={`h-3 bg-slate-200 rounded-sm animate-pulse ${i.id === 1 ? "w-28" : i.id === 2 ? "w-24" : "w-32"}`}
                    />
                    <div className="h-2.5 w-20 bg-slate-100 rounded-sm animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Chat Area Skeleton */}
      <div className="flex-1 flex flex-col bg-white z-10 relative overflow-hidden h-full">
        {/* Chat Room Header Skeleton */}
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white/90 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-300 font-bold">
              #
            </div>
            <div className="space-y-1.5">
              <div className="h-4 w-32 bg-slate-200 rounded-sm animate-pulse" />
              <div className="h-3 w-24 bg-slate-100 rounded-sm animate-pulse" />
            </div>
          </div>
          <div>
            <div className="h-5 w-24 bg-slate-100 rounded-full animate-pulse" />
          </div>
        </header>

        {/* Chat Thread Skeleton */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-slate-50/30">
          {[
            { id: 1, self: false, width: "w-48", height: "h-10" },
            { id: 2, self: true, width: "w-64", height: "h-12" },
            { id: 3, self: false, width: "w-80", height: "h-16" },
            { id: 4, self: true, width: "w-36", height: "h-10" },
          ].map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[70%] ${
                msg.self ? "ml-auto items-end" : "mr-auto items-start"
              }`}
            >
              {/* Sender Name */}
              <div
                className={`h-3 w-16 bg-slate-200 rounded-sm animate-pulse mb-1.5 ${msg.self ? "ml-1" : "mr-1"}`}
              />

              {/* Message Bubble */}
              <div
                className={`rounded-2xl px-4 py-2.5 animate-pulse ${msg.width} ${msg.height} ${
                  msg.self
                    ? "bg-sky-100 border border-sky-200/50 rounded-tr-none"
                    : "bg-slate-100 border border-slate-200/60 rounded-tl-none"
                }`}
              />

              {/* Timestamp */}
              <div
                className={`h-2.5 w-10 bg-slate-100 rounded-sm animate-pulse mt-1.5 ${msg.self ? "ml-1" : "mr-1"}`}
              />
            </div>
          ))}
        </div>

        {/* Chat Input Area Skeleton */}
        <div className="p-4 border-t border-slate-200 bg-white flex gap-3 items-center shrink-0">
          <div className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 h-11 animate-pulse" />
          <div className="px-5 py-3 rounded-xl bg-slate-200 w-16 h-11 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
