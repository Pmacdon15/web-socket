"use client";

import React, { useState } from "react";

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (friendId: string) => void;
  isPending: boolean;
}

export function AddFriendModal({ isOpen, onClose, onSubmit, isPending }: AddFriendModalProps) {
  const [friendId, setFriendId] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendId.trim()) return;
    onSubmit(friendId.trim());
    setFriendId("");
  };

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-panel max-w-sm w-full p-6 rounded-2xl border border-zinc-800 relative space-y-4">
        <button
          onClick={onClose}
          disabled={isPending}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 disabled:opacity-50"
        >
          ✕
        </button>
        <h3 className="text-lg font-bold text-zinc-100">Add Friend</h3>
        <p className="text-xs text-zinc-400">
          Type in a user ID to add a peer to your friends directory. You can copy the user ID of another browser window to connect.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={friendId}
            onChange={(e) => setFriendId(e.target.value)}
            disabled={isPending}
            placeholder="e.g. user_2d8k9..."
            className="w-full glass-input px-4 py-2.5 rounded-xl text-sm outline-none bg-zinc-950/50"
            required
            autoFocus
          />
          <div className="flex gap-3 justify-end text-xs">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 font-semibold text-zinc-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !friendId.trim()}
              className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 font-semibold text-white disabled:bg-violet-850 disabled:opacity-50"
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

export function CreateRoomModal({ isOpen, onClose, onSubmit, isPending }: CreateRoomModalProps) {
  const [roomName, setRoomName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    onSubmit(roomName.trim());
    setRoomName("");
  };

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-panel max-w-sm w-full p-6 rounded-2xl border border-zinc-800 relative space-y-4">
        <button
          onClick={onClose}
          disabled={isPending}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 disabled:opacity-50"
        >
          ✕
        </button>
        <h3 className="text-lg font-bold text-zinc-100">Create Chat Room</h3>
        <p className="text-xs text-zinc-400">
          Create a new public group channel where users can join and message each other.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            disabled={isPending}
            placeholder="e.g. Tech Support 💻"
            className="w-full glass-input px-4 py-2.5 rounded-xl text-sm outline-none bg-zinc-950/50"
            required
            autoFocus
          />
          <div className="flex gap-3 justify-end text-xs">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 font-semibold text-zinc-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !roomName.trim()}
              className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 font-semibold text-white disabled:bg-violet-850 disabled:opacity-50"
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

export function JoinRoomModal({ isOpen, onClose, onSubmit, isPending }: JoinRoomModalProps) {
  const [roomId, setRoomId] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim()) return;
    onSubmit(roomId.trim());
    setRoomId("");
  };

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-panel max-w-sm w-full p-6 rounded-2xl border border-zinc-800 relative space-y-4">
        <button
          onClick={onClose}
          disabled={isPending}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 disabled:opacity-50"
        >
          ✕
        </button>
        <h3 className="text-lg font-bold text-zinc-100">Join Existing Room</h3>
        <p className="text-xs text-zinc-400">
          Enter a Room ID (e.g. GRP-XYZ123) to add the room to your active chat list.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            disabled={isPending}
            placeholder="e.g. GRP-ABCD123"
            className="w-full glass-input px-4 py-2.5 rounded-xl text-sm outline-none bg-zinc-950/50"
            required
            autoFocus
          />
          <div className="flex gap-3 justify-end text-xs">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 font-semibold text-zinc-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !roomId.trim()}
              className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 font-semibold text-white disabled:bg-violet-850 disabled:opacity-50"
            >
              {isPending ? "Joining..." : "Join Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
