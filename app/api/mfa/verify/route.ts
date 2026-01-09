import { createClient } from "@/lib/supabase/server"
import { MFAUtils, MFARateLimit } from "@/lib/mfa-utils"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { code, useBackupCode = false } = await request.json()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check rate limiting
    const rateLimitKey = `mfa_${user.id}`
    if (!MFARateLimit.checkRateLimit(rateLimitKey)) {
      return NextResponse.json({ 
        error: 'Too many failed attempts. Please try again later.',
        rateLimited: true 
      }, { status: 429 })
    }

    // Get MFA data for user
    const { data: mfaRecord, error: mfaError } = await supabase
      .from('user_mfa')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (mfaError || !mfaRecord || !mfaRecord.enabled) {
      return NextResponse.json({ error: 'MFA not enabled for this user' }, { status: 400 })
    }

    let isValid = false
    let isBackup = false

    if (useBackupCode) {
      // Verify backup code
      const result = await MFAUtils.verifyBackupCode(code, mfaRecord.backup_codes)
      if (result.isValid && result.codeIndex !== undefined) {
        isValid = true
        isBackup = true
        
        // Remove used backup code
        const updatedBackupCodes = MFAUtils.removeUsedBackupCode(
          mfaRecord.backup_codes, 
          result.codeIndex
        )
        
        // Update database with remaining backup codes
        const { error: updateError } = await supabase
          .from('user_mfa')
          .update({ backup_codes: updatedBackupCodes })
          .eq('user_id', user.id)
        
        if (updateError) throw updateError
      }
    } else {
      // Verify TOTP code
      isValid = MFAUtils.verifyTokenWithWindow(mfaRecord.secret, code)
    }

    if (isValid) {
      // Reset rate limiting on successful verification
      MFARateLimit.resetAttempts(rateLimitKey)
      
      return NextResponse.json({ 
        success: true, 
        message: 'MFA verification successful',
        usedBackupCode: isBackup
      })
    } else {
      const attemptsRemaining = MFARateLimit.getRemainingAttempts(rateLimitKey)
      return NextResponse.json({ 
        error: useBackupCode ? 'Invalid backup code' : 'Invalid verification code',
        attemptsRemaining
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in MFA verification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
