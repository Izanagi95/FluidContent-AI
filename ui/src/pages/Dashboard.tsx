
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, Filter, Plus, BookOpen, TrendingUp, Users, Star, 
  Upload, Edit, BarChart3, Heart, MessageCircle,
  Play, Camera, Video, FileText, X
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string>('consumer');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['Fitness', 'Travel', 'Technology']);

  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'consumer';
    setUserRole(role);
    
    // Check authentication
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [navigate]);

  const addFilter = (filter: string) => {
    if (!selectedFilters.includes(filter)) {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };

  const removeFilter = (filter: string) => {
    setSelectedFilters(selectedFilters.filter(f => f !== filter));
  };

  const availableFilters = ['Fitness', 'Travel', 'Technology', 'Food', 'Art', 'Music', 'Sports', 'Science'];

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log('Media files selected:', files);
      alert(`Selected ${files.length} file(s) for upload`);
    }
  };

  // Consumer Dashboard
  const ConsumerDashboard = () => (
    <div className="space-y-6">
      {/* Enhanced Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search for content, topics, or authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Advanced Filters
          </Button>
        </div>
        
        {/* Selected Filters */}
        <div className="flex gap-2 mb-3 flex-wrap">
          {selectedFilters.map((filter) => (
            <Badge key={filter} className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1">
              {filter}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-red-500" 
                onClick={() => removeFilter(filter)}
              />
            </Badge>
          ))}
        </div>
        
        {/* Available Filters */}
        <div className="flex gap-2 flex-wrap">
          {availableFilters.filter(f => !selectedFilters.includes(f)).map((filter) => (
            <Badge 
              key={filter} 
              variant="outline" 
              className="cursor-pointer hover:bg-primary/5"
              onClick={() => addFilter(filter)}
            >
              + {filter}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Content Feed */}
      <div className="grid gap-6">
        <Card className="p-6 hover-lift">
          <div className="flex items-start gap-4">
            <img 
              src="https://images.unsplash.com/photo-1501854140801-50d01698950b?w=100&h=100&fit=crop"
              alt="Content thumbnail"
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Travel</Badge>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Fitness Enhanced</Badge>
              </div>
              <h3 className="text-xl font-semibold mb-2">Exploring Rome: A Fitness Enthusiast's Guide</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Discover the eternal city with a focus on outdoor fitness opportunities, 
                from morning runs along the Tiber to calisthenics in Villa Borghese...
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    124
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    18
                  </span>
                  <span>5 min read</span>
                </div>
                <Button size="sm" onClick={() => navigate('/articles/1')}>Read More</Button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover-lift">
          <div className="flex items-start gap-4">
            <img 
              src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=100&h=100&fit=crop"
              alt="Content thumbnail"
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">Technology</Badge>
                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Interactive Quiz</Badge>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI in Modern Web Development</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Learn how artificial intelligence is revolutionizing web development 
                with practical examples and hands-on exercises...
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    89
                  </span>
                  <span className="flex items-center gap-1">
                    <Play className="h-4 w-4" />
                    Quiz Available
                  </span>
                  <span>8 min read</span>
                </div>
                <Button size="sm" onClick={() => navigate('/articles/2')}>Start Learning</Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  // Maker Dashboard
  const MakerDashboard = () => (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 hover-lift cursor-pointer" onClick={() => navigate('/my-articles')}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold">New Article</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Start creating your next piece of content</p>
        </Card>

        <Card className="p-6 hover-lift cursor-pointer" onClick={() => navigate('/analytics')}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Analytics</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300">View your content performance</p>
        </Card>

        <Card className="p-6 hover-lift cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Collaborate</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Work with content providers</p>
        </Card>
      </div>

      {/* Recent Content */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Your Recent Content</h2>
          <Button onClick={() => navigate('/my-articles')}>View All</Button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <FileText className="h-8 w-8 text-gray-400" />
              <div>
                <h3 className="font-medium">Complete Guide to Mediterranean Diet</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Published 2 days ago • 1.2k views</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Published</Badge>
              <Button size="sm" variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <FileText className="h-8 w-8 text-gray-400" />
              <div>
                <h3 className="font-medium">Urban Photography Tips for Beginners</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Draft • Last edited 1 hour ago</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Draft</Badge>
              <Button size="sm" variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Continue
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Content Editor Preview */}
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Quick Create</h2>
        <div className="space-y-4">
          <Input placeholder="Article title..." className="text-lg" />
          <Textarea 
            placeholder="Start writing your content here..."
            className="min-h-[200px] resize-none"
          />
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <label className="flex items-center cursor-pointer">
                  <Camera className="h-4 w-4 mr-2" />
                  Add Media
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    onChange={handleMediaUpload}
                  />
                </label>
              </Button>
              <Button variant="outline" size="sm">
                <Star className="h-4 w-4 mr-2" />
                Add Interest Tags
              </Button>
            </div>
            <Button className="bg-gradient-primary">Save Draft</Button>
          </div>
        </div>
      </Card>
    </div>
  );

  // Provider Dashboard
  const ProviderDashboard = () => (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Upload Media Content</h2>
        <label className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer block">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Drop your media files here</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Support for images, videos, and audio files</p>
          <Button variant="outline" type="button">Browse Files</Button>
          <input
            type="file"
            accept="image/*,video/*,audio/*"
            multiple
            className="hidden"
            onChange={handleMediaUpload}
          />
        </label>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Total Earnings</h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-600">$433.60</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">+15% from last month</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Content Usage</h3>
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-600">95</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Total uses this month</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Media Files</h3>
            <Video className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-purple-600">24</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Active media files</p>
        </Card>
      </div>

      {/* Recent Uploads */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Recent Uploads</h2>
          <Button onClick={() => navigate('/my-videos')}>View All</Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="relative group">
            <img 
              src="https://images.unsplash.com/photo-1501854140801-50d01698950b?w=200&h=150&fit=crop"
              alt="Mountain landscape"
              className="w-full h-24 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <div className="text-white text-center text-xs">
                <p className="font-medium">Mountain View</p>
                <p>23 uses • $115.50</p>
              </div>
            </div>
          </div>

          <div className="relative group">
            <img 
              src="https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=200&h=150&fit=crop"
              alt="Ocean waves"
              className="w-full h-24 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <div className="text-white text-center text-xs">
                <p className="font-medium">Ocean Waves</p>
                <p>45 uses • $202.30</p>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="w-full h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Video className="h-6 w-6 text-white" />
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <div className="text-white text-center text-xs">
                <p className="font-medium">City Timelapse</p>
                <p>15 uses • $67.20</p>
              </div>
            </div>
          </div>

          <label className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg h-24 flex items-center justify-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
            <Plus className="h-6 w-6 text-gray-400" />
            <input
              type="file"
              accept="image/*,video/*,audio/*"
              multiple
              className="hidden"
              onChange={handleMediaUpload}
            />
          </label>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">Welcome back!</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {userRole === 'consumer' && "Discover content tailored just for you"}
            {userRole === 'maker' && "Create amazing content that adapts to your audience"}
            {userRole === 'provider' && "Share your authentic media and earn from it"}
          </p>
        </div>

        {userRole === 'consumer' && <ConsumerDashboard />}
        {userRole === 'maker' && <MakerDashboard />}
        {userRole === 'provider' && <ProviderDashboard />}
      </div>
    </div>
  );
};

export default Dashboard;
