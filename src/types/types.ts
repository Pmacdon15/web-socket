import type { SerializableResult } from "@/dal/chat";
import type { FriendRelation, Message, Room } from "./chat";

export interface DashboardClientProps {
  roomsPromise: Promise<SerializableResult<Room[]>>;
  friendsPromise: Promise<SerializableResult<FriendRelation[]>>;
  messagesPromise: Promise<SerializableResult<Message[]>>;
  activeRoomIdPromise: Promise<string>;
  activeRoomTypePromise: Promise<string>;
  activeRoomNamePromise: Promise<string>;
}
