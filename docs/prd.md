# FoloCharge Requirements Document

## 1. Application Overview

### 1.1 Application Name
FoloCharge – Smarter EV Operations for India

### 1.2 Application Description
A premium, enterprise-level SaaS platform designed for Indian EV charging station owners and operators. FoloCharge integrates four core modules into a unified dashboard:\n- **Fault Diagnoser**: Analyzes charger failures through log file uploads with fault categorization and root cause analysis
- **Auto-Downtime Cost Calculator**: Calculates revenue loss in INR based on downtime\n- **Predictive Failure Indicator**: Rule-based pattern detection for proactive maintenance
- **Multi-Site Revenue Analyzer**: Comprehensive site and charger performance analytics

### 1.3 Tagline
Smarter EV Operations for India — No Setup, Just Upload.\n
### 1.4 Target Users
EV charging station owners, operators, and decision-makers in the Indian market\n
---

## 2. Authentication & Access Control

### 2.1 Access States

#### State 1: Public Demo (No Authentication)
- **Who**: Anyone visiting the platform
- **Auth Required**: ❌ No
- **Access Level**: \n  - Full UI access to all modules
  - Can interact with all features using pre-loaded sample data
  - Can test fault diagnosis, cost analysis, predictive failure, and site analytics
  - Cannot upload custom files
  - Banner displayed:'You are using Demo Mode with sample data. Sign in to upload your own files.'

#### State 2: Pending (Invited, Not Yet Approved)
- **Who**: Users invited by admin but not yet approved
- **Auth Required**: ✅ Yes\n- **Access Level**:
  - Can sign in with invited email
  - Full UI access with sample data only
  - Cannot upload custom files
  - Status banner displayed: 'Your account is pending approval. You will be notified once approved.'
  - Notification sent to admin for approval action

#### State 3: Approved (Fully Onboarded)
- **Who**: Clients approved by admin
- **Auth Required**: ✅ Yes
- **Access Level**:
  - Full platform access
  - Can upload custom log files (CSV, JSON, TXT)
  - Can upload custom site analytics data
  - All export features enabled
  - No access restrictions
\n### 2.2 Authentication Flow

#### 2.2.1 Public Demo Experience
- No sign-in required
- Immediate access to all modules with sample data
- 'Sign In' button visible in top-right header
- 'Upload Your Files' buttons show tooltip: 'Sign in required to upload custom data'
- Clicking upload triggers sign-in prompt

#### 2.2.2 User Invitation Process
1. Admin manually invites user via email through admin panel
2. User receives invitation email with sign-in link
3. User clicks link and completes authentication
4. User account created in'Pending' state
5. Admin receives notification for approval
6. Admin approves user through admin panel
7. User status changes to 'Approved'
8. User receives approval notification email
9. User can now upload custom files

#### 2.2.3 Sign-In Methods
- Email-based authentication (primary method)
- OSS Google login (secondary option)
- No password required for invited users (magic link authentication)

### 2.3 UI Components

#### 2.3.1 Header Authentication Elements
- **Public Demo State**: 'Sign In' button (top-right)
- **Pending State**: User email display + 'Pending Approval' badge (orange)
- **Approved State**: User email display + profile dropdown menu

#### 2.3.2 Upload Restrictions
- **Public Demo**: Upload buttons disabled with tooltip overlay
- **Pending**: Upload buttons disabled with 'Awaiting Approval' message
- **Approved**: Upload buttons fully functional

#### 2.3.3 Status Banners
- **Demo Mode**: Blue banner at top of dashboard
- **Pending Approval**: Orange banner with approval status
- **Approved**: No banner (clean interface)

### 2.4 Admin Panel

#### 2.4.1 Admin Access
- Separate admin login (admin-only credentials)
- Admin dashboard accessible via /admin route
\n#### 2.4.2 User Management Features
- Invite new users (enter email address)
- View all users with status (Public Demo / Pending / Approved)
- Approve pending users (one-click approval)
- Revoke access for approved users
- View user activity logs (file uploads, module usage)
- Send manual notifications to users

#### 2.4.3 Invitation Management
- Bulk invite option (CSV upload with email list)
- Custom invitation message template
- Track invitation status (Sent / Opened / Signed In / Approved)
- Resend invitation emails

### 2.5 Data Handling by State

#### 2.5.1 Public Demo
- Pre-loaded sample datasets for all modules
- Session-based temporary data (cleared after session)
- No data persistence\n
#### 2.5.2 Pending Users
- Same as Public Demo
- User profile stored (email, invitation timestamp)
\n#### 2.5.3 Approved Users
- Uploaded files processed and stored temporarily per session
- Export history tracked (optional)
- No long-term data storage (client-side processing only)

### 2.6 Security Considerations
- Magic link authentication with expiration (24 hours)
- Session timeout after 2 hours of inactivity
- Admin approval required for all new users
- No public registration (invite-only)
- Secure email delivery for invitations

---

## 3. Navigation Structure

### 3.1 Left Vertical Sidebar
**Primary Menu**
- 🏠 Dashboard Home
- 🛠 Fault Diagnosis
- 💸 Cost Analysis
- ⚡ Predictive Failure
- 📊 Site Analytics
- 🔌 Charger Analytics
\n**Footer Section**
- Help & Documentation
- About FoloCharge
- Version Number (v1.0)
- Built by Folonite
\n### 3.2 Navigation Features
- Collapsible sections for clean interface
- Hover tooltips for menu items
- Active state highlighting for current page
- Smooth transitions between sections

---

## 4. Dashboard Home (Executive Summary)

### 4.1 Top Widgets (Large Cards)
Four primary metric cards displaying:
- **Today's Detected Faults**: Total count with severity breakdown
- **Estimated Downtime Loss**: INR amount for today and current month
- **Highest-Earning Sites**: Top 3 sites with revenue figures
- **Charger Risk Scores**: Count of chargers in High and Critical risk categories

### 4.2 Secondary Widgets
- **Usage Trend Graph**: Line chart showing last 7 days activity
- **Fault Category Distribution**: Pie chart with fault type breakdown
- **Sites Needing Immediate Attention**: Alert list with actionable items
\n### 4.3 Widget Design Requirements
- Color-coded by severity and status
- Bold typography for key numbers
- Subtle animations: fade-in on load, slide-up transitions, hover shadows
- Large readable numbers for quick scanning
- Icon representation for each metric type

---
\n## 5. Fault Diagnosis Module

### 5.1 Log Upload & Parsing
- Support file formats: CSV, JSON, TXT
- Drag-and-drop upload zone with hover state
- 'Load Indian Sample Data' button for instant testing
- **Upload Restriction**: Custom file upload requires Approved user status
- Auto-extract key fields: errorCode, timestamp, connectorId, meterValue, temperature, voltage/current, OCPP status, transactionStopReason

### 5.2 Fault Classification Engine
Rule-based categorization into11 fault types:
- Overcurrent
- Overvoltage
- Low grid voltage
- Overheating
- BMS communication mismatch
- OCPP network disconnect
- Power module failure
- Vehicle-side abort
- Emergency stop
- Contactor stuck
- Repeated soft restarts
\n### 5.3 Fault Analysis Display
For each detected fault:
- Issue description
- Root cause analysis
- Impact on charging uptime
- Severity badge (Green: Normal, Orange: Warning, Red: Critical, Blue: Info)
- Resolution guidance with action type (Electrician required / Vendor support / Simple reset)

### 5.4 Detailed Fault Table
- Sortable and filterable columns
- Collapsible rows for detailed information
- Risk badges integrated for at-risk chargers
- Export functionality for selected faults

---

## 6. Cost Analysis Module

### 6.1 Downtime Cost Calculator (INR)
- Formula: avg_sessions_per_day × avg_ticket_size_in_INR × (downtime_hours/24)
- Default parameters (user-editable with inline validation):
  - Average Session Value: ₹120
  - Average Sessions per Day: 14
\n### 6.2 Display Metrics
- Revenue lost today\n- Revenue lost this month
- Top 5 costliest faults ranking with bar chart
- Total potential revenue at risk from predictive alerts

### 6.3 Visual Representation
- Large number displays with INR symbol
- Trend indicators (up/down arrows)
- Color-coded severity levels
- Interactive charts with hover details

---

## 7. Predictive Failure Module

### 7.1 Pattern Detection Rules
Trigger alerts based on:
- Overheating events:3+ occurrences within 7 days
- OCPP disconnect: More than 6 times in 24 hours
- Voltage fluctuation: More than 10% deviation repeatedly
- Repeated charger restarts: More than 4 per day
- Vehicle-aborted sessions: 5+ occurrences
- Power module current imbalance detected

### 7.2 Risk Classification
- ⚠️ **Medium Failure Risk** (Orange badge): Single pattern, moderate frequency
- 🔥 **High Failure Risk** (Orange badge): Multiple patterns or high frequency
- 🚨 **Critical — Failure Imminent** (Red badge): Severe patterns with very high frequency
\n### 7.3 Charger Health Score
- 0-100 scale displayed as circular progress indicator with color gradient
- Score ranges:\n  - 80-100: Healthy (Green)
  - 60-79: Monitor Closely (Yellow)
  - 40-59: Service Recommended (Orange)
  - 0-39: Critical — Service Immediately (Red)

### 7.4 Risk Summary Panel
- Total chargers at risk count
- Breakdown by risk level with color-coded badges
- Top 3 highest-risk chargers with health scores
- Total potential revenue at risk (INR)
- Sticky summary bar when at-risk chargers detected

### 7.5 Detailed Risk Table
For each at-risk charger:
- Charger ID / Connector ID
- Risk badge with color coding
- Health score with circular indicator
- Detected patterns list
- Explanation and recommended action
- Estimated revenue loss (INR)
- Days until predicted failure
- Urgency level (Immediate / Within 3 days / Within 1 week)

### 7.6 Risk Detail Cards
- Collapsible cards for each at-risk charger
- Pattern timeline visualization
- Expandable sections for technical details
- Action buttons for maintenance scheduling
\n---

## 8. Site Analytics Module
\n### 8.1 CSV Upload\n- Single CSV file upload with drag-and-drop support
- **Upload Restriction**: Custom file upload requires Approved user status
- Required fields: siteId, chargerId, connectorId, energy_kWh, sessionDurationMin, tariffINR, revenueINR, startTime, stopTime\n\n### 8.2 Site-Level Metrics
For each site:
- Total revenue (INR)
- Total energy delivered (kWh)
- Average session revenue (INR)
- Average session duration (minutes)
- Utilization percentage
- Sessions per day
- Peak hour identification

### 8.3 Site Comparison Visualization
- Bar chart comparing revenue across sites
- Usage ranking table with sortable columns
- Color-coded performance indicators
- Interactive hover tooltips with detailed metrics

### 8.4 Insights & Recommendations
Rule-based business suggestions:
- Tariff adjustment recommendations
- Charger relocation alerts for low footfall
- Capacity expansion suggestions for high-demand sites
- Grid issue warnings for low energy output
\n---

## 9. Charger Analytics Module\n
### 9.1 Charger-Level Performance Analysis
Categorization:\n- **Good Performer** (Green badge): High utilization and revenue
- **Low Performer** (Yellow badge): Below-average metrics
- **Dead Chargers** (Red badge): 0–1 sessions per day
- **Underutilized Chargers** (Orange badge): Less than 10% usage
\n### 9.2 Charger Performance Table
- Sortable and filterable columns
- Performance badge for each charger
- Drill-down capability for connector-level data
- Alert indicators for dead and underutilized chargers

### 9.3 Visual Reports
- Revenue ranking by charger
- Utilization heatmap
- Dead charger alerts with recommended actions
- Performance trend graphs

---

## 10. Context-Aware Intelligence Engine

### 10.1 Overview
Folonite DMS goes beyond basic fault detection by applying context-aware intelligence to every charger event. Instead of treating faults as isolated incidents, the system continuously analyzes patterns, frequency, and sensor behavior to understand the true operational risk.\n
### 10.2Recurrence-Based Severity Escalation
- Automatically escalates fault severity when the same fault repeats multiple times on the same charger within a short time window
- Reflects real-world urgency by adjusting priority based on recurrence patterns
- Time window analysis to identify critical fault clusters

### 10.3 Sensor-Driven Severity Scaling
- Live sensor readings (temperature, voltage, current) evaluated against safe operating thresholds
- Critical conditions flagged with higher priority based on sensor data
- Real-time threshold monitoring for proactive risk assessment
- Automatic severity adjustment when sensor values exceed safe limits

### 10.4 Dynamic Charger Health Scoring
- Rolling health score assigned to each charger\n- Score degrades based on fault impact and frequency
- At-a-glance indicator of asset reliability for operators
- Continuous score updates reflecting current operational status
- Integration with predictive failure module for comprehensive risk assessment

### 10.5 Intelligence Engine Benefits
- Smarter decision-making through contextual analysis
- Reduced false alarms by understanding fault patterns
- Prioritized maintenance actions based on true operational risk
- Enhanced asset reliability tracking
- Proactive risk mitigation through continuous monitoring

---

## 11. Help & Documentation Features

### 11.1 Contextual Tooltips
One-line definitions for Indian EV terms:
- **OCPP**: Open Charge Point Protocol for charger communication
- **BMS**: Battery Management System in electric vehicles
- **Tariff**: Charging rate per kWh in INR
- **kWh**: Kilowatt-hour, unit of energy delivered
- **Session**: Single charging transaction from start to stop
\n### 11.2 Help Section
- Quick start guide\n- Module-specific documentation
- FAQ section\n- Sample data download links
- Contact support information

---

## 12. Export Capabilities

### 12.1 Export Formats
- PDF: Formatted reports with charts and tables
- CSV: Raw data tables
- Excel (XLSX): Structured workbooks with multiple sheets
\n### 12.2 Exportable Content
- Fault analysis reports
- Cost analysis summaries
- Predictive failure alerts
- Site performance reports
- Charger analytics data
- Visual charts and graphs

### 12.3 Export Controls
- Export buttons positioned consistently across modules
- Batch export option for multiple reports
- Custom date range selection for exports
- Preview before download functionality

---

## 13. Technical Architecture

### 13.1 Data Processing\n- Client-side processing only\n- Session-based temporary data handling
- No backend database storage for uploaded files
- User authentication data stored securely
- All processing runs in memory\n- Data cleared after session ends

### 13.2 Workflow\nUpload → Process → Show Insights → Export
\n### 13.3 Runtime Error Fix
- Issue: 'Cannot read properties of null (reading useRef)' in BrowserRouter
- Solution: Ensure React context is properly initialized before BrowserRouter renders. Verify React and React-DOM versions compatibility (both 18.3.1). Wrap BrowserRouter in proper React root element with no null references in parent components.
- Implementation: Use ReactDOM.createRoot correctly and ensure BrowserRouter renders after React context initialization.

---

## 14. Branding & Visual Identity

### 14.1 Brand Elements
- **Name**: FoloCharge
- **Logo**: Simple electric bolt + F text combination
- **Footer Credit**: Built by Folonite
\n### 14.2 Brand Application
Consistent branding across:\n- Page headers
- Tooltips
- Buttons
- Loading screens
- Export documents
- Error messages

---

## 15. Design Style\n
### 15.1 Color Scheme
- **Primary**: Electric Blue (#007BFF) for main actions and highlights
- **Background**: Midnight Black (#0A0A0A) for sidebar and headers
- **Content Background**: Pure White (#FFFFFF) for main content areas
- **Accent**: Neon Cyan (#04D9FF) for interactive elements and hover states
- **Status Colors**:
  - Green (#28A745): Normal, Healthy
  - Yellow (#FFC107): Warning, Monitor\n  - Orange (#F97316): High Risk, Underutilized
  - Red (#DC2626): Critical, Dead Chargers
  - Blue (#007BFF): Info, General alerts

### 15.2 Visual Elements
- **Card Layout**: Spacious cards with subtle shadows (02px 8px rgba(0,0,0,0.1)),12px rounded corners
- **Typography**: High-contrast, bold headings (24-32px), readable body text (14-16px), large numbers for metrics (36-48px)
- **Iconography**: Consistent icon set for all modules and actions,24px standard size
- **Animations**: Fade-in on page load (300ms), slide-up for cards (400ms), hover shadows with smooth transitions (200ms), smooth page transitions between modules
- **Spacing**: Consistent 16px/24px/32px grid system, generous whitespace for readability

### 15.3 Layout Structure
- **Sidebar**: Fixed left vertical navigation (240px width), collapsible on smaller screens
- **Main Content**: Full-width content area with max-width 1400px, centered alignment
- **Dashboard Grid**: Responsive grid layout (4 columns on desktop, 2 on tablet, 1 on mobile)
- **Card Hierarchy**: Large cards for primary metrics, medium cards for secondary widgets, small cards for alerts
\n### 15.4 Interactive Components
- **Buttons**: Primary (Electric Blue), Secondary (outlined), Danger (Red for critical actions), all with hover and active states
- **Input Fields**: Clean borders, focus states with blue outline, inline validation messages
- **Tables**: Alternating row colors, sortable headers with icons, hover row highlighting
- **Charts**: Interactive with hover tooltips, color-coded by category, smooth animations on load
- **Badges**: Rounded pill shape, color-coded by severity, consistent sizing (24px height)

### 15.5 Responsive Design
- Full desktop experience (1920px+)
- Tablet optimization (768px-1024px)
- Collapsible sidebar on smaller screens
- Stacked card layout on mobile
- Touch-friendly interactive elements

---

## 16. Key Features Summary

### 16.1 Unified Dashboard
- Single seamless interface combining all four modules
- Executive summary homepage with quick-glance insights
- Left vertical sidebar navigation with collapsible sections
- Consistent branding and visual hierarchy throughout

### 16.2 Premium UI/UX
- Enterprise-level design quality comparable to Datadog, Amplitude, ChargeLab
- Clean, structured layout with spacious cards
- High-contrast typography and bold numbers
- Smooth animations and transitions
- Comprehensive iconography\n- Contextual help tooltips

### 16.3 Comprehensive Analytics
- Fault diagnosis with 11 fault types
- INR-based cost analysis
- Predictive failure detection with health scoring
- Multi-site revenue and utilization analysis
- Charger-level performance categorization
- Rule-based business recommendations
- Context-aware intelligence engine for smarter decision-making

### 16.4 Export & Reporting
- Multiple export formats (PDF, CSV, Excel)
- Customizable report generation
- Visual charts and graphs included
- Batch export capabilities
\n### 16.5 Flexible Access Model
- Public demo mode with sample data (no authentication)\n- Invite-only user onboarding
- Admin-controlled approval workflow
- Custom file upload for approved users only

---
\n## 17. Version Information
- **Current Version**: v1.0\n- **Built by**: Folonite
- **Platform**: Web-based SaaS
- **Target Market**: Indian EV charging station operators
\n---

## 18. Vendor-Agnostic Log Format Detection (Autodetect Engine)

### 18.1 Purpose
Automatically detect and normalize log formats from ANY EV charger vendor in India without requiring manual user configuration.

### 18.2 Supported Vendors & Formats
The autodetection engine supports logs from:
- Delta\n- ABB
- Exicom
- Servotech
- Fortum
- Statiq
- Tata Power style reports
- Charge+Zone
- OCPP 1.6J Standard logs
- Custom OEM diagnostic files
- JSON-based telemetry dumps
- TXT console dumps

### 18.3 Format Autodetection Logic
\n####18.3.1 File Structure Detection
- **CSV Header Matching**: Identify columns like eventType, meterValue, evseId\n- **JSON Key Recognition**: Detect keys such as connectorId, measurand, reason
- **TXT Line Format Parsing**: Recognize patterns like [2024-12-0114:00:01] ERROR: ...
\n#### 18.3.2 Vendor Signature Recognition
Identify unique vendor identifiers:
- 'EXICOM-CP'\n- 'ABB_ERR_'\n- 'DELTA:OCPP'\n- 'CHARGEZONE LOG BLOCK'
- 'STQ_EVT'\n\n#### 18.3.3OCPP Event Pattern Recognition
Recognize standard OCPP events:
- BootNotification
- MeterValues
- StatusNotification
- Heartbeat
- StartTransaction
- StopTransaction\n\n### 18.4 Auto-Mapping Fields
\n#### 18.4.1 Standard FoloCharge Fields
- timestamp
- errorCode
- connectorId
- status
- voltage
- current
- meterValue
- temperature
- vendorErrorString
- restartCount
\n#### 18.4.2Vendor Field Mapping Examples
- Err_Code → errorCode
- EVSE_ID → connectorId
- Temp_C → temperature
- Volt_R / Volt_S / Volt_T → voltage
\n### 18.5 Validation Layer
\n#### 18.5.1 Data Quality Checks
Detect and handle:\n- Missing timestamps
- Corrupted timestamps
- Invalid connector numbers
- Empty lines
- Broken JSON structures
\n#### 18.5.2 Validation Warnings
Display user-friendly messages:
- '32 invalid entries were fixed automatically.'
- 'Timestamp format normalized from vendor-specific to ISO 8601.'
- 'Missing connector IDs assigned default values.'

### 18.6 UI Integration

#### 18.6.1 Module Integration
Autodetection applies to:
- Fault Diagnoser
- Predictive Failure
- Cost Analysis
\n#### 18.6.2 Detection Banner
Display small banner after file upload:
- 'Vendor detected: ABB (OCPP 1.6J Pattern)'
- 'Logs normalized for analysis.'
- Color-coded by detection confidence (Green: High confidence, Yellow: Partial match, Orange: Manual review suggested)

#### 18.6.3 Detection Details Panel (Optional)
Collapsible panel showing:
- Detected vendor name
- Log format type
- Number of entries processed
- Number of entries corrected
- Field mapping summary

### 18.7 Processing Workflow
1. User uploads log file (CSV/JSON/TXT)
2. Autodetection engine analyzes file structure and content
3. Vendor signature identified
4. Fields auto-mapped to standard format
5. Validation layer corrects data quality issues
6. Detection banner displayed
7. Normalized data passed to analysis modules
8. User proceeds with fault diagnosis, cost analysis, or predictive failure detection

### 18.8 Technical Implementation
- Client-side processing only (no backend required)
- Pattern matching algorithms for vendor detection
- Field mapping dictionary for all supported vendors
- Validation rules engine for data quality checks
- Real-time processing with progress indicator
- Error handling for unsupported formats with user guidance

### 18.9 Deliverables
- Vendor autodetection engine
- Auto-field mapping system
- Data normalizer
- Validation layer with auto-correction
- Unified output format for all modules
- Detection banner UI component
- User-friendly error messages for unsupported formats