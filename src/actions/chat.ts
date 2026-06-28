"use server";

import { auth } from "@clerk/nextjs/server";
import { updateTag } from "next/cache";
import * as dal from "@/dal/chat";
import { serializeResult } from "@/dal/chat";

export async function actionSyncProfile(name: string, avatar: string) {
  const { userId } = await auth.protect();
  const res = await dal.syncUserProfile(name, avatar);
  res.match(
    () => updateTag(`user-profile-${userId}`),
    () => {},
  );
  return serializeResult(res);
}

export async function actionGetCurrentUser() {
  const res = await dal.getCurrentUserProfile();
  return serializeResult(res);
}

export async function actionGetRooms() {
  const res = await dal.getRooms();
  return serializeResult(res);
}

export async function actionGetFriends() {
  const res = await dal.getFriends();
  return serializeResult(res);
}

export async function actionGetMessages(roomId: string) {
  const res = await dal.getMessages(roomId);
  return serializeResult(res);
}

export async function actionCreateRoom(
  name: string,
  type: "group" | "personal",
) {
  const { userId } = await auth.protect();
  const res = await dal.createRoom(name, type);
  res.match(
    () => {
      updateTag(`user-rooms-${userId}`);
      if (type === "personal") {
        updateTag(`user-rooms-${name}`);
      }
    },
    () => {},
  );
  return serializeResult(res);
}

export async function actionDeleteRoom(roomId: string) {
  const { userId } = await auth.protect();
  const res = await dal.deleteRoom(roomId);
  res.match(
    () => {
      updateTag(`user-rooms-${userId}`);
      updateTag(`messages-${roomId}`);
    },
    () => {},
  );
  return serializeResult(res);
}

export async function actionJoinRoom(roomId: string) {
  const { userId } = await auth.protect();
  const res = await dal.joinRoom(roomId);
  res.match(
    () => updateTag(`user-rooms-${userId}`),
    () => {},
  );
  return serializeResult(res);
}

export async function actionAddFriend(friendId: string) {
  const { userId } = await auth.protect();
  const res = await dal.addFriend(friendId);
  res.match(
    () => {
      updateTag(`user-friends-${userId}`);
      updateTag(`user-friends-${friendId}`);
      updateTag(`user-rooms-${userId}`);
      updateTag(`user-rooms-${friendId}`);
    },
    () => {},
  );
  return serializeResult(res);
}

export async function actionAcceptFriend(friendId: string) {
  const { userId } = await auth.protect();
  const res = await dal.acceptFriend(friendId);
  res.match(
    () => {
      updateTag(`user-friends-${userId}`);
      updateTag(`user-friends-${friendId}`);
      updateTag(`user-rooms-${userId}`);
      updateTag(`user-rooms-${friendId}`);
    },
    () => {},
  );
  return serializeResult(res);
}

export async function actionSaveMessage(
  msgId: string,
  roomId: string,
  senderName: string,
  text: string,
) {
  const res = await dal.saveMessage(msgId, roomId, senderName, text);
  res.match(
    () => updateTag(`messages-${roomId}`),
    () => {},
  );
  return serializeResult(res);
}

export async function actionSearchUsers(query: string) {
  const res = await dal.searchUsers(query);
  return serializeResult(res);
}

export async function actionSearchRooms(query: string) {
  const res = await dal.searchRooms(query);
  return serializeResult(res);
}
