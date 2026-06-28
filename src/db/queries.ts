import { neon } from "@neondatabase/serverless";
import type { FriendRelation, Message, Room, User } from "@/types/chat";

const _isDbConfigured = () => {
  return typeof process !== "undefined" && !!process.env.DATABASE_URL;
};

const getSql = () => {
  return neon(process.env.DATABASE_URL || "");
};

// Users queries
export async function dbUpsertUser(
  id: string,
  name: string,
  avatar: string,
): Promise<User> {
  const sql = getSql();
  const rows = await sql.query(
    `INSERT INTO users (id, name, avatar) VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, avatar = EXCLUDED.avatar
       RETURNING id, name, avatar, created_at as "createdAt"`,
    [id, name, avatar],
  );
  return rows[0] as User;
}

export async function dbGetUser(id: string): Promise<User | null> {
  const sql = getSql();
  const rows = await sql.query(
    `SELECT id, name, avatar, created_at as "createdAt" FROM users WHERE id = $1`,
    [id],
  );
  return (rows[0] as User) || null;
}

// Rooms queries
export async function dbGetRooms(userId: string): Promise<Room[]> {
  const sql = getSql();
  const rows = await sql.query(
    `SELECT r.id, r.name, r.type, r.created_by as "createdBy", r.created_at as "createdAt"
     FROM rooms r
     JOIN room_members rm ON r.id = rm.room_id
     WHERE rm.user_id = $1`,
    [userId],
  );
  return rows as Room[];
}

export async function dbCreateRoom(
  id: string,
  name: string,
  type: "group" | "personal",
  createdBy: string,
): Promise<Room> {
  const sql = getSql();
  const rows = await sql.query(
    `INSERT INTO rooms (id, name, type, created_by)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, type, created_by as "createdBy", created_at as "createdAt"`,
    [id, name, type, createdBy],
  );
  await sql.query(
    `INSERT INTO room_members (room_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [id, createdBy],
  );
  return rows[0] as Room;
}

export async function dbJoinRoom(
  roomId: string,
  userId: string,
): Promise<Room> {
  const sql = getSql();
  await sql.query(
    `INSERT INTO room_members (room_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [roomId, userId],
  );
  const rows = await sql.query(
    `SELECT id, name, type, created_by as "createdBy", created_at as "createdAt"
     FROM rooms WHERE id = $1`,
    [roomId],
  );
  if (rows.length === 0) {
    throw new Error("Room not found");
  }
  return rows[0] as Room;
}

export async function dbAddRoomMember(
  roomId: string,
  userId: string,
): Promise<void> {
  const sql = getSql();
  await sql.query(
    `INSERT INTO room_members (room_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [roomId, userId],
  );
}

export async function dbDeleteRoom(
  roomId: string,
  userId: string,
): Promise<void> {
  const sql = getSql();
  const roomRows = await sql.query(
    `SELECT created_by FROM rooms WHERE id = $1`,
    [roomId],
  );
  const room = roomRows[0];
  if (room && room.created_by === userId) {
    await sql.query(`DELETE FROM rooms WHERE id = $1`, [roomId]);
  } else {
    await sql.query(
      `DELETE FROM room_members WHERE room_id = $1 AND user_id = $2`,
      [roomId, userId],
    );
  }
}

// Friends queries
export async function dbGetFriends(userId: string): Promise<FriendRelation[]> {
  const sql = getSql();
  const rows = await sql.query(
    `SELECT f.user_id as "userId", f.friend_id as "friendId", f.status, f.created_at as "createdAt",
              u.name as "friendName", u.avatar as "friendAvatar"
       FROM friends f
       JOIN users u ON (u.id = CASE WHEN f.user_id = $1 THEN f.friend_id ELSE f.user_id END)
       WHERE f.user_id = $1 OR f.friend_id = $1`,
    [userId],
  );
  return rows as FriendRelation[];
}

export async function dbAddFriendRequest(
  senderId: string,
  receiverId: string,
): Promise<FriendRelation> {
  const sql = getSql();
  // We insert status pending. If it exists in any direction, we return it.
  const rows = await sql.query(
    `INSERT INTO friends (user_id, friend_id, status)
       VALUES ($1, $2, 'pending')
       ON CONFLICT (user_id, friend_id) DO UPDATE SET status = EXCLUDED.status
       RETURNING user_id as "userId", friend_id as "friendId", status, created_at as "createdAt"`,
    [senderId, receiverId],
  );
  return rows[0] as FriendRelation;
}

export async function dbAcceptFriendRequest(
  userId: string,
  friendId: string,
): Promise<FriendRelation> {
  const sql = getSql();
  const rows = await sql.query(
    `UPDATE friends SET status = 'accepted'
       WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)
       RETURNING user_id as "userId", friend_id as "friendId", status, created_at as "createdAt"`,
    [userId, friendId],
  );
  if (rows.length === 0) {
    throw new Error("Friend request relation not found");
  }
  return rows[0] as FriendRelation;
}

// Messages queries
export async function dbGetMessages(roomId: string): Promise<Message[]> {
  const sql = getSql();
  const rows = await sql.query(
    `SELECT id, room_id as "roomId", sender_id as "senderId", sender_name as "senderName", text,
              to_char(timestamp, 'HH24:MI') as "timestamp"
       FROM messages
       WHERE room_id = $1
       ORDER BY timestamp ASC`,
    [roomId],
  );
  return rows as Message[];
}

export async function dbSaveMessage(
  msgId: string,
  roomId: string,
  senderId: string,
  senderName: string,
  text: string,
): Promise<Message> {
  const sql = getSql();
  const rows = await sql.query(
    `INSERT INTO messages (id, room_id, sender_id, sender_name, text)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, room_id as "roomId", sender_id as "senderId", sender_name as "senderName", text,
                 to_char(timestamp, 'HH24:MI') as "timestamp"`,
    [msgId, roomId, senderId, senderName, text],
  );
  return rows[0] as Message;
}

export async function dbSearchUsers(
  query: string,
  excludeUserId: string,
): Promise<User[]> {
  const sql = getSql();
  const searchPattern = `%${query}%`;
  const rows = await sql.query(
    `SELECT id, name, avatar FROM users
     WHERE id <> $2 AND (id ILIKE $1 OR name ILIKE $1)
     LIMIT 10`,
    [searchPattern, excludeUserId],
  );
  return rows as User[];
}

export async function dbSearchRooms(query: string): Promise<Room[]> {
  const sql = getSql();
  const searchPattern = `%${query}%`;
  const rows = await sql.query(
    `SELECT id, name, type FROM rooms
     WHERE type = 'group' AND (id ILIKE $1 OR name ILIKE $1)
     LIMIT 10`,
    [searchPattern],
  );
  return rows as Room[];
}
