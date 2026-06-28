"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { actionSearchRooms, actionSearchUsers } from "@/actions/chat";
import type { Room, User } from "@/types/chat";

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (friendId: string) => void;
  isPending: boolean;
}

export function AddFriendModal({
  isOpen,
  onClose,
  onSubmit,
  isPending,
}: AddFriendModalProps) {
  const [query, setQuery] = useState("");

  // TanStack Query for searching users
  const { data: autocompleteUsers = [], isLoading } = useQuery({
    queryKey: ["searchUsers", query],
    queryFn: async () => {
      if (query.trim().length < 2) return [];
      const res = await actionSearchUsers(query.trim());
      if (!res.success) throw new Error(res.error);
      return res.data as User[];
    },
    enabled: query.trim().length >= 2,
    staleTime: 5000,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSubmit(query.trim());
    setQuery("");
  };

  const handleSelectUser = (userId: string) => {
    onSubmit(userId);
    setQuery("");
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div
        className="bg-white max-w-sm w-full p-6 rounded-2xl border border-slate-200 shadow-xl relative space-y-4 animate-float"
        style={{ animationIterationCount: 1, animationDuration: "0.3s" }}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 disabled:opacity-50 cursor-pointer"
        >
          ✕
        </button>
        <h3 className="text-lg font-bold text-slate-800">Add Friend</h3>
        <p className="text-xs text-slate-500">
          Search for friends by name or ID.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 relative">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isPending}
              placeholder="Start typing name or ID..."
              className="w-full glass-input px-4 py-2.5 rounded-xl text-sm outline-none text-slate-800"
              required
            />

            {/* Autocomplete Dropdown */}
            {query.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-100 rounded-xl shadow-lg z-50 divide-y divide-slate-50 custom-scrollbar">
                {isLoading ? (
                  <div className="p-3 text-xs text-slate-400 text-center">
                    Searching users...
                  </div>
                ) : autocompleteUsers.length === 0 ? (
                  <div className="p-3 text-xs text-slate-400 text-center">
                    No matching users found
                  </div>
                ) : (
                  autocompleteUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleSelectUser(user.id)}
                      className="w-full p-2.5 flex items-center gap-3 text-left hover:bg-sky-50/50 transition-colors cursor-pointer"
                    >
                      <Image
                        width={600}
                        height={600}
                        src={user.avatar}
                        alt={user.name}
                        className="w-7 h-7 rounded-full bg-slate-100 object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate">
                          {user.name}
                        </p>
                        <p className="text-[9px] text-slate-400 font-mono truncate">
                          {user.id}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end text-xs pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 font-semibold text-slate-600 disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !query.trim()}
              className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 font-semibold text-white disabled:opacity-50 cursor-pointer"
            >
              {isPending ? "Adding..." : "Add Friend"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  isPending: boolean;
}

export function CreateRoomModal({
  isOpen,
  onClose,
  onSubmit,
  isPending,
}: CreateRoomModalProps) {
  const [roomName, setRoomName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    onSubmit(roomName.trim());
    setRoomName("");
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-sm w-full p-6 rounded-2xl border border-slate-200 shadow-xl relative space-y-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 disabled:opacity-50 cursor-pointer"
        >
          ✕
        </button>
        <h3 className="text-lg font-bold text-slate-800">Create Chat Room</h3>
        <p className="text-xs text-slate-500">Create a new chat room.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            disabled={isPending}
            placeholder="e.g. Design Team 🎨"
            className="w-full glass-input px-4 py-2.5 rounded-xl text-sm outline-none text-slate-800"
            required
          />
          <div className="flex gap-3 justify-end text-xs">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 font-semibold text-slate-600 disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !roomName.trim()}
              className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 font-semibold text-white disabled:opacity-50 cursor-pointer"
            >
              {isPending ? "Creating..." : "Create Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roomId: string) => void;
  isPending: boolean;
}

export function JoinRoomModal({
  isOpen,
  onClose,
  onSubmit,
  isPending,
}: JoinRoomModalProps) {
  const [query, setQuery] = useState("");

  // TanStack Query for searching group rooms
  const { data: autocompleteRooms = [], isLoading } = useQuery({
    queryKey: ["searchRooms", query],
    queryFn: async () => {
      if (query.trim().length < 2) return [];
      const res = await actionSearchRooms(query.trim());
      if (!res.success) throw new Error(res.error);
      return res.data as Room[];
    },
    enabled: query.trim().length >= 2,
    staleTime: 5000,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSubmit(query.trim());
    setQuery("");
  };

  const handleSelectRoom = (roomId: string) => {
    onSubmit(roomId);
    setQuery("");
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-sm w-full p-6 rounded-2xl border border-slate-200 shadow-xl relative space-y-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 disabled:opacity-50 cursor-pointer"
        >
          ✕
        </button>
        <h3 className="text-lg font-bold text-slate-800">Join Existing Room</h3>
        <p className="text-xs text-slate-500">
          Search for rooms by name or ID.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4 relative">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isPending}
              placeholder="Start typing name or ID..."
              className="w-full glass-input px-4 py-2.5 rounded-xl text-sm outline-none text-slate-800"
              required
            />

            {/* Autocomplete Dropdown */}
            {query.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-100 rounded-xl shadow-lg z-50 divide-y divide-slate-50 custom-scrollbar">
                {isLoading ? (
                  <div className="p-3 text-xs text-slate-400 text-center">
                    Searching rooms...
                  </div>
                ) : autocompleteRooms.length === 0 ? (
                  <div className="p-3 text-xs text-slate-400 text-center">
                    No matching rooms found
                  </div>
                ) : (
                  autocompleteRooms.map((room) => (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => handleSelectRoom(room.id)}
                      className="w-full p-2.5 flex flex-col items-start text-left hover:bg-sky-50/50 transition-colors cursor-pointer"
                    >
                      <p className="text-xs font-semibold text-slate-700 truncate">
                        # {room.name}
                      </p>
                      <p className="text-[9px] text-slate-400 font-mono truncate">
                        {room.id}
                      </p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end text-xs pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 font-semibold text-slate-600 disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !query.trim()}
              className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 font-semibold text-white disabled:opacity-50 cursor-pointer"
            >
              {isPending ? "Join Room" : "Join Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isPending?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isPending,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-sm w-full p-6 rounded-2xl border border-slate-200 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        <p className="text-xs text-slate-500">{message}</p>
        <div className="flex gap-3 justify-end text-xs">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 font-semibold text-slate-600 disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 font-semibold text-white disabled:opacity-50 cursor-pointer"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

interface ShowQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

export function ShowQRCodeModal({
  isOpen,
  onClose,
  userId,
  userName,
}: ShowQRCodeModalProps) {
  if (!isOpen) return null;

  const friendLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/dashboard?addFriend=${userId}`
      : `https://patchat.vercel.app/dashboard?addFriend=${userId}`;

  const copyLink = () => {
    navigator.clipboard.writeText(friendLink);
    toast.success("Friend link copied to clipboard!");
  };

  const shareLink = async () => {
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
          copyLink();
        }
      }
    } else {
      copyLink();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div
        className="bg-white max-w-sm w-full p-6 rounded-2xl border border-slate-200 shadow-xl relative space-y-4 animate-float"
        style={{ animationIterationCount: 1, animationDuration: "0.3s" }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          ✕
        </button>

        <div className="text-center space-y-2">
          <h3 className="text-lg font-bold text-slate-800">
            Your Friend QR Code
          </h3>
          <p className="text-xs text-slate-500">
            Let other users scan this QR code or use the link below to add you
            as a friend.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center bg-slate-50 p-4 rounded-xl border border-slate-100 relative">
          <div className="bg-white p-3 rounded-lg shadow-xs">
            <QRCodeSVG value={friendLink} size={180} includeMargin={true} />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-700">
            {userName}
          </p>
          <p className="text-[10px] text-slate-400 font-mono select-all truncate max-w-full px-4">
            {userId}
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={copyLink}
              className="flex-1 py-2.5 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-600 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <title>Copy Link Icon</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                />
              </svg>
              Copy
            </button>
            <button
              type="button"
              onClick={shareLink}
              className="flex-1 py-2.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active-glow"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <title>Share Profile Icon</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 10.742l4.744-2.42m0 5.356l-4.744-2.42m4.744-2.42a3 3 0 110-3.684m0 3.684a3 3 0 110 3.684m0-3.684l-4.744 2.42m4.744-2.42a3 3 0 100-3.684M4 12a3 3 0 106 0 3 3 0 00-6 0z"
                />
              </svg>
              Share
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
