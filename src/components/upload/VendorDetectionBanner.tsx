import { AlertTriangle, CheckCircle2, Info, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { VendorDetectionBanner as BannerData } from '@/types/vendor.types';
import { getConfidenceLevel, getVendorDisplayName } from '@/utils/vendorDetection';

interface VendorDetectionBannerProps {
  banner: BannerData;
  validationWarnings?: string[];
}

export function VendorDetectionBanner({ banner, validationWarnings = [] }: VendorDetectionBannerProps) {
  const confidenceLevel = getConfidenceLevel(banner.confidence);
  const displayName = getVendorDisplayName(banner.vendor, banner.format);

  const getConfidenceColor = () => {
    if (confidenceLevel === 'High') return 'text-success';
    if (confidenceLevel === 'Medium') return 'text-warning';
    return 'text-destructive';
  };

  const getConfidenceBadgeVariant = () => {
    if (confidenceLevel === 'High') return 'default';
    if (confidenceLevel === 'Medium') return 'secondary';
    return 'outline';
  };

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary" />
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-base flex items-center gap-2">
                  <span>Vendor Detected: {displayName}</span>
                  <Badge variant={getConfidenceBadgeVariant()} className="text-xs">
                    {confidenceLevel} Confidence
                  </Badge>
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Logs normalized for analysis • {banner.entriesProcessed.toLocaleString()} entries processed
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Info className="h-3 w-3" />
                  {banner.format}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-muted-foreground">
                  <span className="font-semibold text-foreground">{banner.entriesProcessed}</span> entries
                </span>
              </div>

              {banner.entriesFixed > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span className="text-muted-foreground">
                    <span className="font-semibold text-foreground">{banner.entriesFixed}</span> auto-fixed
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <div className={`h-2 w-2 rounded-full ${confidenceLevel === 'High' ? 'bg-success' : confidenceLevel === 'Medium' ? 'bg-warning' : 'bg-destructive'}`} />
                <span className={`font-medium ${getConfidenceColor()}`}>
                  {(banner.confidence * 100).toFixed(0)}% match
                </span>
              </div>
            </div>

            {validationWarnings.length > 0 && (
              <div className="pt-2 border-t border-primary/20">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Note:</span> {validationWarnings[0]}
                  {validationWarnings.length > 1 && ` (+${validationWarnings.length - 1} more)`}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
