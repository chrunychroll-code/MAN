# CivicPulse AI — Intelligent Civic Issue Triage, Deduplication, Hotspot & Action Platform

[![Deploy to Cloud Run](https://deploy.cloud.run/button.svg)](https://deploy.cloud.run)

A production-ready municipal civic intelligence and dispatch synchronization platform engineered for **Google Cloud Run** and **Supabase Realtime**. CivicPulse AI automates civic issue intake, eliminates duplicate complaints across multiple reporting channels, computes explainable multi-factor priority scores, uncovers interconnected multi-symptom corridor failures (hotspots), renders interactive **Google Maps™**-style vector cartography with live traffic congestion, and synchronizes live dispatch updates directly with affected citizens in real-time.

---

## 🏛️ System Architecture & 4-Stage Lifecycle

```
[ Citizen Ingestion ]  --> Mobile App / WhatsApp / Voice Helpline / Web Portal / Twitter
                                |
[ Stage 1: CAPTURE ]   --> Toggleable Mobile Frame, Interactive Google Maps Mini-Map Pin Picker,
                           Two-Way Citizen Status Tracker & Smart Duplicate Transparency Banner
                                |
[ Stage 2: UNDERSTAND] --> Deterministic Hybrid AI Triage (<10ms) + Optional Gemini 2.5 Flash
                           • Spatial Distance (1 unit = 5m) & Semantic Token Overlap
                           • Explainable 4-Factor Priority Score (0-100) & Decision Inspector
                                |
[ Stage 3: REVEAL ]    --> Google Maps™ Vector Cartography (Roadmap, Satellite, Traffic Modes)
                           • Authentic Google Teardrop Pins, Drop Shadows & Clickable InfoWindows
                           • Radiating Hotspot Halos & Duplicate Vector Linkages
                           • 1-Minute Executive Action Briefs (Sequenced Multi-Dept Dispatch)
                                |
[ Stage 4: ACT ]       --> Central Dispatcher Console & Field Response Unit Assignment
                           • Rapid Response Units Alpha-1, E-4, J-2, R-5, SWM-09, T-3
                           • Instant SMS / Push Broadcast & Live Two-Way Citizen Synchronization
                                |
[ Stage 5: HONESTY ]   --> 4-Card Transparency Matrix (Real vs Synthetic, Failure Modes, Roadmap)
                           • One-Click JSON & CSV Dataset Export
                                |
[ Data Layer: SYNC ]   --> Supabase Realtime PostgreSQL (RLS, Auto-Seed, Multi-Client Live Sync)
                           • Seamless offline fallback to deterministic in-memory store
```

---

## 🚀 Key Platform Innovations

### 1. 🗺️ Google Maps™-Style Vector Cartography Engine (Stage 3)
- **3 Map Rendering Modes:**
  - **Map (Roadmap):** Authentic Google Maps palette (`#e8eaed` canvas, `#ffffff` arterial avenues, `#f1f3f4` local streets, `#c5e1a5` parks/greenery, `#bbdefb` water bodies, building footprints, and route badges).
  - **Satellite Imagery Mode:** Deep satellite base palette (`#1a242f` land, `#0d1b2a` water, `#233544` streets, `#2e4a3e` canopy).
  - **Live Traffic Congestion Overlay:** Color-coded traffic flows along municipal corridors:
    - 🟢 Green: Normal flow (indiranagar 100ft road, outer ring).
    - 🟡 Orange: Moderate congestion (Koramangala 80ft road).
    - 🔴 Red: Severe corridor blockage (MG Road School Zone & Koramangala 4th Cross flood zones).
- **Google Teardrop Pins & Drop Shadows:** Handcrafted SVG teardrop map markers with dynamic drop shadows, category color coding, and white circular category glyphs.
- **Interactive Google InfoWindows:** Clicking any pin displays a Google Maps-style InfoWindow popup with live status pill, priority score, duplicate count badge, ward name, and a 1-click **"Dispatch Unit"** trigger.
- **Floating Google Controls:** Floating Google search bar with instant pin filtering, `Map | Satellite | Traffic` switcher, and Google `+` / `−` zoom buttons.

### 2. ⚡ Supabase PostgreSQL & Realtime Two-Way Synchronization
- **Supabase Cloud Sync Modal:** Accessible via the header status pill (`🟢 Supabase Realtime` / `⚪ Supabase Sync`). Allows live entry of Supabase credentials or auto-discovery via environment variables.
- **1-Click Baseline Seed:** Populate a fresh Supabase database with all 42 municipal reports (`CP-1001` through `CP-1042`) at the push of a button.
- **Realtime Postgres Subscription:** Connects to `public:civic_reports` channel via `@supabase/supabase-js`. When a dispatcher updates a crew assignment or status, every connected citizen smartphone and dispatcher dashboard updates instantaneously across separate devices or browser tabs.
- **Ready-to-Run SQL Schema:** Complete [supabase_schema.sql](file:///c:/Users/darkm/OneDrive/Documents/ASTRA/supabase_schema.sql) file included with indexes, RLS policies, and `ALTER PUBLICATION supabase_realtime ADD TABLE public.civic_reports;`.
- **Zero-Failure Hybrid Offline Fallback:** If Supabase is not connected, the platform operates seamlessly on its robust in-memory database with zero errors or degraded features.

### 3. 📱 Stage 1: Capture (Citizen Reporting & Two-Way Status Tracking)
- **Toggleable Smartphone Frame:** Switch between a realistic mobile device frame (complete with notch, speaker grill, and battery status bar) and a wide responsive desktop view.
- **Interactive Mini-Map Pin Picker:** Click anywhere on the coordinate grid to select exact complaint coordinates with auto-detected municipal wards.
- **Self-Contained Vector Hazard Evidence:** Zero broken external URLs. Custom SVG illustrations for submerged waterlogging, sparking 11kV high-tension cables, deep asphalt craters, 12-ft open manholes, 3-ton commercial dumps, carriageway tree blockages, and traffic signals.
- **4 Interactive Demo Presets:**
  - *Scenario A: Duplicate Detection Test* (St. Mary's School Gate culvert collapse &rarr; consolidates into `CP-1001`).
  - *Scenario B: Urgent Life-Safety Hazard* (11kV sparking high-tension wire &rarr; scores 96/100 Critical, Rank #1).
  - *Scenario C: Hotspot Cluster Pattern* (Submerged pothole on Koramangala 4th Cross &rarr; links to `CL-4TH-CROSS`).
  - *Scenario D: New Standalone Issue* (Fallen banyan tree blocking emergency ambulance lane &rarr; creates new master ticket `CP-1043`).
- **Smart Duplicate Transparency:** Tracking a merged duplicate report (e.g. `CP-1002`) displays a transparent explanation that the complaint was consolidated into Master Ticket `CP-1001`, boosting priority to Critical and dispatching crews 4x faster, while mirroring all master crew assignments and resolution notes in real-time.

### 4. 🧠 Stage 2: Understand (Deterministic AI Triage & Explainable Math)
- **Live AI Pipeline Execution Banner:** Displays classified department, spatial/semantic duplicate detection metrics, 4-factor score breakdown, and plain-language reasoning.
- **Ranked Priority Queue:** Real-time descending list of all unique primary issues with 4-color stacked factor bars, duplicate count badges, and cluster tags.
- **AI Decision Inspector:** Side-by-side head-to-head comparison against lowest-ranked routine issue (`CP-1042`, Score 14/100 — daytime streetlights stuck on), explaining mathematically why critical life-safety hazards rank above routine maintenance.
- **Merged Child Report Inspector:** Lists all consolidated child tickets with exact distance in meters, submission channel, and timestamp.

### 5. 🔍 Stage 3: Reveal (Hotspot Detection & Executive Action Briefs)
- **Root-Cause Multi-Symptom Cluster Detection:**
  - `CL-4TH-CROSS`: 7 reports across 4 categories (Waste &rarr; Drain Blockage &rarr; Waterlogging &rarr; Submerged Pothole Crater + 4 Dead Streetlights).
  - `CL-MG-DRAIN`: 6 duplicate reports outside a 1,200-student school gate during morning arrival.
  - `CL-WF-MARKET`: 4 reports linking a 3-ton wholesale waste blackspot to an overflowing bus bay drain.
- **1-Minute Executive Action Brief Modal:** Generates sequenced inter-departmental dispatch orders (Step 1: Clear trash grate; Step 2: Hydro-jet drain; Step 3: Hotmix patch pothole; Step 4: Repair lighting feeder pillar).

### 6. 🚒 Stage 4: Act (Dispatcher Console, Crew Assignment & Live Citizen Sync)
- **Central Dispatch Console:** Filter by active primary issues, duplicates, resolved issues, and municipal wards.
- **1-Click Lifecycle Progression:** Progress tickets from `Triaged` &rarr; `Assigned` &rarr; `Field Crew Dispatched` &rarr; `Resolved`.
- **Specialized Response Units:** Assign dedicated municipal teams (`Rapid Response Crew Alpha-1`, `Rapid Response Unit E-4`, `Jetting & Suction Rig J-2`, `Hotmix Patch Unit R-5`, `Compactor Truck SWM-09`, `Forestry Squad T-3`).
- **Live Citizen SMS Preview:** Real-time formatting of outbound SMS/push notifications.
- **Verify Citizen Live Status View Modal:** Live proof that changing ticket status or adding field notes in Stage 4 instantaneously propagates to the citizen's mobile screen and all child duplicate reports.

### 7. ⚖️ Stage 5: AI Honesty Note & Export Tools
- **4-Card Transparency Matrix:**
  1. *What is 100% Real & Computing Live* (Euclidean spatial distance, synonym-normalized TF-IDF/Jaccard similarity, 4-factor scoring formula, Express REST API, Supabase Realtime).
  2. *What is Synthetic or Simulated* (42 synthetic reports across 5 wards, simulated SMS gateway, vector SVG Google Maps cartography).
  3. *Where the AI Can Be Wrong / Failure Modes* (Over-merging distinct nearby potholes, adversarial keyword inflation, urban canyon GPS drift).
  4. *What We Would Build Next* (Multimodal photo verification with EXIF check, OpenStreetMap shapefiles, "After" photo proof of resolution).
- **Downloadable Data:** One-click buttons to export the triaged municipal dataset as `.json` or `.csv`.

---

## 💻 Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, High-fidelity SVG Vector Cartography.
- **Database & Realtime:** Supabase (`@supabase/supabase-js` v2), PostgreSQL with Row-Level Security and Realtime Publications.
- **Backend Server:** Node.js (v20+), Express 4, CORS.
- **AI Engine:**
  - Deterministic client & server hybrid engine running in `<10ms` with zero external dependencies.
  - Optional non-blocking Gemini 2.5 Flash REST bridge via Express endpoint (`POST /api/ai/triage`).
- **Container & Cloud:** Multi-stage Alpine Dockerfile, Google Cloud Build (`cloudbuild.yaml`), Google Cloud Run (`deploy-cloud-run.sh`).

---

## 🛠️ Local Development & Running

### 1. Prerequisites
- Node.js 18+ (tested on Node 20 & 24)
- npm 9+

### 2. Installation
```bash
# Clone or navigate to the repository
cd ASTRA

# Install dependencies
npm install
```

### 3. Run Locally (Development Mode)
```bash
# Starts Vite dev server on http://localhost:3000
npm run dev
```

### 4. Run Production Build Locally (Express Server)
```bash
# 1. Compile production assets into dist/
npm run build

# 2. Start Express server on http://localhost:8080
npm start
```

Visit [http://localhost:8080](http://localhost:8080) to interact with the production platform.
Check container health at [http://localhost:8080/api/health](http://localhost:8080/api/health).

---

## ⚡ Supabase Setup & Realtime Configuration

CivicPulse AI can run 100% offline with zero setup, but connecting to Supabase takes less than 2 minutes:

### 1. Create a Supabase Project
1. Log in to [supabase.com](https://supabase.com) and create a new project.
2. Go to the **SQL Editor** tab in your Supabase project dashboard.
3. Paste and run the contents of [supabase_schema.sql](file:///c:/Users/darkm/OneDrive/Documents/ASTRA/supabase_schema.sql).

### 2. Connect Your App
You can connect in either of two ways:
- **Via the UI:** Click the **"⚪ Supabase Sync"** button in the app header, paste your `Project URL` and `anon public key`, and click **"Save & Connect"**.
- **Via Environment Variables:** Create a `.env` file in the root directory:
  ```env
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-key
  ```

### 3. Seed Baseline Data
In the Supabase modal, click **"Seed 42 Baseline Reports"** to instantly populate your table with realistic municipal issues.

---

## ☁️ Google Cloud Run Deployment (1-Command)

### Option A: Direct Source Deployment via `gcloud`
```bash
# Authenticate with Google Cloud
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# 1-command deployment from repository source
gcloud run deploy civicpulse-ai \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080
```

Or execute the included helper script:
```bash
chmod +x deploy-cloud-run.sh
./deploy-cloud-run.sh
```

### Option B: Docker Container Build
```bash
# Build the production Docker image locally
docker build -t civicpulse-ai .

# Run container locally on port 8080
docker run -p 8080:8080 -e PORT=8080 civicpulse-ai
```

### Optional Environment Variables on Cloud Run
```bash
gcloud run services update civicpulse-ai \
  --region us-central1 \
  --set-env-vars GEMINI_API_KEY="your-gemini-key",SUPABASE_URL="https://your-proj.supabase.co",SUPABASE_SERVICE_KEY="your-key"
```

---

## 📊 Synthetic Dataset Index (`CP-1001` through `CP-1042`)

| ID Range | Category | Ward | Core Highlight |
|---|---|---|---|
| **CP-1001..1006** | Waterlogging | Ward 1 | St. Mary's School Gate culvert collapse (Master + 5 merged duplicates, Score 93 Critical). |
| **CP-1007..1009** | Electrical | Ward 2 | 11kV live sparking wire on wet hospital footpath (Rank #1 overall, Score 96 Critical). |
| **CP-1010..1011** | Waterlogging | Ward 3 | 12-ft uncovered sewer manhole on Indiranagar 100ft road fast lane (Score 85 Critical). |
| **CP-1012..1018** | Multi-Symptom | Ward 4 | Koramangala 4th Cross corridor failure: Waste &rarr; Flooding &rarr; Submerged Pothole &rarr; Streetlights (`CL-4TH-CROSS`). |
| **CP-1019..1022** | Waste & Drainage | Ward 5 | Whitefield Market waste blackspot choking bus bay gully drain (`CL-WF-MARKET`). |
| **CP-1023..1031** | Various | Wards 1-5 | Standalone high-priority hazards (cracked tree on wires, burst potable water main, collapsed clinic footpath, failed ambulance signal). |
| **CP-1032..1035** | Various | Wards 1-5 | Medium priority issues (sewer chamber overflow, railway fence breach, scrap trailers). |
| **CP-1036..1042** | Routine | Wards 1-5 | Low priority routine requests (flickering bulb, bougainvillea bush trim, leaf litter, faded zebra crossing, park bench crack, daytime streetlights on `CP-1042` with Score 14). |

---

## 🔒 License
MIT License. Built for municipal civic transparency and intelligent emergency dispatch.
