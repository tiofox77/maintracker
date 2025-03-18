-- Create tasks table and update maintenance_tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rename category_id to area_id in maintenance_tasks table
ALTER TABLE public.maintenance_tasks RENAME COLUMN category_id TO area_id;

-- Add type column to maintenance_tasks table
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('predictive', 'corrective', 'conditional')) DEFAULT 'corrective';

-- Create RLS policies for tasks table
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY Allow all operations for authenticated users ON public.tasks
  FOR ALL USING (auth.role() = 'authenticated');

