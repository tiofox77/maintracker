-- Add type column to maintenance_tasks table
ALTER TABLE maintenance_tasks
ADD COLUMN IF NOT EXISTS type text CHECK (type IN ('predictive', 'corrective', 'conditional'));

-- Rename category_id to area_id
ALTER TABLE maintenance_tasks
RENAME COLUMN category_id TO area_id;
