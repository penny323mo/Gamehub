-- ============================================================================
-- Gomoku Fixed Rooms: DB Migration for Ready Mechanism
-- ============================================================================
-- Execute this in Supabase SQL Editor

-- 1. Add columns to "Gomoku's rooms" table
ALTER TABLE "Gomoku's rooms"
ADD COLUMN IF NOT EXISTS turn_expires_at timestamptz,
ADD COLUMN IF NOT EXISTS black_ready boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS white_ready boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS round_no integer DEFAULT 0;

-- 2. Create "moves" table
CREATE TABLE IF NOT EXISTS "moves" (
    id bigserial PRIMARY KEY,
    room_key text NOT NULL,
    round_no integer NOT NULL DEFAULT 0,
    move_no integer NOT NULL,
    x integer NOT NULL,
    y integer NOT NULL,
    color text NOT NULL CHECK (color IN ('black', 'white')),
    created_at timestamptz DEFAULT now(),
    
    -- Constraints
    UNIQUE(room_key, round_no, move_no),
    UNIQUE(room_key, round_no, x, y)
);

-- 3. Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_moves_room_round ON "moves" (room_key, round_no);

-- 4. Enable Row Level Security (RLS) for moves table
ALTER TABLE "moves" ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for moves
CREATE POLICY "Enable read access for all users" ON "moves"
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON "moves"
    FOR INSERT WITH CHECK (true);

-- Note: DELETE policy intentionally omitted for now
-- round_no will be managed manually via buttons, no auto-increment trigger

-- 6. Update existing rows to set default values
UPDATE "Gomoku's rooms"
SET 
    black_ready = COALESCE(black_ready, false),
    white_ready = COALESCE(white_ready, false),
    round_no = COALESCE(round_no, 0)
WHERE black_ready IS NULL OR white_ready IS NULL OR round_no IS NULL;

-- ============================================================================
-- IMPORTANT: Execute this script MANUALLY in Supabase SQL Editor
-- Do NOT run automatically from app code
-- ============================================================================
-- Done! Your schema now supports:
-- - Ready mechanism (black_ready, white_ready)
-- - Timer (turn_expires_at - absolute timeout timestamp)
-- - Multiple rounds (round_no, managed via buttons)
-- - Move history (moves table with uniqueness constraints)
