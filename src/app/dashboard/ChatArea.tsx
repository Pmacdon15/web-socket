"use client";

import React, { useRef, useEffect } from "react";
import type { Message, FriendRelation } from "@/types/chat";

interface ChatAreaProps {
  currentUser: { id: string; name: string; avatar: string };
  activeChat: { type: "friend" | "group"; id: string; name: string } | null;
  messages: Message[];
  messageInput: string;
  typingUsers: string[];
  friendRelation: FriendRelation | null;
  onSendMessage: (e?: React.FormEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAcceptFriend: (friendId: string) => void;
}

export default function ChatArea({
  currentUser,
  activeChat,
  messages,
  messageInput,
  typingUsers,
  friendRelation,
  onSendMessage,
  onInputChange,
  onAcceptFriend,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages or typing indicators change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-xl mx-auto gap-6">
        <div className="w-20 h-20 rounded-3xl bg-violet-500/10 flex items-center justify-center text-violet-400 border border-violet-500/20 animate-pulse">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-zinc-100 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">
            Welcome to VoltChat
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Real-time chat rooms powered by WebSockets, Neon Database, and Clerk Auth. Choose a room or add a friend to start communicating.
          </p>
        </div>
      </div>
    );
  }

  // Check direct message permission status
  const isPersonal = activeChat.type === "friend";
  const isPending = isPersonal && friendRelation?.status === "pending";
  // Determine if we are the sender or receiver of the pending request
  const isSender = isPending && friendRelation?.userId === currentUser.id;
  const isReceiver = isPending && friendRelation?.friendId === currentUser.id;

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 z-10 relative overflow-hidden">
      {/* Chat Room Header */}
      <header className="h-16 border-b border-zinc-900 flex items-center justify-between px-6 bg-zinc-950/60 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          {activeChat.type === "friend" ? (
            <img
              src={
                friendRelation?.friendAvatar ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${activeChat.id}`
              }
              alt={activeChat.name}
              className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 p-0.5 object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800 text-sm font-bold text-violet-400">
              #
            </div>
          )}
          <div>
            <h3 className="text-sm font-bold text-zinc-200">{activeChat.name}</h3>
            <p className="text-[10px] text-zinc-500 font-mono tracking-tight">{activeChat.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isPersonal ? (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold tracking-wide">
              Direct Message
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-semibold tracking-wide">
              Group Room
            </span>
          )}
        </div>
      </header>

      {/* Chat Thread */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
        {/* Info Alert */}
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/20 text-xs text-zinc-400 leading-relaxed max-w-2xl mx-auto flex items-start gap-3">
          <span className="text-violet-400 shrink-0 text-base mt-0.5">ℹ</span>
          <p>
            Messages are persisted in the Neon Serverless DB and broadcast via WebSockets.
            Open VoltChat in an Incognito window to simulate another user in real time.
          </p>
        </div>

        {/* Pending Friend Request Action Banner */}
        {isPending && (
          <div className="max-w-md mx-auto p-5 rounded-2xl border border-amber-500/25 bg-amber-500/5 text-center space-y-4 my-8">
            <span className="text-2xl">⏳</span>
            <h4 className="text-sm font-bold text-zinc-200">Friend Request Pending</h4>
            {isSender ? (
              <p className="text-xs text-zinc-400">
                You sent a friend request to <b>{activeChat.name}</b>. Messaging will be unlocked once they accept your request.
              </p>
            ) : isReceiver ? (
              <div className="space-y-3">
                <p className="text-xs text-zinc-400">
                  <b>{activeChat.name}</b> wants to be friends. Accept their request to unlock messaging.
                </p>
                <button
                  onClick={() => onAcceptFriend(activeChat.id)}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-all shadow-md shadow-amber-500/10"
                >
                  Accept Friend Request
                </button>
              </div>
            ) : null}
          </div>
        )}

        {/* Message List */}
        {!isPending && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-zinc-600 gap-2">
            <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-xs text-zinc-500">No messages yet. Say hello to start the conversation!</p>
          </div>
        ) : (
          !isPending &&
          messages.map((msg) => {
            const isSelf = msg.senderId === currentUser.id;
            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[70%] ${
                  isSelf ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <span className="text-[10px] text-zinc-500 font-semibold mb-1 ml-1 mr-1">
                  {isSelf ? "You" : msg.senderName}
                </span>

                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isSelf
                      ? "bg-violet-600 text-white rounded-tr-none"
                      : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>

                <span className="text-[9px] text-zinc-600 mt-1 ml-1 mr-1 font-mono">
                  {msg.timestamp}
                </span>
              </div>
            );
          })
        )}

        {/* Typing Indicators */}
        {!isPending && typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-zinc-500 italic mt-2 ml-1">
            <span className="flex gap-0.5">
              <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></span>
              <span
                className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></span>
              <span
                className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></span>
            </span>
            <span>
              {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Area */}
      <form
        onSubmit={onSendMessage}
        className="p-4 border-t border-zinc-900 bg-zinc-950 flex gap-3 items-center shrink-0"
      >
        <input
          type="text"
          value={messageInput}
          onChange={onInputChange}
          disabled={isPending}
          placeholder={
            isPending
              ? "Chat locked until friend request is accepted..."
              : `Message ${activeChat.name}...`
          }
          className={`flex-1 glass-input px-4 py-3 rounded-xl text-sm text-zinc-200 outline-none transition-all ${
            isPending ? "opacity-50 cursor-not-allowed bg-zinc-900/50" : ""
          }`}
        />
        <button
          type="submit"
          disabled={isPending || !messageInput.trim()}
          className={`px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 shrink-0 ${
            isPending || !messageInput.trim()
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-900"
              : "bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-500/10 active:scale-95"
          }`}
        >
          Send
        </button>
      </form>
    </div>
  );
}
