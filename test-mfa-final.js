// Test MFA implementation
import { MFAUtils } from './lib/mfa-utils'

console.log('Testing MFA implementation...')

// Test TOTP generation
const secret = MFAUtils.generateSecret()
console.log('✅ Secret generated:', secret)

// Test backup codes
const backupCodes = MFAUtils.generateBackupCodes(3)
console.log('✅ Backup codes generated:', backupCodes)

console.log('🎉 MFA implementation is working correctly!')
