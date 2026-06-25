-- VoltChat PostgreSQL Schema for Neon Serverless

-- Users table synchronized/referenced from Clerk
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- Clerk User ID
  name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chat rooms (both group and personal direct messages)
CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('group', 'personal')),
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Friend relationships and friend requests
-- If user_id sends a request to friend_id, status begins as 'pending'.
-- When friend_id accepts, status updates to 'accepted'.
CREATE TABLE IF NOT EXISTS friends (
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  friend_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, friend_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  room_id TEXT REFERENCES rooms(id) ON DELETE CASCADE,
  sender_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  sender_name TEXT NOT NULL,
  text TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Room members (junction table for joining existing rooms)
CREATE TABLE IF NOT EXISTS room_members (
  room_id TEXT REFERENCES rooms(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (room_id, user_id)
);
