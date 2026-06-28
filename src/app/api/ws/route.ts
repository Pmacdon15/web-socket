import {
  experimental_upgradeWebSocket,
  type WebSocketData,
} from "@vercel/functions";
import { connection } from "next/server";
import { revalidateTag } from "next/cache";

interface UpgradedWebSocket {
  send(data: string): void;
}

const rooms = new Map<string, Set<UpgradedWebSocket>>();

export async function GET() {
  await connection();
  return experimental_upgradeWebSocket(
    (ws) => {
      let currentRoom: string | null = null;

      ws.on("message", (data: WebSocketData) => {
        try {
          const message = JSON.parse(data.toString());
          const {
            type,
            roomId,
            userId,
            userName,
            isTyping,
            text,
            senderId,
            senderName,
            timestamp,
            id,
          } = message;

          if (type === "join-room") {
            currentRoom = roomId;

            if (!rooms.has(roomId)) {
              rooms.set(roomId, new Set());
            }
            rooms.get(roomId)?.add(ws as unknown as UpgradedWebSocket);
            console.log(`User joined ${roomId}`);
          } else if (type === "leave-room") {
            const targetRoom = roomId || currentRoom;
            if (targetRoom) {
              rooms.get(targetRoom)?.delete(ws as unknown as UpgradedWebSocket);
              if (currentRoom === targetRoom) {
                currentRoom = null;
              }
            }
          } else if (type === "send-message") {
            const targetRoom = roomId || currentRoom;
            if (targetRoom) {
              const payload = {
                type: "message",
                id,
                text,
                senderId,
                senderName,
                timestamp,
                roomId: targetRoom,
              };
              broadcastToRoom(targetRoom, payload);
            }
          } else if (type === "typing") {
            const targetRoom = roomId || currentRoom;
            if (targetRoom) {
              const payload = {
                type: "user-typing",
                userId,
                userName,
                isTyping,
                roomId: targetRoom,
              };
              broadcastToRoom(
                targetRoom,
                payload,
                ws as unknown as UpgradedWebSocket,
              );
            }
          } else if (type === "friend-request") {
            const targetFriendId = message.friendId;
            if (targetFriendId) {
              revalidateTag(`user-friends-${targetFriendId}`, "max");
              revalidateTag(`user-rooms-${targetFriendId}`, "max");
              broadcastToRoom(targetFriendId, { type: "refetch-data" });
            }
          }
        } catch (error) {
          console.error("Error processing message:", error);
        }
      });

      ws.on("close", () => {
        if (currentRoom) {
          rooms.get(currentRoom)?.delete(ws as unknown as UpgradedWebSocket);
        }
      });

      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
      });
    },
    {
      maxPayload: 256 * 1024,
    },
  );
}

function broadcastToRoom(
  roomId: string,
  message: Record<string, unknown>,
  excludeWs?: UpgradedWebSocket,
) {
  const room = rooms.get(roomId);
  if (room) {
    const payload = JSON.stringify(message);
    room.forEach((socket) => {
      if (excludeWs && socket === excludeWs) return;
      try {
        socket.send(payload);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });
  }
}
