import { authenticator } from 'otplib'
import * as QRCode from 'qrcode'
import * as crypto from 'crypto'

// MFA Utility Functions
export class MFAUtils {
  // Generate a new TOTP secret
  static generateSecret(): string {
    return authenticator.generateSecret()
  }

  // Generate QR code data URL for authenticator apps
  static async generateQRCodeDataURL(
    secret: string,
    email: string,
    appName: string = 'PhishGuard AI'
  ): Promise<string> {
    const otpauthUrl = authenticator.keyuri(email, appName, secret)
    return await QRCode.toDataURL(otpauthUrl)
  }

  // Verify TOTP token
  static verifyToken(secret: string, token: string): boolean {
    try {
      return authenticator.verify({ token, secret })
    } catch (error) {
      console.error('Error verifying TOTP token:', error)
      return false
    }
  }

  // Generate backup codes
  static generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = []
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric codes
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase())
    }
    return codes
  }

  // Hash backup codes for storage
  static async hashBackupCodes(codes: string[]): Promise<string[]> {
    const hashedCodes: string[] = []
    for (const code of codes) {
      const hash = crypto.createHash('sha256').update(code).digest('hex')
      hashedCodes.push(hash)
    }
    return hashedCodes
  }

  // Verify backup code against hashed codes
  static async verifyBackupCode(
    providedCode: string,
    hashedCodes: string[]
  ): Promise<{ isValid: boolean; codeIndex?: number }> {
    const providedHash = crypto.createHash('sha256').update(providedCode).digest('hex')
    
    for (let i = 0; i < hashedCodes.length; i++) {
      if (hashedCodes[i] === providedHash) {
        return { isValid: true, codeIndex: i }
      }
    }
    
    return { isValid: false }
  }

  // Remove used backup code
  static removeUsedBackupCode(hashedCodes: string[], codeIndex: number): string[] {
    return hashedCodes.filter((_, index) => index !== codeIndex)
  }

  // Generate current TOTP token (for testing)
  static generateCurrentToken(secret: string): string {
    return authenticator.generate(secret)
  }

  // Check if token is valid within time window (allows for clock drift)
  static verifyTokenWithWindow(
    secret: string,
    token: string,
    timeWindow: number = 1
  ): boolean {
    try {
      const options = { token, secret }
      // Add window property if supported
      if (timeWindow > 0) {
        (options as any).window = timeWindow
      }
      return authenticator.verify(options)
    } catch (error) {
      console.error('Error verifying TOTP token with window:', error)
      return false
    }
  }
}

// Rate limiting for MFA attempts
export class MFARateLimit {
  private static attempts = new Map<string, { count: number; lastAttempt: number }>()
  
  static checkRateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now()
    const record = this.attempts.get(identifier)
    
    if (!record) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now })
      return true
    }
    
    // Reset if window has passed
    if (now - record.lastAttempt > windowMs) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now })
      return true
    }
    
    // Check if max attempts exceeded
    if (record.count >= maxAttempts) {
      return false
    }
    
    // Increment count
    this.attempts.set(identifier, { 
      count: record.count + 1, 
      lastAttempt: now 
    })
    
    return true
  }
  
  static resetAttempts(identifier: string): void {
    this.attempts.delete(identifier)
  }
  
  static getRemainingAttempts(identifier: string, maxAttempts: number = 5): number {
    const record = this.attempts.get(identifier)
    if (!record) return maxAttempts
    return Math.max(0, maxAttempts - record.count)
  }
}
