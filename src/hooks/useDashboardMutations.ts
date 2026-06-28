import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  actionAcceptFriend,
  actionAddFriend,
  actionCreateRoom,
  actionDeleteRoom,
  actionJoinRoom,
} from "@/actions/chat";

interface UseDashboardMutationsProps {
  setShowAddFriend: (show: boolean) => void;
  setShowCreateRoom: (show: boolean) => void;
  setShowJoinRoom: (show: boolean) => void;
}

export function useDashboardMutations({
  setShowAddFriend,
  setShowCreateRoom,
  setShowJoinRoom,
}: UseDashboardMutationsProps) {
  const router = useRouter();

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
      router.push(
        `/dashboard?room=${room.id}&type=group&name=${encodeURIComponent(room.name)}`,
      );
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
      router.push(
        "/dashboard?room=global-lounge&type=group&name=Global Lounge 🌐",
      );
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
      router.push(
        `/dashboard?room=${room.id}&type=group&name=${encodeURIComponent(room.name)}`,
      );
      router.refresh();
    },
    onError: (err: any) => {
      toast.error(
        err.message || "Failed to join room. Verify the Room ID is correct.",
      );
    },
  });

  return {
    addFriendMutation,
    acceptFriendMutation,
    createRoomMutation,
    deleteRoomMutation,
    joinRoomMutation,
  };
}
