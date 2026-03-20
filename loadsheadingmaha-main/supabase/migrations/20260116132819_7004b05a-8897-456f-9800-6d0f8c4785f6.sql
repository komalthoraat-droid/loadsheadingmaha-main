
-- Create substations table
CREATE TABLE public.substations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create villages table with substation mapping
CREATE TABLE public.villages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  substation_id UUID NOT NULL REFERENCES public.substations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name, substation_id)
);

-- Create load shedding schedules table
CREATE TABLE public.load_shedding_schedules (
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

-- Create engineers table linked to auth.users
CREATE TABLE public.engineers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  assigned_substation_id UUID NOT NULL REFERENCES public.substations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.substations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.load_shedding_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engineers ENABLE ROW LEVEL SECURITY;

-- Substations: public read access
CREATE POLICY "Substations are publicly readable"
ON public.substations FOR SELECT
USING (true);

-- Villages: public read access
CREATE POLICY "Villages are publicly readable"
ON public.villages FOR SELECT
USING (true);

-- Schedules: public read access
CREATE POLICY "Schedules are publicly readable"
ON public.load_shedding_schedules FOR SELECT
USING (true);

-- Schedules: engineers can insert/update for their assigned substation only
CREATE POLICY "Engineers can insert schedules for their substation"
ON public.load_shedding_schedules FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.engineers
    WHERE engineers.user_id = auth.uid()
    AND engineers.assigned_substation_id = substation_id
  )
);

CREATE POLICY "Engineers can update schedules for their substation"
ON public.load_shedding_schedules FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.engineers
    WHERE engineers.user_id = auth.uid()
    AND engineers.assigned_substation_id = substation_id
  )
);

-- Engineers: can read their own profile
CREATE POLICY "Engineers can read own profile"
ON public.engineers FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Insert default substations
INSERT INTO public.substations (name) VALUES
  ('Nighoj Substation'),
  ('Ralegan Therpal Substation'),
  ('Shirur Substation'),
  ('Supa Substation'),
  ('Manchar Substation');

-- Insert villages with substation mapping
INSERT INTO public.villages (name, substation_id)
SELECT 'Nighoj', id FROM public.substations WHERE name = 'Nighoj Substation'
UNION ALL
SELECT 'Tukai Mala', id FROM public.substations WHERE name = 'Nighoj Substation'
UNION ALL
SELECT 'Dhawan Vasti', id FROM public.substations WHERE name = 'Nighoj Substation'
UNION ALL
SELECT 'Shirsule', id FROM public.substations WHERE name = 'Nighoj Substation'
UNION ALL
SELECT 'Ralegan Therpal', id FROM public.substations WHERE name = 'Ralegan Therpal Substation'
UNION ALL
SELECT 'Mazampur', id FROM public.substations WHERE name = 'Ralegan Therpal Substation'
UNION ALL
SELECT 'Shirur City', id FROM public.substations WHERE name = 'Shirur Substation'
UNION ALL
SELECT 'Supa', id FROM public.substations WHERE name = 'Supa Substation'
UNION ALL
SELECT 'Supa MIDC', id FROM public.substations WHERE name = 'Supa Substation'
UNION ALL
SELECT 'Manchar', id FROM public.substations WHERE name = 'Manchar Substation'
UNION ALL
SELECT 'Avasari Khurd', id FROM public.substations WHERE name = 'Manchar Substation';

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for schedule updates
CREATE TRIGGER update_schedules_updated_at
BEFORE UPDATE ON public.load_shedding_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
