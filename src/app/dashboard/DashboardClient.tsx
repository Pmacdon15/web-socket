"use client";

import React, { useState, useEffect, use } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { getSocket } from "@/lib/socket";
import type { Room, FriendRelation, Message } from "@/types/chat";
import type { SerializableResult } from "@/dal/chat";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";
import { AddFriendModal, CreateRoomModal, JoinRoomModal, ConfirmDialog } from "./Modals";
import { Toaster, toast } from "sonner";
import {
  actionAddFriend,
  actionAcceptFriend,
  actionCreateRoom,
  actionDeleteRoom,
  actionSaveMessage,
  actionJoinRoom,
} from "@/app/actions/chat";

interface DashboardClientProps {
  roomsPromise: Promise<SerializableResult<Room[]>>;
  friendsPromise: Promise<SerializableResult<FriendRelation[]>>;
  messagesPromise: Promise<SerializableResult<Message[]>>;
}

const BOT_AVATARS = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=100&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=100&auto=format&fit=crop&q=60",
];

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
  const activeRoomType = (searchParams.get("type") as "group" | "friend") || "group";
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
      }
    };

    const handleTyping = (data: { userId: string; userName: string; isTyping: boolean }) => {
      if (data.userId === currentUser.id) return;
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

    // Join the room
    socket.emit("join-room", { roomId: activeRoomId });

    return () => {
      socket.off("message", handleMsg);
      socket.off("user-typing", handleTyping);
      socket.emit("leave-room", { roomId: activeRoomId });
    };
  }, [activeRoomId, currentUser.id]);

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
    onSuccess: (data) => {
      toast.success("Friend request sent!");
      setShowAddFriend(false);
      router.refresh();
    },
    onError: (err: any) => {
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
    onError: (err: any) => {
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
      router.push(`/dashboard?room=${room.id}&type=group&name=${encodeURIComponent(room.name)}`);
      router.refresh();
    },
    onError: (err: any) => {
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
      router.push("/dashboard?room=global-lounge&type=group&name=Global Lounge 🌐");
      router.refresh();
    },
    onError: (err: any) => {
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
      router.push(`/dashboard?room=${room.id}&type=group&name=${encodeURIComponent(room.name)}`);
      router.refresh();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to join room. Verify the Room ID is correct.");
    },
  });

  // Action Triggers
  const handleSelectChat = (chat: { type: "friend" | "group"; id: string; name: string }) => {
    router.push(`/dashboard?room=${chat.id}&type=${chat.type}&name=${encodeURIComponent(chat.name)}`);
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
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

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
    actionSaveMessage(msgId, activeRoomId, currentUser.name, messageInput.trim()).then((res) => {
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
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
    <div className="flex h-screen w-full items-center justify-center bg-background text-slate-500">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold tracking-wider uppercase text-slate-400">
          Syncing PatChat session...
        </p>
      </div>
    </div>
  );
}
