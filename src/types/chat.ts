export interface User {
  id: string;
  name: string;
  avatar: string;
  createdAt?: string;
}

export interface Room {
  id: string;
  name: string;
  type: "group" | "personal";
  createdBy?: string;
  createdAt?: string;
}

export interface FriendRelation {
  userId: string;
  friendId: string;
  status: "pending" | "accepted";
  createdAt?: string;
  // Denormalized fields joined from the users table for UI use
  friendName?: string;
  friendAvatar?: string;
  online?: boolean;
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string; // ISO string or UI formatted string
}
