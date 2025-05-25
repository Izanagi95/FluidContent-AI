
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Eye, PenTool, Image, Check, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const userRoles = [
    {
      id: "consumer",
      icon: Eye,
      title: "Content Consumer",
      description: "I want to discover and consume personalized content",
      features: [
        "Adaptive content filtering",
        "Interactive quizzes and gamification",
        "Content tailored to my interests",
        "Seamless reading experience"
      ],
      color: "from-blue-500 to-purple-600"
    },
    {
      id: "maker",
      icon: PenTool,
      title: "Content Maker",
      description: "I want to create and publish engaging content",
      features: [
        "Rich content creation tools",
        "Interest-based personalization layers",
        "Analytics and engagement tracking",
        "Collaboration with providers"
      ],
      color: "from-purple-500 to-pink-600"
    },
    {
      id: "provider",
      icon: Image,
      title: "Content Provider",
      description: "I want to share authentic media and earn revenue",
      features: [
        "Easy media upload and management",
        "Automatic usage tracking",
        "Commission-based earnings",
        "Quality verification system"
      ],
      color: "from-green-500 to-blue-600"
    }
  ];

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
  };

  const handleContinue = () => {
    if (selectedRole && step === 1) {
      setStep(2);
    } else if (step === 2) {
      // Store user role in localStorage for demo purposes
      localStorage.setItem('userRole', selectedRole || 'consumer');
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold gradient-text">FluidContent AI</span>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              Step {step} of 2
            </Badge>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {step === 1 && (
          <div className="animate-fade-in">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="gradient-text">Welcome to</span>
                <br />
                <span className="text-gray-900">FluidContent AI</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Choose your role to get started with a personalized experience tailored just for you.
              </p>
            </div>

            <div className="grid gap-6 mb-8">
              {userRoles.map((role) => (
                <Card
                  key={role.id}
                  className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    selectedRole === role.id
                      ? 'ring-2 ring-primary shadow-xl transform scale-[1.02]'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handleRoleSelect(role.id)}
                >
                  <div className="flex items-start space-x-6">
                    <div className={`flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-r ${role.color} flex items-center justify-center`}>
                      <role.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-2xl font-semibold">{role.title}</h3>
                        {selectedRole === role.id && (
                          <Check className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <p className="text-gray-600 mb-4">{role.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {role.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-700">
                            <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
              <Button
                onClick={handleContinue}
                disabled={!selectedRole}
                className="bg-gradient-primary hover:opacity-90"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && selectedRole && (
          <div className="animate-fade-in">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-6">
                <span className="gradient-text">Almost Ready!</span>
              </h1>
              <p className="text-xl text-gray-600">
                You've selected <strong>{userRoles.find(r => r.id === selectedRole)?.title}</strong>. 
                Let's set up your personalized dashboard.
              </p>
            </div>

            <Card className="p-8 text-center">
              <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-r ${userRoles.find(r => r.id === selectedRole)?.color} flex items-center justify-center mb-6`}>
                {(() => {
                  const role = userRoles.find(r => r.id === selectedRole);
                  const IconComponent = role?.icon || Eye;
                  return <IconComponent className="h-12 w-12 text-white" />;
                })()}
              </div>
              <h2 className="text-3xl font-bold mb-4">
                Welcome, {userRoles.find(r => r.id === selectedRole)?.title}!
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Your dashboard is being prepared with all the tools and features you need to get started.
              </p>
              <div className="space-y-3 mb-8">
                {userRoles.find(r => r.id === selectedRole)?.features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleContinue}
                className="bg-gradient-primary hover:opacity-90"
              >
                Enter Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
