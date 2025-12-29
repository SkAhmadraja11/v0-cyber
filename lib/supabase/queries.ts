import { createClient } from "./server"

export async function getRecentScans(limit = 50) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("scan_results")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function getThreatIntelligence() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("threat_intel")
    .select("*")
    .eq("is_active", true)
    .order("last_seen", { ascending: false })

  if (error) throw error
  return data
}

export async function getAnalyticsSummary(hoursBack = 168) {
  const supabase = await createClient()
  const startDate = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString()

  const { count: totalScans } = await supabase
    .from("scan_results")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startDate)

  const { count: threats } = await supabase
    .from("scan_results")
    .select("*", { count: "exact", head: true })
    .in("classification", ["PHISHING", "SUSPICIOUS"])
    .gte("created_at", startDate)

  return {
    totalScans: totalScans || 0,
    threatsBlocked: threats || 0,
  }
}
