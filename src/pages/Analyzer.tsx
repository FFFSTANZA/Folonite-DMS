import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { SessionUpload } from '@/components/analytics/SessionUpload';
import { AnalyticsSummaryCards } from '@/components/analytics/AnalyticsSummaryCards';
import { SiteAnalyticsTable } from '@/components/analytics/SiteAnalyticsTable';
import { ChargerAnalyticsTable } from '@/components/analytics/ChargerAnalyticsTable';
import { RecommendationsModal } from '@/components/analytics/RecommendationsModal';
import { Button } from '@/components/ui/button';
import { parseSessionFile } from '@/utils/sessionParser';
import { 
  calculateSiteMetrics, 
  calculateChargerMetrics,
  calculateAnalyticsSummary 
} from '@/utils/analyticsEngine';
import { generateRecommendations } from '@/utils/recommendationEngine';
import { 
  SessionData, 
  SiteMetrics, 
  ChargerMetrics, 
  Recommendation,
  AnalyticsSummary 
} from '@/types/analytics';
import { FileText } from 'lucide-react';

export default function Analyzer() {
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [siteMetrics, setSiteMetrics] = useState<SiteMetrics[]>([]);
  const [chargerMetrics, setChargerMetrics] = useState<ChargerMetrics[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const { toast } = useToast();

  // Determine active tab based on route
  const getActiveTab = () => {
    if (location.pathname === '/performance-analytics') return 'chargers';
    return 'sites'; // default
  };

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);

    try {
      const sessionData = await parseSessionFile(file);
      
      if (sessionData.length === 0) {
        throw new Error('No valid session data found');
      }

      const sites = calculateSiteMetrics(sessionData);
      const chargers = calculateChargerMetrics(sessionData);
      const recs = generateRecommendations(sessionData, sites, chargers);
      const summaryData = calculateAnalyticsSummary(sessionData, sites, chargers);

      setSessions(sessionData);
      setSiteMetrics(sites);
      setChargerMetrics(chargers);
      setRecommendations(recs);
      setSummary(summaryData);

      toast({
        title: 'Analysis Complete',
        description: `Processed ${sessionData.length} sessions from ${sites.length} sites`,
      });
    } catch (error) {
      toast({
        title: 'Processing Failed',
        description: error instanceof Error ? error.message : 'Failed to process file',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Page title based on route
  const getPageTitle = () => {
    return 'Performance Analytics';
  };

  const getPageDescription = () => {
    return 'Multi-site revenue analysis and individual charger performance tracking';
  };

  return (
    <div className="space-y-8 ">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">{getPageTitle()}</h1>
        <p className="text-muted-foreground mt-2">{getPageDescription()}</p>
      </div>

      <section>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Upload Session Data</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Upload your charging session logs to analyze site performance and get recommendations
            </p>
          </div>
        </div>
        <SessionUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />
      </section>

      {summary && (
        <>
          <section className="">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Overview</h2>
              {recommendations.length > 0 && (
                <Button
                  onClick={() => setShowRecommendations(true)}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  View Recommendations ({recommendations.length})
                </Button>
              )}
            </div>
            <AnalyticsSummaryCards summary={summary} />
          </section>

          <Tabs value={getActiveTab()} className="w-full ">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sites">Site View</TabsTrigger>
              <TabsTrigger value="chargers">Charger View</TabsTrigger>
            </TabsList>

            <TabsContent value="sites" className="mt-6 ">
              <SiteAnalyticsTable sites={siteMetrics} />
            </TabsContent>

            <TabsContent value="chargers" className="mt-6 ">
              <ChargerAnalyticsTable chargers={chargerMetrics} />
            </TabsContent>
          </Tabs>

          {/* Recommendations Modal */}
          <RecommendationsModal
            open={showRecommendations}
            onOpenChange={setShowRecommendations}
            recommendations={recommendations}
          />
        </>
      )}

      {!isProcessing && !summary && (
        <div className="text-center py-12 ">
          <p className="text-muted-foreground">
            Upload session data to begin analysis
          </p>
        </div>
      )}
    </div>
  );
}
