import { UniversalUpload } from '@/components/upload/UniversalUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, AlertCircle } from 'lucide-react';

export default function DataImport() {
  return (
    <div className="space-y-8 ">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Data Import</h1>
        <p className="text-muted-foreground mt-2">
          Upload charger log files for analysis and fault diagnosis
        </p>
      </div>

      {/* Universal Upload Section */}
      <UniversalUpload />

      {/* Information Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Supported Formats</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                CSV - Comma-separated values
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                JSON - JavaScript Object Notation
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                TXT - Plain text log files
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">What Happens Next</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Automatic fault detection
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Root cause analysis
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Revenue loss calculation
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              </div>
              <CardTitle className="text-lg">Important Notes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                Files are processed locally
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                No data is stored permanently
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                Session-based analysis only
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Help Section */}
      <Card className=" border-primary/20">
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>
            Learn more about the data import process and supported log formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Required Fields in Log Files:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  errorCode
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  timestamp
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  connectorId
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  meterValue
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  temperature
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  voltage
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  current
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  status
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              For detailed documentation and sample log files, visit the{' '}
              <a href="/help" className="text-primary hover:underline font-medium">
                Help & Documentation
              </a>{' '}
              page.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
