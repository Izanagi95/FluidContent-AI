
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, ArrowRight, Eye, PenTool, Image, 
  BookOpen, TrendingUp, Users, Star, Shield 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const roles = [
    {
      type: 'consumer',
      icon: Eye,
      title: 'Content Reader',
      description: 'Discover and consume personalized content',
      features: ['Personalized Feed', 'Reading Progress', 'Achievement System']
    },
    {
      type: 'maker',
      icon: PenTool,
      title: 'Content Maker',
      description: 'Create engaging content with AI assistance',
      features: ['AI Writing Tools', 'Content Analytics', 'Collaboration']
    },
    {
      type: 'provider',
      icon: Image,
      title: 'Content Provider',
      description: 'Share authentic media and earn revenue',
      features: ['Media Library', 'Usage Analytics', 'Revenue Tracking']
    }
  ];

  const features = [
    { icon: BookOpen, title: 'Smart Content', description: 'AI-powered content recommendations' },
    { icon: TrendingUp, title: 'Analytics', description: 'Track performance and engagement' },
    { icon: Users, title: 'Community', description: 'Connect with like-minded creators' },
    { icon: Star, title: 'Gamification', description: 'Earn XP and unlock achievements' },
    { icon: Shield, title: 'Quality First', description: 'Verified and authentic content' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold gradient-text">FluidContent AI</span>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate('/auth')}>
              Login
            </Button>
            <Button onClick={() => navigate('/onboarding')}>
              Get Started
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          <span className="gradient-text">Fluid Content</span><br />
          <span className="text-gray-800 dark:text-gray-200">Powered by AI</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Experience content that flows like water - adapting seamlessly to your needs. 
          Whether you're reading, creating, or providing media, our AI-powered platform 
          makes every interaction natural and rewarding.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => navigate('/onboarding')} className="bg-gradient-primary">
            Start Your Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
            Already Have Account?
          </Button>
        </div>
      </div>

      {/* Roles Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Choose Your Flow</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {roles.map((role) => (
            <Card key={role.type} className="p-8 text-center hover-lift">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <role.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">{role.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{role.description}</p>
              <div className="space-y-2 mb-6">
                {role.features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  localStorage.setItem('userRole', role.type);
                  navigate('/onboarding');
                }}
              >
                Flow as {role.title}
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why FluidContent AI?</h2>
        <div className="grid md:grid-cols-5 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <Card className="p-12 text-center bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-0">
          <h2 className="text-3xl font-bold mb-4">Ready to Go with the Flow?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of users creating a fluid content ecosystem where ideas flow freely.
          </p>
          <Button size="lg" onClick={() => navigate('/onboarding')} className="bg-gradient-primary">
            Dive In Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <div className="mt-6 flex justify-center gap-4 flex-wrap">
            <Badge variant="secondary">🌊 Fluid Experience</Badge>
            <Badge variant="secondary">🚀 Fast Setup</Badge>
            <Badge variant="secondary">💰 Earn Revenue</Badge>
            <Badge variant="secondary">📊 Deep Analytics</Badge>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="flex justify-center items-center">
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <Sparkles className="h-5 w-5" />
            <span>© 2024 FluidContent AI. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
