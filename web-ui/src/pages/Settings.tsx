
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, Bell, Moon, Globe, Shield, HelpCircle } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      weekly: true,
      achievements: true
    },
    display: {
      theme: 'light',
      language: 'en',
      readingMode: false
    },
    privacy: {
      profileVisible: true,
      shareProgress: false,
      analyticsTracking: true
    }
  });

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }));
    toast.success('Setting updated');
  };

  const userRole = localStorage.getItem('userRole') || 'consumer';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">Settings</span>
          </h1>
          <p className="text-xl text-gray-600">
            Customize your FluidContent AI experience
          </p>
        </div>

        {/* Current Role */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Current Role</h3>
              <Badge className="bg-primary/10 text-primary border-primary/20">
                {userRole === 'consumer' ? 'Content Consumer' : 
                 userRole === 'maker' ? 'Content Maker' : 'Content Provider'}
              </Badge>
            </div>
            <Button variant="outline" onClick={() => {
              localStorage.removeItem('userRole');
              window.location.href = '/onboarding';
            }}>
              Switch Role
            </Button>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Email Notifications</h4>
                <p className="text-sm text-gray-600">Receive updates via email</p>
              </div>
              <Switch
                checked={settings.notifications.email}
                onCheckedChange={(checked) => 
                  handleSettingChange('notifications', 'email', checked)
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Push Notifications</h4>
                <p className="text-sm text-gray-600">Browser push notifications</p>
              </div>
              <Switch
                checked={settings.notifications.push}
                onCheckedChange={(checked) => 
                  handleSettingChange('notifications', 'push', checked)
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Weekly Summary</h4>
                <p className="text-sm text-gray-600">Weekly progress report</p>
              </div>
              <Switch
                checked={settings.notifications.weekly}
                onCheckedChange={(checked) => 
                  handleSettingChange('notifications', 'weekly', checked)
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Achievement Alerts</h4>
                <p className="text-sm text-gray-600">Notifications for new achievements</p>
              </div>
              <Switch
                checked={settings.notifications.achievements}
                onCheckedChange={(checked) => 
                  handleSettingChange('notifications', 'achievements', checked)
                }
              />
            </div>
          </div>
        </Card>

        {/* Display Settings */}
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Display & Language
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Theme</h4>
                <p className="text-sm text-gray-600">Choose your preferred theme</p>
              </div>
              <Select
                value={settings.display.theme}
                onValueChange={(value) => handleSettingChange('display', 'theme', value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Language</h4>
                <p className="text-sm text-gray-600">Interface language</p>
              </div>
              <Select
                value={settings.display.language}
                onValueChange={(value) => handleSettingChange('display', 'language', value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Reading Mode</h4>
                <p className="text-sm text-gray-600">Enhanced reading experience</p>
              </div>
              <Switch
                checked={settings.display.readingMode}
                onCheckedChange={(checked) => 
                  handleSettingChange('display', 'readingMode', checked)
                }
              />
            </div>
          </div>
        </Card>

        {/* Privacy Settings */}
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Data
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Public Profile</h4>
                <p className="text-sm text-gray-600">Make your profile visible to others</p>
              </div>
              <Switch
                checked={settings.privacy.profileVisible}
                onCheckedChange={(checked) => 
                  handleSettingChange('privacy', 'profileVisible', checked)
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Share Progress</h4>
                <p className="text-sm text-gray-600">Show your progress in leaderboards</p>
              </div>
              <Switch
                checked={settings.privacy.shareProgress}
                onCheckedChange={(checked) => 
                  handleSettingChange('privacy', 'shareProgress', checked)
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Analytics Tracking</h4>
                <p className="text-sm text-gray-600">Help improve the platform with usage data</p>
              </div>
              <Switch
                checked={settings.privacy.analyticsTracking}
                onCheckedChange={(checked) => 
                  handleSettingChange('privacy', 'analyticsTracking', checked)
                }
              />
            </div>
          </div>
        </Card>

        {/* Help & Support */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Help & Support
          </h3>
          
          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <Globe className="h-4 w-4 mr-2" />
              Visit Help Center
            </Button>
            
            <Button variant="outline" className="w-full justify-start">
              <HelpCircle className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
            
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">Version 1.0.0</p>
              <p className="text-xs text-gray-500">
                © 2025 FluidContent AI. All rights reserved.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
