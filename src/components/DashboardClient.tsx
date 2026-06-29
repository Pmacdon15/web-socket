"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { useDashboardMutations } from "@/hooks/useDashboardMutations";
import { useDashboardSocket } from "@/hooks/useDashboardSocket";
import { useQRCodeAddFriend } from "@/hooks/useQRCodeAddFriend";
import type { DashboardClientProps } from "@/types/types";
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

  // Modals visibility states
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [deleteRoomId, setDeleteRoomId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  // Build the current user structure
  const currentUser = clerkUser
    ? {
        id: clerkUser.id,
        name: clerkUser.fullName || clerkUser.username || "User",
        avatar: clerkUser.imageUrl,
      }
    : { id: "", name: "Guest", avatar: "" };

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

  // Local Chat / WebSockets states and handlers managed by custom hooks
  const {
    socketConnected,
    messageInput,
    typingUsers,
    renderedMessages,
    handleInputChange,
    handleSendMessage,
  } = useDashboardSocket({
    currentUser,
    activeRoomId,
    activeRoomType,
    activeRoomName,
    rooms,
    friends,
    dbMessages,
  });

  // Check for auto-adding friend via QR code search param
  useQRCodeAddFriend({
    currentUser,
    friends,
    addFriendMutation,
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

  if (!isLoaded || !clerkUser) {
    return <DashboardLoading />;
  }

  return (
    <div className="fixed inset-0 flex bg-background text-slate-900 overflow-hidden font-sans">
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
