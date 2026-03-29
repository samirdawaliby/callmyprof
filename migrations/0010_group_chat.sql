-- Migration 0010: Group Class Members & Group Chat

CREATE TABLE IF NOT EXISTS group_class_members (
  id TEXT PRIMARY KEY,
  group_class_id TEXT NOT NULL,
  user_id TEXT,
  formateur_id TEXT,
  role TEXT NOT NULL DEFAULT 'student',
  name TEXT,
  email TEXT,
  joined_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS group_chat_messages (
  id TEXT PRIMARY KEY,
  group_class_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_gcmembers_class ON group_class_members(group_class_id);
CREATE INDEX IF NOT EXISTS idx_gchat_class ON group_chat_messages(group_class_id);
CREATE INDEX IF NOT EXISTS idx_gchat_created ON group_chat_messages(group_class_id, created_at);
