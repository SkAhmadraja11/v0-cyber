-- PhishGuard AI Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'analyst')),
  organization TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scan results table
CREATE TABLE IF NOT EXISTS public.scan_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  scan_type TEXT NOT NULL CHECK (scan_type IN ('url', 'email', 'file')),
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  classification TEXT NOT NULL CHECK (classification IN ('SAFE', 'SUSPICIOUS', 'PHISHING')),
  confidence DECIMAL(5,2) NOT NULL,
  detection_sources JSONB NOT NULL,
  features_extracted JSONB,
  reasons TEXT[],
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Threat intelligence table
CREATE TABLE IF NOT EXISTS public.threat_intel (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT UNIQUE NOT NULL,
  domain TEXT NOT NULL,
  threat_type TEXT NOT NULL,
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  report_count INTEGER DEFAULT 1,
  sources TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB
);

-- API usage tracking
CREATE TABLE IF NOT EXISTS public.api_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  api_name TEXT NOT NULL,
  endpoint TEXT,
  status_code INTEGER,
  response_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scan_results_user_id ON public.scan_results(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_results_classification ON public.scan_results(classification);
CREATE INDEX IF NOT EXISTS idx_scan_results_created_at ON public.scan_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_threat_intel_domain ON public.threat_intel(domain);
CREATE INDEX IF NOT EXISTS idx_threat_intel_url ON public.threat_intel(url);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON public.api_usage(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to profiles table
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
