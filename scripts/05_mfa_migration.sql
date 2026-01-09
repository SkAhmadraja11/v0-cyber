-- Migration Script for Existing Users
-- This script handles existing users who need to enroll in MFA

-- Create a function to check if user needs MFA enrollment
CREATE OR REPLACE FUNCTION check_mfa_enrollment_required()
RETURNS TRIGGER AS $$
BEGIN
  -- This trigger can be used to flag users who need MFA enrollment
  -- on their next login
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a temporary flag for users without MFA
-- This can be used to show a banner or force enrollment
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mfa_enrollment_required BOOLEAN DEFAULT FALSE;

-- Flag existing users who don't have MFA setup
UPDATE public.profiles 
SET mfa_enrollment_required = TRUE 
WHERE id NOT IN (
  SELECT user_id FROM public.user_mfa WHERE enabled = TRUE
);

-- Create a view for users needing MFA enrollment
CREATE OR REPLACE VIEW users_needing_mfa_enrollment AS
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.created_at as user_created_at
FROM public.profiles p
LEFT JOIN public.user_mfa m ON p.id = m.user_id AND m.enabled = TRUE
WHERE m.user_id IS NULL
AND p.id IN (SELECT id FROM auth.users WHERE email_confirmed_at IS NOT NULL);

-- Add comment for documentation
COMMENT ON TABLE public.profiles IS 'Extended user profile with MFA enrollment tracking';
COMMENT ON COLUMN public.profiles.mfa_enrollment_required IS 'Flag to indicate if user needs to complete MFA enrollment';
COMMENT ON VIEW users_needing_mfa_enrollment IS 'Users who have confirmed email but no MFA setup';
