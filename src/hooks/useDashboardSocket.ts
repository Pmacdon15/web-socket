"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { actionSaveMessage } from "@/actions/chat";
import { getSocket } from "@/lib/socket";
import type { Message, Room, FriendRelation } from "@/types/chat";

interface UseDashboardSocketProps {
  currentUser: { id: string; name: string; avatar: string };
  activeRoomId: string;
  activeRoomType: "group" | "friend";
  activeRoomName: string;
  rooms: Room[];
  friends: FriendRelation[];
  dbMessages: Message[];
}

export function useDashboardSocket({
  currentUser,
  activeRoomId,
  activeRoomType,
  activeRoomName,
  rooms,
  friends,
  dbMessages,
}: UseDashboardSocketProps) {
  const router = useRouter();

  // Local Chat / WebSockets states
  const [websocketMessages, setWebsocketMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [socketConnected, setSocketConnected] = useState(false);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Compute all joined room IDs dynamically
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
  const allJoinedRoomIds = Array.from(ids);
  const allJoinedRoomIdsStr = allJoinedRoomIds.join(",");

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

    const handleRefetch = (data: unknown) => {
      console.log("[SOCKET-DEBUG] Received 'refetch-data' event via socket:", data);
      router.refresh();
    };

    socket.on("message", handleMsg);
    socket.on("user-typing", handleTyping);
    socket.on("refetch-data", handleRefetch);

    return () => {
      socket.off("message", handleMsg);
      socket.off("user-typing", handleTyping);
      socket.off("refetch-data", handleRefetch);
    };
  }, [activeRoomId, currentUser.id, rooms, router]);

  // 3. WebSocket room subscription manager
  useEffect(() => {
    const socket = getSocket();
    const roomIds = allJoinedRoomIdsStr.split(",").filter(Boolean);

    // Join all rooms we are members of so we can receive notifications
    for (const rid of roomIds) {
      socket.emit("join-room", { roomId: rid });
    }
    // Also join our personal user room to receive direct events (like friend requests)
    if (currentUser.id) {
      socket.emit("join-room", { roomId: currentUser.id });
    }

    return () => {
      for (const rid of roomIds) {
        socket.emit("leave-room", { roomId: rid });
      }
      if (currentUser.id) {
        socket.emit("leave-room", { roomId: currentUser.id });
      }
    };
  }, [allJoinedRoomIdsStr, currentUser.id]);

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
    }, 5500);
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

  return {
    socketConnected,
    messageInput,
    setMessageInput,
    typingUsers,
    renderedMessages,
    handleInputChange,
    handleSendMessage,
  };
}
