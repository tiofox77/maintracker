-- Create task_maintenance table
CREATE TABLE IF NOT EXISTS public.task_maintenance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES public.tasks(id),
  equipment_id UUID NOT NULL REFERENCES public.equipment(id),
  line_id UUID REFERENCES public.categories(id),
  area_id UUID REFERENCES public.departments(id),
  scheduled_date DATE NOT NULL,
  frequency TEXT CHECK (frequency IN ('custom', 'weekly', 'monthly', 'yearly')),
  custom_days INTEGER,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled', 'partial')) DEFAULT 'scheduled',
  type TEXT CHECK (type IN ('predictive', 'corrective', 'conditional')) NOT NULL,
  assigned_to TEXT,
  description TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_task_maintenance_equipment_id ON public.task_maintenance(equipment_id);
CREATE INDEX IF NOT EXISTS idx_task_maintenance_task_id ON public.task_maintenance(task_id);
CREATE INDEX IF NOT EXISTS idx_task_maintenance_scheduled_date ON public.task_maintenance(scheduled_date);

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_task_maintenance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_task_maintenance_updated_at
BEFORE UPDATE ON public.task_maintenance
FOR EACH ROW
EXECUTE FUNCTION update_task_maintenance_updated_at();