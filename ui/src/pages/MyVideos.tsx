
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, Upload, Play, Eye, DollarSign, 
  Video, TrendingUp, Calendar, BarChart3 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface VideoFile {
  id: string;
  title: string;
  filename: string;
  uploadDate: string;
  duration: string;
  fileSize: string;
  usageCount: number;
  earnings: number;
  tags: string[];
  thumbnail: string;
}

const MyVideos = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication and role
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userRole = localStorage.getItem('userRole');
    
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    if (userRole !== 'provider') {
      navigate('/dashboard');
      return;
    }

    // Mock API call to get user's videos
    setTimeout(() => {
      setVideos([
        {
          id: '1',
          title: 'Mountain Sunrise Timelapse',
          filename: 'mountain_sunrise_4k.mp4',
          uploadDate: '2024-01-20',
          duration: '2:30',
          fileSize: '450 MB',
          usageCount: 23,
          earnings: 115.50,
          tags: ['Nature', 'Mountain', 'Sunrise', 'Timelapse'],
          thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop'
        },
        {
          id: '2',
          title: 'City Traffic at Night',
          filename: 'city_traffic_night.mp4',
          uploadDate: '2024-01-18',
          duration: '1:45',
          fileSize: '320 MB',
          usageCount: 15,
          earnings: 67.20,
          tags: ['City', 'Traffic', 'Night', 'Urban'],
          thumbnail: 'https://images.unsplash.com/photo-1519871117077-f4b94463c4ad?w=300&h=200&fit=crop'
        },
        {
          id: '3',
          title: 'Ocean Waves Calm',
          filename: 'ocean_waves_loop.mp4',
          uploadDate: '2024-01-15',
          duration: '0:30',
          fileSize: '180 MB',
          usageCount: 45,
          earnings: 202.30,
          tags: ['Ocean', 'Waves', 'Relaxing', 'Loop'],
          thumbnail: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=300&h=200&fit=crop'
        },
        {
          id: '4',
          title: 'Forest Rain Ambience',
          filename: 'forest_rain_audio.mp3',
          uploadDate: '2024-01-12',
          duration: '10:00',
          fileSize: '95 MB',
          usageCount: 12,
          earnings: 48.60,
          tags: ['Forest', 'Rain', 'Ambience', 'Audio'],
          thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop'
        }
      ]);
      setLoading(false);
    }, 500);
  }, [navigate]);

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalEarnings = videos.reduce((sum, video) => sum + video.earnings, 0);
  const totalUsage = videos.reduce((sum, video) => sum + video.usageCount, 0);
  const topPerformer = videos.reduce((top, video) => 
    video.earnings > top.earnings ? video : top, videos[0] || { earnings: 0, title: 'None' }
  );

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Mock file upload process
      console.log('Files selected for upload:', files);
      // Here you would typically handle the file upload
      alert(`Selected ${files.length} file(s) for upload`);
    }
  };

  if (loading) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="gradient-text">My Videos</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Manage your uploaded media and track earnings
            </p>
          </div>
          <div className="flex gap-3">
            <Button className="bg-gradient-primary">
              <label className="flex items-center cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Upload Media
                <input
                  type="file"
                  multiple
                  accept="video/*,audio/*,image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Media</p>
                <p className="text-2xl font-bold">{videos.length}</p>
              </div>
              <Video className="h-8 w-8 text-blue-500" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</p>
                <p className="text-2xl font-bold">${totalEarnings.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Usage</p>
                <p className="text-2xl font-bold">{totalUsage}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-500" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Top Performer</p>
                <p className="text-lg font-bold truncate">{topPerformer.title}</p>
                <p className="text-sm text-green-600">${topPerformer.earnings?.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </Card>
        </div>

        {/* Search */}
        <Card className="p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search videos by title or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <Card key={video.id} className="overflow-hidden hover-lift">
              <div className="relative">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="h-12 w-12 text-white" />
                </div>
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold mb-2 line-clamp-2">{video.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{video.filename}</p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {video.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {video.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{video.tags.length - 3}
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Uploaded:</span>
                    <span>{new Date(video.uploadDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">File Size:</span>
                    <span>{video.fileSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Usage Count:</span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {video.usageCount}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-600 dark:text-gray-400">Earnings:</span>
                    <span className="text-green-600">${video.earnings.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" className="flex-1">
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Analytics
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Play className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          
          {filteredVideos.length === 0 && (
            <div className="col-span-full">
              <Card className="p-12 text-center">
                <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No videos found</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {searchQuery ? 'Try adjusting your search terms' : 'Start uploading your first media files'}
                </p>
                <Button className="bg-gradient-primary">
                  <label className="flex items-center cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Media
                    <input
                      type="file"
                      multiple
                      accept="video/*,audio/*,image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </Button>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyVideos;
