import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, Trophy, Target, TrendingUp, Award, Zap, Coins, Gift } from "lucide-react";
import { mockApi, User, Achievement } from "@/services/mockApi";

const Gamification = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(850); // Mock credits

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await mockApi.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = ((user.totalXp % 1000) / 1000) * 100;

  const milestones = [
    { level: 5, title: "Explorer", description: "Reached level 5", unlocked: user.level >= 5 },
    { level: 10, title: "Scholar", description: "Reached level 10", unlocked: user.level >= 10 },
    { level: 15, title: "Expert", description: "Reached level 15", unlocked: user.level >= 15 },
    { level: 20, title: "Master", description: "Reached level 20", unlocked: user.level >= 20 },
  ];

  const stats = [
    { label: "Total XP", value: user.totalXp, icon: Star, color: "text-yellow-600" },
    { label: "Current Level", value: user.level, icon: Trophy, color: "text-blue-600" },
    { label: "Achievements", value: user.achievements.length, icon: Award, color: "text-purple-600" },
    { label: "XP to Next Level", value: user.xpToNext, icon: Target, color: "text-green-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">Your Progress</span>
          </h1>
          <p className="text-xl text-gray-600">
            Track your learning journey and achievements
          </p>
        </div>

        {/* Level Progress Card */}
        <Card className="p-8 mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Level {user.level}</h2>
              <p className="text-gray-600">
                {user.xpToNext > 0 ? `${user.xpToNext} XP to next level` : 'Max level reached!'}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-2xl font-bold text-yellow-600">
                <Star className="h-8 w-8" />
                {user.totalXp} XP
              </div>
              <p className="text-sm text-gray-600">Total Experience</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {user.level + 1}</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>
        </Card>

        {/* Stats Grid with Credits */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-6 text-center">
              <div className={`w-12 h-12 ${stat.color} mx-auto mb-3 flex items-center justify-center bg-gray-100 rounded-full`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </Card>
          ))}
          
          {/* Credits Card */}
          <Card className="p-6 text-center bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
            <div className="w-12 h-12 text-emerald-600 mx-auto mb-3 flex items-center justify-center bg-emerald-100 rounded-full">
              <Coins className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold mb-1 text-emerald-700">{credits}</div>
            <div className="text-sm text-emerald-600 font-medium">Credits</div>
            <div className="text-xs text-emerald-500 mt-1">For rewards & gadgets</div>
          </Card>
        </div>

        {/* Credits Details Card */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-semibold text-emerald-800 flex items-center gap-2">
              <Gift className="h-6 w-6" />
              Rewards & Credits
            </h3>
            <Badge className="bg-emerald-100 text-emerald-800 text-lg px-3 py-1">
              {credits} Credits Available
            </Badge>
          </div>
          
          <p className="text-emerald-700 mb-4">
            Use your credits to get free stuff, gadgets, and exclusive offers from local shops and supermarkets!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-emerald-200">
              <h4 className="font-semibold text-emerald-800 mb-2">Coffee Voucher</h4>
              <p className="text-sm text-emerald-600 mb-2">Free coffee at partner cafes</p>
              <Badge variant="outline" className="text-emerald-600 border-emerald-300">50 Credits</Badge>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-emerald-200">
              <h4 className="font-semibold text-emerald-800 mb-2">Tech Gadgets</h4>
              <p className="text-sm text-emerald-600 mb-2">Discount on electronics</p>
              <Badge variant="outline" className="text-emerald-600 border-emerald-300">200 Credits</Badge>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-emerald-200">
              <h4 className="font-semibold text-emerald-800 mb-2">Grocery Discount</h4>
              <p className="text-sm text-emerald-600 mb-2">10% off at supermarkets</p>
              <Badge variant="outline" className="text-emerald-600 border-emerald-300">100 Credits</Badge>
            </div>
          </div>
        </Card>

        {/* Achievements Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Unlocked Achievements */}
          <Card className="p-6">
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-600" />
              Achievements
            </h3>
            
            <div className="space-y-4">
              {user.achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-start gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{achievement.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-yellow-100 text-yellow-800">
                        +{achievement.xpReward} XP
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {user.achievements.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No achievements unlocked yet</p>
                  <p className="text-sm">Keep reading and engaging to earn your first achievement!</p>
                </div>
              )}
            </div>
          </Card>

          {/* Milestones */}
          <Card className="p-6">
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              Milestones
            </h3>
            
            <div className="space-y-4">
              {milestones.map((milestone) => (
                <div 
                  key={milestone.level} 
                  className={`flex items-center gap-4 p-4 rounded-lg border ${
                    milestone.unlocked 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    milestone.unlocked 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {milestone.unlocked ? (
                      <Trophy className="h-6 w-6" />
                    ) : (
                      <span className="font-bold">{milestone.level}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${
                      milestone.unlocked ? 'text-green-800' : 'text-gray-600'
                    }`}>
                      {milestone.title}
                    </h4>
                    <p className={`text-sm ${
                      milestone.unlocked ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {milestone.description}
                    </p>
                  </div>
                  {milestone.unlocked && (
                    <Badge className="bg-green-100 text-green-800">
                      <Zap className="h-3 w-3 mr-1" />
                      Unlocked
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Gamification;