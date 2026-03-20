-- Create load shedding schedules table
CREATE TABLE IF NOT EXISTS public.load_shedding_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  substation_id UUID NOT NULL REFERENCES public.substations(id) ON DELETE CASCADE,
  village_id UUID NOT NULL REFERENCES public.villages(id) ON DELETE CASCADE,
  schedule_date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  remarks TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(village_id, schedule_date)
);

-- Enable RLS
ALTER TABLE public.load_shedding_schedules ENABLE ROW LEVEL SECURITY;

-- Schedules: public read access
CREATE POLICY "Schedules are publicly readable"
ON public.load_shedding_schedules FOR SELECT
USING (true);

-- Schedules: engineers can insert/update for their assigned substation only
CREATE POLICY "Engineers can insert schedules"
ON public.load_shedding_schedules FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.engineers
    WHERE engineers.user_id = auth.uid()
    AND engineers.assigned_substation_id = substation_id
  )
);

CREATE POLICY "Engineers can update schedules"
ON public.load_shedding_schedules FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.engineers
    WHERE engineers.user_id = auth.uid()
    AND engineers.assigned_substation_id = substation_id
  )
);

-- Admins can do anything
CREATE POLICY "Admins can manage schedules"
ON public.load_shedding_schedules FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'approval_admin')
  )
);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for schedule updates
DROP TRIGGER IF EXISTS update_schedules_updated_at ON public.load_shedding_schedules;
CREATE TRIGGER update_schedules_updated_at
BEFORE UPDATE ON public.load_shedding_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
