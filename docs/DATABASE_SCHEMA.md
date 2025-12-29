# Database Schema

## Overview

PhishGuard AI can optionally store scan history, user data, and analytics in a database. This document outlines the recommended schema for Supabase/PostgreSQL.

## Tables

### 1. scans

Stores all phishing detection scans performed by users.

```sql
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  input_type VARCHAR(10) NOT NULL CHECK (input_type IN ('url', 'email')),
  input_value TEXT NOT NULL,
  risk_score INTEGER NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
  classification VARCHAR(20) NOT NULL CHECK (classification IN ('SAFE', 'SUSPICIOUS', 'PHISHING')),
  confidence DECIMAL(5,2) NOT NULL CHECK (confidence BETWEEN 0 AND 100),
  processing_time INTEGER NOT NULL,
  sources JSONB NOT NULL,
  reasons TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for performance
  INDEX idx_scans_user_id (user_id),
  INDEX idx_scans_classification (classification),
  INDEX idx_scans_created_at (created_at DESC),
  INDEX idx_scans_risk_score (risk_score DESC)
);

-- Row Level Security
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scans"
  ON scans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scans"
  ON scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 2. users_profile

Extended user profile information.

```sql
CREATE TABLE users_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  organization TEXT,
  role VARCHAR(50),
  scans_count INTEGER DEFAULT 0,
  threats_detected INTEGER DEFAULT 0,
  last_scan_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON users_profile FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users_profile FOR UPDATE
  USING (auth.uid() = id);
```

### 3. threat_intelligence

Store known phishing patterns and malicious indicators.

```sql
CREATE TABLE threat_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_type VARCHAR(50) NOT NULL,
  indicator_value TEXT NOT NULL UNIQUE,
  threat_level VARCHAR(20) CHECK (threat_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  source VARCHAR(100),
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  times_detected INTEGER DEFAULT 1,
  metadata JSONB,
  
  INDEX idx_threat_indicator (indicator_value),
  INDEX idx_threat_level (threat_level)
);
```

### 4. api_usage

Track API calls for rate limiting and analytics.

```sql
CREATE TABLE api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint VARCHAR(100) NOT NULL,
  api_provider VARCHAR(50),
  status_code INTEGER,
  response_time INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_api_usage_user (user_id),
  INDEX idx_api_usage_provider (api_provider),
  INDEX idx_api_usage_created (created_at DESC)
);
```

## Functions

### Update user stats after scan

```sql
CREATE OR REPLACE FUNCTION update_user_scan_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users_profile
  SET 
    scans_count = scans_count + 1,
    threats_detected = threats_detected + 
      CASE WHEN NEW.classification IN ('SUSPICIOUS', 'PHISHING') THEN 1 ELSE 0 END,
    last_scan_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_stats
AFTER INSERT ON scans
FOR EACH ROW
EXECUTE FUNCTION update_user_scan_stats();
```

## Setup Instructions

### Option 1: Manual Setup (Supabase Dashboard)

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the SQL from above
3. Execute each table creation statement
4. Set up Row Level Security policies
5. Create triggers and functions

### Option 2: Migration Files (Recommended)

Create migration files in your project:

```bash
# If using Supabase CLI
supabase migration new initial_schema

# Add the SQL to the generated migration file
# Run migrations
supabase db push
```

### Option 3: v0 Scripts Folder

Place SQL files in `/scripts` folder and run them directly in v0.

## Analytics Queries

### Get user scan statistics

```sql
SELECT 
  classification,
  COUNT(*) as count,
  AVG(risk_score) as avg_risk_score,
  AVG(confidence) as avg_confidence
FROM scans
WHERE user_id = 'user-uuid'
GROUP BY classification;
```

### Top detected threats

```sql
SELECT 
  input_value,
  risk_score,
  classification,
  created_at
FROM scans
WHERE classification = 'PHISHING'
ORDER BY risk_score DESC, created_at DESC
LIMIT 10;
```

### Detection accuracy over time

```sql
SELECT 
  DATE_TRUNC('day', created_at) as date,
  AVG(confidence) as avg_confidence,
  COUNT(*) as scans_count
FROM scans
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;
```

## Notes

- All timestamps use UTC
- JSONB fields allow flexible storage for API responses
- Row Level Security ensures user data privacy
- Indexes optimize query performance
- Triggers automatically maintain user statistics
