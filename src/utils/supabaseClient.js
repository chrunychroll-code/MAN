/**
 * Supabase Client & Realtime Sync Utility for CivicPulse AI
 * Supports environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
 * and interactive dynamic credentials saved in localStorage for live judge evaluation.
 * Gracefully falls back to local in-memory dataset when unconfigured or offline.
 */

import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from Vite env or user localStorage override
export function getSupabaseConfig() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('civicpulse_supabase_url') : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('civicpulse_supabase_key') : '';

  const url = (localUrl || envUrl || '').trim();
  const key = (localKey || envKey || '').trim();

  return {
    url,
    key,
    isConfigured: Boolean(url && key && url.startsWith('http'))
  };
}

let supabaseInstance = null;

export function getSupabaseClient() {
  const config = getSupabaseConfig();
  if (!config.isConfigured) return null;

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(config.url, config.key, {
        auth: { persistSession: false },
        realtime: { params: { eventsPerSecond: 10 } }
      });
    } catch (e) {
      console.warn('[CivicPulse Supabase] Failed to initialize client:', e.message);
      return null;
    }
  }
  return supabaseInstance;
}

export function setSupabaseConfig(url, key) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('civicpulse_supabase_url', url.trim());
    localStorage.setItem('civicpulse_supabase_key', key.trim());
    supabaseInstance = null; // Reset cached instance
  }
}

export function clearSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('civicpulse_supabase_url');
    localStorage.removeItem('civicpulse_supabase_key');
    supabaseInstance = null;
  }
}

/**
 * Fetch all civic reports from Supabase
 */
export async function fetchCivicReportsFromSupabase() {
  const client = getSupabaseClient();
  if (!client) return { data: null, error: 'Supabase client not configured' };

  try {
    const { data, error } = await client
      .from('civic_reports')
      .select('*')
      .order('priority_score', { ascending: false });

    if (error) throw error;

    // Transform database columns back to application model structure
    const formattedReports = (data || []).map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      department: row.department,
      ward: row.ward,
      wardNumber: row.ward_number,
      landmark: row.landmark,
      coordinates: { x: row.x, y: row.y },
      submissionChannel: row.submission_channel,
      submittedAt: row.submitted_at,
      status: row.status,
      isPrimary: row.is_primary,
      duplicateOf: row.duplicate_of,
      mergedCount: row.merged_count,
      childTicketIds: row.child_ticket_ids || [],
      priorityScore: row.priority_score,
      priorityLevel: row.priority_level,
      priorityFactors: row.priority_factors || {},
      clusterId: row.cluster_id,
      assignedCrew: row.assigned_crew || {},
      resolutionNotes: row.resolution_notes,
      auditLog: row.audit_log || [],
      hazardPhotoType: row.hazard_photo_type
    }));

    return { data: formattedReports, error: null };
  } catch (err) {
    console.warn('[CivicPulse Supabase] Error fetching reports:', err.message);
    return { data: null, error: err.message };
  }
}

/**
 * Insert a new civic report to Supabase
 */
export async function insertCivicReportToSupabase(report) {
  const client = getSupabaseClient();
  if (!client) return { data: null, error: 'Supabase client not configured' };

  const dbRow = {
    id: report.id,
    title: report.title,
    description: report.description,
    category: report.category,
    department: report.department,
    ward: report.ward,
    ward_number: report.wardNumber,
    landmark: report.landmark,
    x: report.coordinates.x,
    y: report.coordinates.y,
    submission_channel: report.submissionChannel,
    submitted_at: report.submittedAt,
    status: report.status,
    is_primary: report.isPrimary,
    duplicate_of: report.duplicateOf,
    merged_count: report.mergedCount,
    child_ticket_ids: report.childTicketIds,
    priority_score: report.priorityScore,
    priority_level: report.priorityLevel,
    priority_factors: report.priorityFactors,
    cluster_id: report.clusterId,
    assigned_crew: report.assignedCrew,
    resolution_notes: report.resolutionNotes,
    audit_log: report.auditLog,
    hazard_photo_type: report.hazardPhotoType
  };

  try {
    const { data, error } = await client
      .from('civic_reports')
      .upsert(dbRow)
      .select();

    return { data, error };
  } catch (err) {
    console.warn('[CivicPulse Supabase] Insert error:', err.message);
    return { data: null, error: err.message };
  }
}

/**
 * Update an existing report in Supabase (e.g., status, notes, crew)
 */
export async function updateCivicReportInSupabase(id, updates) {
  const client = getSupabaseClient();
  if (!client) return { error: 'Supabase client not configured' };

  const dbUpdates = {};
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.resolutionNotes !== undefined) dbUpdates.resolution_notes = updates.resolutionNotes;
  if (updates.assignedCrew !== undefined) dbUpdates.assigned_crew = updates.assignedCrew;
  if (updates.mergedCount !== undefined) dbUpdates.merged_count = updates.mergedCount;
  if (updates.childTicketIds !== undefined) dbUpdates.child_ticket_ids = updates.childTicketIds;
  if (updates.priorityScore !== undefined) dbUpdates.priority_score = updates.priorityScore;
  if (updates.priorityLevel !== undefined) dbUpdates.priority_level = updates.priorityLevel;
  if (updates.auditLog !== undefined) dbUpdates.audit_log = updates.auditLog;

  try {
    const { error } = await client
      .from('civic_reports')
      .update(dbUpdates)
      .eq('id', id);

    return { error };
  } catch (err) {
    console.warn('[CivicPulse Supabase] Update error:', err.message);
    return { error: err.message };
  }
}

/**
 * One-click seed function: Inserts the 42 synthetic baseline reports into Supabase
 */
export async function seedSupabaseDatabase(initialReports) {
  const client = getSupabaseClient();
  if (!client) return { success: false, message: 'Supabase client not configured' };

  try {
    const dbRows = initialReports.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      department: r.department,
      ward: r.ward,
      ward_number: r.wardNumber,
      landmark: r.landmark,
      x: r.coordinates.x,
      y: r.coordinates.y,
      submission_channel: r.submissionChannel,
      submitted_at: r.submittedAt,
      status: r.status,
      is_primary: r.isPrimary,
      duplicate_of: r.duplicateOf,
      merged_count: r.mergedCount,
      child_ticket_ids: r.childTicketIds,
      priority_score: r.priorityScore,
      priority_level: r.priorityLevel,
      priority_factors: r.priorityFactors,
      cluster_id: r.clusterId,
      assigned_crew: r.assignedCrew,
      resolution_notes: r.resolutionNotes,
      audit_log: r.auditLog,
      hazard_photo_type: r.hazardPhotoType
    }));

    const { error } = await client
      .from('civic_reports')
      .upsert(dbRows, { onConflict: 'id' });

    if (error) throw error;
    return { success: true, count: dbRows.length };
  } catch (err) {
    return { success: false, message: err.message };
  }
}
