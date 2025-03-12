-- Create task_status_history table to track task status changes
CREATE TABLE IF NOT EXISTS public.task_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.maintenance_tasks(id) ON DELETE CASCADE,
    status_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled', 'partial')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_task_status_history_task_id ON public.task_status_history(task_id);
CREATE INDEX IF NOT EXISTS idx_task_status_history_status_date ON public.task_status_history(status_date);
CREATE INDEX IF NOT EXISTS idx_task_status_history_status ON public.task_status_history(status);

-- Add RLS policies
ALTER TABLE public.task_status_history ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to select task status history
CREATE POLICY "Authenticated users can view task status history"
    ON public.task_status_history
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to insert task status history
CREATE POLICY "Authenticated users can insert task status history"
    ON public.task_status_history
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow users to update their own task status history entries
CREATE POLICY "Users can update their own task status history"
    ON public.task_status_history
    FOR UPDATE
    TO authenticated
    USING (created_by = auth.uid());

-- Allow users to delete their own task status history entries
CREATE POLICY "Users can delete their own task status history"
    ON public.task_status_history
    FOR DELETE
    TO authenticated
    USING (created_by = auth.uid());
