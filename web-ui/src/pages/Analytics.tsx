
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, Eye, Heart, MessageCircle, Users, 
  Calendar, BarChart3, DollarSign, Target,
  ArrowUp, ArrowDown, Download
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AnalyticsData {
  role: string;
  metrics: {
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalEarnings: number;
    growth: {
      views: number;
      likes: number;
      earnings: number;
    };
  };
  topContent: Array<{
    id: string;
    title: string;
    views: number;
    likes: number;
    earnings?: number;
  }>;
  audience: {
    demographics: Array<{
      category: string;
      percentage: number;
    }>;
    interests: string[];
  };
  recommendations: string[];
}

const Analytics = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userRole = localStorage.getItem('userRole');
    
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    if (userRole === 'consumer') {
      navigate('/dashboard');
      return;
    }

    // Mock API call based on user role
    setTimeout(() => {
      if (userRole === 'maker') {
        setAnalytics({
          role: 'maker',
          metrics: {
            totalViews: 15420,
            totalLikes: 2340,
            totalComments: 456,
            totalEarnings: 0, // Content makers don't have direct earnings
            growth: {
              views: 12.5,
              likes: 8.3,
              earnings: 0
            }
          },
          topContent: [
            { id: '1', title: 'Mediterranean Diet Guide', views: 5420, likes: 834 },
            { id: '2', title: 'Future of Remote Work', views: 3890, likes: 567 },
            { id: '3', title: 'Photography Tips', views: 2340, likes: 423 }
          ],
          audience: {
            demographics: [
              { category: 'Health & Wellness', percentage: 35 },
              { category: 'Business', percentage: 28 },
              { category: 'Technology', percentage: 22 },
              { category: 'Lifestyle', percentage: 15 }
            ],
            interests: ['Health', 'Productivity', 'Technology', 'Photography', 'Nutrition']
          },
          recommendations: [
            'Focus on health and wellness content - your highest engagement category',
            'Consider creating video content to increase engagement',
            'Post consistently during weekday mornings for better reach',
            'Collaborate with other content creators in your niche'
          ]
        });
      } else if (userRole === 'provider') {
        setAnalytics({
          role: 'provider',
          metrics: {
            totalViews: 0, // Providers track usage instead
            totalLikes: 0,
            totalComments: 0,
            totalEarnings: 433.60,
            growth: {
              views: 0,
              likes: 0,
              earnings: 15.2
            }
          },
          topContent: [
            { id: '1', title: 'Mountain Sunrise Timelapse', views: 23, likes: 0, earnings: 115.50 },
            { id: '2', title: 'Ocean Waves Calm', views: 45, likes: 0, earnings: 202.30 },
            { id: '3', title: 'City Traffic Night', views: 15, likes: 0, earnings: 67.20 }
          ],
          audience: {
            demographics: [
              { category: 'Nature Content', percentage: 45 },
              { category: 'Urban Scenes', percentage: 30 },
              { category: 'Abstract/Artistic', percentage: 15 },
              { category: 'Lifestyle', percentage: 10 }
            ],
            interests: ['Nature', 'Timelapses', 'Urban', 'Relaxation', 'Background Videos']
          },
          recommendations: [
            'Nature content performs best - consider uploading more landscapes',
            'Timelapse videos have higher demand and earnings potential',
            'Urban night scenes are trending - great opportunity',
            'Consider creating loopable content for better usage rates'
          ]
        });
      }
      setLoading(false);
    }, 500);
  }, [navigate, timeRange]);

  if (loading || !analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isProvider = analytics.role === 'provider';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="gradient-text">Analytics Dashboard</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {isProvider ? 'Track your media performance and earnings' : 'Monitor your content performance and audience'}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {!isProvider && (
            <>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Views</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <ArrowUp className="h-3 w-3" />
                    {analytics.metrics.growth.views}%
                  </div>
                </div>
                <p className="text-2xl font-bold">{analytics.metrics.totalViews.toLocaleString()}</p>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Likes</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <ArrowUp className="h-3 w-3" />
                    {analytics.metrics.growth.likes}%
                  </div>
                </div>
                <p className="text-2xl font-bold">{analytics.metrics.totalLikes.toLocaleString()}</p>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-purple-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Comments</span>
                  </div>
                </div>
                <p className="text-2xl font-bold">{analytics.metrics.totalComments}</p>
              </Card>
            </>
          )}
          
          {isProvider && (
            <>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <ArrowUp className="h-3 w-3" />
                    {analytics.metrics.growth.earnings}%
                  </div>
                </div>
                <p className="text-2xl font-bold">${analytics.metrics.totalEarnings.toFixed(2)}</p>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Usage</span>
                  </div>
                </div>
                <p className="text-2xl font-bold">{analytics.topContent.reduce((sum, item) => sum + item.views, 0)}</p>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Avg. Per Use</span>
                  </div>
                </div>
                <p className="text-2xl font-bold">
                  ${(analytics.metrics.totalEarnings / analytics.topContent.reduce((sum, item) => sum + item.views, 0)).toFixed(2)}
                </p>
              </Card>
            </>
          )}
          
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {isProvider ? 'Media Files' : 'Total Articles'}
                </span>
              </div>
            </div>
            <p className="text-2xl font-bold">{analytics.topContent.length}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Performing Content */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {isProvider ? 'Top Earning Media' : 'Top Performing Articles'}
            </h3>
            <div className="space-y-4">
              {analytics.topContent.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium truncate max-w-[200px]">{item.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {isProvider ? `${item.views} uses` : `${item.views.toLocaleString()} views`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {isProvider ? (
                      <p className="font-bold text-green-600">${item.earnings?.toFixed(2)}</p>
                    ) : (
                      <p className="font-bold">{item.likes} likes</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Audience Insights */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              {isProvider ? 'Content Categories' : 'Audience Interests'}
            </h3>
            <div className="space-y-4">
              {analytics.audience.demographics.map((demo) => (
                <div key={demo.category} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{demo.category}</span>
                    <span>{demo.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${demo.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <h4 className="font-medium mb-3">
                {isProvider ? 'Popular Tags' : 'Top Interests'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {analytics.audience.interests.map((interest) => (
                  <Badge key={interest} variant="outline">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>

          {/* Recommendations */}
          <Card className="p-6 lg:col-span-2">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5" />
              {isProvider ? 'Optimization Recommendations' : 'Content Strategy Recommendations'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics.recommendations.map((rec, index) => (
                <div key={index} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
