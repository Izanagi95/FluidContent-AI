
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, Plus, Edit, Trash2, Eye, BarChart3, 
  FileText, Calendar, TrendingUp 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  status: 'published' | 'draft';
  publishDate: string;
  views: number;
  likes: number;
  readTime: number;
  tags: string[];
}

const MyArticles = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication and role
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userRole = localStorage.getItem('userRole');
    
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    if (userRole !== 'maker') {
      navigate('/dashboard');
      return;
    }

    // Mock API call to get user's articles
    setTimeout(() => {
      setArticles([
        {
          id: '1',
          title: 'Complete Guide to Mediterranean Diet',
          excerpt: 'A comprehensive guide to healthy eating with Mediterranean principles...',
          status: 'published',
          publishDate: '2024-01-25',
          views: 1520,
          likes: 234,
          readTime: 8,
          tags: ['Health', 'Nutrition', 'Lifestyle']
        },
        {
          id: '2',
          title: 'Urban Photography Tips for Beginners',
          excerpt: 'Learn how to capture stunning urban scenes with basic equipment...',
          status: 'draft',
          publishDate: '',
          views: 0,
          likes: 0,
          readTime: 12,
          tags: ['Photography', 'Art', 'Tutorial']
        },
        {
          id: '3',
          title: 'The Future of Remote Work',
          excerpt: 'Exploring trends and tools that are shaping the future of work...',
          status: 'published',
          publishDate: '2024-01-20',
          views: 890,
          likes: 156,
          readTime: 15,
          tags: ['Business', 'Technology', 'Future']
        }
      ]);
      setLoading(false);
    }, 500);
  }, [navigate]);

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const publishedArticles = articles.filter(article => article.status === 'published');
  const draftArticles = articles.filter(article => article.status === 'draft');
  const totalViews = publishedArticles.reduce((sum, article) => sum + article.views, 0);
  const totalLikes = publishedArticles.reduce((sum, article) => sum + article.likes, 0);

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
              <span className="gradient-text">My Articles</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Manage your published and draft content
            </p>
          </div>
          <Button className="bg-gradient-primary">
            <Plus className="h-4 w-4 mr-2" />
            New Article
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Articles</p>
                <p className="text-2xl font-bold">{articles.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Published</p>
                <p className="text-2xl font-bold">{publishedArticles.length}</p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
                <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Likes</p>
                <p className="text-2xl font-bold">{totalLikes}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
          </Card>
        </div>

        {/* Search */}
        <Card className="p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search articles by title or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Articles List */}
        <div className="space-y-6">
          {filteredArticles.map((article) => (
            <Card key={article.id} className="p-6 hover-lift">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={article.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}>
                      {article.status === 'published' ? 'Published' : 'Draft'}
                    </Badge>
                    {article.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{article.excerpt}</p>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                    {article.status === 'published' && (
                      <>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(article.publishDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {article.views} views
                        </span>
                        <span>{article.likes} likes</span>
                      </>
                    )}
                    <span>{article.readTime} min read</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  {article.status === 'published' && (
                    <Button size="sm" variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analytics
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          
          {filteredArticles.length === 0 && (
            <Card className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No articles found</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {searchQuery ? 'Try adjusting your search terms' : 'Start creating your first article'}
              </p>
              <Button className="bg-gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Create Article
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyArticles;
