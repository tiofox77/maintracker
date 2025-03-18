-- Add task_id column to maintenance_tasks table if it doesn't exist
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES public.tasks(id);

-- Create index for task_id
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_task_id ON public.maintenance_tasks(task_id);

-- Update the select query in the maintenance_tasks RLS policy to include task relationship
COMMENT ON TABLE public.maintenance_tasks IS 'Table for storing maintenance tasks with relationships to equipment, categories, and tasks';
