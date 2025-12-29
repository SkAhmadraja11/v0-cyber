import { createBrowserClient } from "@supabase/ssr"

let client: ReturnType<typeof createBrowserClient> | null = null

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ghtgjwxtljqhlybbnhzq.supabase.co"
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdodGdqd3h0bGpxaGx5YmJuaHpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MjYwODUsImV4cCI6MjA4MjMwMjA4NX0.tJp39dphXOYD02QMYw2lP22w4csCReFxim763KcW1CY"

export function createClient() {
  if (client) return client

  client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  return client
}

export function getSupabaseClient() {
  return createClient()
}
