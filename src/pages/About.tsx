import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Target, Users, Shield, TrendingUp, Clock } from 'lucide-react';

export default function About() {
  const features = [
    {
      icon: Zap,
      title: 'Instant Analysis',
      description: 'Upload logs and get insights in seconds - no setup, no configuration required'
    },
    {
      icon: Target,
      title: 'Accurate Diagnostics',
      description: '11 fault types with detailed root cause analysis and resolution guidance'
    },
    {
      icon: TrendingUp,
      title: 'Revenue Insights',
      description: 'Calculate downtime costs in INR and identify revenue optimization opportunities'
    },
    {
      icon: Shield,
      title: 'Predictive Alerts',
      description: 'Identify at-risk chargers before complete failure with pattern detection'
    },
    {
      icon: Users,
      title: 'Multi-Site Management',
      description: 'Compare performance across sites and get actionable business recommendations'
    },
    {
      icon: Clock,
      title: 'No Data Storage',
      description: 'Session-based processing ensures your data privacy and security'
    }
  ];

  const stats = [
    { label: 'Fault Types', value: '11' },
    { label: 'Analysis Modules', value: '5' },
    { label: 'Export Formats', value: '3' },
    { label: 'Version', value: '1.0' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">About Folonite DMS</h1>
        <p className="text-muted-foreground mt-2">
          Smarter EV Operations for India — No Setup, Just Upload.
        </p>
      </div>

      {/* Hero Card */}
      <Card className="card-hover animate-slide-up border-primary/50 shadow-premium">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-7 w-7" />
            </div>
            <div>
              <CardTitle className="text-2xl">Folonite DMS</CardTitle>
              <CardDescription className="text-base">Diagnostic Management System for EV Charging Operations</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Folonite DMS is a comprehensive diagnostic and analytics platform designed specifically for Indian EV charging station operators. 
            Our mission is to help you maximize uptime, optimize revenue, and prevent failures before they happen.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">No Login Required</Badge>
            <Badge variant="secondary">Client-Side Processing</Badge>
            <Badge variant="secondary">Multi-Format Support</Badge>
            <Badge variant="secondary">INR-Based Analytics</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {stats.map((stat, index) => (
          <Card key={index} className="card-hover text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary">{stat.value}</div>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features */}
      <Card className="card-hover animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <CardHeader>
          <CardTitle>Key Features</CardTitle>
          <CardDescription>What makes Folonite DMS the best choice for EV operators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Modules Overview */}
      <Card className="card-hover animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <CardHeader>
          <CardTitle>Complete Solution</CardTitle>
          <CardDescription>Five integrated modules for comprehensive operations management</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge className="mt-0.5">1</Badge>
              <div>
                <h3 className="font-semibold">Fault Diagnosis</h3>
                <p className="text-sm text-muted-foreground">
                  Automated fault detection with 11 categories, severity classification, and resolution guidance
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge className="mt-0.5">2</Badge>
              <div>
                <h3 className="font-semibold">Cost Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Calculate revenue loss from downtime in INR with customizable parameters
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge className="mt-0.5">3</Badge>
              <div>
                <h3 className="font-semibold">Predictive Failure Indicator</h3>
                <p className="text-sm text-muted-foreground">
                  Pattern-based risk detection to identify chargers needing preventive maintenance
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge className="mt-0.5">4</Badge>
              <div>
                <h3 className="font-semibold">Performance Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Unified analytics with Site View for multi-site comparison and Charger View for individual unit tracking, plus actionable business recommendations
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Built By */}
      <Card className="card-hover animate-slide-up border-accent/50" style={{ animationDelay: '0.4s' }}>
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">Built by</p>
          <h2 className="text-3xl font-bold gradient-text">Folonite</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Empowering EV infrastructure with intelligent software solutions
          </p>
        </CardContent>
      </Card>

      {/* Version Info */}
      <div className="text-center text-sm text-muted-foreground animate-slide-up" style={{ animationDelay: '0.5s' }}>
        <p>Folonite DMS v1.0 • 2025 • Made for Indian EV Operators</p>
      </div>
    </div>
  );
}
