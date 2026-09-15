import { Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary-foreground" fill="currentColor" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-foreground">
                  DMS
                </span>
                <span className="text-[10px] text-muted-foreground font-medium tracking-wide">
                  DIAGNOSTIC MANAGEMENT SYSTEM
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Advanced diagnostic and fault analysis platform for EV charging stations. 
              Empowering operators with intelligent insights, predictive maintenance, and revenue optimization.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/fault-diagnosis" className="text-muted-foreground hover:text-foreground transition-colors">
                  Fault Diagnosis
                </Link>
              </li>
              <li>
                <Link to="/predictive" className="text-muted-foreground hover:text-foreground transition-colors">
                  Predictive Analysis
                </Link>
              </li>
              <li>
                <Link to="/performance-analytics" className="text-muted-foreground hover:text-foreground transition-colors">
                  Performance Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Resources
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/help" className="text-muted-foreground hover:text-foreground transition-colors">
                  Help & Documentation
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About DMS
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {currentYear} DMS
            </p>
            <p className="text-xs text-muted-foreground">
              Built for EV charging station operators in India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
