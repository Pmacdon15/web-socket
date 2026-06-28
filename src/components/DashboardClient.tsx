"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import React, { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { actionSaveMessage } from "@/actions/chat";
import type { SerializableResult } from "@/dal/chat";
import { useDashboardMutations } from "@/hooks/useDashboardMutations";
import { getSocket } from "@/lib/socket";
import type { FriendRelation, Message, Room } from "@/types/chat";
import ChatArea from "./ChatArea";
import { DashboardLoading } from "./DashboardLoading";
import {
  AddFriendModal,
  ConfirmDialog,
  CreateRoomModal,
  JoinRoomModal,
  ShowQRCodeModal,
} from "./Modals";
import Sidebar from "./Sidebar";

interface DashboardClientProps {
  roomsPromise: Promise<SerializableResult<Room[]>>;
  friendsPromise: Promise<SerializableResult<FriendRelation[]>>;
  messagesPromise: Promise<SerializableResult<Message[]>>;
  activeRoomIdPromise: Promise<string>;
  activeRoomTypePromise: Promise<string>;
  activeRoomNamePromise: Promise<string>;
}

export default function DashboardClient({
  roomsPromise,
  friendsPromise,
  messagesPromise,
  activeRoomIdPromise,
  activeRoomTypePromise,
  activeRoomNamePromise,
}: DashboardClientProps) {
  const { user: clerkUser, isLoaded } = useUser();
  const router = useRouter();

  // Resolve Suspended Server Promises
  const roomsResult = use(roomsPromise);
  const friendsResult = use(friendsPromise);
  const messagesResult = use(messagesPromise);
  const activeRoomId = use(activeRoomIdPromise) || "global-lounge";
  const activeRoomType =
    (use(activeRoomTypePromise) as "group" | "friend") || "group";
  const activeRoomName = use(activeRoomNamePromise) || "Global Lounge 🌐";

  const rooms = roomsResult.success ? roomsResult.data : [];
  const friends = friendsResult.success ? friendsResult.data : [];
  const dbMessages = messagesResult.success ? messagesResult.data : [];

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
  const [showQRCode, setShowQRCode] = useState(false);

  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const triggeredRef = React.useRef<string | null>(null);

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

  // Custom hook containing all Dashboard React Query mutations
  const {
    addFriendMutation,
    acceptFriendMutation,
    createRoomMutation,
    deleteRoomMutation,
    joinRoomMutation,
  } = useDashboardMutations({
    setShowAddFriend,
    setShowCreateRoom,
    setShowJoinRoom,
  });

  // Check for auto-adding friend via QR code search param
  const searchParams = useSearchParams();
  useEffect(() => {
    const friendId = searchParams.get("addFriend");
    if (friendId && currentUser.id && triggeredRef.current !== friendId) {
      triggeredRef.current = friendId;

      if (friendId === currentUser.id) {
        toast.error("You cannot add yourself as a friend");
        const params = new URLSearchParams(window.location.search);
        params.delete("addFriend");
        router.replace(`/dashboard?${params.toString()}`);
        return;
      }

      const isAlreadyFriend = friends.some(
        (f) => f.userId === friendId || f.friendId === friendId,
      );

      if (isAlreadyFriend) {
        toast.info(
          "You are already friends or have a pending request with this user",
        );
        const params = new URLSearchParams(window.location.search);
        params.delete("addFriend");
        router.replace(`/dashboard?${params.toString()}`);
        return;
      }

      addFriendMutation.mutate(friendId);
    }
  }, [searchParams, currentUser.id, friends, addFriendMutation, router]);
  

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
        onShowQRCode={() => setShowQRCode(true)}
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

      <ShowQRCodeModal
        isOpen={showQRCode}
        onClose={() => setShowQRCode(false)}
        userId={currentUser.id}
        userName={currentUser.name}
      />
    </div>
  );
}
