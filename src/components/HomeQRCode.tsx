"use client";

import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

interface HomeQRCodeProps {
  userId: string;
  userName: string;
}

export default function HomeQRCode({ userId, userName }: HomeQRCodeProps) {
  const friendLink = `https://patchat.ca/dashboard?addFriend=${userId}`;

  const copyFriendLink = () => {
    navigator.clipboard.writeText(friendLink);
    toast.success("Friend link copied to clipboard!");
  };

  const shareProfile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Add me on PatChat!",
          text: `Scan my QR code or open this link to add me as a friend on PatChat! My username is ${userName}.`,
          url: friendLink,
        });
        toast.success("Shared successfully!");
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          copyFriendLink();
        }
      }
    } else {
      copyFriendLink();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col items-center shadow-xs w-full max-w-[200px]">
        <div className="bg-white p-2 rounded-lg">
          <QRCodeSVG value={friendLink} size={130} includeMargin={true} />
        </div>
        <span className="text-[9px] text-slate-400 font-mono mt-1.5 select-all truncate max-w-full px-2">
          {userId}
        </span>
      </div>

      <div className="flex gap-2 w-full">
        <button
          type="button"
          onClick={copyFriendLink}
          className="flex-1 py-2 px-3 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-600 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <title>Copy Link Icon</title>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          Copy
        </button>
        <button
          type="button"
          onClick={shareProfile}
          className="flex-1 py-2 px-3 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active-glow"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <title>Share Profile Icon</title>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 10.742l4.744-2.42m0 5.356l-4.744-2.42m4.744-2.42a3 3 0 110-3.684m0 3.684a3 3 0 110 3.684m0-3.684l-4.744 2.42m4.744-2.42a3 3 0 100-3.684M4 12a3 3 0 106 0 3 3 0 00-6 0z" />
          </svg>
          Share
        </button>
      </div>
    </div>
  );
}
