import { createClient } from "@/lib/supabase/server"
import { MFAUtils } from "@/lib/mfa-utils"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { secret, verificationCode, backupCodes } = await request.json()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the provided TOTP code
    if (!MFAUtils.verifyToken(secret, verificationCode)) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
    }

    // Hash backup codes for storage
    const hashedBackupCodes = await MFAUtils.hashBackupCodes(backupCodes)

    // Save MFA setup to database
    const { error: mfaError } = await supabase
      .from('user_mfa')
      .upsert({
        user_id: user.id,
        secret: secret,
        backup_codes: hashedBackupCodes,
        enabled: true
      })

    if (mfaError) {
      console.error('Error saving MFA setup:', mfaError)
      return NextResponse.json({ error: 'Failed to save MFA setup' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'MFA enabled successfully' })
  } catch (error) {
    console.error('Error in MFA enrollment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
