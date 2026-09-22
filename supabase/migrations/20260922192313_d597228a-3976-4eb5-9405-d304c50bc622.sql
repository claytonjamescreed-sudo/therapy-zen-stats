CREATE TABLE public.practice_metric_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id text NOT NULL UNIQUE,
  selected_metrics text[] NOT NULL DEFAULT ARRAY['sessions','insurance_aging','patient_balances','new_patients']::text[],
  selected_outcomes text[] NOT NULL DEFAULT ARRAY[]::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.practice_metric_preferences TO authenticated;
GRANT ALL ON public.practice_metric_preferences TO service_role;

ALTER TABLE public.practice_metric_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Practice users can view metric preferences"
ON public.practice_metric_preferences
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.practice_id = practice_metric_preferences.practice_id
  )
);

CREATE POLICY "Practice users can create metric preferences"
ON public.practice_metric_preferences
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.practice_id = practice_metric_preferences.practice_id
  )
);

CREATE POLICY "Practice users can update metric preferences"
ON public.practice_metric_preferences
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.practice_id = practice_metric_preferences.practice_id
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.practice_id = practice_metric_preferences.practice_id
  )
);

CREATE POLICY "Admins can delete metric preferences"
ON public.practice_metric_preferences
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_practice_metric_preferences_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_practice_metric_preferences_updated_at
BEFORE UPDATE ON public.practice_metric_preferences
FOR EACH ROW
EXECUTE FUNCTION public.set_practice_metric_preferences_updated_at();