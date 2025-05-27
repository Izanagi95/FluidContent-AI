import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search, Filter, Heart, MessageCircle,
  Play, X
} from "lucide-react";


// Consumer Dashboard
const ConsumerDashboard = () =>{

    const navigate = useNavigate();
  
    const availableFilters = ['Fitness', 'Travel', 'Technology', 'Food', 'Art', 'Music', 'Sports', 'Science'];
    const [userRole, setUserRole] = useState<string>('consumer');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilters, setSelectedFilters] = useState<string[]>(['Fitness', 'Travel', 'Technology']);
  

    const addFilter = (filter: string) => {
      if (!selectedFilters.includes(filter)) {
        setSelectedFilters([...selectedFilters, filter]);
      }
    };

    const removeFilter = (filter: string) => {
      setSelectedFilters(selectedFilters.filter(f => f !== filter));
    };

    return  (
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
  )
};

export default ConsumerDashboard;
