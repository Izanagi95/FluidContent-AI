
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
          title: 'Sunset Over the Colosseum',
          filename: 'colosseum_sunset_rome.mp4',
          uploadDate: '2024-02-01',
          duration: '1:20',
          fileSize: '280 MB',
          usageCount: 30,
          earnings: 135.00,
          tags: ['Rome', 'Colosseum', 'Sunset', 'Italy', 'Historic'],
          thumbnail: 'https://colosseumrometickets.com/wp-content/uploads/2023/08/Colosseum-Sunset-Tour-2-1.jpg'
        },
        {
          id: '2',
          title: 'Burj Khalifa Aerial View',
          filename: 'burj_khalifa_drone_dubai.mp4',
          uploadDate: '2024-01-28',
          duration: '2:10',
          fileSize: '400 MB',
          usageCount: 42,
          earnings: 198.75,
          tags: ['Dubai', 'Burj Khalifa', 'Skyscraper', 'Aerial', 'UAE'],
          thumbnail: 'https://i.ytimg.com/vi/4LuBVXWpDss/hqdefault.jpg'
        },
        {
          id: '3',
          title: 'Mystical Machu Picchu Morning',
          filename: 'machu_picchu_morning_timelapse.mp4',
          uploadDate: '2024-01-25',
          duration: '1:50',
          fileSize: '350 MB',
          usageCount: 38,
          earnings: 172.40,
          tags: ['Peru', 'Machu Picchu', 'Mountains', 'Timelapse', 'Inca'],
          thumbnail: 'https://www.boletomachupicchu.com/gutblt/wp-content/uploads/2024/10/machu-picchu-turistas-vista-panoramica-full.jpg'
        },
        {
          id: '4',
          title: 'The Great Wall',
          filename: 'great_wall_china_walk.mp4',
          uploadDate: '2024-01-22',
          duration: '3:00',
          fileSize: '500 MB',
          usageCount: 50,
          earnings: 225.00,
          tags: ['China', 'Great Wall', 'Travel', 'Historic', 'Scenic'],
          thumbnail: 'https://euc7zxtct58.exactdn.com/wp-content/uploads/2023/09/21113054/Great-Wall-of-China-Charity-Trek_2.jpg?strip=all&lossy=1&quality=85&ssl=1'
        },
        {
          id: '5',
          title: 'Golden Hour at Eiffel Tower',
          filename: 'eiffel_tower_golden_hour.mp4',
          uploadDate: '2024-02-05',
          duration: '1:30',
          fileSize: '310 MB',
          usageCount: 36,
          earnings: 162.00,
          tags: ['Paris', 'Eiffel Tower', 'Sunset', 'France', 'Landmark'],
          thumbnail: 'https://images.stockcake.com/public/3/2/6/326c58ff-c6ae-498b-bc3e-0e367e549b45_large/parisian-childhood-joy-stockcake.jpg'
        },
        {
          id: '6',
          title: 'Taj Mahal Reflection',
          filename: 'taj_mahal_reflection.mp4',
          uploadDate: '2024-02-03',
          duration: '2:00',
          fileSize: '390 MB',
          usageCount: 40,
          earnings: 190.00,
          tags: ['India', 'Taj Mahal', 'Reflection', 'Architecture', 'Heritage'],
          thumbnail: 'https://media.tacdn.com/media/attractions-splice-spp-674x446/0e/8f/88/03.jpg'
        },
        {
          id: '7',
          title: 'Petra by Moonlight',
          filename: 'petra_moonlight_walk.mp4',
          uploadDate: '2024-01-30',
          duration: '1:45',
          fileSize: '320 MB',
          usageCount: 27,
          earnings: 120.50,
          tags: ['Jordan', 'Petra', 'Moonlight', 'Ruins', 'Desert'],
          thumbnail: 'https://www.archetravel.com/wp-content/uploads/2020/06/petra-by-night_inside-620x245.jpg'
        },
        {
          id: '8',
          title: 'Pyramids of Giza Aerial',
          filename: 'pyramids_giza_drone.mp4',
          uploadDate: '2024-01-26',
          duration: '2:20',
          fileSize: '420 MB',
          usageCount: 48,
          earnings: 210.00,
          tags: ['Egypt', 'Pyramids', 'Giza', 'Drone', 'Desert'],
          thumbnail: 'https://images.stockcake.com/public/e/8/b/e8bc34cd-6492-4728-91f5-ac5ad757b0da_large/majestic-pyramid-view-stockcake.jpg'
        },
        {
          id: '9',
          title: 'Angkor Wat Sunrise',
          filename: 'angkor_wat_sunrise.mp4',
          uploadDate: '2024-01-23',
          duration: '1:55',
          fileSize: '360 MB',
          usageCount: 33,
          earnings: 155.25,
          tags: ['Cambodia', 'Angkor Wat', 'Sunrise', 'Temple', 'Ancient'],
          thumbnail: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-674x446/13/2b/cc/9f.jpg'
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
