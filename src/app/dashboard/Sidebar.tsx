"use client";

import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
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
  isSidebarOpen: boolean;
  onClose: () => void;
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
  isSidebarOpen,
  onClose,
}: SidebarProps) {
  const copyUserId = () => {
    navigator.clipboard.writeText(currentUser.id);
    toast.success("User ID copied to clipboard!");
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 md:hidden w-full h-full text-left cursor-default outline-none border-none"
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-80 border-r border-slate-200 bg-white flex flex-col shrink-0 transition-transform duration-300 md:static md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-85 transition-opacity"
        >
          <span className="w-6 h-6 rounded-lg bg-sky-500 flex items-center justify-center font-bold text-sm text-white">
            P
          </span>
          <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-linear-to-r from-sky-500 to-sky-600">
            PatChat
          </span>
        </Link>
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              socketConnected ? "bg-emerald-500 active-glow" : "bg-rose-500"
            }`}
          ></span>
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            {socketConnected ? "connected" : "offline"}
          </span>
        </div>
      </div>

      {/* User Profile Area (Clerk & Copy ID) */}
      <div className="p-4 border-b border-slate-200 bg-white flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserButton />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-700 truncate max-w-32.5 block">
                {currentUser.name}
              </span>
              <span className="text-[10px] font-mono text-slate-400 truncate max-w-32.5 block">
                {currentUser.id}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={copyUserId}
            className="text-[10px] px-2 py-1 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded font-semibold text-sky-600 hover:text-sky-500 transition-colors"
          >
            Copy ID
          </button>
        </div>
      </div>

      {/* Channels / Scrollable list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-6">
        {/* Friends Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">
              Friends
            </span>
            <button
              type="button"
              onClick={onShowAddFriend}
              className="p-1 rounded hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
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
              <p className="text-xs text-slate-400 px-2 italic">
                No friends added yet.
              </p>
            ) : (
              friends.map((friend) => {
                const friendId =
                  friend.userId === currentUser.id
                    ? friend.friendId
                    : friend.userId;
                const dmRoomId = `dm-${[currentUser.id, friendId].sort().join("-")}`;
                const active =
                  activeChat?.type === "friend" && activeChat.id === dmRoomId;
                const isPending = friend.status === "pending";

                return (
                  <button
                    type="button"
                    key={friendId}
                    onClick={() =>
                      onSelectChat({
                        type: "friend",
                        id: dmRoomId,
                        name: friend.friendName || `User ${friendId.slice(-4)}`,
                      })
                    }
                    className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl text-left transition-all duration-200 ${
                      active
                        ? "bg-sky-50 border border-sky-100 text-sky-700 font-semibold"
                        : "hover:bg-slate-200/50 border border-transparent text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <div className="relative">
                      <Image
                        width={600}
                        height={600}
                        src={
                          friend.friendAvatar ||
                          `https://api.dicebear.com/7.x/bottts/svg?seed=${friendId}`
                        }
                        alt={friend.friendName || "Friend Avatar"}
                        className="w-8 h-8 rounded-lg bg-slate-100 p-0.5 object-cover border border-slate-200/50"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-50 ${
                          friend.online ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      ></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm truncate">
                          {friend.friendName || `User ${friendId.slice(-4)}`}
                        </p>
                        {isPending && (
                          <span className="text-[8px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-600 font-bold">
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono truncate">
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
            <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">
              Chat Rooms
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onShowJoinRoom}
                className="p-1 rounded hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
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
                className="p-1 rounded hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
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
            {rooms.filter((r) => r.type === "group").length === 0 ? (
              <p className="text-xs text-slate-400 px-2 italic">
                No rooms joined.
              </p>
            ) : (
              rooms
                .filter((r) => r.type === "group")
                .map((room) => {
                  const active =
                    activeChat?.type === "group" && activeChat.id === room.id;
                  return (
                    <div
                      key={room.id}
                      className={`group/room w-full flex items-center justify-between px-2 py-1.5 rounded-xl transition-all duration-200 ${
                        active
                          ? "bg-sky-50 border border-sky-100 text-sky-700 font-semibold"
                          : "hover:bg-slate-200/50 border border-transparent text-slate-600 hover:text-slate-900"
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
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center border text-xs font-bold ${
                            active
                              ? "bg-white border-sky-200 text-sky-500"
                              : "bg-slate-100 border-slate-200 text-slate-500"
                          }`}
                        >
                          #
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{room.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono truncate">
                            {room.id}
                          </p>
                        </div>
                      </button>
                      {/* Delete button (except global-lounge) */}
                      {room.id !== "global-lounge" && (
                        <button
                          type="button"
                          onClick={() => onDeleteRoom(room.id)}
                          className="opacity-0 group-hover/room:opacity-100 p-1 hover:bg-rose-50 hover:text-rose-600 rounded text-slate-400 transition-all border border-transparent hover:border-rose-100"
                          title="Leave/Delete Room"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <title>Leave room</title>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
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
    </>
  );
}
