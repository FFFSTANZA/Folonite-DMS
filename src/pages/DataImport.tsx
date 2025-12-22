import { UniversalUpload } from '@/components/upload/UniversalUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, AlertCircle } from 'lucide-react';

export default function DataImport() {
  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Data Import</h1>
        <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
          Upload charger log files for analysis and fault diagnosis
        </p>
      </div>

      {/* Universal Upload Section */}
      <UniversalUpload />

      {/* Information Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
        <Card className="">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base sm:text-lg">Supported Formats</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
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
              <CardTitle className="text-base sm:text-lg">What Happens Next</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
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
              <div className="h-10 w-10 rounded-lg bg-muted/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardTitle className="text-base sm:text-lg">Important Notes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-muted" />
                Files are processed locally
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-muted" />
                No data is stored permanently
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-muted" />
                Session-based analysis only
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Help Section */}
      <Card className=" border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Need Help?</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Learn more about the data import process and supported log formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <h4 className="font-semibold text-xs sm:text-sm mb-2">Required Fields in Log Files:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
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
            <p className="text-xs sm:text-sm text-muted-foreground">
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
