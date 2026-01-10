"use client"

import { useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { Shield, Mail, Lock, User, Eye, EyeOff, ArrowRight, UserPlus, AlertTriangle, CheckCircle, Camera, Upload, Smartphone } from "lucide-react"

function SignUpContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>("")
  const [enableMFA, setEnableMFA] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Profile picture must be less than 5MB")
        return
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError("Profile picture must be an image file")
        return
      }
      
      setProfilePicture(file)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePictureUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadProfilePicture = async (file: File, userId: string): Promise<string | null> => {
    if (!file) return null
    
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/profile.${fileExt}`
      
      // First check if bucket exists, if not create it
      const { data: buckets } = await supabase.storage.listBuckets()
      const bucketExists = buckets?.some((bucket: any) => bucket.name === 'profile-pictures')
      
      if (!bucketExists) {
        // Create bucket if it doesn't exist
        const { error: bucketError } = await supabase.storage.createBucket('profile-pictures', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        })
        
        if (bucketError) {
          console.error('Bucket creation error:', bucketError)
          return null
        }
      }
      
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        })
      
      if (error) {
        console.error('Upload error:', error)
        return null
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName)
      
      return publicUrl
    } catch (error) {
      console.error('Profile picture upload failed:', error)
      return null
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    // Validation
    if (!email || !password || !fullName) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      // Create user account directly without email verification
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      })

      if (authError) {
        setError(authError.message)
        setIsLoading(false)
        return
      }

      if (authData.user) {
        // Upload profile picture if provided
        let profilePictureUrl = null
        if (profilePicture) {
          try {
            profilePictureUrl = await uploadProfilePicture(profilePicture, authData.user.id)
            if (!profilePictureUrl) {
              console.warn('Profile picture upload failed, but continuing with signup')
            }
          } catch (uploadError) {
            console.error('Profile picture upload error:', uploadError)
            // Continue with signup even if upload fails
          }
        }
        
        // Create profile without is_activated column
        try {
          const profileResponse = await supabase
            .from('profiles')
            .upsert({
              id: authData.user.id,
              email: email,
              full_name: fullName,
              role: 'user',
              avatar_url: profilePictureUrl,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'id' // Handle case where profile already exists
            })

          if (profileResponse.error) {
            console.error('Profile creation error:', profileResponse.error)
            // Don't fail the signup if profile creation fails
            // User account is created, just log the error
          }
        } catch (profileCatchError) {
          console.error('Profile creation exception:', profileCatchError)
        }

        // Set up MFA if enabled
        if (enableMFA) {
          try {
            // Generate MFA setup token
            const mfaResponse = await supabase
              .from('user_mfa')
              .upsert({
                user_id: authData.user.id,
                enabled: false, // Will be enabled after setup
                setup_token: crypto.randomUUID(),
                created_at: new Date().toISOString()
              }, {
                onConflict: 'user_id'
              })

            if (mfaResponse.error) {
              console.error('MFA setup error:', mfaResponse.error)
            } else {
              console.log('MFA setup initiated for user:', authData.user.id)
            }
          } catch (mfaCatchError) {
            console.error('MFA enrollment error:', mfaCatchError)
          }
        }

        setSuccess(`Account created successfully!${enableMFA ? ' MFA setup will be available in your profile settings.' : ''} Redirecting to login...`)
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      } else {
        // User might need to confirm email first
        setSuccess("Account created! Please check your email to confirm your account, then you can log in.")
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth/login')
        }, 3000)
      }

    } catch (error) {
      console.error('Signup error details:', error)
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('duplicate')) {
          setError('An account with this email already exists. Please sign in instead.')
        } else if (error.message.includes('password')) {
          setError('Password is too weak. Please use a stronger password.')
        } else if (error.message.includes('network')) {
          setError('Network error. Please check your connection and try again.')
        } else if (error.message.includes('database') || error.message.includes('relation')) {
          setError('Database configuration error. Please contact support.')
        } else {
          setError(`Registration failed: ${error.message}`)
        }
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">
      <div className="fixed inset-0 bg-grid-pattern opacity-20" />
      <div className="fixed inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/30">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
              <p className="text-muted-foreground">
                Start your secure journey with PhishGuard AI
              </p>
            </div>
          </div>

          {/* Card */}
          <Card className="glassmorphism border-border/60 shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Create Account</CardTitle>
              <CardDescription>
                Enter your information to create your PhishGuard AI account
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-500/60 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profilePicture" className="text-sm font-medium">
                    Profile Picture (Optional)
                  </Label>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      {profilePictureUrl ? (
                        <img
                          src={profilePictureUrl}
                          alt="Profile preview"
                          className="w-20 h-20 rounded-full object-cover border-2 border-primary/20"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-muted border-2 border-dashed border-muted-foreground/50 flex items-center justify-center">
                          <Camera className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        id="profilePicture"
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('profilePicture')?.click()}
                        className="w-full"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {profilePicture ? 'Change Picture' : 'Upload Picture'}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG or GIF (max. 5MB)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      id="enableMFA"
                      type="checkbox"
                      checked={enableMFA}
                      onChange={(e) => setEnableMFA(e.target.checked)}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <Label htmlFor="enableMFA" className="text-sm font-medium flex items-center">
                      <Smartphone className="w-4 h-4 mr-2 text-primary" />
                      Enable Multi-Factor Authentication (MFA)
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">
                    Add an extra layer of security to your account with MFA
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11" 
                  disabled={isLoading || !!success}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      Create Account
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </form>

              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    onClick={() => router.push('/auth/login')}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <SignUpContent />
    </Suspense>
  )
}
