"use client";

import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import type { FriendRelation, Room } from "@/types/chat";

interface SidebarProps {
  currentUser: { id: string; name: string; avatar: string };
  friends: FriendRelation[];
  rooms: Room[];
  activeChat: { type: "friend" | "group"; id: string; name: string } | null;
  onSelectChat: (chat: {
    type: "friend" | "group";
    id: string;
    name: string;
  }) => void;
  onShowAddFriend: () => void;
  onShowCreateRoom: () => void;
  onShowJoinRoom: () => void;
  onDeleteRoom: (roomId: string) => void;
  socketConnected: boolean;
}

export default function Sidebar({
  currentUser,
  friends,
  rooms,
  activeChat,
  onSelectChat,
  onShowAddFriend,
  onShowCreateRoom,
  onShowJoinRoom,
  onDeleteRoom,
  socketConnected,
}: SidebarProps) {
  // const copyUserId = () => {
  //   navigator.clipboard.writeText(currentUser.id);
  //   alert("User ID copied to clipboard!");
  // };

  return (
    <aside className="w-80 border-r border-zinc-900 bg-zinc-950 flex flex-col z-10 shrink-0">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-zinc-900 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-85 transition-opacity"
        >
          <span className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center font-bold text-sm text-white">
            V
          </span>
          <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">
            VoltChat
          </span>
        </Link>
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              socketConnected ? "bg-emerald-500 active-glow" : "bg-rose-500"
            }`}
          ></span>
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
            {socketConnected ? "connected" : "offline"}
          </span>
        </div>
      </div>

      {/* User Profile Area (Clerk & Copy ID) */}
      <div className="p-4 border-b border-zinc-900 bg-zinc-900/10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserButton />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-zinc-300 truncate max-w-35 block">
                {currentUser.name}
              </span>
              <span className="text-[10px] font-mono text-zinc-500 truncate max-w-35 block">
                {currentUser.id}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Channels / Scrollable list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-6">
        {/* Friends Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs uppercase font-extrabold text-zinc-500 tracking-wider">
              Friends
            </span>
            <button
              type="button"
              onClick={onShowAddFriend}
              className="p-1 rounded hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors"
              title="Add Friend"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                role="img"
              >
                <title>Add Friend</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </button>
          </div>
          <div className="space-y-0.5">
            {friends.length === 0 ? (
              <p className="text-xs text-zinc-600 px-2 italic">
                No friends added yet.
              </p>
            ) : (
              friends.map((friend) => {
                const friendId =
                  friend.userId === currentUser.id
                    ? friend.friendId
                    : friend.userId;
                const active =
                  activeChat?.type === "friend" && activeChat.id === friendId;
                const isPending = friend.status === "pending";

                return (
                  <button
                    type="button"
                    key={friendId}
                    onClick={() =>
                      onSelectChat({
                        type: "friend",
                        id: friendId,
                        name: friend.friendName || `User ${friendId.slice(-4)}`,
                      })
                    }
                    className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl text-left transition-all duration-200 ${
                      active
                        ? "bg-violet-600/15 border border-violet-500/25 text-violet-300"
                        : "hover:bg-zinc-900/50 border border-transparent text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <div className="relative">
                      <Image
                        src={
                          friend.friendAvatar ||
                          `https://api.dicebear.com/7.x/bottts/svg?seed=${friendId}`
                        }
                        alt={
                          friend.friendName
                            ? `${friend.friendName}'s avatar`
                            : "Friend avatar"
                        }
                        className="w-8 h-8 rounded-lg bg-zinc-900 p-0.5 object-cover"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-zinc-950 ${
                          friend.online ? "bg-emerald-500" : "bg-zinc-600"
                        }`}
                      ></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold truncate">
                          {friend.friendName || `User ${friendId.slice(-4)}`}
                        </p>
                        {isPending && (
                          <span className="text-[8px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500">
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-500 font-mono truncate">
                        {friendId}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Groups Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs uppercase font-extrabold text-zinc-500 tracking-wider">
              Chat Rooms
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onShowJoinRoom}
                className="p-1 rounded hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Join Existing Room"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Join Existing Room</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={onShowCreateRoom}
                className="p-1 rounded hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Create Room"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  role="image"
                >
                  <title>Create Room</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="space-y-0.5">
            {rooms.length === 0 ? (
              <p className="text-xs text-zinc-600 px-2 italic">
                No rooms created.
              </p>
            ) : (
              rooms.map((room) => {
                const active =
                  activeChat?.type === "group" && activeChat.id === room.id;
                return (
                  <div
                    key={room.id}
                    className={`group/room w-full flex items-center justify-between px-2 py-1.5 rounded-xl transition-all duration-200 ${
                      active
                        ? "bg-violet-600/15 border border-violet-500/25 text-violet-300"
                        : "hover:bg-zinc-900/50 border border-transparent text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        onSelectChat({
                          type: "group",
                          id: room.id,
                          name: room.name,
                        })
                      }
                      className="flex-1 flex items-center gap-3 text-left min-w-0"
                    >
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800 text-xs font-bold text-violet-400">
                        #
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {room.name}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-mono truncate">
                          {room.id}
                        </p>
                      </div>
                    </button>
                    {/* Delete button (except global-lounge) */}
                    {room.id !== "global-lounge" && (
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            confirm(
                              `Are you sure you want to delete the room "${room.name}"?`,
                            )
                          ) {
                            onDeleteRoom(room.id);
                          }
                        }}
                        className="opacity-0 group-hover/room:opacity-100 p-1 hover:bg-rose-500/10 hover:text-rose-400 rounded text-zinc-500 transition-all"
                        title="Delete Room"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <title>Delete room</title>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
