import { AlertCircle, Download, FileText, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UniversalUpload } from '@/components/upload/UniversalUpload';

const sampleFiles = [
  {
    name: 'sample-logs.csv',
    label: 'Charger Fault Logs',
    description: '110 entries across 10 chargers in 7 cities — overcurrent, overheating, OCPP disconnects, power failures, and more',
    format: 'CSV',
  },
  {
    name: 'sample-sessions.csv',
    label: 'Revenue & Session Data',
    description: '107 sessions across 7 sites — energy consumed, duration, tariff (INR), and revenue per session',
    format: 'CSV',
  },
  {
    name: 'sample-logs-predictive.csv',
    label: 'Predictive Failure Logs',
    description: '67 entries with escalating fault patterns — fan degradation, network failures, restart loops, overcurrent trends, and contactor wear',
    format: 'CSV',
  },
];

function downloadFile(filename: string) {
  const link = document.createElement('a');
  link.href = `/${filename}`;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function DataImport() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Data Import</h1>
        <p className="text-muted-foreground mt-0.5 text-[13px]">
          Upload charger log files for analysis and fault diagnosis
        </p>
      </div>

      {/* Universal Upload Section */}
      <UniversalUpload />

      {/* Download Sample Files */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[13px]">
            <Download className="h-4 w-4 text-primary" />
            Download Sample Files
          </CardTitle>
          <CardDescription>
            Try the app with realistic Indian EV charging data before uploading your own
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {sampleFiles.map((file) => (
              <div
                key={file.name}
                className="flex flex-col gap-2 p-3 rounded-lg border border-border/60 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-[13px] font-medium truncate">{file.label}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {file.description}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 mt-1"
                  onClick={() => downloadFile(file.name)}
                >
                  <Download className="h-3 w-3" />
                  Download {file.format}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Information Cards */}
      <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <CardTitle className="text-[13px]">Supported Formats</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-[12px] text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary" />
                CSV — Comma-separated values
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary" />
                JSON — JavaScript Object Notation
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary" />
                TXT — Plain text log files
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-primary" />
              <CardTitle className="text-[13px]">What Happens Next</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-[12px] text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary" />
                Automatic fault detection
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary" />
                Root cause analysis
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary" />
                Revenue loss calculation
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-[13px]">Important Notes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-[12px] text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                Files are processed locally
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                No data is stored permanently
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                Session-based analysis only
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
