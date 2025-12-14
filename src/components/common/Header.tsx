import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Zap, ChevronDown } from "lucide-react";
import routes from "../../routes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigation = routes.filter((route) => route.visible !== false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group"
          >
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary-foreground" fill="currentColor" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-foreground">
                Folonite DMS
              </span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-wide">
                DIAGNOSTIC MANAGEMENT SYSTEM
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${isActive(item.path)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }
                `}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <Link to="/help">Help</Link>
            </Button>
            <Button
              size="sm"
              asChild
            >
              <Link to="/about">About</Link>
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  Menu
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {navigation.map((item) => (
                  <DropdownMenuItem key={item.path} asChild>
                    <Link
                      to={item.path}
                      className={`w-full ${isActive(item.path) ? "text-primary font-medium" : ""}`}
                    >
                      {item.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem asChild>
                  <Link to="/help" className="w-full">
                    Help
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/about" className="w-full">
                    About
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
