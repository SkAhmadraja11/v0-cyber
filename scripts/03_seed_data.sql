-- Seed data for demo and testing
-- Run this after RLS policies

-- Insert sample threat intelligence data
INSERT INTO public.threat_intel (url, domain, threat_type, sources, metadata) VALUES
  ('http://phishing-example.com/login', 'phishing-example.com', 'PHISHING', ARRAY['PhishTank', 'Google Safe Browsing'], '{"severity": "high", "category": "credential_theft"}'::jsonb),
  ('http://malware-site.net', 'malware-site.net', 'MALWARE', ARRAY['VirusTotal'], '{"severity": "critical", "category": "malware_distribution"}'::jsonb),
  ('http://suspicious-domain.org/verify', 'suspicious-domain.org', 'SUSPICIOUS', ARRAY['Heuristic Analysis'], '{"severity": "medium", "category": "suspicious_redirect"}'::jsonb)
ON CONFLICT (url) DO NOTHING;

-- Note: User profiles will be automatically created via trigger when users sign up
