"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { actionSearchUsers, actionSearchRooms } from "@/app/actions/chat";
import type { User, Room } from "@/types/chat";

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (friendId: string) => void;
  isPending: boolean;
}

export function AddFriendModal({ isOpen, onClose, onSubmit, isPending }: AddFriendModalProps) {
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
    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-sm w-full p-6 rounded-2xl border border-slate-200 shadow-xl relative space-y-4 animate-float" style={{ animationIterationCount: 1, animationDuration: "0.3s" }}>
        <button
          onClick={onClose}
          disabled={isPending}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 disabled:opacity-50 cursor-pointer"
        >
          ✕
        </button>
        <h3 className="text-lg font-bold text-slate-800">Add Friend</h3>
        <p className="text-xs text-slate-500">
          Search by name or enter a user ID. Clicking a matching user from the autocomplete dropdown will instantly send a request.
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
              autoFocus
            />

            {/* Autocomplete Dropdown */}
            {query.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg z-50 divide-y divide-slate-100 custom-scrollbar">
                {isLoading ? (
                  <div className="p-3 text-xs text-slate-400 text-center">Searching users...</div>
                ) : autocompleteUsers.length === 0 ? (
                  <div className="p-3 text-xs text-slate-400 text-center">No matching users found</div>
                ) : (
                  autocompleteUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleSelectUser(user.id)}
                      className="w-full p-2.5 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-7 h-7 rounded-full bg-slate-100 object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate">{user.name}</p>
                        <p className="text-[9px] text-slate-400 font-mono truncate">{user.id}</p>
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
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold text-white disabled:opacity-50 cursor-pointer"
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
    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-sm w-full p-6 rounded-2xl border border-slate-200 shadow-xl relative space-y-4">
        <button
          onClick={onClose}
          disabled={isPending}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 disabled:opacity-50 cursor-pointer"
        >
          ✕
        </button>
        <h3 className="text-lg font-bold text-slate-800">Create Chat Room</h3>
        <p className="text-xs text-slate-500">
          Create a new public group channel where users can join and message each other.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            disabled={isPending}
            placeholder="e.g. Design Team 🎨"
            className="w-full glass-input px-4 py-2.5 rounded-xl text-sm outline-none text-slate-800"
            required
            autoFocus
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
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold text-white disabled:opacity-50 cursor-pointer"
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
    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-sm w-full p-6 rounded-2xl border border-slate-200 shadow-xl relative space-y-4">
        <button
          onClick={onClose}
          disabled={isPending}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 disabled:opacity-50 cursor-pointer"
        >
          ✕
        </button>
        <h3 className="text-lg font-bold text-slate-800">Join Existing Room</h3>
        <p className="text-xs text-slate-500">
          Search by name or enter a Room ID. Clicking a matching room from the autocomplete dropdown will instantly subscribe you.
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
              autoFocus
            />

            {/* Autocomplete Dropdown */}
            {query.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg z-50 divide-y divide-slate-100 custom-scrollbar">
                {isLoading ? (
                  <div className="p-3 text-xs text-slate-400 text-center">Searching rooms...</div>
                ) : autocompleteRooms.length === 0 ? (
                  <div className="p-3 text-xs text-slate-400 text-center">No matching rooms found</div>
                ) : (
                  autocompleteRooms.map((room) => (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => handleSelectRoom(room.id)}
                      className="w-full p-2.5 flex flex-col items-start text-left hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <p className="text-xs font-semibold text-slate-700 truncate"># {room.name}</p>
                      <p className="text-[9px] text-slate-400 font-mono truncate">{room.id}</p>
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
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold text-white disabled:opacity-50 cursor-pointer"
            >
              {isPending ? "Joining..." : "Join Room"}
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
    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
