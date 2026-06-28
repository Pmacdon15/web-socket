import { auth } from "@clerk/nextjs/server";
import { type Result, ResultAsync } from "neverthrow";
import * as db from "@/db/queries";
import type { FriendRelation, Message, Room, User } from "@/types/chat";

export type SerializableResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface DAlError {
  reason: string;
}

// Maps neverthrow Result into plain serializable structures for boundary crossing
export function serializeResult<T, E extends DAlError>(
  result: Result<T, E>,
): SerializableResult<T> {
  if (result.isOk()) {
    return { success: true, data: result.value };
  } else {
    return { success: false, error: result.error.reason };
  }
}

// Sync Clerk user profile with the local DB table
export function syncUserProfile(
  name: string,
  avatar: string,
): ResultAsync<User, DAlError> {
  return ResultAsync.fromPromise(
    auth.protect().then(({ userId }) => db.dbUpsertUser(userId, name, avatar)),
    (error) => ({
      reason:
        error instanceof Error ? error.message : "Failed to sync user profile",
    }),
  );
}

// Fetch current user details
export function getCurrentUserProfile(): ResultAsync<User | null, DAlError> {
  return ResultAsync.fromPromise(
    auth.protect().then(({ userId }) => db.dbGetUser(userId)),
    (error) => ({
      reason:
        error instanceof Error ? error.message : "Failed to get user profile",
    }),
  );
}

// Fetch rooms
export function getRooms(): ResultAsync<Room[], DAlError> {
  return ResultAsync.fromPromise(
    auth.protect().then(({ userId }) => db.dbGetRooms(userId)),
    (error) => ({
      reason:
        error instanceof Error
          ? error.message
          : "Failed to retrieve chat rooms",
    }),
  );
}

// Fetch friends list
export function getFriends(): ResultAsync<FriendRelation[], DAlError> {
  return ResultAsync.fromPromise(
    auth.protect().then(({ userId }) => db.dbGetFriends(userId)),
    (error) => ({
      reason:
        error instanceof Error
          ? error.message
          : "Failed to retrieve friends directory",
    }),
  );
}

// Fetch messages for a room
export function getMessages(roomId: string): ResultAsync<Message[], DAlError> {
  return ResultAsync.fromPromise(
    auth.protect().then(({ userId }) => {
      // Validate accessibility of DMs: verify user is part of the room ID if type is personal
      if (roomId.startsWith("dm-") && !roomId.includes(userId)) {
        throw new Error(
          "Unauthorized: Access to this private room is forbidden",
        );
      }
      return db.dbGetMessages(roomId, userId);
    }),
    (error) => ({
      reason:
        error instanceof Error
          ? error.message
          : `Failed to retrieve messages for room ${roomId}`,
    }),
  );
}

// Create a new room
export function createRoom(
  name: string,
  type: "group" | "personal",
  customId?: string,
): ResultAsync<Room, DAlError> {
  return ResultAsync.fromPromise(
    auth.protect().then(({ userId }) => {
      const roomId =
        customId ||
        (type === "group"
          ? `GRP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
          : `dm-${[userId, name].sort().join("-")}`); // If personal, name represents the friend user id
      return db.dbCreateRoom(roomId, name, type, userId);
    }),
    (error) => ({
      reason:
        error instanceof Error ? error.message : "Failed to create chat room",
    }),
  );
}

// Delete a room
export function deleteRoom(roomId: string): ResultAsync<void, DAlError> {
  return ResultAsync.fromPromise(
    auth.protect().then(({ userId }) => db.dbDeleteRoom(roomId, userId)),
    (error) => ({
      reason:
        error instanceof Error ? error.message : "Failed to delete chat room",
    }),
  );
}

// Join an existing room
export function joinRoom(roomId: string): ResultAsync<Room, DAlError> {
  return ResultAsync.fromPromise(
    auth.protect().then(({ userId }) => db.dbJoinRoom(roomId, userId)),
    (error) => ({
      reason:
        error instanceof Error
          ? error.message
          : `Failed to join chat room ${roomId}`,
    }),
  );
}

// Send Friend Request
export function addFriend(
  friendId: string,
): ResultAsync<FriendRelation, DAlError> {
  return ResultAsync.fromPromise(
    auth.protect().then(async ({ userId }) => {
      if (userId === friendId) {
        throw new Error("You cannot add yourself as a friend");
      }
      // Create request
      const relation = await db.dbAddFriendRequest(userId, friendId);

      // Also create a personal room for DMs between the two users
      const dmRoomId = `dm-${[userId, friendId].sort().join("-")}`;
      try {
        await db.dbCreateRoom(
          dmRoomId,
          `DM between ${userId} and ${friendId}`,
          "personal",
          userId,
        );
        await db.dbAddRoomMember(dmRoomId, friendId);
      } catch (_roomErr) {
        // Room might already exist, which is fine, but verify they are members
        try {
          await db.dbAddRoomMember(dmRoomId, userId);
          await db.dbAddRoomMember(dmRoomId, friendId);
        } catch (_e) {}
      }

      return relation;
    }),
    (error) => ({
      reason:
        error instanceof Error
          ? error.message
          : "Failed to send friend request",
    }),
  );
}

// Accept Friend Request
export function acceptFriend(
  friendId: string,
): ResultAsync<FriendRelation, DAlError> {
  return ResultAsync.fromPromise(
    auth
      .protect()
      .then(({ userId }) => db.dbAcceptFriendRequest(userId, friendId)),
    (error) => ({
      reason:
        error instanceof Error
          ? error.message
          : "Failed to accept friend request",
    }),
  );
}

// Save Message
export function saveMessage(
  msgId: string,
  roomId: string,
  senderName: string,
  text: string,
): ResultAsync<Message, DAlError> {
  return ResultAsync.fromPromise(
    auth.protect().then(async ({ userId }) => {
      // Rule check: if it is a personal room (DM), check if status is accepted
      if (roomId.startsWith("dm-")) {
        const parts = roomId.replace("dm-", "").split("-");
        if (parts.length === 2) {
          const [id1, id2] = parts;
          // Verify relationship status
          const relations = await db.dbGetFriends(userId);
          const rel = relations.find(
            (r) =>
              (r.userId === id1 && r.friendId === id2) ||
              (r.userId === id2 && r.friendId === id1),
          );

          if (!rel || rel.status !== "accepted") {
            throw new Error(
              "Friend request must be accepted before exchanging messages.",
            );
          }
        }
      }

      return db.dbSaveMessage(msgId, roomId, userId, senderName, text);
    }),
    (error) => ({
      reason: error instanceof Error ? error.message : "Failed to post message",
    }),
  );
}

export function searchUsers(query: string): ResultAsync<User[], DAlError> {
  return ResultAsync.fromPromise(
    auth.protect().then(({ userId }) => db.dbSearchUsers(query, userId)),
    (error) => ({
      reason: error instanceof Error ? error.message : "Failed to search users",
    }),
  );
}

export function searchRooms(query: string): ResultAsync<Room[], DAlError> {
  return ResultAsync.fromPromise(
    auth.protect().then(() => db.dbSearchRooms(query)),
    (error) => ({
      reason: error instanceof Error ? error.message : "Failed to search rooms",
    }),
  );
}
