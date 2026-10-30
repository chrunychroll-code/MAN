import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  INITIAL_REPORTS,
  WARDS,
  CATEGORIES,
  RESPONSE_UNITS,
  PREDEFINED_CLUSTERS,
  DEMO_SCENARIO_PRESETS
} from './data/syntheticReports.js';
import {
  computeDistanceMeters,
  computeSemanticSimilarity,
  computePriorityScore,
  explainPriorityRanking,
  triageReportAgainstPool,
  getDepartmentForCategory,
  generateActionBrief
} from './utils/aiEngine.js';
import {
  getSupabaseConfig,
  getSupabaseClient,
  fetchCivicReportsFromSupabase,
  insertCivicReportToSupabase,
  updateCivicReportInSupabase,
  seedSupabaseDatabase,
  setSupabaseConfig,
  clearSupabaseConfig
} from './utils/supabaseClient.js';
import {
  AlertTriangle,
  Zap,
  Droplets,
  Car,
  Trash2,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  Filter,
  Layers,
  Smartphone,
  Send,
  Eye,
  FileText,
  Download,
  Share2,
  Copy,
  Check,
  ChevronRight,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Radio,
  Sparkles,
  RefreshCw,
  PhoneCall,
  MessageSquare,
  Globe,
  Camera,
  Activity,
  Maximize2,
  Minimize2,
  HelpCircle,
  ExternalLink,
  Info,
  Database,
  Server,
  Cloud
} from 'lucide-react';

// Custom SVG Hazard Illustrations (100% self-contained, no broken external image links)
const HazardPhotoPreview = ({ type, title }) => {
  switch (type) {
    case 'flooding':
      return (
        <div className="relative w-full h-36 bg-slate-900 rounded-lg overflow-hidden border border-sky-500/30 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 320 144" fill="none">
            <rect width="320" height="144" fill="#0f172a" />
            <path d="M0 80 Q 80 70 160 85 T 320 80 L 320 144 L 0 144 Z" fill="#0369a1" fillOpacity="0.4" />
            <path d="M0 95 Q 70 85 150 100 T 320 95 L 320 144 L 0 144 Z" fill="#0284c7" fillOpacity="0.6" />
            <path d="M0 115 Q 90 105 180 120 T 320 112 L 320 144 L 0 144 Z" fill="#38bdf8" fillOpacity="0.3" />
            {/* School gate bars */}
            <line x1="60" y1="20" x2="60" y2="90" stroke="#64748b" strokeWidth="4" />
            <line x1="80" y1="15" x2="80" y2="95" stroke="#64748b" strokeWidth="4" />
            <line x1="100" y1="20" x2="100" y2="98" stroke="#64748b" strokeWidth="4" />
            <line x1="50" y1="35" x2="110" y2="35" stroke="#94a3b8" strokeWidth="3" />
            {/* Water ripples */}
            <ellipse cx="180" cy="110" rx="30" ry="6" stroke="#bae6fd" strokeWidth="2" strokeDasharray="6 4" opacity="0.8" />
            <ellipse cx="230" cy="125" rx="45" ry="8" stroke="#e0f2fe" strokeWidth="2" strokeDasharray="8 6" opacity="0.6" />
          </svg>
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur text-[10px] font-mono text-sky-400 flex items-center gap-1 border border-sky-500/30">
            <Droplets className="w-3 h-3 text-sky-400" /> Geo-Watermark: 12.9716°N, 77.5946°E
          </div>
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur text-[10px] font-mono text-slate-300">
            Depth: ~1.5ft Submersion
          </div>
        </div>
      );
    case 'wire':
      return (
        <div className="relative w-full h-36 bg-slate-900 rounded-lg overflow-hidden border border-amber-500/30 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 320 144" fill="none">
            <rect width="320" height="144" fill="#0f172a" />
            {/* Wet pavement */}
            <path d="M0 90 L 320 90 L 320 144 L 0 144 Z" fill="#1e293b" />
            <ellipse cx="160" cy="115" rx="80" ry="15" fill="#0369a1" fillOpacity="0.3" />
            {/* Snapped power line */}
            <path d="M20 -10 Q 90 70 150 115" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" />
            <path d="M300 0 Q 230 60 170 115" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" />
            {/* Electrical sparks */}
            <circle cx="160" cy="115" r="14" fill="#fbbf24" fillOpacity="0.4" />
            <path d="M160 100 L 165 112 L 175 110 L 163 120 L 168 130 L 155 118 L 145 125 Z" fill="#fef08a" stroke="#d97706" strokeWidth="1.5" />
            <line x1="160" y1="115" x2="190" y2="105" stroke="#67e8f9" strokeWidth="2" strokeDasharray="3 3" />
            <line x1="160" y1="115" x2="130" y2="102" stroke="#67e8f9" strokeWidth="2" strokeDasharray="3 3" />
            <line x1="160" y1="115" x2="162" y2="85" stroke="#fef08a" strokeWidth="2" />
          </svg>
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur text-[10px] font-mono text-amber-400 flex items-center gap-1 border border-amber-500/30">
            <Zap className="w-3 h-3 text-amber-400 animate-pulse" /> 11kV Arcing Hazard Detected
          </div>
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-rose-950/80 backdrop-blur text-[10px] font-bold text-rose-300 border border-rose-500/40">
            LIFE SAFETY LEVEL 1
          </div>
        </div>
      );
    case 'pothole':
      return (
        <div className="relative w-full h-36 bg-slate-900 rounded-lg overflow-hidden border border-orange-500/30 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 320 144" fill="none">
            <rect width="320" height="144" fill="#1e293b" />
            {/* Road texture and lines */}
            <line x1="0" y1="72" x2="320" y2="72" stroke="#facc15" strokeWidth="4" strokeDasharray="24 16" />
            {/* Crater outline */}
            <path d="M80 60 Q 120 45 190 55 T 260 85 Q 240 120 170 125 T 90 100 Z" fill="#090d16" stroke="#475569" strokeWidth="3" />
            <path d="M100 70 Q 140 60 180 68 T 240 90 Q 220 112 165 115 T 105 92 Z" fill="#020617" />
            {/* Submerged water reflection */}
            <path d="M120 78 Q 160 70 200 80 T 225 98 Q 190 108 140 105 Z" fill="#0284c7" fillOpacity="0.45" />
            {/* Exposed rebar / rocks */}
            <circle cx="115" cy="85" r="4" fill="#94a3b8" />
            <circle cx="170" cy="100" r="5" fill="#64748b" />
            <line x1="210" y1="85" x2="235" y2="82" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur text-[10px] font-mono text-orange-400 flex items-center gap-1 border border-orange-500/30">
            <Car className="w-3 h-3 text-orange-400" /> Depth: ~1.0ft Rim Breaker
          </div>
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur text-[10px] font-mono text-slate-300">
            Submerged Obstacle
          </div>
        </div>
      );
    case 'manhole':
      return (
        <div className="relative w-full h-36 bg-slate-900 rounded-lg overflow-hidden border border-rose-500/30 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 320 144" fill="none">
            <rect width="320" height="144" fill="#1e293b" />
            {/* Road texture */}
            <ellipse cx="160" cy="80" rx="55" ry="35" fill="#020617" stroke="#dc2626" strokeWidth="4" />
            <ellipse cx="160" cy="80" rx="46" ry="28" fill="#000000" />
            <ellipse cx="160" cy="85" rx="36" ry="18" fill="#0369a1" fillOpacity="0.2" />
            {/* Deep shadow gradient */}
            <path d="M125 75 L 125 95 Q 160 120 195 95 L 195 75 Z" fill="#000000" fillOpacity="0.9" />
            <line x1="160" y1="40" x2="160" y2="120" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 4" />
          </svg>
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur text-[10px] font-mono text-rose-400 flex items-center gap-1 border border-rose-500/30">
            <AlertTriangle className="w-3 h-3 text-rose-400" /> 12-ft Vertical Fall Chasm
          </div>
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-rose-950/80 backdrop-blur text-[10px] font-bold text-rose-300 border border-rose-500/40">
            FATAL RISK
          </div>
        </div>
      );
    case 'garbage':
      return (
        <div className="relative w-full h-36 bg-slate-900 rounded-lg overflow-hidden border border-emerald-500/30 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 320 144" fill="none">
            <rect width="320" height="144" fill="#0f172a" />
            {/* Curb */}
            <line x1="0" y1="100" x2="320" y2="100" stroke="#475569" strokeWidth="4" />
            {/* Garbage mound */}
            <path d="M70 100 Q 110 30 170 45 Q 230 25 270 100 Z" fill="#14532d" fillOpacity="0.5" stroke="#16a34a" strokeWidth="2" />
            <path d="M90 100 Q 130 50 180 55 Q 220 40 250 100 Z" fill="#064e3b" />
            {/* Scattered plastic bags / crates */}
            <rect x="130" y="70" width="24" height="16" fill="#38bdf8" rx="2" />
            <rect x="175" y="65" width="20" height="18" fill="#facc15" rx="3" />
            <circle cx="115" cy="85" r="8" fill="#f43f5e" />
            <path d="M190 92 Q 210 80 230 92" stroke="#a7f3d0" strokeWidth="2" />
          </svg>
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur text-[10px] font-mono text-emerald-400 flex items-center gap-1 border border-emerald-500/30">
            <Trash2 className="w-3 h-3 text-emerald-400" /> ~3-Ton Commercial Dump
          </div>
        </div>
      );
    case 'tree':
      return (
        <div className="relative w-full h-36 bg-slate-900 rounded-lg overflow-hidden border border-rose-500/30 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 320 144" fill="none">
            <rect width="320" height="144" fill="#0f172a" />
            {/* Roadway */}
            <rect y="70" width="320" height="74" fill="#1e293b" />
            {/* Snapped trunk across carriageway */}
            <path d="M20 110 L 290 85 L 295 98 L 25 125 Z" fill="#78350f" stroke="#b45309" strokeWidth="2" />
            {/* Broken branch foliage */}
            <circle cx="180" cy="75" r="28" fill="#15803d" fillOpacity="0.7" />
            <circle cx="230" cy="70" r="34" fill="#166534" fillOpacity="0.8" />
            <circle cx="270" cy="80" r="25" fill="#14532d" fillOpacity="0.8" />
            <line x1="80" y1="20" x2="80" y2="120" stroke="#64748b" strokeWidth="3" />
            <line x1="20" y1="40" x2="300" y2="40" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="8 4" />
          </svg>
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur text-[10px] font-mono text-rose-400 flex items-center gap-1 border border-rose-500/30">
            <AlertTriangle className="w-3 h-3 text-rose-400" /> Carriageway Blocked: 100%
          </div>
        </div>
      );
    case 'traffic_signal':
      return (
        <div className="relative w-full h-36 bg-slate-900 rounded-lg overflow-hidden border border-amber-500/30 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 320 144" fill="none">
            <rect width="320" height="144" fill="#0f172a" />
            {/* Pole */}
            <rect x="155" y="10" width="10" height="130" fill="#475569" />
            {/* Signal box */}
            <rect x="145" y="15" width="30" height="70" rx="6" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
            <circle cx="160" cy="30" r="7" fill="#ef4444" className="animate-pulse" />
            <circle cx="160" cy="50" r="7" fill="#334155" />
            <circle cx="160" cy="70" r="7" fill="#334155" />
          </svg>
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur text-[10px] font-mono text-amber-400 flex items-center gap-1 border border-amber-500/30">
            <Zap className="w-3 h-3 text-amber-400" /> Signal Stuck on All-Red
          </div>
        </div>
      );
    default:
      return (
        <div className="relative w-full h-36 bg-slate-900 rounded-lg overflow-hidden border border-slate-700 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 320 144" fill="none">
            <rect width="320" height="144" fill="#0f172a" />
            {/* Streetlamp pole */}
            <path d="M140 130 L 140 40 Q 140 20 170 20 L 180 20" stroke="#64748b" strokeWidth="4" fill="none" />
            <rect x="175" y="20" width="16" height="8" rx="2" fill="#94a3b8" />
            <polygon points="175,28 191,28 220,120 150,120" fill="#fef08a" fillOpacity="0.12" />
            <circle cx="183" cy="30" r="4" fill="#fde047" />
          </svg>
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur text-[10px] font-mono text-slate-400 flex items-center gap-1 border border-slate-700">
            <Activity className="w-3 h-3 text-slate-400" /> Daylight Sensor Relay Open
          </div>
        </div>
      );
  }
};

export default function App() {
  // Navigation active tab: 'capture' | 'understand' | 'reveal' | 'act' | 'honesty'
  const [activeTab, setActiveTab] = useState('capture');

  // Master mutable state: Reports pool
  const [reports, setReports] = useState(INITIAL_REPORTS);

  // Selected report for deep inspection across Stage 2, 3, and 4
  const [selectedReportId, setSelectedReportId] = useState('CP-1001');

  // Stage 1 State: Form input, view toggle (phone vs wide), demo presets
  const [phoneFrameView, setPhoneFrameView] = useState(true);
  const [trackedTicketId, setTrackedTicketId] = useState('CP-1002');
  const [ticketSearchInput, setTicketSearchInput] = useState('');
  const [reportForm, setReportForm] = useState({
    title: '',
    description: '',
    category: 'Waterlogging & Drainage',
    ward: 'Ward 1 - MG Road / Central',
    landmark: '',
    coordinates: { x: 280, y: 310 },
    hazardPhotoType: 'flooding'
  });
  const [submissionSuccess, setSubmissionSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stage 2 State: Execution banner, queue search & filters
  const [queueSearchQuery, setQueueSearchQuery] = useState('');
  const [queueCategoryFilter, setQueueCategoryFilter] = useState('ALL');
  const [latestPipelineExecution, setLatestPipelineExecution] = useState({
    ticketId: 'CP-1001',
    category: 'Waterlogging & Drainage',
    department: 'Stormwater & Sewerage Dept',
    executiveSummary: 'Submerged school access culvert creating dangerous wading conditions for 1,200 students.',
    duplicateDetection: {
      matched: true,
      parentTicketId: 'CP-1001',
      distanceMeters: 28,
      semanticSimilarity: 88,
      mergedCount: 6
    },
    priorityScore: 93,
    priorityLevel: 'Critical',
    priorityFactors: { hazardSeverity: 34, vulnerableProximity: 25, volumeMultiplier: 20, cascadingRisk: 14 },
    hotspotAlert: 'CL-MG-DRAIN (Culvert Structural Collapse)',
    llmEnhanced: false
  });

  // Stage 3 State: Google Maps Style, filters, halos toggle, zoom
  const [mapCategoryFilter, setMapCategoryFilter] = useState('ALL');
  const [showHotspotHalos, setShowHotspotHalos] = useState(true);
  const [showDuplicatePins, setShowDuplicatePins] = useState(true);
  const [activeActionBriefModal, setActiveActionBriefModal] = useState(null);
  const [briefCopied, setBriefCopied] = useState(false);
  const [mapViewMode, setMapViewMode] = useState('roadmap'); // 'roadmap' | 'satellite' | 'traffic'
  const [mapZoom, setMapZoom] = useState(1);
  const [mapSearchText, setMapSearchText] = useState('');

  // Stage 4 State: Dispatcher queue filter, selected crew, resolution notes, SMS sync modal
  const [dispatchFilter, setDispatchFilter] = useState('ACTIVE_PRIMARY');
  const [dispatchWardFilter, setDispatchWardFilter] = useState('ALL');
  const [selectedCrewUnit, setSelectedCrewUnit] = useState('Rapid Response Crew Alpha-1');
  const [customResolutionNote, setCustomResolutionNote] = useState('');
  const [showCitizenSyncModal, setShowCitizenSyncModal] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

  // Supabase State & Realtime Configuration
  const [supabaseConfig, setSupabaseStateConfig] = useState(getSupabaseConfig());
  const [isSupabaseLive, setIsSupabaseLive] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(supabaseConfig.url || '');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(supabaseConfig.key || '');
  const [isSeedingSupabase, setIsSeedingSupabase] = useState(false);
  const [supabaseStatusMsg, setSupabaseStatusMsg] = useState(null);
  const [schemaCopied, setSchemaCopied] = useState(false);

  // Initialize Supabase & Realtime Subscription
  useEffect(() => {
    let channel = null;
    const config = getSupabaseConfig();
    setSupabaseStateConfig(config);

    if (config.isConfigured) {
      const client = getSupabaseClient();
      if (client) {
        // Fetch existing reports from Supabase
        fetchCivicReportsFromSupabase().then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            setReports(data);
            setIsSupabaseLive(true);
            setSupabaseStatusMsg(`Synchronized ${data.length} live records from Supabase.`);
          } else if (!error && data && data.length === 0) {
            setIsSupabaseLive(true);
            setSupabaseStatusMsg('Supabase connected! Table is empty (click "Seed Baseline" to populate).');
          } else {
            setIsSupabaseLive(false);
            if (error) setSupabaseStatusMsg(`Supabase notice: ${error}`);
          }
        });

        // Listen for Realtime Postgres Changes
        try {
          channel = client
            .channel('civicpulse_realtime_channel')
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'civic_reports' },
              (payload) => {
                if (payload.eventType === 'INSERT') {
                  const newRow = payload.new;
                  const formatted = {
                    id: newRow.id,
                    title: newRow.title,
                    description: newRow.description,
                    category: newRow.category,
                    department: newRow.department,
                    ward: newRow.ward,
                    wardNumber: newRow.ward_number,
                    landmark: newRow.landmark,
                    coordinates: { x: newRow.x, y: newRow.y },
                    submissionChannel: newRow.submission_channel,
                    submittedAt: newRow.submitted_at,
                    status: newRow.status,
                    isPrimary: newRow.is_primary,
                    duplicateOf: newRow.duplicate_of,
                    mergedCount: newRow.merged_count,
                    childTicketIds: newRow.child_ticket_ids || [],
                    priorityScore: newRow.priority_score,
                    priorityLevel: newRow.priority_level,
                    priorityFactors: newRow.priority_factors || {},
                    clusterId: newRow.cluster_id,
                    assignedCrew: newRow.assigned_crew || {},
                    resolutionNotes: newRow.resolution_notes,
                    auditLog: newRow.audit_log || [],
                    hazardPhotoType: newRow.hazard_photo_type
                  };
                  setReports(prev => {
                    if (prev.some(r => r.id === formatted.id)) return prev;
                    return [formatted, ...prev];
                  });
                } else if (payload.eventType === 'UPDATE') {
                  const updatedRow = payload.new;
                  setReports(prev => prev.map(item => {
                    if (item.id === updatedRow.id) {
                      return {
                        ...item,
                        status: updatedRow.status,
                        resolutionNotes: updatedRow.resolution_notes,
                        assignedCrew: updatedRow.assigned_crew || item.assignedCrew,
                        priorityScore: updatedRow.priority_score ?? item.priorityScore,
                        mergedCount: updatedRow.merged_count ?? item.mergedCount,
                        childTicketIds: updatedRow.child_ticket_ids || item.childTicketIds,
                        auditLog: updatedRow.audit_log || item.auditLog
                      };
                    }
                    return item;
                  }));
                }
              }
            )
            .subscribe((status) => {
              if (status === 'SUBSCRIBED') {
                setIsSupabaseLive(true);
              }
            });
        } catch (e) {
          console.warn('[CivicPulse Supabase] Realtime notice:', e.message);
        }
      }
    }

    return () => {
      if (channel) {
        const client = getSupabaseClient();
        if (client) client.removeChannel(channel);
      }
    };
  }, []);

  // Currently selected report object
  const selectedReport = useMemo(() => {
    return reports.find(r => r.id === selectedReportId) || reports[0];
  }, [reports, selectedReportId]);

  // Tracked citizen report object (Stage 1 tracker)
  const trackedReport = useMemo(() => {
    return reports.find(r => r.id === trackedTicketId) || reports[0];
  }, [reports, trackedTicketId]);

  // Tracked parent report if trackedReport is a merged duplicate
  const trackedMasterReport = useMemo(() => {
    if (trackedReport?.duplicateOf) {
      return reports.find(r => r.id === trackedReport.duplicateOf) || trackedReport;
    }
    return trackedReport;
  }, [reports, trackedReport]);

  // Filtered primary reports ranked by priority score descending (Stage 2)
  const rankedPrimaryReports = useMemo(() => {
    return reports
      .filter(r => r.isPrimary)
      .filter(r => queueCategoryFilter === 'ALL' || r.category === queueCategoryFilter)
      .filter(r => {
        if (!queueSearchQuery.trim()) return true;
        const q = queueSearchQuery.toLowerCase();
        return r.title.toLowerCase().includes(q) ||
               r.id.toLowerCase().includes(q) ||
               r.landmark.toLowerCase().includes(q) ||
               r.ward.toLowerCase().includes(q);
      })
      .sort((a, b) => b.priorityScore - a.priorityScore);
  }, [reports, queueCategoryFilter, queueSearchQuery]);

  // Filtered reports for Dispatcher Console (Stage 4)
  const dispatchQueueReports = useMemo(() => {
    return reports
      .filter(r => {
        if (dispatchWardFilter !== 'ALL' && r.ward !== dispatchWardFilter) return false;
        if (dispatchFilter === 'ACTIVE_PRIMARY') return r.isPrimary && r.status !== 'Resolved';
        if (dispatchFilter === 'ALL_PRIMARY') return r.isPrimary;
        if (dispatchFilter === 'MERGED_DUPLICATES') return !r.isPrimary;
        if (dispatchFilter === 'RESOLVED') return r.status === 'Resolved';
        return true;
      })
      .sort((a, b) => b.priorityScore - a.priorityScore);
  }, [reports, dispatchFilter, dispatchWardFilter]);

  // All primary reports (Stage 3 Map)
  const mapPrimaryReports = useMemo(() => {
    return reports.filter(r => r.isPrimary && (mapCategoryFilter === 'ALL' || r.category === mapCategoryFilter));
  }, [reports, mapCategoryFilter]);

  // All merged duplicate reports (Stage 3 Map)
  const mapDuplicateReports = useMemo(() => {
    return reports.filter(r => !r.isPrimary && (mapCategoryFilter === 'ALL' || r.category === mapCategoryFilter));
  }, [reports, mapCategoryFilter]);

  // Populate report form from demo presets
  const applyPresetScenario = (scenario) => {
    setReportForm({
      title: scenario.data.title,
      description: scenario.data.description,
      category: scenario.data.category,
      ward: scenario.data.ward,
      landmark: scenario.data.landmark,
      coordinates: scenario.data.coordinates,
      hazardPhotoType: scenario.data.hazardPhotoType
    });
  };

  // Mini-map coordinate click handler in Stage 1 form
  const handleMiniMapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Scale to 0-1000 and 0-850 coordinates
    const scaledX = Math.round((clickX / rect.width) * 1000);
    const scaledY = Math.round((clickY / rect.height) * 850);

    // Auto-detect ward based on coordinate quadrant
    let detectedWard = 'Ward 1 - MG Road / Central';
    if (scaledX > 500 && scaledY < 450) detectedWard = 'Ward 2 - Indiranagar / East';
    else if (scaledX > 600 && scaledY >= 450) detectedWard = 'Ward 5 - Whitefield / Tech Zone';
    else if (scaledX <= 550 && scaledY >= 500) detectedWard = 'Ward 4 - HSR Layout / Sector 4';
    else if (scaledX > 550 && scaledY >= 350) detectedWard = 'Ward 3 - Koramangala / South';

    setReportForm(prev => ({
      ...prev,
      coordinates: { x: scaledX, y: scaledY },
      ward: detectedWard
    }));
  };

  // Form submission: Runs local AI pipeline + optional non-blocking Gemini LLM enhancement
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportForm.title.trim()) return;

    setIsSubmitting(true);

    const newTicketId = `CP-${1000 + reports.length + 1}`;
    const newReportCandidate = {
      id: newTicketId,
      title: reportForm.title.trim(),
      description: reportForm.description.trim() || reportForm.title.trim(),
      category: reportForm.category,
      ward: reportForm.ward,
      wardNumber: WARDS.find(w => w.name === reportForm.ward)?.id || 1,
      landmark: reportForm.landmark || 'Citizen Reported Location',
      coordinates: reportForm.coordinates,
      submissionChannel: 'Mobile App',
      submittedAt: new Date().toISOString(),
      hazardPhotoType: reportForm.hazardPhotoType
    };

    // 1. Run deterministic local AI triage engine in <10ms
    const triageResult = triageReportAgainstPool(newReportCandidate, reports);

    // 2. Optional non-blocking Gemini API call to Express backend
    let geminiEnriched = false;
    let executiveSummary = triageResult.isDuplicate
      ? `Spatial duplicate detected within ${triageResult.distanceMeters}m of Master Ticket ${triageResult.matchedParentTicket.id} (${triageResult.similarityPercent}% semantic similarity). Merged into parent queue.`
      : `${newReportCandidate.category} incident at ${newReportCandidate.landmark}. Evaluated at ${triageResult.priorityScore}/100 Priority (${triageResult.priorityLevel}).`;

    try {
      const response = await fetch('/api/ai/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReportCandidate)
      });
      if (response.ok) {
        const data = await response.json();
        if (!data.fallback && data.enrichment?.executiveSummary) {
          executiveSummary = data.enrichment.executiveSummary;
          geminiEnriched = true;
        }
      }
    } catch {
      // Clean fallback: Keep deterministic local AI engine summary
    }

    // 3. Assemble new report object and update mutable state
    if (triageResult.isDuplicate) {
      const parent = triageResult.matchedParentTicket;
      const updatedParentMergedCount = parent.mergedCount + 1;
      const updatedParentScore = Math.min(100, Math.max(parent.priorityScore, triageResult.priorityScore + 2));

      const newDuplicateReport = {
        ...newReportCandidate,
        status: 'Merged',
        isPrimary: false,
        duplicateOf: parent.id,
        mergedCount: 1,
        childTicketIds: [],
        priorityScore: updatedParentScore,
        priorityLevel: parent.priorityLevel,
        priorityFactors: triageResult.priorityFactors,
        clusterId: parent.clusterId || triageResult.detectedCluster?.id || null,
        assignedCrew: { ...parent.assignedCrew },
        resolutionNotes: `Merged into Master Ticket ${parent.id}`,
        auditLog: [
          {
            timestamp: new Date().toISOString(),
            actor: 'Citizen (Mobile App)',
            action: 'Report Submitted',
            details: 'Captured with GPS coordinates and SVG preview.'
          },
          {
            timestamp: new Date().toISOString(),
            actor: 'CivicPulse AI',
            action: 'Duplicate Consolidated',
            details: `Matched ${parent.id} at ${triageResult.distanceMeters}m with ${triageResult.similarityPercent}% similarity.`
          }
        ]
      };

      // Update parent ticket in pool
      setReports(prev => prev.map(item => {
        if (item.id === parent.id) {
          return {
            ...item,
            mergedCount: updatedParentMergedCount,
            childTicketIds: [...item.childTicketIds, newTicketId],
            priorityScore: updatedParentScore,
            auditLog: [
              ...item.auditLog,
              {
                timestamp: new Date().toISOString(),
                actor: 'CivicPulse AI',
                action: 'Child Report Merged',
                details: `Appended ${newTicketId} from Mobile App. Total duplicates: ${updatedParentMergedCount}.`
              }
            ]
          };
        }
        return item;
      }).concat(newDuplicateReport));

      // Update latest pipeline execution banner
      setLatestPipelineExecution({
        ticketId: newTicketId,
        category: newReportCandidate.category,
        department: triageResult.department,
        executiveSummary,
        duplicateDetection: {
          matched: true,
          parentTicketId: parent.id,
          distanceMeters: triageResult.distanceMeters,
          semanticSimilarity: triageResult.similarityPercent,
          mergedCount: updatedParentMergedCount
        },
        priorityScore: updatedParentScore,
        priorityLevel: parent.priorityLevel,
        priorityFactors: triageResult.priorityFactors,
        hotspotAlert: parent.clusterId || triageResult.detectedCluster?.name || null,
        llmEnhanced: geminiEnriched
      });

      setSelectedReportId(parent.id);
      setTrackedTicketId(newTicketId);
    } else {
      // Standalone new primary ticket
      const newPrimaryReport = {
        ...newReportCandidate,
        status: 'Triaged',
        isPrimary: true,
        duplicateOf: null,
        mergedCount: 1,
        childTicketIds: [],
        priorityScore: triageResult.priorityScore,
        priorityLevel: triageResult.priorityLevel,
        priorityFactors: triageResult.priorityFactors,
        clusterId: triageResult.detectedCluster?.id || null,
        assignedCrew: {
          unit: null,
          dept: triageResult.department,
          dispatchedAt: null,
          etaMinutes: null
        },
        resolutionNotes: 'Newly triaged. Awaiting crew assignment in Stage 4.',
        auditLog: [
          {
            timestamp: new Date().toISOString(),
            actor: 'Citizen (Mobile App)',
            action: 'Report Submitted',
            details: 'Captured with GPS coordinates.'
          },
          {
            timestamp: new Date().toISOString(),
            actor: 'CivicPulse AI',
            action: 'Triaged & Scored',
            details: `Calculated priority score: ${triageResult.priorityScore}/100 (${triageResult.priorityLevel}).`
          }
        ]
      };

      setReports(prev => [newPrimaryReport, ...prev]);

      setLatestPipelineExecution({
        ticketId: newTicketId,
        category: newReportCandidate.category,
        department: triageResult.department,
        executiveSummary,
        duplicateDetection: {
          matched: false,
          parentTicketId: null,
          distanceMeters: null,
          semanticSimilarity: null,
          mergedCount: 1
        },
        priorityScore: triageResult.priorityScore,
        priorityLevel: triageResult.priorityLevel,
        priorityFactors: triageResult.priorityFactors,
        hotspotAlert: triageResult.detectedCluster?.name || null,
        llmEnhanced: geminiEnriched
      });

      setSelectedReportId(newTicketId);
      setTrackedTicketId(newTicketId);
    }

    setIsSubmitting(false);
    setSubmissionSuccess({
      ticketId: newTicketId,
      isDuplicate: triageResult.isDuplicate,
      parentId: triageResult.isDuplicate ? triageResult.matchedParentTicket.id : null,
      score: triageResult.priorityScore
    });

    // Reset title
    setReportForm(prev => ({ ...prev, title: '', description: '' }));
  };

  // Status progression in Stage 4 Dispatch Console
  const handleUpdateTicketStatus = (newStatus) => {
    if (!selectedReport) return;

    const timestamp = new Date().toISOString();
    const noteText = customResolutionNote.trim() || `Status progressed to ${newStatus} by Dispatch Control.`;

    setReports(prev => prev.map(item => {
      // Update selected report
      if (item.id === selectedReport.id) {
        return {
          ...item,
          status: newStatus,
          resolutionNotes: noteText,
          assignedCrew: {
            ...item.assignedCrew,
            unit: selectedCrewUnit,
            dispatchedAt: newStatus === 'Field Crew Dispatched' ? timestamp : item.assignedCrew?.dispatchedAt,
            etaMinutes: newStatus === 'Field Crew Dispatched' ? 14 : item.assignedCrew?.etaMinutes
          },
          auditLog: [
            ...item.auditLog,
            {
              timestamp,
              actor: 'Dispatcher Verma',
              action: `Status: ${newStatus}`,
              details: `Assigned unit: ${selectedCrewUnit}. Note: ${noteText}`
            }
          ]
        };
      }
      // If this report has child duplicate tickets, synchronize all children too!
      if (item.duplicateOf === selectedReport.id) {
        return {
          ...item,
          status: newStatus === 'Resolved' ? 'Resolved' : item.status,
          resolutionNotes: `Synchronized with Master ${selectedReport.id}: ${noteText}`,
          assignedCrew: {
            ...item.assignedCrew,
            unit: selectedCrewUnit,
            dispatchedAt: newStatus === 'Field Crew Dispatched' ? timestamp : item.assignedCrew?.dispatchedAt,
            etaMinutes: newStatus === 'Field Crew Dispatched' ? 14 : item.assignedCrew?.etaMinutes
          },
          auditLog: [
            ...item.auditLog,
            {
              timestamp,
              actor: 'CivicPulse Auto-Sync',
              action: `Master Update: ${newStatus}`,
              details: `Propagated from Master ${selectedReport.id}`
            }
          ]
        };
      }
      return item;
    }));

    setActionFeedback(`Ticket ${selectedReport.id} successfully updated to "${newStatus}". Citizen notification dispatched.`);
    setTimeout(() => setActionFeedback(null), 4500);
  };

  // Export functions (Stage 5)
  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reports, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `civicpulse_triage_dataset_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportCSV = () => {
    const headers = ["id", "title", "category", "ward", "landmark", "priorityScore", "priorityLevel", "status", "isPrimary", "duplicateOf", "mergedCount", "x", "y"];
    const rows = reports.map(r => [
      r.id,
      `"${r.title.replace(/"/g, '""')}"`,
      r.category,
      `"${r.ward}"`,
      `"${r.landmark.replace(/"/g, '""')}"`,
      r.priorityScore,
      r.priorityLevel,
      r.status,
      r.isPrimary,
      r.duplicateOf || "",
      r.mergedCount,
      r.coordinates.x,
      r.coordinates.y
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", encodedUri);
    downloadAnchor.setAttribute("download", `civicpulse_triage_dataset_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Copy Action Brief text
  const copyActionBriefText = (brief) => {
    if (!brief) return;
    const briefText = `=== ${brief.title} ===
Corridor: ${brief.corridor}
Total Correlated Reports: ${brief.reportsCount}
Root Cause Hypothesis: ${brief.rootCauseHypothesis}

OPERATIONAL DISPATCH SEQUENCE:
${brief.sequencedDispatchOrder.map(s => `Step ${s.step}: [${s.dept}] (${s.unit}) -> ${s.action}`).join('\n')}

Risk If Delayed: ${brief.riskIfDelayed}
Estimated Remediation Cost: ${brief.estimatedCost}
Target Resolution Window: ${brief.resolutionWindow}`;

    navigator.clipboard.writeText(briefText);
    setBriefCopied(true);
    setTimeout(() => setBriefCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col bg-grid-pattern selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* =========================================================================
          TOP PLATFORM NAVIGATION HEADER
      ========================================================================= */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Brand & Live System Status */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  CivicPulse AI
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Cloud Run Ready
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span>Deterministic <span className="text-emerald-400 font-mono">&lt;10ms</span> Triage</span>
                <span className="text-slate-600">•</span>
                <span>Spatial &amp; Semantic Deduplication</span>
                <span className="text-slate-600">•</span>
                <span className="text-sky-400 font-medium">Gemini 2.5 REST API Bridge</span>
              </p>
            </div>
          </div>

          {/* Lifecycle Stages Tab Switcher */}
          <nav className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab('capture')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'capture'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-700/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>1. Capture</span>
            </button>

            <button
              onClick={() => setActiveTab('understand')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'understand'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-700/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>2. Understand</span>
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-blue-500/30 text-blue-200 font-mono">
                {rankedPrimaryReports.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('reveal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'reveal'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-700/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>3. Reveal Map</span>
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-purple-500/30 text-purple-200 font-mono">
                3 Clusters
              </span>
            </button>

            <button
              onClick={() => setActiveTab('act')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'act'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-700/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>4. Act &amp; Dispatch</span>
            </button>

            <button
              onClick={() => setActiveTab('honesty')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'honesty'
                  ? 'bg-gradient-to-r from-slate-700 to-slate-600 text-white shadow-md font-semibold border border-slate-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Honesty Note</span>
            </button>
          </nav>

          {/* Quick Municipal Health, Supabase & Reset */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSupabaseModal(true)}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
                isSupabaseLive
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
              title="Configure Supabase Database & Realtime Sync"
            >
              <Database className={`w-3.5 h-3.5 ${isSupabaseLive ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">
                {isSupabaseLive ? 'Supabase Realtime' : 'Supabase Sync'}
              </span>
              <span className={`w-2 h-2 rounded-full ${isSupabaseLive ? 'bg-emerald-400 animate-ping-slow' : 'bg-slate-500'}`} />
            </button>

            <button
              onClick={() => {
                setReports(INITIAL_REPORTS);
                setSelectedReportId('CP-1001');
                setTrackedTicketId('CP-1002');
              }}
              title="Reset synthetic reports to baseline"
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Baseline</span>
            </button>

            <button
              onClick={exportJSON}
              title="Download live triaged dataset"
              className="p-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-500/30 text-xs flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </header>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div className="bg-emerald-600/90 text-white text-xs px-4 py-2 font-medium flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{actionFeedback}</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          MAIN APPLICATION WORKSPACE
      ========================================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">

        {/* =======================================================================
            STAGE 1: CAPTURE (Mobile-First Citizen Reporting & Two-Way Status Tracker)
        ======================================================================= */}
        {activeTab === 'capture' && (
          <div className="space-y-6">
            {/* Top Demo Presets Bar */}
            <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 bg-slate-900/40">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-slate-200">
                    Interactive Evaluation Presets (Click to Test Live AI Engine)
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => setPhoneFrameView(!phoneFrameView)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{phoneFrameView ? "Switch to Wide Form View" : "Switch to Smartphone Bezel"}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {DEMO_SCENARIO_PRESETS.map((scenario) => (
                  <button
                    key={scenario.id}
                    onClick={() => applyPresetScenario(scenario)}
                    className="text-left p-3 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${scenario.badgeColor}`}>
                          {scenario.badge}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                        {scenario.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                        {scenario.subtitle}
                      </p>
                    </div>
                    <div className="mt-2 text-[10px] text-slate-500 italic border-t border-slate-800 pt-1.5">
                      {scenario.expectedBehavior}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submission Success Banner */}
            {submissionSuccess && (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Report Captured Successfully — Ticket ID: {submissionSuccess.ticketId}
                    </h4>
                    <p className="text-xs text-emerald-300">
                      {submissionSuccess.isDuplicate
                        ? `AI Spatial Deduplicator linked this report to Master Ticket ${submissionSuccess.parentId}. Your report boosted the Master Priority score to ${submissionSuccess.score}/100!`
                        : `AI Engine assigned Priority Score ${submissionSuccess.score}/100 and registered this as a new primary municipal dispatch ticket.`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setTrackedTicketId(submissionSuccess.ticketId);
                      setSelectedReportId(submissionSuccess.isDuplicate ? submissionSuccess.parentId : submissionSuccess.ticketId);
                      setActiveTab('understand');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <span>View in Stage 2 AI Triage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Stage 1 Layout: Citizen Form (Left) + Two-Way Status Tracker (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Citizen Reporting Interface */}
              <div className={`${phoneFrameView ? 'lg:col-span-6 flex justify-center' : 'lg:col-span-7'}`}>
                <div className={`${phoneFrameView ? 'w-full max-w-md phone-bezel rounded-[40px] bg-slate-900 border-4 border-slate-700/80 p-5 overflow-hidden' : 'glass-panel p-6 rounded-2xl border border-slate-800'}`}>
                  {/* Simulated Smartphone Status Bar & Notch */}
                  {phoneFrameView && (
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                      <span>9:41 AM</span>
                      <div className="w-24 h-4 bg-slate-950 rounded-full border border-slate-800" />
                      <span className="flex items-center gap-1">5G • 100%</span>
                    </div>
                  )}

                  {/* Form Header */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
                        <Send className="w-4 h-4" />
                      </span>
                      <h2 className="text-base font-bold text-white">
                        Report a Civic Hazard or Road Incident
                      </h2>
                    </div>
                    <p className="text-xs text-slate-400">
                      AI auto-detects nearest master tickets and correlates root-cause clusters in under 10ms.
                    </p>
                  </div>

                  {/* Form Fields */}
                  <form onSubmit={handleSubmitReport} className="space-y-4">
                    {/* Title */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Issue Title <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={reportForm.title}
                        onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                        placeholder="e.g., Knee-deep water outside school gate or sparking cable"
                        className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>

                    {/* Category Selection Grid */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Category &amp; Department Selector
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {CATEGORIES.map((cat) => {
                          const isSelected = reportForm.category === cat.name;
                          return (
                            <button
                              key={cat.name}
                              type="button"
                              onClick={() => setReportForm({ ...reportForm, category: cat.name })}
                              className={`p-2 rounded-xl text-left border text-xs transition-all flex flex-col justify-between ${
                                isSelected
                                  ? `${cat.border} ${cat.bgLight} ${cat.textLight} ring-1 ring-emerald-500/50 font-semibold shadow-md`
                                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                {cat.name === 'Waterlogging & Drainage' && <Droplets className="w-3.5 h-3.5" />}
                                {cat.name === 'Electrical & Streetlights' && <Zap className="w-3.5 h-3.5" />}
                                {cat.name === 'Roads & Footpaths' && <Car className="w-3.5 h-3.5" />}
                                {cat.name === 'Waste & Sanitation' && <Trash2 className="w-3.5 h-3.5" />}
                                {cat.name === 'Public Safety & Trees' && <AlertTriangle className="w-3.5 h-3.5" />}
                                {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                              </div>
                              <span className="text-[11px] leading-tight">{cat.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Detailed Description &amp; Symptoms
                      </label>
                      <textarea
                        rows={3}
                        value={reportForm.description}
                        onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                        placeholder="Provide details: depth, size, arcing sounds, immediate danger..."
                        className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>

                    {/* Ward & Landmark */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Ward Boundary (5 City Wards)
                        </label>
                        <select
                          value={reportForm.ward}
                          onChange={(e) => setReportForm({ ...reportForm, ward: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                        >
                          {WARDS.map((w) => (
                            <option key={w.id} value={w.name}>
                              {w.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Nearest Landmark
                        </label>
                        <input
                          type="text"
                          value={reportForm.landmark}
                          onChange={(e) => setReportForm({ ...reportForm, landmark: e.target.value })}
                          placeholder="e.g., St. Mary's School Gate, CMH Metro"
                          className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Interactive SVG Mini-Map Pin Picker (Click anywhere to set coordinates) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Interactive GPS Pin Picker (Click mini-map to position)</span>
                        </label>
                        <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                          X: {reportForm.coordinates.x}, Y: {reportForm.coordinates.y}
                        </span>
                      </div>
                      <div
                        onClick={handleMiniMapClick}
                        className="relative w-full h-36 bg-slate-950 rounded-xl border border-slate-700/80 overflow-hidden cursor-crosshair group shadow-inner"
                        title="Click anywhere to drop issue pin"
                      >
                        {/* Google Maps Style Mini Vector Map */}
                        <svg className="w-full h-full" viewBox="0 0 1000 850">
                          <defs>
                            <filter id="miniPinShadow" x="-30%" y="-30%" width="160%" height="160%">
                              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.7" />
                            </filter>
                          </defs>
                          {/* Google Maps Land Base */}
                          <rect width="1000" height="850" fill="#1e293b" />

                          {/* Green Park Area */}
                          <path d="M 60 80 Q 180 60 220 140 T 120 220 T 50 160 Z" fill="#14532d" fillOpacity="0.6" />
                          {/* Water Basin */}
                          <path d="M 620 120 Q 750 90 780 180 T 680 250 T 590 190 Z" fill="#0369a1" fillOpacity="0.7" />

                          {/* Ward outlines */}
                          <path d="M 50 50 L 500 50 L 450 450 L 50 450 Z" fill="#3b82f6" fillOpacity="0.05" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="6 4" />
                          <path d="M 500 50 L 950 50 L 950 450 L 450 450 Z" fill="#8b5cf6" fillOpacity="0.05" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="6 4" />
                          <path d="M 50 450 L 450 450 L 450 800 L 50 800 Z" fill="#f97316" fillOpacity="0.05" stroke="#f97316" strokeWidth="1.5" strokeDasharray="6 4" />
                          <path d="M 450 450 L 950 450 L 950 800 L 450 800 Z" fill="#10b981" fillOpacity="0.05" stroke="#10b981" strokeWidth="1.5" strokeDasharray="6 4" />

                          {/* Minor Roads */}
                          <g stroke="#334155" strokeWidth="6" opacity="0.5">
                            <line x1="200" y1="40" x2="200" y2="420" />
                            <line x1="40" y1="240" x2="480" y2="240" />
                            <line x1="640" y1="420" x2="640" y2="820" />
                            <line x1="540" y1="620" x2="960" y2="620" />
                          </g>

                          {/* Google Arterial Road Lines (Gold/Yellow) */}
                          <line x1="100" y1="310" x2="900" y2="310" stroke="#f59e0b" strokeWidth="14" strokeLinecap="round" />
                          <line x1="438" y1="100" x2="438" y2="780" stroke="#f59e0b" strokeWidth="14" strokeLinecap="round" />
                          <line x1="100" y1="310" x2="900" y2="310" stroke="#fef08a" strokeWidth="2" strokeDasharray="14 10" />

                          {/* Existing Primary Pins */}
                          {reports.filter(r => r.isPrimary).slice(0, 15).map(r => (
                            <circle
                              key={r.id}
                              cx={r.coordinates.x}
                              cy={r.coordinates.y}
                              r="5"
                              fill={r.priorityScore >= 80 ? '#ef4444' : r.priorityScore >= 60 ? '#f97316' : '#eab308'}
                              opacity="0.7"
                            />
                          ))}

                          {/* Google Maps Teardrop Selected Pin with Radar Ring */}
                          <circle
                            cx={reportForm.coordinates.x}
                            cy={reportForm.coordinates.y}
                            r="28"
                            fill="#10b981"
                            fillOpacity="0.2"
                            className="animate-ping-slow"
                          />
                          <g transform={`translate(${reportForm.coordinates.x}, ${reportForm.coordinates.y})`} filter="url(#miniPinShadow)">
                            <path
                              d="M 0 0 C -6 -10 -12 -16 -12 -24 C -12 -33 -4 -38 0 -38 C 4 -38 12 -33 12 -24 C 12 -16 6 -10 0 0 Z"
                              fill="#10b981"
                              stroke="#ffffff"
                              strokeWidth="2"
                            />
                            <circle cx="0" cy="-24" r="4.5" fill="#ffffff" />
                          </g>
                        </svg>

                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur text-[10px] font-mono text-slate-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>Google Maps Pin: Click anywhere to move</span>
                        </div>
                      </div>
                    </div>

                    {/* Hazard Photo Preview */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Simulated Hazard Photo Evidence (Built-in Vector SVG)</span>
                        </label>
                        <select
                          value={reportForm.hazardPhotoType}
                          onChange={(e) => setReportForm({ ...reportForm, hazardPhotoType: e.target.value })}
                          className="text-[10px] font-mono bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-slate-300 focus:outline-none"
                        >
                          <option value="flooding">Flooding &amp; Submersion</option>
                          <option value="wire">Sparking 11kV Cable</option>
                          <option value="pothole">Asphalt Crater Pothole</option>
                          <option value="manhole">Open 12ft Sewer Manhole</option>
                          <option value="garbage">3-Ton Garbage Dump</option>
                          <option value="tree">Fallen Tree Carriageway</option>
                          <option value="traffic_signal">Failed Traffic Signal</option>
                          <option value="streetlight">Daylight Sensor Relay</option>
                        </select>
                      </div>
                      <HazardPhotoPreview type={reportForm.hazardPhotoType} title={reportForm.title} />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs tracking-wide shadow-lg shadow-emerald-700/30 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>Executing AI Triage &amp; Spatial Deduplication...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 text-emerald-200" />
                          <span>Submit Civic Report to AI Engine (&lt;10ms)</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column: Two-Way Citizen Live Status Tracker */}
              <div className={`${phoneFrameView ? 'lg:col-span-6' : 'lg:col-span-5'} space-y-4`}>
                <div className="glass-panel p-5 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">
                          Two-Way Citizen Live Status Tracker
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Real-time field updates &amp; transparent duplicate merging
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Search Bar & Quick Buttons */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={ticketSearchInput}
                          onChange={(e) => setTicketSearchInput(e.target.value.toUpperCase())}
                          placeholder="Search Ticket ID (e.g., CP-1002)..."
                          className="w-full pl-8 pr-3 py-1.5 bg-slate-950/80 border border-slate-700 rounded-lg text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      {ticketSearchInput && (
                        <button
                          onClick={() => {
                            if (reports.some(r => r.id === ticketSearchInput)) {
                              setTrackedTicketId(ticketSearchInput);
                              setTicketSearchInput('');
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
                        >
                          Track
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                      <span className="text-slate-500 text-[10px]">Quick test:</span>
                      {['CP-1001', 'CP-1002', 'CP-1007', 'CP-1016'].map(tid => (
                        <button
                          key={tid}
                          onClick={() => setTrackedTicketId(tid)}
                          className={`px-2 py-0.5 rounded font-mono text-[10px] border transition-colors ${
                            trackedTicketId === tid
                              ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {tid}
                          {tid === 'CP-1002' && ' (Merged Dup)'}
                          {tid === 'CP-1007' && ' (Rank #1)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Tracked Ticket Details */}
                  {trackedReport ? (
                    <div className="space-y-4">
                      {/* Ticket Identity Card */}
                      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/30">
                              {trackedReport.id}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              via {trackedReport.submissionChannel}
                            </span>
                          </div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            trackedReport.status === 'Resolved'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : trackedReport.status === 'Field Crew Dispatched'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}>
                            {trackedReport.status}
                          </span>
                        </div>

                        <h4 className="text-xs font-semibold text-slate-100 leading-snug">
                          {trackedReport.title}
                        </h4>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            {trackedReport.landmark}
                          </span>
                          <span>•</span>
                          <span>{trackedReport.ward}</span>
                        </div>
                      </div>

                      {/* Smart Duplicate Transparency Banner (MANDATORY REQUIREMENT) */}
                      {!trackedReport.isPrimary && trackedReport.duplicateOf && (
                        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 space-y-2">
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-amber-400 shrink-0" />
                            <h5 className="text-xs font-bold text-amber-300">
                              Smart Duplicate Consolidation Active
                            </h5>
                          </div>
                          <p className="text-[11px] text-amber-200/90 leading-relaxed">
                            Your report was merged with <strong className="text-white">neighboring reports</strong> into <strong className="text-white">Master Ticket {trackedReport.duplicateOf}</strong>.
                            By combining citizen reports, the AI escalated this issue to <strong className="text-rose-300 font-mono">Priority {trackedMasterReport.priorityScore}/100 ({trackedMasterReport.priorityLevel})</strong>, dispatching crews 4x faster than isolated complaints.
                          </p>
                          <div className="flex items-center justify-between pt-1 border-t border-amber-500/20 text-[10px]">
                            <span className="text-amber-400">Master Ticket: {trackedReport.duplicateOf}</span>
                            <button
                              onClick={() => setTrackedTicketId(trackedReport.duplicateOf)}
                              className="text-white underline hover:text-amber-300 font-semibold"
                            >
                              View Master Ticket &rarr;
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 4-Step Progress Timeline */}
                      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                        <h5 className="text-xs font-bold text-slate-300">
                          Lifecycle Progress Timeline
                        </h5>

                        <div className="space-y-3 text-xs">
                          {/* Step 1: Captured & Geo-Verified */}
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center shrink-0 text-[11px] font-bold">
                              ✓
                            </div>
                            <div>
                              <div className="font-semibold text-slate-200">1. Captured &amp; Geo-Verified</div>
                              <div className="text-[11px] text-slate-400">
                                Coordinates ({trackedReport.coordinates.x}, {trackedReport.coordinates.y}) logged with timestamp.
                              </div>
                            </div>
                          </div>

                          {/* Step 2: AI Triaged & Deduplicated */}
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center shrink-0 text-[11px] font-bold">
                              ✓
                            </div>
                            <div>
                              <div className="font-semibold text-slate-200">2. AI Triaged &amp; Deduplicated</div>
                              <div className="text-[11px] text-slate-400">
                                {trackedReport.isPrimary
                                  ? `Scored ${trackedReport.priorityScore}/100. Dispatched to ${trackedReport.department}.`
                                  : `Merged into Master Ticket ${trackedReport.duplicateOf}. Priority boosted.`}
                              </div>
                            </div>
                          </div>

                          {/* Step 3: Field Crew Assigned & Dispatched */}
                          <div className="flex items-start gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold ${
                              ['Field Crew Dispatched', 'Resolved'].includes(trackedMasterReport.status)
                                ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-400'
                                : trackedMasterReport.status === 'Assigned'
                                ? 'bg-amber-500/20 border border-amber-500 text-amber-400 animate-pulse'
                                : 'bg-slate-800 border border-slate-700 text-slate-500'
                            }`}>
                              {['Field Crew Dispatched', 'Resolved'].includes(trackedMasterReport.status) ? '✓' : '3'}
                            </div>
                            <div>
                              <div className={`font-semibold ${
                                ['Field Crew Dispatched', 'Resolved', 'Assigned'].includes(trackedMasterReport.status)
                                  ? 'text-slate-200'
                                  : 'text-slate-500'
                              }`}>
                                3. Field Crew Assigned &amp; Dispatched
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {trackedMasterReport.assignedCrew?.unit ? (
                                  <span className="text-amber-300 font-medium">
                                    {trackedMasterReport.assignedCrew.unit} {trackedMasterReport.assignedCrew.etaMinutes ? `(ETA: ~${trackedMasterReport.assignedCrew.etaMinutes} mins)` : ''}
                                  </span>
                                ) : (
                                  'Awaiting dispatcher assignment in central control room.'
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Step 4: Resolved & Citizen Verified */}
                          <div className="flex items-start gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold ${
                              trackedMasterReport.status === 'Resolved'
                                ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-400'
                                : 'bg-slate-800 border border-slate-700 text-slate-500'
                            }`}>
                              {trackedMasterReport.status === 'Resolved' ? '✓' : '4'}
                            </div>
                            <div>
                              <div className={`font-semibold ${
                                trackedMasterReport.status === 'Resolved' ? 'text-emerald-300' : 'text-slate-500'
                              }`}>
                                4. Resolved &amp; Citizen Verified
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {trackedMasterReport.status === 'Resolved'
                                  ? 'Field crew reported on-site repair completion.'
                                  : 'Final photographic proof pending field completion.'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Field Crew Notes & Live Audit Sync */}
                      {trackedMasterReport.resolutionNotes && (
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                          <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold block mb-1">
                            Latest Public Field Update:
                          </span>
                          <p className="text-slate-300 italic">
                            "{trackedMasterReport.resolutionNotes}"
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-500">
                      Enter a Ticket ID above to track progress.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =======================================================================
            STAGE 2: UNDERSTAND (Hybrid AI Triage, Deduplication & Explainable Math)
        ======================================================================= */}
        {activeTab === 'understand' && (
          <div className="space-y-6">
            {/* Live AI Pipeline Execution Banner */}
            <div className="glass-panel p-5 rounded-2xl border border-blue-500/30 bg-gradient-to-r from-slate-900 via-blue-950/20 to-slate-900 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">
                        Live AI Pipeline Execution Banner
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {latestPipelineExecution.llmEnhanced ? 'Gemini 2.5 Flash Enriched' : 'Deterministic Local AI (<10ms)'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Real-time mathematical decomposition of recently triaged report [{latestPipelineExecution.ticketId}]
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border font-mono ${
                    latestPipelineExecution.priorityScore >= 80
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : latestPipelineExecution.priorityScore >= 60
                      ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  }`}>
                    Priority Score: {latestPipelineExecution.priorityScore}/100 ({latestPipelineExecution.priorityLevel})
                  </span>
                </div>
              </div>

              {/* Banner Decomposition Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
                {/* 1. Category & Department */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold block">
                    1. Classified Department
                  </span>
                  <div className="text-xs font-bold text-slate-200">
                    {latestPipelineExecution.department}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Category: {latestPipelineExecution.category}
                  </div>
                  <p className="text-[11px] text-slate-300 italic pt-1 border-t border-slate-800/80">
                    "{latestPipelineExecution.executiveSummary}"
                  </p>
                </div>

                {/* 2. Deduplication Result */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold block">
                    2. Spatial &amp; Semantic Deduplication
                  </span>
                  {latestPipelineExecution.duplicateDetection.matched ? (
                    <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs">
                      <div className="font-bold text-amber-300 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" /> Duplicate Identified
                      </div>
                      <div className="text-[11px] mt-1">
                        Distance: <strong>{latestPipelineExecution.duplicateDetection.distanceMeters}m</strong> (≤250m threshold)
                      </div>
                      <div className="text-[11px]">
                        Semantic overlap: <strong>{latestPipelineExecution.duplicateDetection.semanticSimilarity}%</strong> (≥42%)
                      </div>
                      <div className="text-[10px] text-amber-400 mt-1 font-mono">
                        Consolidated into Master {latestPipelineExecution.duplicateDetection.parentTicketId}
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs">
                      <div className="font-bold text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> New Primary Incident
                      </div>
                      <div className="text-[11px] text-emerald-300/80 mt-1">
                        No spatial/semantic duplicates within 250m. Assigned dedicated SLA ticket.
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. 4-Factor Score Breakdown */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold block">
                    3. Explainable 4-Factor Math
                  </span>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between text-slate-300">
                      <span>Hazard Severity (0-40)</span>
                      <span className="font-mono font-bold text-rose-400">{latestPipelineExecution.priorityFactors.hazardSeverity}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(latestPipelineExecution.priorityFactors.hazardSeverity / 40) * 100}%` }} />
                    </div>

                    <div className="flex justify-between text-slate-300">
                      <span>Vulnerable Proximity (0-25)</span>
                      <span className="font-mono font-bold text-amber-400">{latestPipelineExecution.priorityFactors.vulnerableProximity}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(latestPipelineExecution.priorityFactors.vulnerableProximity / 25) * 100}%` }} />
                    </div>

                    <div className="flex justify-between text-slate-300">
                      <span>Volume Multiplier (0-20)</span>
                      <span className="font-mono font-bold text-blue-400">{latestPipelineExecution.priorityFactors.volumeMultiplier}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(latestPipelineExecution.priorityFactors.volumeMultiplier / 20) * 100}%` }} />
                    </div>

                    <div className="flex justify-between text-slate-300">
                      <span>Cascading Risk (0-15)</span>
                      <span className="font-mono font-bold text-purple-400">{latestPipelineExecution.priorityFactors.cascadingRisk}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(latestPipelineExecution.priorityFactors.cascadingRisk / 15) * 100}%` }} />
                    </div>
                  </div>
                </div>

                {/* 4. Plain Language Reason & Hotspot */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold block">
                    4. Corridor Hotspot &amp; Reason
                  </span>
                  {latestPipelineExecution.hotspotAlert ? (
                    <div className="p-2 rounded-lg bg-purple-950/40 border border-purple-500/30 text-purple-200 text-xs">
                      <span className="text-[10px] font-bold text-purple-300 block">HOTSPOT CLUSTER CORRELATED</span>
                      <span className="font-semibold">{latestPipelineExecution.hotspotAlert}</span>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400">
                      Isolated municipal defect. No active cluster correlation.
                    </div>
                  )}
                  <p className="text-[11px] text-slate-400 pt-2 leading-relaxed">
                    Deterministic score formula: <code className="text-slate-300 font-mono text-[10px]">Hazard + Vulnerability + (6 + 3*DupCount) + Cascading</code>
                  </p>
                </div>
              </div>
            </div>

            {/* Stage 2 Two-Column: Left = Ranked Queue, Right = Decision Inspector */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Ranked Priority Queue */}
              <div className="lg:col-span-6 space-y-3">
                <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                        <span>Interactive Ranked Priority Queue</span>
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {rankedPrimaryReports.length} primary issues ranked dynamically by explainable AI score
                      </p>
                    </div>
                  </div>

                  {/* Search and Category Filters */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={queueSearchQuery}
                        onChange={(e) => setQueueSearchQuery(e.target.value)}
                        placeholder="Filter by title, ID, ward, or landmark..."
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
                      <button
                        onClick={() => setQueueCategoryFilter('ALL')}
                        className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors ${
                          queueCategoryFilter === 'ALL'
                            ? 'bg-blue-600 text-white font-semibold'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        All Categories
                      </button>
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat.name}
                          onClick={() => setQueueCategoryFilter(cat.name)}
                          className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors ${
                            queueCategoryFilter === cat.name
                              ? 'bg-blue-600 text-white font-semibold'
                              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {cat.name.split('&')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ranked Ticket Cards List */}
                  <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
                    {rankedPrimaryReports.map((report, idx) => {
                      const isSelected = report.id === selectedReportId;
                      return (
                        <div
                          key={report.id}
                          onClick={() => setSelectedReportId(report.id)}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-slate-850 border-blue-500 ring-1 ring-blue-500/50 shadow-lg'
                              : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className={`w-6 h-6 rounded-md font-mono text-[11px] font-bold flex items-center justify-center ${
                                idx === 0
                                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                                  : idx === 1
                                  ? 'bg-orange-500 text-white'
                                  : idx === 2
                                  ? 'bg-amber-500 text-slate-950'
                                  : 'bg-slate-800 text-slate-300'
                              }`}>
                                #{idx + 1}
                              </span>
                              <span className="font-mono text-xs font-bold text-blue-400">
                                {report.id}
                              </span>
                              <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
                                {report.ward}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {report.mergedCount > 1 && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                                  +{report.mergedCount - 1} Dups
                                </span>
                              )}
                              {report.clusterId && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                                  {report.clusterId}
                                </span>
                              )}
                              <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${
                                report.priorityScore >= 80
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : report.priorityScore >= 60
                                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              }`}>
                                {report.priorityScore}
                              </span>
                            </div>
                          </div>

                          <h4 className="text-xs font-semibold text-slate-100 line-clamp-1 mb-2">
                            {report.title}
                          </h4>

                          {/* 4-Color Stacked Bar Representing the 4 Priority Factors */}
                          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden flex mb-2">
                            <div
                              title={`Hazard Severity: ${report.priorityFactors?.hazardSeverity}/40`}
                              className="h-full bg-rose-500"
                              style={{ width: `${(report.priorityFactors?.hazardSeverity || 20) / 100 * 100}%` }}
                            />
                            <div
                              title={`Vulnerable Proximity: ${report.priorityFactors?.vulnerableProximity}/25`}
                              className="h-full bg-amber-500"
                              style={{ width: `${(report.priorityFactors?.vulnerableProximity || 15) / 100 * 100}%` }}
                            />
                            <div
                              title={`Volume Multiplier: ${report.priorityFactors?.volumeMultiplier}/20`}
                              className="h-full bg-blue-500"
                              style={{ width: `${(report.priorityFactors?.volumeMultiplier || 6) / 100 * 100}%` }}
                            />
                            <div
                              title={`Cascading Risk: ${report.priorityFactors?.cascadingRisk}/15`}
                              className="h-full bg-purple-500"
                              style={{ width: `${(report.priorityFactors?.cascadingRisk || 5) / 100 * 100}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span className="flex items-center gap-1 truncate max-w-[200px]">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              {report.landmark}
                            </span>
                            <span className="font-mono">{report.status}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: AI Decision Inspector & Head-to-Head Comparison */}
              <div className="lg:col-span-6 space-y-4">
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                        <Eye className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">
                          AI Decision Inspector
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Explainability math for Ticket [{selectedReport.id}]
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedReportId(selectedReport.id);
                        setActiveTab('act');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center gap-1 shadow-md"
                    >
                      <span>Dispatch in Stage 4</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Selected Ticket Summary */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-blue-400">
                        {selectedReport.id} • {selectedReport.category}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${
                        selectedReport.priorityScore >= 80 ? 'bg-rose-500/20 text-rose-300' : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        Score {selectedReport.priorityScore}/100 ({selectedReport.priorityLevel})
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-white">
                      {selectedReport.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {selectedReport.description}
                    </p>
                  </div>

                  {/* Plain Language "Why This Ranks Here" */}
                  {(() => {
                    const explanation = explainPriorityRanking(
                      selectedReport,
                      rankedPrimaryReports.length,
                      rankedPrimaryReports.findIndex(r => r.id === selectedReport.id)
                    );
                    return (
                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                        <h5 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                          <span>Why This Ticket Ranks Here</span>
                        </h5>
                        <ul className="space-y-1.5 text-xs text-slate-300">
                          {explanation.bulletPoints.map((pt, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-blue-400 font-bold">•</span>
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="pt-2 border-t border-slate-800 text-[11px] font-medium text-emerald-400">
                          {explanation.verdict}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Head-to-Head Comparison Against Lowest Ranked Ticket (CP-1042) */}
                  <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                        <span>Head-to-Head Contrast vs. Lowest-Ranked Routine Ticket</span>
                      </h5>
                      <span className="text-[10px] font-mono text-slate-400">
                        Comparing vs. CP-1042 (Score 14/100)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {/* Left: Selected Ticket */}
                      <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-500/30 space-y-1.5">
                        <div className="font-bold text-blue-300 flex items-center justify-between">
                          <span>{selectedReport.id}</span>
                          <span className="font-mono">{selectedReport.priorityScore} pts</span>
                        </div>
                        <div className="text-[10px] text-slate-300 line-clamp-1">{selectedReport.title}</div>
                        <div className="space-y-1 pt-1.5 border-t border-blue-500/20 text-[10px] text-slate-300">
                          <div>Hazard: <strong className="text-white">{selectedReport.priorityFactors?.hazardSeverity}/40</strong></div>
                          <div>Proximity: <strong className="text-white">{selectedReport.priorityFactors?.vulnerableProximity}/25</strong></div>
                          <div>Volume: <strong className="text-white">{selectedReport.priorityFactors?.volumeMultiplier}/20</strong></div>
                          <div>Cascading: <strong className="text-white">{selectedReport.priorityFactors?.cascadingRisk}/15</strong></div>
                        </div>
                      </div>

                      {/* Right: CP-1042 (Daytime Streetlight Stuck On) */}
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5 opacity-80">
                        <div className="font-bold text-slate-300 flex items-center justify-between">
                          <span>CP-1042 (Routine)</span>
                          <span className="font-mono text-slate-400">14 pts</span>
                        </div>
                        <div className="text-[10px] text-slate-400 line-clamp-1">Daytime streetlights stuck on</div>
                        <div className="space-y-1 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400">
                          <div>Hazard: 4/40 (Zero danger)</div>
                          <div>Proximity: 4/25 (Service road)</div>
                          <div>Volume: 6/20 (1 report)</div>
                          <div>Cascading: 0/15 (Dry weather)</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Merged Child Duplicate Reports Section */}
                  {selectedReport.childTicketIds?.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Merged Child Duplicate Reports ({selectedReport.childTicketIds.length})</span>
                        </h5>
                        <span className="text-[10px] font-mono text-indigo-400">
                          Consolidated to prevent redundant crews
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {selectedReport.childTicketIds.map(childId => {
                          const childTicket = reports.find(r => r.id === childId);
                          if (!childTicket) return null;
                          const dist = computeDistanceMeters(selectedReport.coordinates, childTicket.coordinates);
                          return (
                            <div key={childId} className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                              <div>
                                <span className="font-mono font-bold text-indigo-300 mr-2">{childId}</span>
                                <span className="text-slate-300">{childTicket.title}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 shrink-0 font-mono">
                                <span>{dist}m away</span>
                                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{childTicket.submissionChannel}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =======================================================================
            STAGE 3: REVEAL (Geospatial Command Map, Hotspots & Action Briefs)
        ======================================================================= */}
        {activeTab === 'reveal' && (
          <div className="space-y-6">
            {/* Google Maps Style Header & Controls Bar */}
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-emerald-400 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-sky-400" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">
                      Google Maps™ Municipal Command View
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Vector GIS Engine
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Live urban cartography with Roadmap, Satellite &amp; Traffic congestion layers
                  </p>
                </div>
              </div>

              {/* Google Maps Mode Switcher & Layer Filters */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                {/* Google Maps View Switcher */}
                <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-700 shadow-inner">
                  <button
                    onClick={() => setMapViewMode('roadmap')}
                    className={`px-3 py-1 rounded-md font-semibold transition-all ${
                      mapViewMode === 'roadmap'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Map
                  </button>
                  <button
                    onClick={() => setMapViewMode('satellite')}
                    className={`px-3 py-1 rounded-md font-semibold transition-all ${
                      mapViewMode === 'satellite'
                        ? 'bg-slate-700 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Satellite
                  </button>
                  <button
                    onClick={() => setMapViewMode('traffic')}
                    className={`px-3 py-1 rounded-md font-semibold transition-all flex items-center gap-1 ${
                      mapViewMode === 'traffic'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Traffic
                  </button>
                </div>

                {/* Hotspot Halos Toggle */}
                <button
                  onClick={() => setShowHotspotHalos(!showHotspotHalos)}
                  className={`px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
                    showHotspotHalos
                      ? 'bg-purple-600/30 text-purple-300 border-purple-500/50'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  Halos: {showHotspotHalos ? 'ON' : 'OFF'}
                </button>

                {/* Duplicate Vectors Toggle */}
                <button
                  onClick={() => setShowDuplicatePins(!showDuplicatePins)}
                  className={`px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
                    showDuplicatePins
                      ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  Dups: {showDuplicatePins ? 'ON' : 'OFF'}
                </button>

                <select
                  value={mapCategoryFilter}
                  onChange={(e) => setMapCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none"
                >
                  <option value="ALL">All Categories</option>
                  {CATEGORIES.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Interactive Vector Map + Side Cluster Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Google Maps Vector Canvas */}
              <div className="lg:col-span-8 glass-panel p-2 sm:p-3 rounded-2xl border border-slate-800 space-y-3">
                <div className="relative w-full aspect-[1000/850] bg-slate-900 rounded-xl overflow-hidden border border-slate-700/80 shadow-2xl">
                  {/* Google Maps Floating Search Bar Overlay (Top-Left) */}
                  <div className="absolute top-3 left-3 z-30 flex items-center gap-2 max-w-xs sm:max-w-sm w-full">
                    <div className="flex items-center w-full bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-700 shadow-xl px-3 py-1.5 text-xs text-slate-100">
                      <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                      <input
                        type="text"
                        value={mapSearchText}
                        onChange={(e) => setMapSearchText(e.target.value)}
                        placeholder="Search Google Maps (e.g., MG Road, Hospital)..."
                        className="bg-transparent w-full focus:outline-none text-xs text-slate-100 placeholder-slate-400"
                      />
                      {mapSearchText && (
                        <button onClick={() => setMapSearchText('')} className="text-slate-400 hover:text-white ml-1">
                          &times;
                        </button>
                      )}
                    </div>
                  </div>

                  {/* SVG Google Maps Canvas */}
                  <svg
                    className="w-full h-full select-none"
                    viewBox={`${(1000 - 1000 / mapZoom) / 2} ${(850 - 850 / mapZoom) / 2} ${1000 / mapZoom} ${850 / mapZoom}`}
                  >
                    <defs>
                      {/* Google Maps Building Hatch Pattern */}
                      <pattern id="urbanBlocks" width="40" height="40" patternUnits="userSpaceOnUse">
                        <rect x="2" y="2" width="16" height="16" rx="2" fill={mapViewMode === 'satellite' ? '#1e293b' : '#334155'} fillOpacity={mapViewMode === 'satellite' ? '0.6' : '0.4'} />
                        <rect x="22" y="2" width="16" height="16" rx="2" fill={mapViewMode === 'satellite' ? '#1e293b' : '#334155'} fillOpacity={mapViewMode === 'satellite' ? '0.6' : '0.4'} />
                        <rect x="2" y="22" width="16" height="16" rx="2" fill={mapViewMode === 'satellite' ? '#1e293b' : '#334155'} fillOpacity={mapViewMode === 'satellite' ? '0.6' : '0.4'} />
                        <rect x="22" y="22" width="16" height="16" rx="2" fill={mapViewMode === 'satellite' ? '#1e293b' : '#334155'} fillOpacity={mapViewMode === 'satellite' ? '0.6' : '0.4'} />
                      </pattern>

                      {/* Drop Shadow Filter for Google Maps Teardrop Pins */}
                      <filter id="googlePinShadow" x="-30%" y="-30%" width="160%" height="160%">
                        <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.65" />
                      </filter>

                      {/* Hotspot Radar Pulse Gradient */}
                      <radialGradient id="googleHaloPulse" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ec4899" stopOpacity="0.5" />
                        <stop offset="70%" stopColor="#a855f7" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    {/* 1. Base Map Background */}
                    <rect
                      width="1000"
                      height="850"
                      fill={mapViewMode === 'satellite' ? '#0f172a' : mapViewMode === 'traffic' ? '#111827' : '#1e293b'}
                    />

                    {/* 2. Urban Building Footprint Density Pattern */}
                    <rect width="1000" height="850" fill="url(#urbanBlocks)" />

                    {/* 3. Parks & Green Reserves (Google Maps Green #1c382b) */}
                    <path
                      d="M 60 80 Q 180 60 220 140 T 120 220 T 50 160 Z"
                      fill={mapViewMode === 'satellite' ? '#064e3b' : '#14532d'}
                      fillOpacity="0.7"
                    />
                    <text x="90" y="145" fill="#86efac" fontSize="11" fontWeight="600" fontFamily="sans-serif">
                      Cubbon Park Reserve
                    </text>

                    <path
                      d="M 600 520 Q 720 500 750 580 T 670 650 T 580 600 Z"
                      fill={mapViewMode === 'satellite' ? '#064e3b' : '#14532d'}
                      fillOpacity="0.7"
                    />
                    <text x="620" y="580" fill="#86efac" fontSize="11" fontWeight="600" fontFamily="sans-serif">
                      Koramangala Valley Park
                    </text>

                    {/* 4. Water Bodies & Stormwater Canal (Google Maps Blue #1e3a5f) */}
                    {/* Ulsoor Lake Water Basin */}
                    <path
                      d="M 620 120 Q 750 90 780 180 T 680 250 T 590 190 Z"
                      fill={mapViewMode === 'satellite' ? '#0c4a6e' : '#0369a1'}
                      fillOpacity="0.8"
                    />
                    <text x="650" y="180" fill="#bae6fd" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
                      Ulsoor Lake Basin
                    </text>

                    {/* Arterial Stormwater Canal */}
                    <path
                      d="M 40 180 Q 300 240 500 200 T 960 260"
                      fill="none"
                      stroke={mapViewMode === 'satellite' ? '#0284c7' : '#38bdf8'}
                      strokeWidth="12"
                      strokeOpacity="0.7"
                      strokeLinecap="round"
                    />
                    <text x="140" y="215" fill="#7dd3fc" fontSize="10" fontWeight="600">
                      ~ Stormwater Drainage Canal ~
                    </text>

                    {/* 5. Municipal Ward Soft Boundaries */}
                    <path d="M 40 40 L 480 40 L 460 420 L 40 420 Z" fill="#3b82f6" fillOpacity="0.04" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="8 6" />
                    <text x="50" y="60" fill="#93c5fd" fontSize="11" fontFamily="sans-serif" fontWeight="bold">WARD 1: MG ROAD / CENTRAL</text>

                    <path d="M 480 40 L 960 40 L 960 420 L 460 420 Z" fill="#8b5cf6" fillOpacity="0.04" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="8 6" />
                    <text x="500" y="60" fill="#c4b5fd" fontSize="11" fontFamily="sans-serif" fontWeight="bold">WARD 2: INDIRANAGAR / EAST</text>

                    <path d="M 540 420 L 960 420 L 960 820 L 540 820 Z" fill="#ec4899" fillOpacity="0.04" stroke="#ec4899" strokeWidth="1.5" strokeDasharray="8 6" />
                    <text x="560" y="440" fill="#f472b6" fontSize="11" fontFamily="sans-serif" fontWeight="bold">WARD 3: KORAMANGALA / SOUTH</text>

                    <path d="M 40 420 L 540 420 L 540 820 L 40 820 Z" fill="#f97316" fillOpacity="0.04" stroke="#f97316" strokeWidth="1.5" strokeDasharray="8 6" />
                    <text x="50" y="440" fill="#fdba74" fontSize="11" fontFamily="sans-serif" fontWeight="bold">WARD 4: HSR LAYOUT / SECTOR 4</text>

                    <path d="M 750 480 L 960 480 L 960 820 L 750 820 Z" fill="#10b981" fillOpacity="0.07" stroke="#10b981" strokeWidth="1.5" strokeDasharray="8 6" />
                    <text x="760" y="500" fill="#6ee7b7" fontSize="11" fontFamily="sans-serif" fontWeight="bold">WARD 5: WHITEFIELD TECH</text>

                    {/* 6. Realistic Google Maps Road Hierarchy */}
                    {/* Minor Residential Connecting Streets */}
                    <g stroke="#475569" strokeWidth="4" strokeLinecap="round" opacity="0.4">
                      <line x1="120" y1="40" x2="120" y2="420" />
                      <line x1="200" y1="40" x2="200" y2="420" />
                      <line x1="380" y1="40" x2="380" y2="420" />
                      <line x1="40" y1="120" x2="480" y2="120" />
                      <line x1="40" y1="240" x2="480" y2="240" />
                      <line x1="40" y1="360" x2="480" y2="360" />
                      <line x1="560" y1="40" x2="560" y2="420" />
                      <line x1="840" y1="40" x2="840" y2="420" />
                      <line x1="480" y1="120" x2="960" y2="120" />
                      <line x1="480" y1="240" x2="960" y2="240" />
                      <line x1="480" y1="360" x2="960" y2="360" />
                      <line x1="120" y1="420" x2="120" y2="820" />
                      <line x1="240" y1="420" x2="240" y2="820" />
                      <line x1="340" y1="420" x2="340" y2="820" />
                      <line x1="40" y1="520" x2="540" y2="520" />
                      <line x1="40" y1="620" x2="540" y2="620" />
                      <line x1="40" y1="740" x2="540" y2="740" />
                      <line x1="640" y1="420" x2="640" y2="820" />
                      <line x1="760" y1="420" x2="760" y2="820" />
                      <line x1="880" y1="420" x2="880" y2="820" />
                      <line x1="540" y1="520" x2="960" y2="520" />
                      <line x1="540" y1="620" x2="960" y2="620" />
                      <line x1="540" y1="740" x2="960" y2="740" />
                    </g>

                    {/* Secondary Arterials (White/Slate Casing) */}
                    <line x1="40" y1="310" x2="960" y2="310" stroke="#334155" strokeWidth="26" strokeLinecap="round" />
                    <line x1="438" y1="100" x2="438" y2="800" stroke="#334155" strokeWidth="26" strokeLinecap="round" />
                    <line x1="690" y1="100" x2="690" y2="600" stroke="#334155" strokeWidth="22" strokeLinecap="round" />

                    {/* Primary Highway Fill: Google Maps Gold/Yellow (or Traffic colors if Traffic mode active) */}
                    {mapViewMode === 'traffic' ? (
                      <>
                        {/* Traffic Congestion Colors: Green = Flowing, Amber = Slow, Red = Choked */}
                        <line x1="40" y1="310" x2="400" y2="310" stroke="#22c55e" strokeWidth="16" strokeLinecap="round" />
                        <line x1="400" y1="310" x2="700" y2="310" stroke="#f59e0b" strokeWidth="16" strokeLinecap="round" />
                        <line x1="700" y1="310" x2="960" y2="310" stroke="#22c55e" strokeWidth="16" strokeLinecap="round" />
                        {/* Koramangala 4th Cross is severe RED gridlock */}
                        <line x1="438" y1="100" x2="438" y2="550" stroke="#22c55e" strokeWidth="16" strokeLinecap="round" />
                        <line x1="438" y1="550" x2="438" y2="720" stroke="#ef4444" strokeWidth="18" strokeLinecap="round" className="animate-pulse" />
                        <line x1="438" y1="720" x2="438" y2="800" stroke="#f59e0b" strokeWidth="16" strokeLinecap="round" />
                        <line x1="690" y1="100" x2="690" y2="600" stroke="#22c55e" strokeWidth="14" strokeLinecap="round" />
                      </>
                    ) : (
                      <>
                        {/* Standard Google Maps Gold/Yellow Highway Casing */}
                        <line x1="40" y1="310" x2="960" y2="310" stroke="#f59e0b" strokeWidth="16" strokeLinecap="round" />
                        <line x1="40" y1="310" x2="960" y2="310" stroke="#fef08a" strokeWidth="2" strokeDasharray="16 12" />
                        <line x1="438" y1="100" x2="438" y2="800" stroke="#f59e0b" strokeWidth="16" strokeLinecap="round" />
                        <line x1="438" y1="100" x2="438" y2="800" stroke="#fef08a" strokeWidth="2" strokeDasharray="16 12" />
                        <line x1="690" y1="100" x2="690" y2="600" stroke="#fbbf24" strokeWidth="14" strokeLinecap="round" />
                      </>
                    )}

                    {/* Highway Labels & Badges */}
                    <g transform="translate(160, 298)">
                      <rect x="0" y="0" width="170" height="18" rx="4" fill="#0f172a" fillOpacity="0.85" />
                      <text x="8" y="13" fill="#f8fafc" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                        MG Road (Arterial 1)
                      </text>
                    </g>

                    <g transform="translate(446, 740) rotate(-90)">
                      <rect x="0" y="0" width="195" height="18" rx="4" fill="#0f172a" fillOpacity="0.85" />
                      <text x="8" y="13" fill="#f8fafc" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                        Koramangala 4th Cross / 80ft
                      </text>
                    </g>

                    <g transform="translate(698, 480) rotate(-90)">
                      <rect x="0" y="0" width="160" height="18" rx="4" fill="#0f172a" fillOpacity="0.85" />
                      <text x="8" y="13" fill="#f8fafc" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                        Indiranagar 100ft Road
                      </text>
                    </g>

                    {/* Elevated Metro Transit Line (Purple Google Transit) */}
                    <path
                      d="M 40 260 L 960 260"
                      stroke="#8b5cf6"
                      strokeWidth="5"
                      strokeDasharray="10 5"
                      strokeLinecap="round"
                    />
                    <g transform="translate(580, 250)">
                      <circle cx="10" cy="10" r="10" fill="#7c3aed" stroke="#ffffff" strokeWidth="2" />
                      <text x="25" y="14" fill="#e9d5ff" fontSize="11" fontWeight="bold">🚇 CMH Metro Station</text>
                    </g>

                    {/* 7. Google Maps Landmark Badges (POIs) */}
                    {/* St. Mary's School */}
                    <g transform="translate(265, 275)" className="cursor-pointer" onClick={() => setSelectedReportId('CP-1001')}>
                      <circle cx="12" cy="12" r="14" fill="#0284c7" stroke="#ffffff" strokeWidth="2" filter="url(#googlePinShadow)" />
                      <text x="8" y="17" fill="#ffffff" fontSize="13">🎓</text>
                      <rect x="30" y="2" width="140" height="20" rx="4" fill="#0f172a" fillOpacity="0.85" stroke="#38bdf8" strokeWidth="1" />
                      <text x="36" y="16" fill="#e0f2fe" fontSize="11" fontWeight="bold">St. Mary's Convent</text>
                    </g>

                    {/* City General Hospital */}
                    <g transform="translate(505, 195)" className="cursor-pointer" onClick={() => setSelectedReportId('CP-1007')}>
                      <circle cx="12" cy="12" r="14" fill="#dc2626" stroke="#ffffff" strokeWidth="2" filter="url(#googlePinShadow)" />
                      <text x="8" y="17" fill="#ffffff" fontSize="13">🏥</text>
                      <rect x="30" y="2" width="155" height="20" rx="4" fill="#0f172a" fillOpacity="0.85" stroke="#f87171" strokeWidth="1" />
                      <text x="36" y="16" fill="#fee2e2" fontSize="11" fontWeight="bold">City Hospital Trauma</text>
                    </g>

                    {/* Whitefield Old Market */}
                    <g transform="translate(795, 575)" className="cursor-pointer" onClick={() => setSelectedReportId('CP-1019')}>
                      <circle cx="12" cy="12" r="14" fill="#059669" stroke="#ffffff" strokeWidth="2" filter="url(#googlePinShadow)" />
                      <text x="8" y="17" fill="#ffffff" fontSize="13">🛒</text>
                      <rect x="30" y="2" width="150" height="20" rx="4" fill="#0f172a" fillOpacity="0.85" stroke="#34d399" strokeWidth="1" />
                      <text x="36" y="16" fill="#d1fae5" fontSize="11" fontWeight="bold">Whitefield Produce Mkt</text>
                    </g>

                    {/* 8. Hotspot Halos (Corridor Cascades) */}
                    {showHotspotHalos && PREDEFINED_CLUSTERS.map(cluster => (
                      <g key={cluster.id} className="cursor-pointer" onClick={() => setSelectedReportId(cluster.primaryMasterId)}>
                        <circle
                          cx={cluster.center.x}
                          cy={cluster.center.y}
                          r={cluster.radiusMeters / 5 * 1.6}
                          fill="url(#googleHaloPulse)"
                          className="animate-pulse"
                        />
                        <circle
                          cx={cluster.center.x}
                          cy={cluster.center.y}
                          r={cluster.radiusMeters / 5}
                          fill="none"
                          stroke="#ec4899"
                          strokeWidth="2.5"
                          strokeDasharray="6 4"
                        />
                        <rect
                          x={cluster.center.x - 70}
                          y={cluster.center.y - (cluster.radiusMeters / 5) - 24}
                          width="140"
                          height="22"
                          rx="6"
                          fill="#4a044e"
                          stroke="#f472b6"
                          strokeWidth="1.5"
                          filter="url(#googlePinShadow)"
                        />
                        <text
                          x={cluster.center.x}
                          y={cluster.center.y - (cluster.radiusMeters / 5) - 9}
                          textAnchor="middle"
                          fill="#fdf2f8"
                          fontSize="10"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                        >
                          ⚠️ HOTSPOT: {cluster.id}
                        </text>
                      </g>
                    ))}

                    {/* 9. Merged Duplicate Vectors (Dotted Linkages) */}
                    {showDuplicatePins && mapDuplicateReports.map(dup => {
                      const parent = reports.find(r => r.id === dup.duplicateOf);
                      if (!parent) return null;
                      return (
                        <g key={`link-${dup.id}`}>
                          <line
                            x1={dup.coordinates.x}
                            y1={dup.coordinates.y}
                            x2={parent.coordinates.x}
                            y2={parent.coordinates.y}
                            stroke="#818cf8"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                            strokeOpacity="0.8"
                          />
                          <circle
                            cx={dup.coordinates.x}
                            cy={dup.coordinates.y}
                            r="5"
                            fill="#818cf8"
                            stroke="#1e1b4b"
                            strokeWidth="1.5"
                          />
                        </g>
                      );
                    })}

                    {/* 10. Authentic Google Maps Teardrop Map Pins */}
                    {mapPrimaryReports.map((report, idx) => {
                      const isSelected = report.id === selectedReportId;
                      const pinColor = report.priorityScore >= 80 ? '#ef4444' : report.priorityScore >= 60 ? '#f97316' : report.priorityScore >= 40 ? '#eab308' : '#38bdf8';
                      return (
                        <g
                          key={report.id}
                          transform={`translate(${report.coordinates.x}, ${report.coordinates.y})`}
                          onClick={() => setSelectedReportId(report.id)}
                          className="cursor-pointer group"
                        >
                          {isSelected && (
                            <circle r="30" fill={pinColor} fillOpacity="0.25" className="animate-ping-slow" />
                          )}

                          {/* Authentic Google Teardrop Pin Path */}
                          <path
                            d="M 0 0 C -6 -12 -14 -18 -14 -28 C -14 -39 -5 -46 0 -46 C 5 -46 14 -39 14 -28 C 14 -18 6 -12 0 0 Z"
                            fill={pinColor}
                            stroke="#ffffff"
                            strokeWidth={isSelected ? "3" : "1.5"}
                            filter="url(#googlePinShadow)"
                            className={`transition-transform duration-200 ${isSelected ? 'scale-125 -translate-y-2' : 'group-hover:scale-110'}`}
                          />

                          {/* Inner White Dot with Priority Rank Number */}
                          <circle
                            cx="0"
                            cy="-28"
                            r={isSelected ? "7" : "5.5"}
                            fill="#ffffff"
                          />
                          <text
                            x="0"
                            y="-25"
                            textAnchor="middle"
                            fill="#0f172a"
                            fontSize="8"
                            fontWeight="800"
                            fontFamily="monospace"
                          >
                            {report.priorityScore}
                          </text>

                          {/* Merged Duplicate Badge Count Badge on Pin */}
                          {report.mergedCount > 1 && (
                            <g transform="translate(10, -42)">
                              <circle r="7" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
                              <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
                                {report.mergedCount}
                              </text>
                            </g>
                          )}

                          {/* Google Maps Style InfoWindow Popup on Selected Pin */}
                          {isSelected && (
                            <g transform="translate(0, -68)" filter="url(#googlePinShadow)">
                              <rect
                                x="-90"
                                y="-36"
                                width="180"
                                height="44"
                                rx="8"
                                fill="#0f172a"
                                stroke={pinColor}
                                strokeWidth="2"
                              />
                              <polygon points="0,8 -6,0 6,0" fill="#0f172a" stroke={pinColor} strokeWidth="1" />
                              <text x="0" y="-20" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                                {report.id} ({report.priorityScore}/100)
                              </text>
                              <text x="0" y="-6" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontFamily="sans-serif">
                                {report.title.slice(0, 26)}...
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </svg>

                  {/* Google Maps Floating Controls (Bottom-Right) */}
                  <div className="absolute bottom-4 right-4 z-30 flex flex-col items-center gap-1.5 shadow-2xl">
                    <div className="bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-700 p-1 flex flex-col shadow-lg">
                      <button
                        onClick={() => setMapZoom(prev => Math.min(2.5, prev + 0.3))}
                        title="Zoom in (+)"
                        className="w-8 h-8 flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-800 rounded font-bold text-lg"
                      >
                        +
                      </button>
                      <div className="w-full h-px bg-slate-700" />
                      <button
                        onClick={() => setMapZoom(prev => Math.max(1, prev - 0.3))}
                        title="Zoom out (-)"
                        className="w-8 h-8 flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-800 rounded font-bold text-lg"
                      >
                        &minus;
                      </button>
                    </div>

                    <button
                      onClick={() => setMapZoom(1)}
                      title="Reset View (100%)"
                      className="px-2 py-1 bg-slate-900/90 backdrop-blur-md border border-slate-700 text-[10px] font-mono text-slate-300 rounded-md hover:bg-slate-800"
                    >
                      {Math.round(mapZoom * 100)}%
                    </button>
                  </div>

                  {/* Google Maps Scale & Attribution Bar (Bottom-Left) */}
                  <div className="absolute bottom-2 left-3 z-30 flex items-center gap-3 text-[10px] font-mono text-slate-400 bg-slate-950/80 backdrop-blur px-2.5 py-1 rounded border border-slate-800">
                    <div className="flex items-center gap-1.5 border-r border-slate-700 pr-2.5">
                      <div className="w-10 h-1 bg-slate-300 border-l border-r border-black" />
                      <span>200 m</span>
                    </div>
                    <span className="text-slate-300 font-semibold flex items-center gap-1">
                      <span className="text-blue-400">G</span><span className="text-rose-400">o</span><span className="text-amber-400">o</span><span className="text-blue-400">g</span><span className="text-emerald-400">l</span><span className="text-rose-400">e</span> Maps Style Cartography
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: AI Root-Cause Cluster Detector & Action Brief Trigger */}
              <div className="lg:col-span-4 space-y-4">
                <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        AI Pattern &amp; Cluster Detector
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                      3 Active
                    </span>
                  </div>

                  {/* Predefined & Dynamic Clusters */}
                  <div className="space-y-3">
                    {PREDEFINED_CLUSTERS.map(cluster => (
                      <div
                        key={cluster.id}
                        className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/60 transition-all space-y-2 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
                            {cluster.id}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {cluster.ticketCount} reports • {cluster.ward.split('-')[0]}
                          </span>
                        </div>

                        <h5 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                          {cluster.name}
                        </h5>

                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {cluster.operationalInsight}
                        </p>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                          <button
                            onClick={() => {
                              setSelectedReportId(cluster.primaryMasterId);
                              setActiveActionBriefModal(cluster);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold flex items-center gap-1 shadow-md shadow-purple-700/20"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Generate 1-Minute Action Brief</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 1-Minute Executive Action Brief Modal */}
            {activeActionBriefModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="glass-panel p-6 rounded-2xl border border-purple-500/50 bg-slate-900 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">
                          1-Minute Executive Action Brief: {activeActionBriefModal.id}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {activeActionBriefModal.name} ({activeActionBriefModal.ward})
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveActionBriefModal(null)}
                      className="text-slate-400 hover:text-white text-lg font-bold p-1"
                    >
                      &times;
                    </button>
                  </div>

                  {/* Root Cause Hypothesis */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold block">
                      Root-Cause Hypothesis
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {activeActionBriefModal.rootCauseHypothesis}
                    </p>
                  </div>

                  {/* Sequenced Inter-Departmental Dispatch Order */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                      Sequenced Inter-Departmental Dispatch Order
                    </span>
                    <div className="space-y-2">
                      {activeActionBriefModal.sequencedDispatchOrder?.map(step => (
                        <div key={step.step} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-purple-500 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            {step.step}
                          </span>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-purple-300">{step.dept}</span>
                              <span className="text-[10px] font-mono text-slate-400">({step.unit})</span>
                            </div>
                            <p className="text-xs text-slate-300">{step.action}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risk If Delayed & Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block uppercase">Risk If Delayed</span>
                      <p className="text-[11px] text-rose-300 mt-1 leading-snug">{activeActionBriefModal.riskIfDelayed}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block uppercase">Estimated Remediation</span>
                      <p className="text-sm font-bold text-emerald-400 mt-1 font-mono">{activeActionBriefModal.estimatedCost}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block uppercase">Target Resolution</span>
                      <p className="text-sm font-bold text-sky-400 mt-1 font-mono">{activeActionBriefModal.resolutionWindow}</p>
                    </div>
                  </div>

                  {/* Modal Footer Controls */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                    <button
                      onClick={() => copyActionBriefText(activeActionBriefModal)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      {briefCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{briefCopied ? "Brief Copied!" : "Copy Brief to Clipboard"}</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedReportId(activeActionBriefModal.primaryMasterId);
                        setActiveActionBriefModal(null);
                        setActiveTab('act');
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-700/30"
                    >
                      <span>Proceed to Stage 4 Dispatch</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =======================================================================
            STAGE 4: ACT (Dispatcher Console, Crew Assignment & Live Citizen Sync)
        ======================================================================= */}
        {activeTab === 'act' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Filterable Dispatch Queue */}
              <div className="lg:col-span-5 space-y-3">
                <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Radio className="w-4 h-4 text-amber-400" />
                        <span>Central Dispatcher Queue</span>
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {dispatchQueueReports.length} issues awaiting status action
                      </p>
                    </div>
                  </div>

                  {/* Queue Filters */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
                      {[
                        { id: 'ACTIVE_PRIMARY', label: 'Primary Active' },
                        { id: 'ALL_PRIMARY', label: 'All Primary' },
                        { id: 'MERGED_DUPLICATES', label: 'Duplicates' },
                        { id: 'RESOLVED', label: 'Resolved' }
                      ].map(f => (
                        <button
                          key={f.id}
                          onClick={() => setDispatchFilter(f.id)}
                          className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors ${
                            dispatchFilter === f.id
                              ? 'bg-amber-600 text-white font-semibold'
                              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>

                    <select
                      value={dispatchWardFilter}
                      onChange={(e) => setDispatchWardFilter(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="ALL">All City Wards</option>
                      {WARDS.map(w => (
                        <option key={w.id} value={w.name}>{w.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Queue Cards */}
                  <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
                    {dispatchQueueReports.map(report => {
                      const isSelected = report.id === selectedReportId;
                      return (
                        <div
                          key={report.id}
                          onClick={() => setSelectedReportId(report.id)}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-slate-850 border-amber-500 ring-1 ring-amber-500/50 shadow-md'
                              : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-bold text-amber-400">
                                {report.id}
                              </span>
                              <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                                report.status === 'Resolved'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : report.status === 'Field Crew Dispatched'
                                  ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                                  : 'bg-slate-800 text-slate-300'
                              }`}>
                                {report.status}
                              </span>
                            </div>
                            <span className="font-mono text-xs font-bold text-slate-300">
                              Score {report.priorityScore}
                            </span>
                          </div>

                          <h4 className="text-xs font-semibold text-slate-200 line-clamp-1 mb-1">
                            {report.title}
                          </h4>

                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>{report.ward.split('-')[0]}</span>
                            <span className="font-mono text-slate-300">
                              {report.assignedCrew?.unit || 'No crew assigned'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Dispatch Action Console & Live Citizen Sync */}
              <div className="lg:col-span-7 space-y-4">
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
                  {/* Header with Verify Citizen View Modal Trigger */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Action Console for [{selectedReport.id}]</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                          selectedReport.priorityScore >= 80 ? 'bg-rose-500/20 text-rose-300' : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {selectedReport.priorityLevel}
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {selectedReport.landmark} • {selectedReport.category}
                      </p>
                    </div>

                    <button
                      onClick={() => setShowCitizenSyncModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-sky-600/30 hover:bg-sky-600/50 text-sky-200 border border-sky-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Verify Citizen Live Status View</span>
                    </button>
                  </div>

                  {/* 1-Click Lifecycle Status Progression Buttons */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 block">
                      1-Click Lifecycle Status Progression
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { status: 'Triaged', desc: 'AI verified' },
                        { status: 'Assigned', desc: 'Crew earmarked' },
                        { status: 'Field Crew Dispatched', desc: 'En route on site' },
                        { status: 'Resolved', desc: 'Field repair complete' }
                      ].map(s => {
                        const isCurrent = selectedReport.status === s.status;
                        return (
                          <button
                            key={s.status}
                            onClick={() => handleUpdateTicketStatus(s.status)}
                            className={`p-2.5 rounded-xl text-left border transition-all ${
                              isCurrent
                                ? 'bg-amber-600 text-white border-amber-500 font-bold shadow-lg ring-1 ring-amber-400'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                            }`}
                          >
                            <div className="text-xs font-semibold leading-tight">{s.status}</div>
                            <div className={`text-[10px] mt-0.5 ${isCurrent ? 'text-amber-100' : 'text-slate-500'}`}>
                              {s.desc}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Response Crew Assignment */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      Department Field Response Unit
                    </label>
                    <select
                      value={selectedCrewUnit}
                      onChange={(e) => setSelectedCrewUnit(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      {RESPONSE_UNITS.map(u => (
                        <option key={u.id} value={u.name}>
                          {u.name} — [{u.dept}] ({u.specialty})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Resolution Notes & Presets */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      Public Resolution / Field Crew Note
                    </label>
                    <textarea
                      rows={2}
                      value={customResolutionNote}
                      onChange={(e) => setCustomResolutionNote(e.target.value)}
                      placeholder="e.g., Jetting suction unit cleared upstream siphon; water receding. Track live updates."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />

                    {/* Presets */}
                    <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                      <span className="text-slate-500">Note presets:</span>
                      {[
                        "Jetting unit cleared upstream siphon; water receding",
                        "11kV cable de-energized & re-tensioned; supply safe",
                        "Cold-mix asphalt compacted; road opened to traffic"
                      ].map((preset, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setCustomResolutionNote(preset)}
                          className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                        >
                          {preset.split(';')[0]}...
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Citizen SMS / Push Notification Preview Box (MANDATORY REQUIREMENT) */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-sky-400 font-semibold flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-sky-400" /> Live Citizen SMS / Push Broadcast Preview
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        Propagates to {selectedReport.mergedCount} citizen reporters
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-200 leading-relaxed">
                      [CivicPulse Alert] Ticket {selectedReport.id} Update: <strong className="text-amber-400">{selectedReport.status}</strong> ({selectedCrewUnit} assigned by Central Control Room).
                      {selectedReport.resolutionNotes ? ` Note: "${selectedReport.resolutionNotes}"` : ''} Track live: civicpulse.gov/t/{selectedReport.id}
                    </div>
                  </div>

                  {/* Audit Trail Log */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-xs font-bold text-slate-300 block">
                      Incident Audit Trail Log ({selectedReport.auditLog?.length || 0} events)
                    </span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-[11px]">
                      {selectedReport.auditLog?.map((log, i) => (
                        <div key={i} className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-2">
                          <div>
                            <span className="font-semibold text-slate-200">{log.action}</span>
                            <span className="text-slate-500 mx-1.5">•</span>
                            <span className="text-slate-400">{log.details}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 shrink-0">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Verify Citizen Live Status View Modal */}
            {showCitizenSyncModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="glass-panel p-6 rounded-2xl border border-sky-500/50 bg-slate-900 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-sky-400" />
                      <h4 className="text-sm font-bold text-white">
                        Simulated Citizen Mobile Screen ({selectedReport.id})
                      </h4>
                    </div>
                    <button
                      onClick={() => setShowCitizenSyncModal(false)}
                      className="text-slate-400 hover:text-white text-lg font-bold p-1"
                    >
                      &times;
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-sky-400">{selectedReport.id}</span>
                      <span className="text-xs font-bold text-amber-300">{selectedReport.status}</span>
                    </div>

                    <h5 className="text-xs font-semibold text-white">{selectedReport.title}</h5>

                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
                      <div className="text-slate-400">Assigned Unit: <strong className="text-white">{selectedReport.assignedCrew?.unit || 'Rapid Response Squad'}</strong></div>
                      <div className="text-slate-400">Field Note: <strong className="text-slate-200">"{selectedReport.resolutionNotes || 'Crew en route.'}"</strong></div>
                    </div>

                    {selectedReport.childTicketIds?.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-indigo-200">
                        <strong className="text-white">Live Propagation Proof:</strong> All {selectedReport.childTicketIds.length} merged duplicate citizens ({selectedReport.childTicketIds.join(', ')}) simultaneously receive this update in their trackers.
                      </div>
                    )}
                  </div>

                  <div className="pt-2 text-right">
                    <button
                      onClick={() => setShowCitizenSyncModal(false)}
                      className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                    >
                      Close Preview
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =======================================================================
            STAGE 5: AI HONESTY NOTE & EXPORT TOOLS
        ======================================================================= */}
        {activeTab === 'honesty' && (
          <div className="space-y-6">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <ShieldAlert className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">
                      AI Architecture, Transparency &amp; Honesty Note
                    </h2>
                    <p className="text-xs text-slate-400">
                      Engineering documentation on mathematical verification, synthetic boundaries, and production roadmaps
                    </p>
                  </div>
                </div>

                {/* Export Tools */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={exportJSON}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON Dataset</span>
                  </button>
                  <button
                    onClick={exportCSV}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>

              {/* 4-Card Transparency Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                {/* Card 1: What is 100% Real & Computing Live */}
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      1. What is 100% Real &amp; Computing Live
                    </h4>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span><strong>Spatial Euclidean &amp; Haversine Distance:</strong> Exact distance in meters computed with zero external GIS service latency (<code className="text-emerald-300 font-mono text-[10px]">Math.hypot(Δx, Δy) * 5m</code>).</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span><strong>Synonym-Normalized Semantic Similarity:</strong> Custom NLP tokenization with domain synonym normalization (flooded&rarr;waterlogging, sparking&rarr;wire) and Jaccard token overlap.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span><strong>4-Factor Priority Math:</strong> Fully deterministic 0-100 scoring based on hazard severity, vulnerable proximity, report volume, and cascading risk.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span><strong>Gemini 2.5 REST API Bridge:</strong> Real Express backend endpoint calling Google Gemini API when API key is provided, with graceful 3.5s timeout fallback.</span>
                    </li>
                  </ul>
                </div>

                {/* Card 2: What is Synthetic or Simulated */}
                <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-400" />
                    <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                      2. What is Synthetic or Simulated
                    </h4>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-400 font-bold">•</span>
                      <span><strong>42-Report Municipal Dataset:</strong> Modeled after realistic municipal scenarios across 5 city wards with zero PII or real citizen telephone numbers.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-400 font-bold">•</span>
                      <span><strong>Self-Contained Vector SVG Coordinate Grid:</strong> 1000&times;850 vector map rendering arterial roads and landmarks with zero reliance on external paid Google Maps API billing.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-400 font-bold">•</span>
                      <span><strong>Simulated SMS / Push Gateway:</strong> Formatted preview of citizen notification messages without triggering paid Twilio or telecom SMS charges.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-400 font-bold">•</span>
                      <span><strong>Built-in SVG Hazard Evidence:</strong> High-fidelity vector illustrations preventing broken external image URLs or dead CDN links.</span>
                    </li>
                  </ul>
                </div>

                {/* Card 3: Where the AI Can Be Wrong / Failure Modes */}
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                      3. Where the AI Can Be Wrong / Failure Modes
                    </h4>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    <li className="flex items-start gap-1.5">
                      <span className="text-rose-400 font-bold">•</span>
                      <span><strong>Over-Merging Distinct Nearby Potholes:</strong> Two separate potholes 35 meters apart on opposite carriageways may be accidentally grouped if descriptions match.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-rose-400 font-bold">•</span>
                      <span><strong>Adversarial Keyword Gaming:</strong> A citizen reporting routine garbage might write "life-threatening hospital emergency" to artificially inflate priority to 90+.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-rose-400 font-bold">•</span>
                      <span><strong>Urban Canyon GPS Drift:</strong> Citizen submitting report from an apartment balcony 70m away from the actual roadway drain.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-rose-400 font-bold">•</span>
                      <span><strong>Polyglot Transliteration:</strong> Reports submitted in transliterated regional languages ("neeru thumbide" / "rasta kharab") require localized phonetic tokenizers.</span>
                    </li>
                  </ul>
                </div>

                {/* Card 4: What We Would Build Next */}
                <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                      4. What We Would Build Next
                    </h4>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    <li className="flex items-start gap-1.5">
                      <span className="text-purple-400 font-bold">•</span>
                      <span><strong>Multimodal Vision EXIF Verification:</strong> Run Gemini 2.5 Flash on uploaded photos to detect whether image is authentic, inspect camera GPS EXIF metadata, and verify hazard depth.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-purple-400 font-bold">•</span>
                      <span><strong>OpenStreetMap GIS Polygon Layers:</strong> Import exact shapefiles for municipal ward polygons, drainage catchments, and underground electric feeders.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-purple-400 font-bold">•</span>
                      <span><strong>Field Crew Proof-of-Resolution:</strong> Mandatory "After" photo submission with automatic AI differential comparison against the "Before" photo before ticket closure.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-purple-400 font-bold">•</span>
                      <span><strong>Automated Contractor SLA Penalties:</strong> Real-time financial clawbacks if critical life-safety hazards exceed the 60-minute dispatch window.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          SUPABASE CLOUD SYNC & CONFIGURATION MODAL
      ========================================================================= */}
      {showSupabaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-2xl border border-emerald-500/50 bg-slate-900 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Database className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Supabase Cloud PostgreSQL &amp; Realtime Sync</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Connect your live Supabase project to persist municipal tickets with Realtime subscriptions
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSupabaseModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1"
              >
                &times;
              </button>
            </div>

            {/* Live Connection Status Banner */}
            <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
              isSupabaseLive
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isSupabaseLive ? 'bg-emerald-400 animate-ping-slow' : 'bg-slate-500'}`} />
                <span className="font-semibold">
                  Status: {isSupabaseLive ? '🟢 Connected to Supabase (Realtime Channel Active)' : '⚪ Offline / Synthetic Hybrid Fallback Active'}
                </span>
              </div>
              {supabaseStatusMsg && (
                <span className="text-[11px] font-mono text-emerald-400 truncate max-w-xs">{supabaseStatusMsg}</span>
              )}
            </div>

            {/* Supabase Connection Credentials Form */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-sky-400" />
                <span>Supabase Project Credentials</span>
              </h4>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Project URL (<code className="text-sky-300 font-mono text-[10px]">VITE_SUPABASE_URL</code>)
                </label>
                <input
                  type="text"
                  value={supabaseUrlInput}
                  onChange={(e) => setSupabaseUrlInput(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Anon Public Key (<code className="text-sky-300 font-mono text-[10px]">VITE_SUPABASE_ANON_KEY</code>)
                </label>
                <input
                  type="password"
                  value={supabaseKeyInput}
                  onChange={(e) => setSupabaseKeyInput(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    setSupabaseConfig(supabaseUrlInput, supabaseKeyInput);
                    const cfg = getSupabaseConfig();
                    setSupabaseStateConfig(cfg);
                    if (cfg.isConfigured) {
                      fetchCivicReportsFromSupabase().then(({ data, error }) => {
                        if (!error && data) {
                          setReports(data);
                          setIsSupabaseLive(true);
                          setSupabaseStatusMsg(`Successfully connected! Found ${data.length} records.`);
                        } else {
                          setIsSupabaseLive(false);
                          setSupabaseStatusMsg(error || 'Failed to fetch');
                        }
                      });
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save &amp; Connect Live</span>
                </button>

                <button
                  onClick={() => {
                    clearSupabaseConfig();
                    setSupabaseUrlInput('');
                    setSupabaseKeyInput('');
                    setSupabaseStateConfig(getSupabaseConfig());
                    setIsSupabaseLive(false);
                    setSupabaseStatusMsg('Disconnected from Supabase. Reverted to synthetic memory dataset.');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Disconnect / Clear
                </button>
              </div>
            </div>

            {/* One-Click Seed Database Button */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-white">Seed Baseline Reports into Supabase</h4>
                <p className="text-[11px] text-slate-400">
                  Bulk upserts the 42 realistic municipal reports (`CP-1001` through `CP-1042`) into your Supabase database.
                </p>
              </div>
              <button
                disabled={isSeedingSupabase}
                onClick={async () => {
                  setIsSeedingSupabase(true);
                  const res = await seedSupabaseDatabase(INITIAL_REPORTS);
                  setIsSeedingSupabase(false);
                  if (res.success) {
                    setSupabaseStatusMsg(`Seeded ${res.count} reports into Supabase!`);
                    setReports(INITIAL_REPORTS);
                  } else {
                    setSupabaseStatusMsg(`Seed error: ${res.message}`);
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 whitespace-nowrap"
              >
                {isSeedingSupabase ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                <span>{isSeedingSupabase ? 'Seeding Tables...' : 'Seed 42 Baseline Reports'}</span>
              </button>
            </div>

            {/* Embedded SQL Schema Script Viewer */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  <span>One-Click SQL Schema Setup (`supabase_schema.sql`)</span>
                </h4>
                <button
                  onClick={() => {
                    const sqlScript = `-- Create Civic Reports Table in Supabase
CREATE TABLE IF NOT EXISTS public.civic_reports (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    department TEXT NOT NULL,
    ward TEXT NOT NULL,
    ward_number INTEGER NOT NULL,
    landmark TEXT,
    x INTEGER NOT NULL DEFAULT 500,
    y INTEGER NOT NULL DEFAULT 425,
    submission_channel TEXT DEFAULT 'Mobile App',
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'Triaged',
    is_primary BOOLEAN NOT NULL DEFAULT true,
    duplicate_of TEXT REFERENCES public.civic_reports(id) ON DELETE SET NULL,
    merged_count INTEGER NOT NULL DEFAULT 1,
    child_ticket_ids JSONB DEFAULT '[]'::jsonb,
    priority_score INTEGER NOT NULL DEFAULT 50,
    priority_level TEXT NOT NULL DEFAULT 'Medium',
    priority_factors JSONB DEFAULT '{}'::jsonb,
    cluster_id TEXT,
    assigned_crew JSONB DEFAULT '{}'::jsonb,
    resolution_notes TEXT,
    audit_log JSONB DEFAULT '[]'::jsonb,
    hazard_photo_type TEXT DEFAULT 'flooding'
);
ALTER TABLE public.civic_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON public.civic_reports FOR ALL USING (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.civic_reports;`;
                    navigator.clipboard.writeText(sqlScript);
                    setSchemaCopied(true);
                    setTimeout(() => setSchemaCopied(false), 3000);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1"
                >
                  {schemaCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{schemaCopied ? 'SQL Copied!' : 'Copy SQL Schema'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Run this schema in your <strong>Supabase Dashboard &gt; SQL Editor</strong> to enable the table and Realtime broadcasting.
              </p>
              <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono text-emerald-300 overflow-x-auto max-h-32">
{`CREATE TABLE public.civic_reports (
  id TEXT PRIMARY KEY, title TEXT, category TEXT,
  priority_score INT, status TEXT, x INT, y INT ...
);
ALTER PUBLICATION supabase_realtime ADD TABLE public.civic_reports;`}
              </pre>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowSupabaseModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Close Modal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PLATFORM FOOTER
      ========================================================================= */}
      <footer className="mt-auto glass-panel border-t border-slate-800/80 bg-slate-950/90 px-4 py-3 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-300">CivicPulse AI Platform v1.0.0</span>
            <span className="text-slate-600">|</span>
            <span>Google Cloud Run 1-Command Deployment</span>
          </div>
          <div className="font-mono text-[11px] text-slate-500 flex items-center gap-3">
            <span>Container Port: 8080</span>
            <span>•</span>
            <span>Vite + React 18 + Express Monorepo</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
