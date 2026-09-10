-- Create user_progress table for storing topic completion progress and target role per Clerk user
CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id TEXT PRIMARY KEY,
  completed_topics JSONB NOT NULL DEFAULT '[]'::jsonb,
  active_topic_id TEXT,
  selected_role TEXT DEFAULT 'all',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security for user_progress
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.user_progress TO authenticated;
GRANT ALL ON TABLE public.user_progress TO service_role;
GRANT ALL ON TABLE public.user_progress TO anon;

CREATE POLICY "Allow individual user read and write"
  ON public.user_progress
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create topics table for storing developer topics metadata & explanation content
CREATE TABLE IF NOT EXISTS public.topics (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  estimated_time TEXT NOT NULL,
  is_important BOOLEAN DEFAULT false,
  summary TEXT NOT NULL,
  explanation JSONB NOT NULL,
  key_takeaways JSONB NOT NULL,
  code_examples JSONB NOT NULL,
  mcqs JSONB NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security for topics
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.topics TO authenticated;
GRANT ALL ON TABLE public.topics TO service_role;
GRANT ALL ON TABLE public.topics TO anon;

CREATE POLICY "Allow public read access to topics"
  ON public.topics
  FOR SELECT
  USING (true);

CREATE POLICY "Allow service role write access to topics"
  ON public.topics
  FOR ALL
  USING (true)
  WITH CHECK (true);
