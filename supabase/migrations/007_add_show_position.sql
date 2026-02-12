-- Add position column to shows table
ALTER TABLE shows 
ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- Initialize position based on created_at (older shows first or last depending on preference, usually custom order starts with something)
-- Let's initialize it such that recently created shows have higher position (or lower, depending on sort direction).
-- If we want "Custom Order" default, we usually sort by position ASC or DESC.
-- Let's assume Sort by Position ASC.
-- We can initialize position using row_number() over created_at.

WITH ranked_shows AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as new_rank
  FROM shows
)
UPDATE shows
SET position = ranked_shows.new_rank
FROM ranked_shows
WHERE shows.id = ranked_shows.id;
