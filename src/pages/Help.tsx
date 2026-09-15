import { 
  Activity, 
  AlertTriangle, 
  BarChart3, 
  CheckCircle, 
  Database,
  FileText, 
  FileUp,
  HelpCircle, 
  Lightbulb,
  Settings, 
  Shield,
  TrendingUp,
  Zap 
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Help() {
  const evTerms = [
    {
      term: 'OCPP',
      definition: 'Open Charge Point Protocol - A standard communication protocol between charging stations and management systems',
      importance: 'Critical for remote monitoring and control'
    },
    {
      term: 'BMS',
      definition: 'Battery Management System - Electronic system that manages a rechargeable battery to ensure safe operation',
      importance: 'Handles vehicle-charger communication'
    },
    {
      term: 'Tariff',
      definition: 'Pricing structure for charging services, typically measured in ₹/kWh or ₹/session',
      importance: 'Determines revenue per charging session'
    },
    {
      term: 'kWh',
      definition: 'Kilowatt-hour - Unit of energy equal to 1000 watts used for one hour',
      importance: 'Standard unit for measuring energy delivered'
    },
    {
      term: 'Session',
      definition: 'A complete charging event from connection to disconnection, including energy delivered and duration',
      importance: 'Basic unit for revenue and utilization tracking'
    },
    {
      term: 'Connector',
      definition: 'Physical interface on a charger where vehicles plug in (e.g., CCS, CHAdeMO, Type 2)',
      importance: 'Multiple connectors per charger increase capacity'
    },
    {
      term: 'Uptime',
      definition: 'Percentage of time a charger is operational and available for use',
      importance: 'Key metric for reliability and revenue potential'
    },
    {
      term: 'Utilization',
      definition: 'Percentage of time a charger is actively being used for charging',
      importance: 'Indicates demand and revenue efficiency'
    },
    {
      term: 'Contactor',
      definition: 'Electrical switch that controls power flow to the vehicle',
      importance: 'Critical safety component that can fail'
    },
    {
      term: 'Power Module',
      definition: 'Internal component that converts AC grid power to DC for vehicle charging',
      importance: 'Core component; failure causes complete downtime'
    }
  ];

  const faultTypes = [
    {
      name: 'Overcurrent',
      severity: 'High',
      description: 'Current exceeded safe operating limits',
      commonCauses: ['Faulty vehicle battery', 'Damaged charging cable', 'Internal sensor malfunction'],
      resolution: 'Inspect cable and vehicle connector. Replace if damaged. Contact electrician.',
      preventiveMeasure: 'Regular cable inspections, proper cable management'
    },
    {
      name: 'Overheating',
      severity: 'Critical',
      description: 'Temperature sensors detected excessive heat',
      commonCauses: ['Inadequate cooling', 'High ambient temperature', 'Blocked ventilation', 'Component aging'],
      resolution: 'Clean cooling vents. Check ambient temperature. Improve ventilation.',
      preventiveMeasure: 'Monthly cleaning, ensure proper airflow, monitor ambient conditions'
    },
    {
      name: 'OCPP Network Disconnect',
      severity: 'Medium',
      description: 'Lost connection to OCPP backend server',
      commonCauses: ['Network infrastructure issue', 'Server downtime', 'Router/modem failure', 'ISP problems'],
      resolution: 'Verify network connection. Check backend server status. Restart router if needed.',
      preventiveMeasure: 'Redundant network connections, UPS for network equipment'
    },
    {
      name: 'BMS Communication Mismatch',
      severity: 'Medium',
      description: 'Vehicle BMS communication protocol mismatch',
      commonCauses: ['Incompatible vehicle model', 'Outdated charger firmware', 'Protocol version mismatch'],
      resolution: 'Update charger firmware. Check vehicle compatibility list.',
      preventiveMeasure: 'Regular firmware updates, maintain compatibility database'
    },
    {
      name: 'Power Module Failure',
      severity: 'Critical',
      description: 'Internal power conversion module malfunction',
      commonCauses: ['Component aging', 'Manufacturing defect', 'Power surge damage', 'Thermal stress'],
      resolution: 'Replace power module. Contact vendor for replacement part.',
      preventiveMeasure: 'Surge protection, regular maintenance, thermal monitoring'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Help & Documentation</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive guide to using DMS effectively for EV charging station management
        </p>
      </div>

      {/* System Overview Alert */}
      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>What is DMS?</AlertTitle>
        <AlertDescription>
          DMS (Diagnostic Management System) is an advanced fault diagnosis and performance analytics platform 
          designed specifically for Indian EV charging station operators. It combines fault detection, 
          predictive maintenance, revenue analytics, and actionable recommendations to maximize uptime and profitability.
        </AlertDescription>
      </Alert>

      {/* Quick Start Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Quick Start Guide
          </CardTitle>
          <CardDescription>Get started with DMS in 3 simple steps</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="font-semibold">Import Your Data</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Go to <strong>Data Import</strong> page and upload your charger logs (CSV, JSON, or TXT) and/or 
                session revenue data (CSV). You can also load sample data to explore features.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>Tip:</strong> Use the "Load Sample Data" button to see all features in action before uploading your own data.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="font-semibold">Review Analysis & Insights</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Navigate through different modules to view automated analysis:
              </p>
              <ul className="text-sm text-muted-foreground mt-1 ml-4 space-y-1">
                <li>• <strong>Dashboard:</strong> Real-time overview of faults, revenue loss, and critical alerts</li>
                <li>• <strong>Fault Diagnosis:</strong> Detailed fault classification with root cause analysis</li>
                <li>• <strong>Cost Analysis:</strong> Revenue impact calculations and top costliest faults</li>
                <li>• <strong>Predictive Failure:</strong> At-risk chargers and health scores</li>
                <li>• <strong>Performance Analytics:</strong> Site and charger performance metrics</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="font-semibold">Export Reports & Take Action</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Download comprehensive reports in PDF or CSV format. Use the insights to:
              </p>
              <ul className="text-sm text-muted-foreground mt-1 ml-4 space-y-1">
                <li>• Prioritize maintenance based on risk scores</li>
                <li>• Schedule repairs for critical chargers</li>
                <li>• Optimize pricing and site operations</li>
                <li>• Track performance improvements over time</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Import Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Data Import Guide
          </CardTitle>
          <CardDescription>Detailed instructions for uploading and managing your data</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="universal-import">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <FileUp className="h-4 w-4 text-primary" />
                  <span>Universal Data Import (Recommended)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 text-sm">
                <p className="font-semibold">What is Universal Import?</p>
                <p>
                  Upload your data files once to populate all modules across the dashboard. This is the most efficient 
                  way to get started with DMS.
                </p>
                
                <p className="font-semibold mt-3">Supported Files:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Charger Logs:</strong> CSV, JSON, or TXT format (for fault diagnosis)</li>
                  <li><strong>Session Revenue Data:</strong> CSV format (for performance analytics)</li>
                </ul>

                <p className="font-semibold mt-3">File Size Limits:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Files under 5MB: Instant processing</li>
                  <li>Files 5MB-50MB: Optimized processing with progress indicator</li>
                  <li>Files over 50MB: Automatic optimization to reduce memory usage</li>
                </ul>

                <p className="font-semibold mt-3">Processing Steps:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Select your log file and/or revenue file</li>
                  <li>Click "Process All Data" button</li>
                  <li>Wait for processing to complete (progress shown for large files)</li>
                  <li>All modules will automatically populate with your data</li>
                </ol>

                <Alert className="mt-3">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Pro Tip:</strong> Enable "Use Optimizer" for large files (10,000+ lines) to improve 
                    performance. The optimizer removes duplicate entries and consolidates similar faults.
                  </AlertDescription>
                </Alert>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="log-format">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span>Charger Log File Format</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 text-sm">
                <p className="font-semibold">Required Fields:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>timestamp:</strong> Date and time of the event (ISO 8601 format recommended)</li>
                  <li><strong>errorCode:</strong> Error code from the charger (e.g., ERR-1234, OC-001)</li>
                  <li><strong>connectorId:</strong> Unique identifier for the charger/connector</li>
                </ul>

                <p className="font-semibold mt-3">Optional Fields (Enhance Analysis):</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>temperature:</strong> Temperature reading in °C (triggers sensor-based severity scaling)</li>
                  <li><strong>voltage:</strong> Voltage reading in V (detects overvoltage/undervoltage conditions)</li>
                  <li><strong>current:</strong> Current reading in A (identifies overcurrent situations)</li>
                  <li><strong>meterValue:</strong> Energy meter reading in kWh</li>
                  <li><strong>statusNotification:</strong> OCPP status updates</li>
                  <li><strong>transactionStopReason:</strong> Reason for session termination</li>
                </ul>

                <p className="font-semibold mt-3">Example CSV Format:</p>
                <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`timestamp,errorCode,connectorId,temperature,voltage,current
2025-12-09T10:30:00Z,ERR-1234,CHG-MUM-01,85.5,420,150
2025-12-09T11:45:00Z,OC-002,CHG-DEL-02,72.3,380,120`}
                </pre>

                <p className="font-semibold mt-3">Example JSON Format:</p>
                <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`[
  {
    "timestamp": "2025-12-09T10:30:00Z",
    "errorCode": "ERR-1234",
    "connectorId": "CHG-MUM-01",
    "temperature": 85.5,
    "voltage": 420,
    "current": 150
  }
]`}
                </pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="session-format">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span>Session Revenue Data Format</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 text-sm">
                <p className="font-semibold">Required Fields:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>siteId:</strong> Site name or identifier</li>
                  <li><strong>chargerId:</strong> Unique charger identifier</li>
                  <li><strong>connectorId:</strong> Connector number (1, 2, etc.)</li>
                  <li><strong>startTime:</strong> Session start timestamp</li>
                  <li><strong>stopTime:</strong> Session end timestamp</li>
                  <li><strong>energy_kWh:</strong> Energy delivered in kWh</li>
                  <li><strong>revenueINR:</strong> Revenue earned in Indian Rupees</li>
                </ul>

                <p className="font-semibold mt-3">Optional Fields:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>sessionDurationMin:</strong> Duration in minutes (auto-calculated if not provided)</li>
                  <li><strong>tariffINR:</strong> Tariff rate in ₹/kWh</li>
                </ul>

                <p className="font-semibold mt-3">Example CSV Format:</p>
                <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`siteId,chargerId,connectorId,startTime,stopTime,energy_kWh,revenueINR,tariffINR
Mumbai Central,CHG-MUM-01,1,2025-12-09T08:00:00Z,2025-12-09T09:30:00Z,35.5,355.0,10.0
Delhi Hub,CHG-DEL-02,2,2025-12-09T10:00:00Z,2025-12-09T11:15:00Z,28.3,311.3,11.0`}
                </pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="sample-data">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  <span>Using Sample Data</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 text-sm">
                <p>
                  Sample data is pre-loaded with realistic scenarios to help you understand all features before 
                  uploading your own data.
                </p>

                <p className="font-semibold mt-3">What's Included:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>50 fault records covering all 11 fault types</li>
                  <li>200 charging sessions across 7 sites</li>
                  <li>Critical severity faults for immediate attention alerts</li>
                  <li>Recurring fault patterns (CHG-MUM-01, CHG-DEL-02)</li>
                  <li>Sensor data (temperature, voltage, current)</li>
                  <li>Varied health scores from Critical to Low risk</li>
                  <li>Today's faults for real-time monitoring demonstration</li>
                </ul>

                <p className="font-semibold mt-3">How to Load:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Go to Data Import page</li>
                  <li>Click "Load Sample Data" button</li>
                  <li>All modules will populate instantly</li>
                  <li>Explore features with realistic data</li>
                </ol>

                <Alert className="mt-3">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Note:</strong> Loading sample data will replace any currently loaded data. 
                    You can always upload your own data again.
                  </AlertDescription>
                </Alert>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Module Guides - Enhanced */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Module Guides
          </CardTitle>
          <CardDescription>Detailed information about each DMS module</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="dashboard">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span>Dashboard Overview</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 text-sm">
                <p className="font-semibold">Purpose:</p>
                <p>Real-time overview of your entire EV charging network with key performance indicators</p>
                
                <p className="font-semibold mt-3">Key Metrics:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Today's Faults:</strong> Number of faults detected today (updates in real-time)</li>
                  <li><strong>Downtime Loss:</strong> Revenue lost today and this month due to charger downtime</li>
                  <li><strong>Critical Alerts:</strong> Count of Critical severity faults requiring immediate action</li>
                  <li><strong>Fleet Health:</strong> Average health score across all chargers (0-100%)</li>
                </ul>

                <p className="font-semibold mt-3">Visualizations:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Top Earning Sites:</strong> Revenue rankings across all locations</li>
                  <li><strong>Fault Distribution:</strong> Visual breakdown of fault types with counts</li>
                  <li><strong>Immediate Attention:</strong> Chargers with Critical/High risk levels</li>
                </ul>

                <Alert className="mt-3">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Dynamic Updates:</strong> Dashboard automatically updates when you upload new data. 
                    No manual refresh needed!
                  </AlertDescription>
                </Alert>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="fault-diagnosis">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span>Fault Diagnosis</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 text-sm">
                <p className="font-semibold">Purpose:</p>
                <p>Analyze charger failures, identify root causes, and get actionable resolution guidance</p>
                
                <p className="font-semibold mt-3">Input:</p>
                <p>Charger log files in CSV, JSON, or TXT format containing error codes and timestamps</p>

                <p className="font-semibold mt-3">Supported Fault Types (11 total):</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Overcurrent</li>
                  <li>Overvoltage / Low grid voltage</li>
                  <li>Overheating</li>
                  <li>BMS communication mismatch</li>
                  <li>OCPP network disconnect</li>
                  <li>Power module failure</li>
                  <li>Vehicle-side abort</li>
                  <li>Emergency stop</li>
                  <li>Contactor stuck</li>
                  <li>Repeated soft restarts</li>
                </ul>

                <p className="font-semibold mt-3">Output for Each Fault:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Description:</strong> What happened</li>
                  <li><strong>Root Cause:</strong> Why it happened</li>
                  <li><strong>Severity Level:</strong> Critical / High / Medium / Low</li>
                  <li><strong>Impact:</strong> Effect on operations and revenue</li>
                  <li><strong>Resolution:</strong> Step-by-step fix instructions</li>
                  <li><strong>Downtime:</strong> Hours of charger unavailability</li>
                </ul>

                <p className="font-semibold mt-3">Context-Aware Intelligence:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Recurrence Detection:</strong> 5+ faults in 24 hours → escalated to Critical</li>
                  <li><strong>Sensor Analysis:</strong> Temperature &gt;80°C, voltage outside 360-440V → higher severity</li>
                  <li><strong>Pattern Recognition:</strong> Identifies recurring issues with emoji indicators (🔥 🔌 ⚡)</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="cost-analysis">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span>Cost Analysis</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 text-sm">
                <p className="font-semibold">Purpose:</p>
                <p>Calculate revenue loss from charger downtime and identify costliest faults</p>
                
                <p className="font-semibold mt-3">Default Parameters (Customizable):</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Average Session Value:</strong> ₹120 per session</li>
                  <li><strong>Average Sessions per Day:</strong> 14 sessions</li>
                </ul>

                <p className="font-semibold mt-3">Calculation Formula:</p>
                <pre className="bg-muted p-3 rounded text-xs mt-2">
{`Revenue Loss = (Downtime Hours / 24) × 
               Avg Session Value × 
               Avg Sessions Per Day`}
                </pre>

                <p className="font-semibold mt-3">Output Metrics:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Today's Loss:</strong> Revenue lost today in INR</li>
                  <li><strong>Monthly Loss:</strong> Cumulative revenue loss this month</li>
                  <li><strong>Top 5 Costliest Faults:</strong> Ranked by revenue impact</li>
                  <li><strong>Per-Fault Loss:</strong> Individual fault cost breakdown</li>
                </ul>

                <p className="font-semibold mt-3">How to Customize:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Click "Edit Parameters" button</li>
                  <li>Enter your site's actual average session value</li>
                  <li>Enter your site's actual sessions per day</li>
                  <li>Click "Save" - calculations update automatically</li>
                </ol>

                <Alert className="mt-3">
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Tip:</strong> Use your actual site metrics for accurate revenue loss calculations. 
                    Check your session data to find average values.
                  </AlertDescription>
                </Alert>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="predictive">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>Predictive Failure Analysis</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 text-sm">
                <p className="font-semibold">Purpose:</p>
                <p>Identify at-risk chargers before complete failure using AI-powered pattern detection</p>
                
                <p className="font-semibold mt-3">Health Score Calculation:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Starts at 100% (perfect health)</li>
                  <li>Deducted based on fault severity and frequency</li>
                  <li>Recent faults weighted more heavily (exponential decay)</li>
                  <li>Sensor readings influence score (temperature, voltage, current)</li>
                </ul>

                <p className="font-semibold mt-3">Risk Levels:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong className="text-destructive">Critical (0-40%):</strong> Immediate maintenance required</li>
                  <li><strong className="text-warning">High (41-60%):</strong> Schedule maintenance within 48 hours</li>
                  <li><strong className="text-chart-3">Medium (61-80%):</strong> Monitor closely, plan maintenance</li>
                  <li><strong className="text-success">Low (81-100%):</strong> Healthy, routine maintenance only</li>
                </ul>

                <p className="font-semibold mt-3">Pattern Detection:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>🔥 <strong>Recurring overheating:</strong> 3+ overheating faults</li>
                  <li>🔌 <strong>Network issues:</strong> Frequent OCPP disconnects</li>
                  <li>⚡ <strong>Power problems:</strong> Multiple power module failures</li>
                  <li>🔄 <strong>Restart loops:</strong> Repeated soft restarts</li>
                </ul>

                <p className="font-semibold mt-3">Estimated Loss:</p>
                <p>
                  Projected revenue loss if charger fails completely, calculated based on historical 
                  downtime and your site's session metrics.
                </p>

                <Alert className="mt-3">
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Preventive Maintenance:</strong> Address Critical and High risk chargers immediately 
                    to prevent costly complete failures and maximize uptime.
                  </AlertDescription>
                </Alert>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="performance-analytics">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span>Performance Analytics</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 text-sm">
                <p className="font-semibold">Purpose:</p>
                <p>Unified analytics for multi-site and individual charger performance tracking</p>
                
                <p className="font-semibold mt-3">Site View Metrics:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Total Revenue:</strong> Revenue generated per site</li>
                  <li><strong>Total Energy:</strong> kWh delivered per site</li>
                  <li><strong>Total Sessions:</strong> Number of charging sessions</li>
                  <li><strong>Utilization Rate:</strong> Percentage of time chargers are in use</li>
                  <li><strong>Peak Hours:</strong> Busiest time of day for each site</li>
                  <li><strong>Sessions Per Day:</strong> Average daily session count</li>
                </ul>

                <p className="font-semibold mt-3">Charger View Metrics:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Revenue Per Charger:</strong> Individual charger earnings</li>
                  <li><strong>Utilization Rate:</strong> How often each charger is used</li>
                  <li><strong>Fault Count:</strong> Number of faults per charger</li>
                  <li><strong>Health Score:</strong> Current health status (0-100%)</li>
                  <li><strong>Performance Classification:</strong> Star / Consistent / Underperformer / Idle</li>
                </ul>

                <p className="font-semibold mt-3">Performance Classifications:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>⭐ Star Performer:</strong> Utilization ≥70%, high revenue</li>
                  <li><strong>✅ Consistent:</strong> Utilization 40-69%, steady performance</li>
                  <li><strong>⚠️ Underperformer:</strong> Utilization 10-39%, needs attention</li>
                  <li><strong>❌ Idle:</strong> Utilization &lt;10%, consider relocation</li>
                </ul>

                <p className="font-semibold mt-3">Recommendations Engine:</p>
                <p>
                  Click "View Recommendations" to get AI-powered insights for:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Pricing optimization (increase/decrease tariffs)</li>
                  <li>Charger relocation suggestions</li>
                  <li>Capacity expansion opportunities</li>
                  <li>Maintenance prioritization</li>
                  <li>Grid connection improvements</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Common Fault Types Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Common Fault Types Reference
          </CardTitle>
          <CardDescription>Detailed guide to understanding and resolving common charger faults</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faultTypes.map((fault, index) => (
              <AccordionItem key={index} value={`fault-${index}`}>
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      fault.severity === 'Critical' ? 'destructive' : 
                      fault.severity === 'High' ? 'default' : 
                      'outline'
                    }>
                      {fault.severity}
                    </Badge>
                    <span>{fault.name}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 text-sm">
                  <div>
                    <p className="font-semibold">Description:</p>
                    <p>{fault.description}</p>
                  </div>
                  
                  <div>
                    <p className="font-semibold">Common Causes:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      {fault.commonCauses.map((cause, i) => (
                        <li key={i}>{cause}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold">Resolution Steps:</p>
                    <p>{fault.resolution}</p>
                  </div>

                  <div>
                    <p className="font-semibold">Preventive Measures:</p>
                    <p>{fault.preventiveMeasure}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Troubleshooting Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Troubleshooting Guide
          </CardTitle>
          <CardDescription>Solutions to common issues and questions</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="no-data">
              <AccordionTrigger className="text-left">
                Dashboard shows "No Data Uploaded"
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-sm">
                <p><strong>Solution:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Go to Data Import page</li>
                  <li>Upload your charger log files or click "Load Sample Data"</li>
                  <li>Click "Process All Data" button</li>
                  <li>Wait for processing to complete</li>
                  <li>Return to Dashboard - data should now be visible</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="file-error">
              <AccordionTrigger className="text-left">
                File upload fails or shows error
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-sm">
                <p><strong>Common Causes & Solutions:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>File too large:</strong> Files over 100MB may fail. Try splitting into smaller files.</li>
                  <li><strong>Wrong format:</strong> Ensure CSV has headers, JSON is valid array, TXT has proper line breaks.</li>
                  <li><strong>Missing required fields:</strong> Check that timestamp, errorCode, and connectorId are present.</li>
                  <li><strong>Invalid timestamps:</strong> Use ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ).</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="no-faults">
              <AccordionTrigger className="text-left">
                No faults detected after upload
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-sm">
                <p><strong>Possible Reasons:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Clean logs:</strong> Your chargers may be operating without errors (good news!)</li>
                  <li><strong>Error codes not recognized:</strong> System may not recognize vendor-specific codes. Check supported fault types.</li>
                  <li><strong>Wrong file uploaded:</strong> Ensure you uploaded charger logs, not session data.</li>
                </ul>
                <p className="mt-2"><strong>Try:</strong> Load sample data to verify system is working correctly.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="wrong-metrics">
              <AccordionTrigger className="text-left">
                Revenue loss calculations seem incorrect
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-sm">
                <p><strong>Solution:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Go to Cost Analysis page</li>
                  <li>Click "Edit Parameters" button</li>
                  <li>Enter your actual average session value (check your billing data)</li>
                  <li>Enter your actual average sessions per day (check your session logs)</li>
                  <li>Save changes - calculations will update automatically</li>
                </ol>
                <p className="mt-2">
                  <strong>Note:</strong> Default values (₹120, 14 sessions/day) are industry averages for India. 
                  Your actual values may differ based on location, charger type, and pricing strategy.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="slow-processing">
              <AccordionTrigger className="text-left">
                File processing is very slow
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-sm">
                <p><strong>Solutions:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Enable Optimizer:</strong> Check "Use Optimizer" box before processing large files (10,000+ lines)</li>
                  <li><strong>Split large files:</strong> Break files into monthly or weekly chunks</li>
                  <li><strong>Remove unnecessary data:</strong> Keep only essential fields (timestamp, errorCode, connectorId)</li>
                  <li><strong>Use CSV format:</strong> CSV processes faster than JSON for large datasets</li>
                </ul>
                <Alert className="mt-3">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Files over 5MB automatically show a progress indicator. Processing time depends on file size 
                    and your device performance.
                  </AlertDescription>
                </Alert>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="export-issues">
              <AccordionTrigger className="text-left">
                Cannot export reports (PDF/CSV)
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-sm">
                <p><strong>Solutions:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Check browser permissions:</strong> Allow downloads in browser settings</li>
                  <li><strong>Disable popup blockers:</strong> May prevent download dialogs</li>
                  <li><strong>Try different browser:</strong> Chrome, Firefox, or Edge recommended</li>
                  <li><strong>Check disk space:</strong> Ensure sufficient space for downloaded files</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* EV Terms Glossary */}
      <Card>
        <CardHeader>
          <CardTitle>EV Charging Terms Glossary</CardTitle>
          <CardDescription>Common terminology used in DMS and EV charging industry</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {evTerms.map((item, index) => (
              <div key={index} className="space-y-1 p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{item.term}</Badge>
                </div>
                <p className="text-sm">{item.definition}</p>
                <p className="text-xs text-muted-foreground italic">
                  <strong>Importance:</strong> {item.importance}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Best Practices
          </CardTitle>
          <CardDescription>Tips for getting the most out of DMS</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Data Management</h3>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Upload data regularly (daily or weekly) for accurate trend analysis</li>
              <li>• Include sensor data (temperature, voltage, current) for enhanced fault detection</li>
              <li>• Keep historical data for at least 3 months to identify long-term patterns</li>
              <li>• Use consistent charger IDs across all data files</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Maintenance Prioritization</h3>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Address Critical risk chargers within 24 hours</li>
              <li>• Schedule High risk charger maintenance within 48 hours</li>
              <li>• Monitor Medium risk chargers weekly</li>
              <li>• Perform routine maintenance on Low risk chargers monthly</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Revenue Optimization</h3>
            <ul className="text-sm text-muted-foreground space-y-1 ml-2">
              <li>• Review Performance Analytics weekly to identify underperforming chargers</li>
              <li>• Act on recommendations for pricing adjustments</li>
              <li>• Consider relocating Idle chargers to high-demand areas</li>
              <li>• Track revenue impact of maintenance actions</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Preventive Maintenance</h3>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Clean cooling vents monthly to prevent overheating</li>
              <li>• Inspect cables and connectors weekly for wear</li>
              <li>• Update charger firmware quarterly</li>
              <li>• Test network connectivity regularly</li>
              <li>• Monitor ambient temperature during summer months</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
