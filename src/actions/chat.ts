"use server";

import * as dal from "@/dal/chat";
import { serializeResult } from "@/dal/chat";

export async function actionSyncProfile(name: string, avatar: string) {
  const res = await dal.syncUserProfile(name, avatar);
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
  const res = await dal.createRoom(name, type);
  return serializeResult(res);
}

export async function actionDeleteRoom(roomId: string) {
  const res = await dal.deleteRoom(roomId);
  return serializeResult(res);
}

export async function actionJoinRoom(roomId: string) {
  const res = await dal.joinRoom(roomId);
  return serializeResult(res);
}

export async function actionAddFriend(friendId: string) {
  const res = await dal.addFriend(friendId);
  return serializeResult(res);
}

export async function actionAcceptFriend(friendId: string) {
  const res = await dal.acceptFriend(friendId);
  return serializeResult(res);
}

export async function actionSaveMessage(
  msgId: string,
  roomId: string,
  senderName: string,
  text: string,
) {
  const res = await dal.saveMessage(msgId, roomId, senderName, text);
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
