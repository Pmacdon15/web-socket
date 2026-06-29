"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

interface UseQRCodeAddFriendProps {
  currentUser: { id: string; name: string; avatar: string };
  friends: Array<{ userId: string; friendId: string }>;
  addFriendMutation: { mutate: (friendId: string) => void };
}

export function useQRCodeAddFriend({
  currentUser,
  friends,
  addFriendMutation,
}: UseQRCodeAddFriendProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const triggeredRef = useRef<string | null>(null);

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
}
