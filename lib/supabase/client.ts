import { createBrowserClient } from "@supabase/ssr"

let client: ReturnType<typeof createBrowserClient> | null = null

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hntttwcudnetgufhpelf.supabase.co"
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhudHR0d2N1ZG5ldGd1ZmhwZWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NjM2MzUsImV4cCI6MjA4MjMzOTYzNX0.acccYuow8CaDPEqE1wGhekoEaGWpUmz3YYagWCK7ejQ"

export function createClient() {
  if (client) return client

  client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  return client
}

export function getSupabaseClient() {
  return createClient()
}
