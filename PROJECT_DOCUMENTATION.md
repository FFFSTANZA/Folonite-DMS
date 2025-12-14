# Folonite DMS - Diagnostic Management System

## 📋 Project Overview

**Folonite DMS** (Diagnostic Management System) is a comprehensive web-based diagnostic tool designed specifically for Indian EV charging station owners and operators. The platform provides intelligent fault analysis, root cause identification, and revenue loss calculations to help optimize charging infrastructure operations.

### 🎯 Core Purpose
Folonite DMS analyzes charger log files to detect faults, categorize issues, provide actionable resolution guidance, and calculate financial impact in Indian Rupees (INR).

### 👥 Target Audience
- EV charging station owners in India
- Charging infrastructure operators
- Fleet management companies
- Facility maintenance teams

---

## 🚀 Key Features

### 1. **Intelligent Log Analysis**
- Multi-format support (CSV, JSON, TXT)
- Automatic field extraction and parsing
- Real-time fault detection
- Pattern recognition across 11 fault categories

### 2. **Comprehensive Fault Diagnosis**
- 11 pre-defined fault types with detailed analysis
- Severity classification (Low, Medium, High)
- Root cause identification
- Impact assessment on charging uptime

### 3. **Financial Impact Analysis**
- Revenue loss calculation in INR
- Customizable business parameters
- Daily and monthly loss tracking
- Cost ranking by fault type

### 4. **Actionable Insights**
- Clear resolution guidance for each fault
- Technician requirement identification
- Vendor support recommendations
- Priority-based action items

### 5. **Data Export Capabilities**
- PDF report generation
- CSV data export
- Comprehensive fault documentation
- Shareable analysis reports

### 6. **No-Login Architecture**
- Instant access without authentication
- Session-based data processing
- Privacy-focused design
- No permanent data storage

---

## 📊 Application Structure

### Navigation Tabs

The application consists of 6 main tabs accessible via the sidebar:

#### 1. **Dashboard Home** (`/`)
**Purpose:** Provides a high-level overview of charging operations and system health.

**Features:**
- **Import Data Button:** Prominent button (top right) to access the data import page
- **Key Metrics Cards:**
  - Today's Faults: Total number of faults detected today
  - Today's Revenue Loss: Financial impact in INR for current day
  - This Month's Loss: Cumulative monthly revenue loss
  - Critical Alerts: Number of high-priority issues requiring immediate attention
  - High-Risk Chargers: Count of chargers with recurring problems
  - Average Health Score: Overall system health percentage

- **Top Performing Sites:**
  - Revenue ranking by location
  - Session count per site
  - Performance comparison

- **Fault Distribution Chart:**
  - Visual breakdown of fault types
  - Color-coded severity indicators
  - Count-based prioritization

- **Sites Needing Attention:**
  - Critical issue alerts
  - Risk level classification
  - Quick action recommendations

**What It Does:**
- Displays real-time operational metrics
- Highlights critical issues requiring immediate attention
- Provides quick access to data import functionality
- Shows performance trends across multiple sites
- Enables rapid decision-making with visual dashboards

---

#### 2. **Data Import** (`/data-import`)
**Purpose:** Dedicated page for uploading and processing charger log files.

**Features:**
- **Universal Upload Component:**
  - Drag-and-drop file upload interface
  - Multi-format support (CSV, JSON, TXT)
  - Automatic file type detection
  - Real-time parsing feedback
  - Progress indicators

- **Supported Formats Card:**
  - CSV - Comma-separated values
  - JSON - JavaScript Object Notation
  - TXT - Plain text log files

- **What Happens Next Card:**
  - Automatic fault detection explanation
  - Root cause analysis process
  - Revenue loss calculation methodology

- **Important Notes Card:**
  - Local processing emphasis
  - No permanent data storage
  - Session-based analysis only
  - Privacy and security information

- **Help Section:**
  - Required log file fields documentation
  - Field descriptions (errorCode, timestamp, connectorId, meterValue, temperature, voltage, current, status)
  - Link to detailed documentation

**What It Does:**
- Accepts charger log files in multiple formats
- Parses and validates log data
- Extracts key fault indicators
- Processes data for analysis
- Provides context and guidance for users
- Ensures data privacy with local processing

**Access:** Click the "Import Data" button on the Dashboard Home (top right corner)

---

#### 3. **Fault Diagnosis** (`/fault-diagnosis`)
**Purpose:** Detailed fault analysis with comprehensive information about each detected issue.

**Features:**
- **Fault Summary Panel:**
  - Total faults detected
  - Severity distribution
  - Quick statistics overview

- **Fault Details Cards:**
  Each fault is displayed in a dedicated card with two sections:

  **Section 1 - Header Information:**
  - **Timestamp:** Date and time of fault occurrence
  - **Fault Type:** Category with color-coded indicator
  - **Connector ID:** Specific charger connector identifier
  - **Severity Badge:** Visual severity level (Low/Medium/High)

  **Section 2 - Detailed Analysis (3-Column Grid):**
  - **Description (Blue Border):**
    - What happened during the fault
    - Observable symptoms
    - System behavior

  - **Root Cause (Yellow Border):**
    - Why the fault occurred
    - Underlying technical reasons
    - Contributing factors

  - **Resolution (Green Border):**
    - How to fix the issue
    - Required resources (electrician, vendor support, local reset)
    - Step-by-step guidance
    - Prevention recommendations

- **Export Options:**
  - Export to PDF: Complete fault report with all details
  - Export to CSV: Data table for further analysis

**What It Does:**
- Categorizes faults into 11 predefined types:
  1. Overcurrent
  2. Overvoltage
  3. Low grid voltage
  4. Overheating
  5. BMS communication mismatch
  6. OCPP network disconnect
  7. Power module failure
  8. Vehicle-side abort
  9. Emergency stop
  10. Contactor stuck
  11. Repeated soft restarts

- Provides detailed analysis for each fault
- Offers actionable resolution steps
- Enables export for documentation and sharing
- Uses color-coded visual indicators for quick scanning
- Displays information in a clean, card-based layout

**Layout Design:**
- Card-based layout (no table collision)
- Responsive design (mobile and desktop)
- Color-coded sections for easy identification
- Generous spacing for readability
- Hover effects for interactivity

---

#### 4. **Cost Analysis** (`/cost-analysis`)
**Purpose:** Financial impact assessment and revenue loss calculation in Indian Rupees.

**Features:**
- **Revenue Loss Calculator:**
  - Customizable business parameters
  - **Average Session Value (INR):** Default ₹120, user-editable
  - **Average Sessions per Day:** Default 14, user-editable
  - Real-time calculation updates

- **Financial Metrics:**
  - **Revenue Lost Today:** Daily financial impact
  - **Revenue Lost This Month:** Monthly cumulative loss
  - **Projected Annual Loss:** Yearly impact projection
  - **Average Loss per Fault:** Per-incident cost

- **Top 5 Costliest Faults:**
  - Ranked by financial impact
  - Fault type identification
  - Individual loss amounts
  - Percentage of total loss

- **Downtime Analysis:**
  - Hours of downtime per fault
  - Correlation between fault type and revenue loss
  - Cost-per-hour calculations

- **Visual Charts:**
  - Revenue loss trends over time
  - Fault cost distribution
  - Monthly comparison graphs

**What It Does:**
- Calculates revenue loss using formula:
  ```
  Loss = avg_sessions_per_day × avg_ticket_size_in_INR × (downtime_hours/24)
  ```
- Provides customizable business parameters
- Ranks faults by financial impact
- Helps prioritize maintenance based on cost
- Enables budget planning for repairs
- Supports ROI analysis for infrastructure improvements

**Business Value:**
- Quantifies the cost of downtime
- Justifies maintenance investments
- Identifies highest-impact issues
- Supports data-driven decision making

---

#### 5. **Predictive Failure** (`/predictive`)
**Purpose:** Proactive maintenance recommendations and failure prediction.

**Features:**
- **Predictive Analytics Dashboard:**
  - Machine learning-based predictions
  - Historical pattern analysis
  - Failure probability scoring

- **Early Warning System:**
  - Chargers at risk of failure
  - Predicted failure timeline
  - Confidence level indicators

- **Maintenance Recommendations:**
  - Preventive maintenance schedule
  - Component replacement suggestions
  - Optimal maintenance timing

- **Risk Assessment:**
  - High-risk charger identification
  - Failure pattern recognition
  - Trend analysis

**What It Does:**
- Analyzes historical fault data
- Identifies patterns leading to failures
- Predicts potential future faults
- Recommends preventive actions
- Reduces unexpected downtime
- Optimizes maintenance scheduling

**Benefits:**
- Prevents costly emergency repairs
- Extends equipment lifespan
- Improves operational efficiency
- Reduces total cost of ownership

---

#### 6. **Performance Analytics** (`/performance-analytics`)
**Purpose:** Comprehensive performance metrics and operational insights.

**Features:**
- **Charger Performance Metrics:**
  - Uptime percentage
  - Availability statistics
  - Utilization rates
  - Session success rates

- **Comparative Analysis:**
  - Site-by-site comparison
  - Connector performance ranking
  - Time-based trends

- **Operational Insights:**
  - Peak usage hours
  - Average session duration
  - Energy delivery efficiency
  - Customer satisfaction indicators

- **Performance Trends:**
  - Historical performance graphs
  - Month-over-month comparisons
  - Seasonal patterns

- **Benchmarking:**
  - Industry standard comparisons
  - Best-performing sites
  - Improvement opportunities

**What It Does:**
- Tracks key performance indicators (KPIs)
- Identifies top and bottom performers
- Reveals operational patterns
- Supports capacity planning
- Enables performance optimization
- Provides data for strategic decisions

**Use Cases:**
- Optimize charging station placement
- Identify underperforming assets
- Plan infrastructure expansion
- Improve customer experience

---

## 🔧 Technical Specifications

### Supported Log File Formats

#### CSV (Comma-Separated Values)
```csv
timestamp,errorCode,connectorId,meterValue,temperature,voltage,current,status
2024-01-15 10:30:00,OC001,CHG-01,45.2,85,230,32,Faulted
```

#### JSON (JavaScript Object Notation)
```json
{
  "timestamp": "2024-01-15 10:30:00",
  "errorCode": "OC001",
  "connectorId": "CHG-01",
  "meterValue": 45.2,
  "temperature": 85,
  "voltage": 230,
  "current": 32,
  "status": "Faulted"
}
```

#### TXT (Plain Text)
```
[2024-01-15 10:30:00] ERROR: OC001 | Connector: CHG-01 | Temp: 85°C | Status: Faulted
```

### Required Log Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| **errorCode** | String | Unique fault identifier | OC001, OV002, OCPP-DC |
| **timestamp** | DateTime | When the fault occurred | 2024-01-15 10:30:00 |
| **connectorId** | String | Charger connector ID | CHG-01, CHG-MUM-02 |
| **meterValue** | Number | Energy meter reading (kWh) | 45.2 |
| **temperature** | Number | Charger temperature (°C) | 85 |
| **voltage** | Number | Grid voltage (V) | 230 |
| **current** | Number | Current draw (A) | 32 |
| **status** | String | OCPP status | Available, Charging, Faulted |

### Optional Fields
- `transactionStopReason`: Why charging stopped
- `vendorErrorCode`: Manufacturer-specific codes
- `bmsStatus`: Battery Management System status
- `powerModuleStatus`: Power module health

---

## 🎨 User Interface Design

### Design Philosophy
Folonite DMS follows a **premium, professional design** approach with:
- Clean, modern aesthetics
- Intuitive navigation
- Color-coded information hierarchy
- Responsive layouts for all devices
- Accessibility-first design

### Color Scheme

#### Primary Colors
- **Primary Blue (#2563EB):** Main brand color, primary actions
- **Accent Blue:** Secondary highlights
- **Neutral Gray (#F3F4F6):** Backgrounds
- **Dark Gray (#1F2937):** Primary text

#### Semantic Colors
- **Red (#DC2626):** High severity, critical alerts
- **Yellow (#F59E0B):** Medium severity, warnings
- **Green (#10B981):** Low severity, success states
- **Blue (#3B82F6):** Informational messages

### Visual Elements

#### Cards
- Subtle shadows (0 1px 3px rgba(0,0,0,0.1))
- 8px rounded corners
- Hover effects with smooth transitions
- Premium shadow on important cards

#### Typography
- Bold headings for hierarchy
- Clear, readable body text
- Monospace for technical data (IDs, codes)
- Consistent font sizing

#### Badges
- Color-coded severity indicators
- Outlined style for connectors
- Solid style for status

#### Buttons
- Gradient backgrounds for primary actions
- Shadow effects for depth
- Icon + text combinations
- Hover state animations

### Responsive Design
- **Desktop (≥1024px):** Multi-column layouts, full feature set
- **Tablet (768px-1023px):** Adapted layouts, maintained functionality
- **Mobile (<768px):** Stacked layouts, touch-optimized

---

## 📈 Fault Categories

### 1. Overcurrent
- **Description:** Current draw exceeds safe limits
- **Common Causes:** Vehicle battery issues, power module malfunction
- **Severity:** High
- **Resolution:** Check vehicle BMS, inspect power module

### 2. Overvoltage
- **Description:** Grid voltage exceeds acceptable range
- **Common Causes:** Grid instability, voltage regulator failure
- **Severity:** High
- **Resolution:** Contact utility provider, check voltage regulator

### 3. Low Grid Voltage
- **Description:** Insufficient voltage from grid
- **Common Causes:** Grid issues, high load on circuit
- **Severity:** Medium
- **Resolution:** Verify grid connection, check circuit capacity

### 4. Overheating
- **Description:** Charger temperature exceeds safe limits
- **Common Causes:** Poor ventilation, ambient temperature, continuous operation
- **Severity:** High
- **Resolution:** Improve ventilation, install cooling system

### 5. BMS Communication Mismatch
- **Description:** Communication failure between charger and vehicle BMS
- **Common Causes:** Protocol incompatibility, cable issues
- **Severity:** Medium
- **Resolution:** Check cable connections, update firmware

### 6. OCPP Network Disconnect
- **Description:** Loss of connection to OCPP backend
- **Common Causes:** Network issues, server downtime
- **Severity:** Medium
- **Resolution:** Check network connectivity, verify server status

### 7. Power Module Failure
- **Description:** Internal power module malfunction
- **Common Causes:** Component failure, electrical surge
- **Severity:** High
- **Resolution:** Contact vendor, replace power module

### 8. Vehicle-Side Abort
- **Description:** Vehicle initiated charging stop
- **Common Causes:** Vehicle BMS protection, user action
- **Severity:** Low
- **Resolution:** Check vehicle status, verify user intent

### 9. Emergency Stop
- **Description:** Emergency stop button activated
- **Common Causes:** Safety concern, user action
- **Severity:** High
- **Resolution:** Inspect for safety issues, reset after clearance

### 10. Contactor Stuck
- **Description:** Electrical contactor failed to open/close
- **Common Causes:** Mechanical wear, electrical fault
- **Severity:** High
- **Resolution:** Replace contactor, inspect wiring

### 11. Repeated Soft Restarts
- **Description:** Charger repeatedly restarting
- **Common Causes:** Software bug, power supply issues
- **Severity:** Medium
- **Resolution:** Update firmware, check power supply stability

---

## 💼 Business Use Cases

### 1. Daily Operations Management
**Scenario:** Station manager starts their day
- Opens Dashboard Home
- Reviews overnight faults
- Checks revenue loss
- Identifies critical issues
- Dispatches maintenance team

### 2. Maintenance Planning
**Scenario:** Maintenance coordinator plans weekly schedule
- Reviews Fault Diagnosis page
- Identifies recurring issues
- Checks Predictive Failure warnings
- Prioritizes based on Cost Analysis
- Schedules preventive maintenance

### 3. Financial Reporting
**Scenario:** Operations director prepares monthly report
- Exports Cost Analysis data
- Reviews revenue loss trends
- Identifies costliest fault types
- Justifies maintenance budget
- Plans infrastructure improvements

### 4. Performance Optimization
**Scenario:** Fleet manager optimizes charging network
- Analyzes Performance Analytics
- Compares site performance
- Identifies underperforming chargers
- Plans equipment upgrades
- Optimizes resource allocation

### 5. Vendor Management
**Scenario:** Procurement manager evaluates vendors
- Reviews fault patterns by charger model
- Analyzes failure rates
- Calculates total cost of ownership
- Makes data-driven purchasing decisions

---

## 🔒 Privacy & Security

### Data Handling
- **Local Processing:** All log analysis happens in the browser
- **No Backend Storage:** No data is sent to external servers
- **Session-Based:** Data cleared when session ends
- **No User Tracking:** No analytics or tracking cookies

### Security Features
- **Client-Side Parsing:** Files never leave user's device
- **No Authentication Required:** No user credentials stored
- **Ephemeral Sessions:** Data exists only during active session
- **Privacy-First Design:** GDPR and data protection compliant

---

## 📱 Responsive Design

### Desktop Experience (≥1024px)
- Full multi-column layouts
- Side-by-side comparisons
- Expanded data tables
- Rich visualizations
- Hover interactions

### Tablet Experience (768px-1023px)
- Adapted 2-column layouts
- Touch-optimized controls
- Maintained functionality
- Readable typography

### Mobile Experience (<768px)
- Single-column stacked layouts
- Touch-friendly buttons
- Simplified navigation
- Optimized card layouts
- Full feature access

---

## 🚀 Getting Started

### For First-Time Users

1. **Access the Application**
   - Open Folonite DMS in your web browser
   - No login required - instant access

2. **Import Your Data**
   - Click "Import Data" button on Dashboard Home (top right)
   - Drag and drop your charger log file (CSV, JSON, or TXT)
   - Wait for automatic parsing and analysis

3. **Review Dashboard**
   - Return to Dashboard Home
   - Review key metrics and alerts
   - Identify critical issues

4. **Analyze Faults**
   - Navigate to Fault Diagnosis tab
   - Review each fault card
   - Read descriptions, root causes, and resolutions
   - Export reports if needed

5. **Assess Financial Impact**
   - Go to Cost Analysis tab
   - Customize business parameters (session value, daily sessions)
   - Review revenue loss calculations
   - Identify costliest faults

6. **Plan Maintenance**
   - Check Predictive Failure tab for early warnings
   - Review Performance Analytics for trends
   - Prioritize actions based on severity and cost

---

## 📊 Export Capabilities

### PDF Export
**Available From:** Fault Diagnosis page

**Contents:**
- Complete fault list with all details
- Timestamp, fault type, connector ID
- Severity levels
- Descriptions, root causes, resolutions
- Professional formatting
- Print-ready layout

**Use Cases:**
- Maintenance reports
- Vendor communication
- Management presentations
- Documentation archives

### CSV Export
**Available From:** Fault Diagnosis page

**Contents:**
- Structured data table
- All fault fields
- Timestamp, errorCode, connectorId
- Severity, description, rootCause, resolution
- Importable into Excel/Google Sheets

**Use Cases:**
- Further data analysis
- Custom reporting
- Integration with other systems
- Historical tracking

---

## 🎯 Key Benefits

### For Station Owners
- **Reduce Downtime:** Quick fault identification and resolution
- **Minimize Revenue Loss:** Prioritize high-impact issues
- **Optimize Maintenance:** Data-driven scheduling
- **Improve ROI:** Better asset utilization

### For Operations Teams
- **Faster Diagnosis:** Automated fault categorization
- **Clear Guidance:** Step-by-step resolution instructions
- **Better Planning:** Predictive maintenance insights
- **Efficient Reporting:** One-click export capabilities

### For Maintenance Teams
- **Actionable Information:** Know exactly what to fix
- **Resource Planning:** Identify required skills and parts
- **Priority Management:** Focus on critical issues first
- **Knowledge Base:** Learn from fault patterns

### For Management
- **Financial Visibility:** Quantified revenue impact
- **Performance Metrics:** Track operational efficiency
- **Strategic Planning:** Data-driven infrastructure decisions
- **Vendor Accountability:** Evidence-based evaluations

---

## 🔄 Workflow Example

### Complete Analysis Workflow

```
1. DATA IMPORT
   ↓
   User uploads log file (CSV/JSON/TXT)
   ↓
   System parses and validates data
   ↓
   Faults extracted and categorized

2. DASHBOARD REVIEW
   ↓
   View key metrics and alerts
   ↓
   Identify critical issues
   ↓
   Check revenue impact

3. FAULT ANALYSIS
   ↓
   Review detailed fault cards
   ↓
   Understand root causes
   ↓
   Note resolution steps

4. COST ASSESSMENT
   ↓
   Calculate revenue loss
   ↓
   Identify costliest faults
   ↓
   Prioritize by financial impact

5. PREDICTIVE INSIGHTS
   ↓
   Check failure predictions
   ↓
   Plan preventive maintenance
   ↓
   Optimize scheduling

6. PERFORMANCE TRACKING
   ↓
   Review operational metrics
   ↓
   Compare site performance
   ↓
   Identify improvement opportunities

7. ACTION & EXPORT
   ↓
   Export reports (PDF/CSV)
   ↓
   Dispatch maintenance teams
   ↓
   Track resolution progress
```

---

## 🛠️ Technical Architecture

### Frontend Stack
- **Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Routing:** React Router v6
- **State Management:** React Context + Hooks
- **Icons:** Lucide React

### Key Technologies
- **File Parsing:** Client-side CSV/JSON/TXT parsing
- **PDF Generation:** Browser-based PDF export
- **Data Visualization:** Custom chart components
- **Responsive Design:** Mobile-first approach

### Performance Optimizations
- Lazy loading for routes
- Optimized re-renders with React.memo
- Efficient state management
- Code splitting
- Asset optimization

---

## 📞 Support & Documentation

### Help Resources
- **In-App Help:** Click "Help" in sidebar
- **Documentation:** Comprehensive guides for each feature
- **FAQ:** Common questions and answers
- **Sample Files:** Example log files for testing

### Best Practices
1. **Regular Uploads:** Upload logs daily for best insights
2. **Customize Parameters:** Adjust business values for accurate calculations
3. **Review Predictions:** Check predictive failure warnings weekly
4. **Export Reports:** Document all major incidents
5. **Track Trends:** Monitor performance metrics over time

---

## 🎓 Training Guide

### For New Users (15 minutes)
1. **Introduction (3 min):** Overview of Folonite DMS purpose and benefits
2. **Data Import (5 min):** How to upload and process log files
3. **Dashboard Tour (3 min):** Understanding key metrics and navigation
4. **Fault Analysis (4 min):** Reading fault cards and taking action

### For Power Users (30 minutes)
1. **Advanced Analysis (10 min):** Deep dive into fault patterns
2. **Cost Optimization (8 min):** Using financial data for decisions
3. **Predictive Maintenance (7 min):** Leveraging predictions
4. **Reporting (5 min):** Creating and exporting comprehensive reports

---

## 🔮 Future Enhancements

### Planned Features
- Real-time log streaming
- Multi-site comparison dashboard
- Custom alert thresholds
- Email notifications
- Mobile app version
- API integration capabilities
- Advanced ML predictions
- Historical trend analysis
- Custom report templates
- Team collaboration features

---

## 📄 Version Information

**Current Version:** 1.0.0  
**Release Date:** January 2024  
**Platform:** Web Application  
**Browser Support:** Chrome, Firefox, Safari, Edge (latest versions)  
**Mobile Support:** iOS Safari, Chrome Mobile  

---

## 📝 License & Credits

**Application Name:** Folonite DMS (Diagnostic Management System)  
**Target Market:** Indian EV Charging Infrastructure  
**Currency:** Indian Rupees (INR)  
**Language:** English  

---

## 🎉 Conclusion

Folonite DMS is a comprehensive, user-friendly diagnostic tool that empowers EV charging station operators with actionable insights, financial visibility, and predictive maintenance capabilities. By combining intelligent fault analysis with business-focused metrics, it helps reduce downtime, minimize revenue loss, and optimize charging infrastructure operations.

**Start using Folonite DMS today to transform your charging station management!**

---

*For questions, feedback, or support, please refer to the Help section within the application.*
