
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {Plus, Users, Edit, BarChart3, Camera, FileText, X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

  // Maker Dashboard
  const MakerDashboard = () => { 
    const navigate = useNavigate();
    
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);

    const clearInputs = () => {
      setTitle("");
      setContent("");
      setMediaFiles([]);
    }

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setMediaFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveDraft = async () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    mediaFiles.forEach((img) => formData.append("images", img));

    let res;
    try {
      res = await fetch("http://localhost:8000/save-draft", {
      method: "POST",
      body: formData,
    });
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Error saving draft:", error.message);
    }

    if (res.ok) {
      toast.success("Draft saved!");
      clearInputs();
    } else {
      toast.error("Error saving draft.");
    }
  };

    return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 hover-lift cursor-pointer" >
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
          <Input placeholder="Article title..." className="text-lg" onChange={(e) => setTitle(e.target.value)} value={title}/>
          <Textarea
            placeholder="Start writing your content here..."
            className="min-h-[200px] resize-none"
            onChange={(e) => setContent(e.target.value)}
            value={content}
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
              {/* <Button variant="outline" size="sm">
                <Star className="h-4 w-4 mr-2" />
                Add Interest Tags
              </Button> */}
            </div>
            <Button onClick={handleSaveDraft} className="bg-gradient-primary">Save Draft</Button>
          </div>
        </div>
          <div className="flex flex-wrap gap-2 mt-2">
             {mediaFiles.length > 0 && (
                <div className="flex flex-wrap gap-3 pt-2">
                  {mediaFiles.map((file, index) => (
                    <div
                      key={index}
                      className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shadow-sm"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`preview-${index}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeMedia(index)}
                        className="absolute top-0 right-0 bg-white/70 hover:bg-red-500 text-black hover:text-white rounded-bl px-1 transition-colors duration-200"
                        title="Remove"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
      </Card>

    </div>
  );
};



export default MakerDashboard;
