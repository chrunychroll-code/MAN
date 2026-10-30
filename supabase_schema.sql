-- ==============================================================================
-- CivicPulse AI — Supabase PostgreSQL Schema & Realtime Configuration
-- Run this in your Supabase Project SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Create Civic Reports Table
CREATE TABLE IF NOT EXISTS public.civic_reports (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    department TEXT NOT NULL,
    ward TEXT NOT NULL,
    ward_number INTEGER NOT NULL,
    landmark TEXT,
    x INTEGER NOT NULL DEFAULT 500,
    y INTEGER NOT NULL DEFAULT 425,
    submission_channel TEXT DEFAULT 'Mobile App',
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'Triaged',
    is_primary BOOLEAN NOT NULL DEFAULT true,
    duplicate_of TEXT REFERENCES public.civic_reports(id) ON DELETE SET NULL,
    merged_count INTEGER NOT NULL DEFAULT 1,
    child_ticket_ids JSONB DEFAULT '[]'::jsonb,
    priority_score INTEGER NOT NULL DEFAULT 50,
    priority_level TEXT NOT NULL DEFAULT 'Medium',
    priority_factors JSONB DEFAULT '{}'::jsonb,
    cluster_id TEXT,
    assigned_crew JSONB DEFAULT '{}'::jsonb,
    resolution_notes TEXT,
    audit_log JSONB DEFAULT '[]'::jsonb,
    hazard_photo_type TEXT DEFAULT 'flooding',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes for High-Performance Geospatial, Status & Priority Queries
CREATE INDEX IF NOT EXISTS idx_civic_reports_priority ON public.civic_reports(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_civic_reports_status ON public.civic_reports(status);
CREATE INDEX IF NOT EXISTS idx_civic_reports_ward ON public.civic_reports(ward_number);
CREATE INDEX IF NOT EXISTS idx_civic_reports_category ON public.civic_reports(category);
CREATE INDEX IF NOT EXISTS idx_civic_reports_cluster ON public.civic_reports(cluster_id);
CREATE INDEX IF NOT EXISTS idx_civic_reports_coords ON public.civic_reports(x, y);

-- 3. Row Level Security (RLS) Policies
ALTER TABLE public.civic_reports ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous reads for citizen transparency and status tracking
CREATE POLICY "Public Read Access" 
ON public.civic_reports 
FOR SELECT 
USING (true);

-- Allow citizen submissions (INSERT)
CREATE POLICY "Public Insert Access" 
ON public.civic_reports 
FOR INSERT 
WITH CHECK (true);

-- Allow dispatcher updates (UPDATE)
CREATE POLICY "Public Update Access" 
ON public.civic_reports 
FOR UPDATE 
USING (true);

-- 4. Enable Supabase Realtime for Instant Dispatcher & Citizen Synchronization
ALTER PUBLICATION supabase_realtime ADD TABLE public.civic_reports;

-- 5. Trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()   
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_timestamp ON public.civic_reports;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.civic_reports
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

-- Verify Table Status
SELECT 'CivicPulse Supabase Table Created Successfully!' as status, count(*) from public.civic_reports;
