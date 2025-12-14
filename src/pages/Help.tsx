import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { FileText, Zap, Activity, BarChart3, HelpCircle } from 'lucide-react';

export default function Help() {
  const evTerms = [
    {
      term: 'OCPP',
      definition: 'Open Charge Point Protocol - A standard communication protocol between charging stations and management systems'
    },
    {
      term: 'BMS',
      definition: 'Battery Management System - Electronic system that manages a rechargeable battery to ensure safe operation'
    },
    {
      term: 'Tariff',
      definition: 'Pricing structure for charging services, typically measured in ₹/kWh or ₹/session'
    },
    {
      term: 'kWh',
      definition: 'Kilowatt-hour - Unit of energy equal to 1000 watts used for one hour'
    },
    {
      term: 'Session',
      definition: 'A complete charging event from connection to disconnection, including energy delivered and duration'
    },
    {
      term: 'Connector',
      definition: 'Physical interface on a charger where vehicles plug in (e.g., CCS, CHAdeMO, Type 2)'
    },
    {
      term: 'Uptime',
      definition: 'Percentage of time a charger is operational and available for use'
    },
    {
      term: 'Utilization',
      definition: 'Percentage of time a charger is actively being used for charging'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Help & Documentation</h1>
        <p className="text-muted-foreground mt-2">
          Learn how to use Folonite DMS effectively
        </p>
      </div>

      {/* Quick Start Guide */}
      <Card className="card-hover animate-slide-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Quick Start Guide
          </CardTitle>
          <CardDescription>Get started with Folonite DMS in 3 simple steps</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="font-semibold">Upload Your Data</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Navigate to any module and upload your charger logs (CSV, JSON, or TXT format) or session data
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="font-semibold">Review Analysis</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Folonite DMS automatically processes your data and displays insights, faults, and recommendations
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="font-semibold">Export & Act</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Download reports in PDF or CSV format and take action based on recommendations
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module Guides */}
      <Card className="card-hover animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Module Guides
          </CardTitle>
          <CardDescription>Detailed information about each Folonite DMS module</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="fault-diagnosis">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span>Fault Diagnosis</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-sm">
                <p><strong>Purpose:</strong> Analyze charger failures and identify root causes</p>
                <p><strong>Input:</strong> Charger log files (CSV, JSON, TXT)</p>
                <p><strong>Output:</strong> Fault classification, severity levels, resolution guidance</p>
                <p><strong>Supported Faults:</strong> Overcurrent, Overvoltage, Overheating, BMS mismatch, OCPP disconnect, and 6 more</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="cost-analysis">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span>Cost Analysis</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-sm">
                <p><strong>Purpose:</strong> Calculate revenue loss from charger downtime</p>
                <p><strong>Parameters:</strong> Average session value (₹120), sessions per day (14)</p>
                <p><strong>Output:</strong> Daily/monthly revenue loss, top costliest faults</p>
                <p><strong>Customization:</strong> Adjust parameters based on your site's actual metrics</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="predictive">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>Predictive Failure Indicator</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-sm">
                <p><strong>Purpose:</strong> Identify at-risk chargers before complete failure</p>
                <p><strong>Detection:</strong> Pattern-based analysis of fault frequency and severity</p>
                <p><strong>Output:</strong> Risk levels (Critical, High, Medium), health scores, estimated loss</p>
                <p><strong>Action:</strong> Prioritize maintenance based on risk scores</p>
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
                <div>
                  <p className="font-semibold mb-1">Purpose:</p>
                  <p>Unified analytics for multi-site and individual charger performance tracking</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Site View:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Multi-site revenue comparison</li>
                    <li>Utilization rates and peak hours</li>
                    <li>Energy delivered and session counts</li>
                    <li>Site rankings and performance insights</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-1">Charger View:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Individual charger classification (Star, Consistent, Underperformer, Idle)</li>
                    <li>Revenue per charger and utilization rates</li>
                    <li>Fault counts and risk scores</li>
                    <li>Predictive failure status</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-1">Recommendations:</p>
                  <p>Click "View Recommendations" to see actionable insights for performance optimization, pricing strategies, and maintenance priorities</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* EV Terms Glossary */}
      <Card className="card-hover animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <CardHeader>
          <CardTitle>EV Charging Terms</CardTitle>
          <CardDescription>Common terminology used in Folonite DMS</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {evTerms.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{item.term}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{item.definition}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* File Format Guide */}
      <Card className="card-hover animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <CardHeader>
          <CardTitle>Supported File Formats</CardTitle>
          <CardDescription>Requirements for uploading data to Folonite DMS</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Fault Diagnosis Logs</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Accepted formats: CSV, JSON, TXT
            </p>
            <p className="text-sm text-muted-foreground">
              Required fields: timestamp, errorCode, connectorId (optional: meterValue, temperature, voltage, current)
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Session Data</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Accepted format: CSV
            </p>
            <p className="text-sm text-muted-foreground">
              Required fields: siteId, chargerId, sessionId, startTime, endTime, energyDelivered, revenue
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
