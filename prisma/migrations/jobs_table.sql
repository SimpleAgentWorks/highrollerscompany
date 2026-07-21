-- Migration: Create jobs table for website booking form leads
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard → your project → SQL Editor

CREATE TABLE IF NOT EXISTS jobs (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT        NOT NULL,
  phone       TEXT        NOT NULL,
  email       TEXT,
  address     TEXT,
  city        TEXT,
  state       TEXT,
  zip         TEXT,
  job_description TEXT,
  contact_preference TEXT,
  status      TEXT        DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'confirmed', 'completed', 'cancelled')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS jobs_updated_at ON jobs;
CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Index for Polling (newest first)
CREATE INDEX IF NOT EXISTS jobs_created_at_desc ON jobs (created_at DESC);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS jobs_status ON jobs (status);

-- Enable Row Level Security (optional — adjust as needed)
-- ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
-- -- Service role can do anything; anon can only insert
-- CREATE POLICY "Service role full access" ON jobs FOR ALL TO service_role USING (true);
-- CREATE POLICY "Anyone can insert" ON jobs FOR INSERT TO anon WITH CHECK (true);
