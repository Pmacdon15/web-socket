"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import React, { use, useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import {
  actionAcceptFriend,
  actionAddFriend,
  actionCreateRoom,
  actionDeleteRoom,
  actionJoinRoom,
  actionSaveMessage,
} from "@/actions/chat";
import type { SerializableResult } from "@/dal/chat";
import { getSocket } from "@/lib/socket";
import type { FriendRelation, Message, Room } from "@/types/chat";
import ChatArea from "./ChatArea";
import {
  AddFriendModal,
  ConfirmDialog,
  CreateRoomModal,
  JoinRoomModal,
} from "./Modals";
import Sidebar from "./Sidebar";

interface DashboardClientProps {
  roomsPromise: Promise<SerializableResult<Room[]>>;
  friendsPromise: Promise<SerializableResult<FriendRelation[]>>;
  messagesPromise: Promise<SerializableResult<Message[]>>;
}


export default function DashboardClient({
  roomsPromise,
  friendsPromise,
  messagesPromise,
}: DashboardClientProps) {
  const { user: clerkUser, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Resolve Suspended Server Promises
  const roomsResult = use(roomsPromise);
  const friendsResult = use(friendsPromise);
  const messagesResult = use(messagesPromise);

  const rooms = roomsResult.success ? roomsResult.data : [];
  const friends = friendsResult.success ? friendsResult.data : [];
  const dbMessages = messagesResult.success ? messagesResult.data : [];

  // Active chat state based on URL Search Parameters
  const activeRoomId = searchParams.get("room") || "global-lounge";
  const activeRoomType =
    (searchParams.get("type") as "group" | "friend") || "group";
  const activeRoomName = searchParams.get("name") || "Global Lounge 🌐";

  const activeChat = {
    id: activeRoomId,
    type: activeRoomType,
    name: activeRoomName,
  };

  // Local Chat / WebSockets states
  const [websocketMessages, setWebsocketMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [socketConnected, setSocketConnected] = useState(false);

  // Modals visibility states
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [deleteRoomId, setDeleteRoomId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Build the current user structure
  const currentUser = clerkUser
    ? {
        id: clerkUser.id,
        name: clerkUser.fullName || clerkUser.username || "User",
        avatar: clerkUser.imageUrl,
      }
    : { id: "", name: "Guest", avatar: "" };

  // 1. WebSocket status listener
  useEffect(() => {
    const socket = getSocket();
    setSocketConnected(socket.ws?.readyState === WebSocket.OPEN);

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  // Compute all joined room IDs for notifications
  const allJoinedRoomIds = React.useMemo(() => {
    const ids = new Set<string>();
    // Group rooms
    rooms.forEach((r) => {
      ids.add(r.id);
    });
    // DM rooms
    friends.forEach((f) => {
      const friendId = f.userId === currentUser.id ? f.friendId : f.userId;
      ids.add(`dm-${[currentUser.id, friendId].sort().join("-")}`);
    });
    return Array.from(ids);
  }, [rooms, friends, currentUser.id]);

  // 2. Active room message subscriber & typing handler
  useEffect(() => {
    setWebsocketMessages([]);
    setTypingUsers([]);

    const socket = getSocket();

    const handleMsg = (msg: Message & { type?: string }) => {
      if (msg.roomId === activeRoomId) {
        setWebsocketMessages((prev) => {
          // Deduplicate
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      } else {
        // Show toast notification for message received in another room!
        if (msg.senderId !== currentUser.id) {
          if (msg.roomId.startsWith("dm-")) {
            toast.info(`New message from ${msg.senderName}: "${msg.text}"`, {
              description: "Direct Message",
            });
          } else {
            const room = rooms.find((r) => r.id === msg.roomId);
            const roomLabel = room ? room.name : `#${msg.roomId}`;
            toast.info(
              `New message in ${roomLabel} from ${msg.senderName}: "${msg.text}"`,
            );
          }
        }
      }
    };

    const handleTyping = (data: {
      userId: string;
      userName: string;
      isTyping: boolean;
      roomId?: string;
    }) => {
      // Only show typing indicator if it is the active room
      if (data.userId === currentUser.id || data.roomId !== activeRoomId)
        return;
      setTypingUsers((prev) => {
        if (data.isTyping) {
          if (!prev.includes(data.userName)) return [...prev, data.userName];
        } else {
          return prev.filter((name) => name !== data.userName);
        }
        return prev;
      });
    };

    socket.on("message", handleMsg);
    socket.on("user-typing", handleTyping);

    // Join all rooms we are members of so we can receive notifications
    for (const rid of allJoinedRoomIds) {
      socket.emit("join-room", { roomId: rid });
    }

    return () => {
      socket.off("message", handleMsg);
      socket.off("user-typing", handleTyping);
      for (const rid of allJoinedRoomIds) {
        socket.emit("leave-room", { roomId: rid });
      }
    };
  }, [activeRoomId, currentUser.id, allJoinedRoomIds, rooms]);

  // Combine initial db-fetched messages with real-time websocket ones
  // Deduplicate by message ID to prevent double-renders
  const allMessagesMap = new Map<string, Message>();
  for (const m of dbMessages) {
    allMessagesMap.set(m.id, m);
  }
  for (const m of websocketMessages) {
    allMessagesMap.set(m.id, m);
  }
  const renderedMessages = Array.from(allMessagesMap.values());

  // Resolve friend request relation for active DMs
  const friendRelation =
    activeRoomType === "friend"
      ? friends.find((f) => {
          const friendId = f.userId === currentUser.id ? f.friendId : f.userId;
          const dmId = `dm-${[currentUser.id, friendId].sort().join("-")}`;
          return dmId === activeRoomId;
        }) || null
      : null;

  // Mutations using TanStack Query
  const addFriendMutation = useMutation({
    mutationFn: async (friendId: string) => {
      const res = await actionAddFriend(friendId);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Friend request sent!");
      setShowAddFriend(false);
      router.refresh();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to add friend");
    },
  });

  const acceptFriendMutation = useMutation({
    mutationFn: async (friendId: string) => {
      const res = await actionAcceptFriend(friendId);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Friend request accepted!");
      router.refresh();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to accept request");
    },
  });

  const createRoomMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await actionCreateRoom(name, "group");
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: (room) => {
      toast.success("Room created successfully!");
      setShowCreateRoom(false);
      router.push(
        `/dashboard?room=${room.id}&type=group&name=${encodeURIComponent(room.name)}`,
      );
      router.refresh();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create room");
    },
  });

  const deleteRoomMutation = useMutation({
    mutationFn: async (roomId: string) => {
      const res = await actionDeleteRoom(roomId);
      if (!res.success) throw new Error(res.error);
    },
    onSuccess: () => {
      toast.success("Room deleted!");
      router.push(
        "/dashboard?room=global-lounge&type=group&name=Global Lounge 🌐",
      );
      router.refresh();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete room");
    },
  });

  const joinRoomMutation = useMutation({
    mutationFn: async (roomId: string) => {
      const res = await actionJoinRoom(roomId);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: (room) => {
      toast.success(`Joined room ${room.name}!`);
      setShowJoinRoom(false);
      router.push(
        `/dashboard?room=${room.id}&type=group&name=${encodeURIComponent(room.name)}`,
      );
      router.refresh();
    },
    onError: (err) => {
      toast.error(
        err.message || "Failed to join room. Verify the Room ID is correct.",
      );
    },
  });

  // Action Triggers
  const handleSelectChat = (chat: {
    type: "friend" | "group";
    id: string;
    name: string;
  }) => {
    router.push(
      `/dashboard?room=${chat.id}&type=${chat.type}&name=${encodeURIComponent(chat.name)}`,
    );
    setIsSidebarOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    if (!currentUser.id || !socketConnected) return;

    const socket = getSocket();
    socket.emit("typing", {
      roomId: activeRoomId,
      userId: currentUser.id,
      userName: currentUser.name,
      isTyping: true,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", {
        roomId: activeRoomId,
        userId: currentUser.id,
        userName: currentUser.name,
        isTyping: false,
      });
    }, 1500);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !currentUser.id) return;

    const msgId = `MSG-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const payload: Message = {
      id: msgId,
      roomId: activeRoomId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text: messageInput.trim(),
      timestamp,
    };

    // 1. Emit via socket
    const socket = getSocket();
    socket.emit("send-message", payload);

    // 2. Optimistic local insert
    setWebsocketMessages((prev) => [...prev, payload]);

    // 3. Save to Neon Serverless
    actionSaveMessage(
      msgId,
      activeRoomId,
      currentUser.name,
      messageInput.trim(),
    ).then((res) => {
      if (!res.success) {
        toast.error(res.error || "Failed to save message to database");
      }
    });

    // 4. Reset
    setMessageInput("");
    socket.emit("typing", {
      roomId: activeRoomId,
      userId: currentUser.id,
      userName: currentUser.name,
      isTyping: false,
    });

    // 5. Sim bots response if active room is a bot DM
    if (activeRoomId.startsWith("bot-")) {
      handleBotResponse(activeRoomId, payload.text);
    }
  };

  // Bot response simulator
  const handleBotResponse = (botId: string, userText: string) => {
    let reply = "";
    let name = "";
    if (botId === "bot-echo") {
      name = "EchoBot 🤖";
      reply = `ECHO PROTOCOL ACTIVATED: "${userText}"`;
    } else if (botId === "bot-ai") {
      name = "AlphaAI 🧠";
      const options = [
        "Analyzing packet structures. Standard system cohesion achieved.",
        "System diagnostics check: Neon DB operations completed in 15ms.",
        "Deep query: If data is serverless, does a message truly exist if no Client uses use() to resolve it?",
      ];
      reply = options[Math.floor(Math.random() * options.length)];
    } else if (botId === "bot-coder") {
      name = "NovaCoder 💻";
      const jokes = [
        "Why do React hooks prefer dark mode? Because light attracts rendering bugs! 🐛",
        "There are 10 types of people: those who understand binary, and those who don't. 💾",
        "A SQL query walks into a bar, walks up to two tables and asks: 'Can I join you?' 📊",
      ];
      reply = jokes[Math.floor(Math.random() * jokes.length)];
    }

    // local typing state
    setTimeout(() => {
      setTypingUsers((prev) => (prev.includes(name) ? prev : [...prev, name]));
    }, 400);

    setTimeout(() => {
      setTypingUsers((prev) => prev.filter((n) => n !== name));
      const botMsgId = `MSG-BOT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      const botPayload: Message = {
        id: botMsgId,
        roomId: activeRoomId,
        senderId: botId,
        senderName: name,
        text: reply,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setWebsocketMessages((prev) => [...prev, botPayload]);
      actionSaveMessage(botMsgId, activeRoomId, name, reply);
    }, 1500);
  };

  if (!isLoaded || !clerkUser) {
    return <DashboardLoading />;
  }

  return (
    <div className="flex h-screen bg-background text-slate-900 overflow-hidden font-sans relative">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <Sidebar
        currentUser={currentUser}
        friends={friends}
        rooms={rooms}
        activeChat={activeChat}
        onSelectChat={handleSelectChat}
        onShowAddFriend={() => setShowAddFriend(true)}
        onShowCreateRoom={() => setShowCreateRoom(true)}
        onShowJoinRoom={() => setShowJoinRoom(true)}
        onDeleteRoom={(roomId) => setDeleteRoomId(roomId)}
        socketConnected={socketConnected}
        isSidebarOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <ChatArea
        currentUser={currentUser}
        activeChat={activeChat.id ? activeChat : null}
        messages={renderedMessages}
        messageInput={messageInput}
        typingUsers={typingUsers}
        friendRelation={friendRelation}
        onSendMessage={handleSendMessage}
        onInputChange={handleInputChange}
        onAcceptFriend={(friendId) => acceptFriendMutation.mutate(friendId)}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />

      <AddFriendModal
        isOpen={showAddFriend}
        onClose={() => setShowAddFriend(false)}
        onSubmit={(friendId) => addFriendMutation.mutate(friendId)}
        isPending={addFriendMutation.isPending}
      />

      <CreateRoomModal
        isOpen={showCreateRoom}
        onClose={() => setShowCreateRoom(false)}
        onSubmit={(name) => createRoomMutation.mutate(name)}
        isPending={createRoomMutation.isPending}
      />

      <JoinRoomModal
        isOpen={showJoinRoom}
        onClose={() => setShowJoinRoom(false)}
        onSubmit={(roomId) => joinRoomMutation.mutate(roomId)}
        isPending={joinRoomMutation.isPending}
      />

      <ConfirmDialog
        isOpen={!!deleteRoomId}
        onClose={() => setDeleteRoomId(null)}
        onConfirm={() => {
          if (deleteRoomId) {
            deleteRoomMutation.mutate(deleteRoomId);
            setDeleteRoomId(null);
          }
        }}
        title="Leave/Delete Room"
        message="Are you sure you want to delete this room or remove it from your active list?"
        isPending={deleteRoomMutation.isPending}
      />

      <Toaster richColors position="top-right" />
    </div>
  );
}

// Inline fallback loader UI for Suspense transitions
export function DashboardLoading() {
  return (
    <div className="flex h-screen bg-background text-slate-900 overflow-hidden font-sans relative w-full">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-500/5 rounded-full blur-[100px] pointer-events-none"></div>

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
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 animate-pulse"></span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              syncing
            </span>
          </div>
        </div>

        {/* User Profile Area Skeleton */}
        <div className="p-4 border-b border-slate-200 bg-white flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse"></div>
              <div className="flex flex-col gap-1.5">
                <div className="h-3 w-20 bg-slate-200 rounded-sm animate-pulse"></div>
                <div className="h-2 w-16 bg-slate-100 rounded-sm animate-pulse"></div>
              </div>
            </div>
            <div className="h-6 w-14 bg-slate-100 border border-slate-200/60 rounded animate-pulse"></div>
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
              <div className="w-4 h-4 rounded bg-slate-100 animate-pulse"></div>
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 px-2 py-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 animate-pulse relative">
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white bg-slate-300 animate-pulse"></span>
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className={`h-3 bg-slate-200 rounded-sm animate-pulse ${i === 1 ? "w-24" : i === 2 ? "w-28" : "w-20"}`}></div>
                    <div className="h-2.5 w-16 bg-slate-100 rounded-sm animate-pulse"></div>
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
                <div className="w-4 h-4 rounded bg-slate-100 animate-pulse"></div>
                <div className="w-4 h-4 rounded bg-slate-100 animate-pulse"></div>
              </div>
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 px-2 py-1.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-300 font-bold">
                    #
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className={`h-3 bg-slate-200 rounded-sm animate-pulse ${i === 1 ? "w-28" : i === 2 ? "w-24" : "w-32"}`}></div>
                    <div className="h-2.5 w-20 bg-slate-100 rounded-sm animate-pulse"></div>
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
              <div className="h-4 w-32 bg-slate-200 rounded-sm animate-pulse"></div>
              <div className="h-3 w-24 bg-slate-100 rounded-sm animate-pulse"></div>
            </div>
          </div>
          <div>
            <div className="h-5 w-24 bg-slate-100 rounded-full animate-pulse"></div>
          </div>
        </header>

        {/* Chat Thread Skeleton */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-slate-50/30">
          {[
            { self: false, width: "w-48", height: "h-10" },
            { self: true, width: "w-64", height: "h-12" },
            { self: false, width: "w-80", height: "h-16" },
            { self: true, width: "w-36", height: "h-10" },
          ].map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col max-w-[70%] ${
                msg.self ? "ml-auto items-end" : "mr-auto items-start"
              }`}
            >
              {/* Sender Name */}
              <div className={`h-3 w-16 bg-slate-200 rounded-sm animate-pulse mb-1.5 ${msg.self ? "ml-1" : "mr-1"}`}></div>

              {/* Message Bubble */}
              <div
                className={`rounded-2xl px-4 py-2.5 animate-pulse ${msg.width} ${msg.height} ${
                  msg.self
                    ? "bg-sky-100 border border-sky-200/50 rounded-tr-none"
                    : "bg-slate-100 border border-slate-200/60 rounded-tl-none"
                }`}
              ></div>

              {/* Timestamp */}
              <div className={`h-2.5 w-10 bg-slate-100 rounded-sm animate-pulse mt-1.5 ${msg.self ? "ml-1" : "mr-1"}`}></div>
            </div>
          ))}
        </div>

        {/* Chat Input Area Skeleton */}
        <div className="p-4 border-t border-slate-200 bg-white flex gap-3 items-center shrink-0">
          <div className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 h-11 animate-pulse"></div>
          <div className="px-5 py-3 rounded-xl bg-slate-200 w-16 h-11 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
