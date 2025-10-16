-- Add soft-delete columns to videos table
ALTER TABLE IF EXISTS videos
  ADD COLUMN IF NOT EXISTS deleted boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS deleted_by text DEFAULT NULL;

-- Optional: index for deleted flag for faster queries
CREATE INDEX IF NOT EXISTS videos_deleted_idx ON videos (deleted);
