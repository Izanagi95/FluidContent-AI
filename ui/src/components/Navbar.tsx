
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/ThemeProvider";
import { 
  Sparkles, Menu, X, Home, BookOpen, User, Settings, 
  Trophy, Star, Eye, PenTool, Image, LogOut, Sun, Moon,
  BarChart3, Video, FileText
} from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  
  // Get user data
  const userRole = localStorage.getItem('userRole') || 'consumer';
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  // Don't show navbar on certain pages
  if (location.pathname === '/' || location.pathname === '/onboarding' || location.pathname === '/auth') {
    return null;
  }

  const getRoleIcon = () => {
    switch (userRole) {
      case 'maker': return PenTool;
      case 'provider': return Image;
      default: return Eye;
    }
  };

  const getRoleTitle = () => {
    switch (userRole) {
      case 'maker': return 'Content Maker';
      case 'provider': return 'Content Provider';
      default: return 'Content Reader';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const getNavigationItems = () => {
    const baseItems = [
      { path: '/dashboard', label: 'Dashboard', icon: Home },
    ];

    if (userRole === 'consumer') {
      return [
        ...baseItems,
        { path: '/articles', label: 'Articles', icon: BookOpen },
        { path: '/gamification', label: 'Progress', icon: Star },
        { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
        { path: '/profile', label: 'Profile', icon: User },
        { path: '/settings', label: 'Settings', icon: Settings },
      ];
    } else if (userRole === 'maker') {
      return [
        ...baseItems,
        { path: '/my-articles', label: 'My Articles', icon: FileText },
        { path: '/analytics', label: 'Analytics', icon: BarChart3 },
        { path: '/profile', label: 'Profile', icon: User },
        { path: '/settings', label: 'Settings', icon: Settings },
      ];
    } else if (userRole === 'provider') {
      return [
        ...baseItems,
        { path: '/my-videos', label: 'My Videos', icon: Video },
        { path: '/analytics', label: 'Analytics', icon: BarChart3 },
        { path: '/profile', label: 'Profile', icon: User },
        { path: '/settings', label: 'Settings', icon: Settings },
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();
  const RoleIcon = getRoleIcon();

  return (
    <nav className="sticky top-0 z-50 glass border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold gradient-text">FluidContent AI</span>
            </Link>
            {isAuthenticated && (
              <Badge className="bg-primary/10 text-primary border-primary/20 hidden sm:flex">
                <RoleIcon className="h-3 w-3 mr-1" />
                {getRoleTitle()}
              </Badge>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-primary/5'
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={toggleTheme}
                  className="flex items-center gap-2"
                >
                  {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </Button>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={toggleTheme}
                  className="flex items-center gap-2"
                >
                  {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </Button>
                <Link to="/auth">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link to="/onboarding">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={toggleTheme}
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-900 border-t">
              {isAuthenticated ? (
                <>
                  <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">
                    <RoleIcon className="h-3 w-3 mr-1" />
                    {getRoleTitle()}
                  </Badge>
                  
                  {navigationItems.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = location.pathname === item.path;
                    
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-primary/5'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <IconComponent className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full mt-4"
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">Login</Button>
                  </Link>
                  <Link to="/onboarding" onClick={() => setIsOpen(false)}>
                    <Button size="sm" className="w-full">Get Started</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
