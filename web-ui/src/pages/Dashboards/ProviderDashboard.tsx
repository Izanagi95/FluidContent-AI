
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Search, Filter, Plus, BookOpen, TrendingUp, Users, Star,
  Upload, Edit, BarChart3, Heart, MessageCircle,
  Play, Camera, Video, FileText, X
} from "lucide-react";
import { useNavigate } from "react-router-dom";

  // Provider Dashboard
  const ProviderDashboard = () => { 
    const navigate = useNavigate();
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);

    const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        const newFiles = Array.from(files);
        setMediaFiles(prev => [...prev, ...newFiles]);
      }
    };

    return (
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
              src="https://colosseumrometickets.com/wp-content/uploads/2023/08/Colosseum-Sunset-Tour-2-1.jpg"
              alt="Colosseum in Rome"
              className="w-full h-24 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <div className="text-white text-center text-xs">
                <p className="font-medium">Colosseum Sunset</p>
                <p>30 uses • $135.00</p>
              </div>
            </div>
          </div>

          <div className="relative group">
            <img
              src="https://i.ytimg.com/vi/4LuBVXWpDss/hqdefault.jpg"
              alt="Burj Khalifa Aerial"
              className="w-full h-24 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <div className="text-white text-center text-xs">
                <p className="font-medium">Burj Khalifa Aerial</p>
                <p>42 uses • $198.75</p>
              </div>
            </div>
          </div>

          <div className="relative group">
            <img
              src="https://www.boletomachupicchu.com/gutblt/wp-content/uploads/2024/10/machu-picchu-turistas-vista-panoramica-full.jpg"
              alt="Machu Picchu"
              className="w-full h-24 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <div className="text-white text-center text-xs">
                <p className="font-medium">Machu Picchu Morning</p>
                <p>38 uses • $172.40</p>
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
  };

export default ProviderDashboard;
