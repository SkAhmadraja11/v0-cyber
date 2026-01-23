"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type {
  User as SupabaseUser,
  AuthChangeEvent,
  Session,
} from "@supabase/supabase-js"

import { createClient } from "@/lib/supabase/client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  User as UserIcon,
  Settings,
  LogOut,
  Shield,
  Activity,
  GraduationCap,
  Lock,
  ArrowRight,
  Plus as UserPlus,
  Gamepad2,
} from "lucide-react"

export function UserNav() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error) throw error
        setUser(user)
      } catch {
        setUser(null)
      }
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  // -----------------------------
  // NOT LOGGED IN
  // -----------------------------
  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/auth/login")}
          className="border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-200 font-medium"
        >
          <ArrowRight className="w-4 h-4 mr-2" />
          Sign In
        </Button>

        <Button
          size="sm"
          onClick={() => router.push("/auth/sign-up")}
          className="shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-105 transition-all duration-200 font-medium bg-gradient-to-r from-primary to-primary/80"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Sign Up
        </Button>
      </div>
    )
  }

  // -----------------------------
  // LOGGED IN
  // -----------------------------
  const initials = user.user_metadata?.full_name
    ? user.user_metadata.full_name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    : user.email?.charAt(0).toUpperCase() || "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            {user.user_metadata?.avatar_url && (
              <AvatarImage
                src={user.user_metadata.avatar_url}
                alt={user.user_metadata.full_name || "User"}
              />
            )}
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56 glassmorphism" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.user_metadata?.full_name || "User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => router.push("/dashboard")}>
          <Activity className="mr-2 h-4 w-4" />
          Dashboard
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push("/scanner")}>
          <Shield className="mr-2 h-4 w-4" />
          Scanner
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push("/awareness")}>
          <GraduationCap className="mr-2 h-4 w-4" />
          Security Awareness
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push("/games")}>
          <Gamepad2 className="mr-2 h-4 w-4" />
          Cyber Range
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push("/encryption")}>
          <Lock className="mr-2 h-4 w-4" />
          Cryptography Hub
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push("/profile")}>
          <UserIcon className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push("/profile/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
