
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Heart, Eye, Clock, X, SlidersHorizontal } from "lucide-react";
import { mockApi, Article } from "@/services/ServiceInterface";
import axios from "axios";

const Articles = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

      const loadArticles = async () => {
      try {
        const response = await axios.get('http://localhost:8000/articles');
        setArticles(response.data);
      } catch (error) {
        console.error('Failed to load articles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [navigate]);


// allTags ora sono i nomi unici dei tag
const allTags = [...new Set(articles.flatMap(article => article.tags.map(tag => tag.name)))];

const filteredArticles = articles.filter(article => {
  const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.author.name.toLowerCase().includes(searchQuery.toLowerCase());

  const matchesTags = selectedTags.length === 0 ||
    selectedTags.some(tagName => article.tags.some(t => t.name === tagName));

  return matchesSearch && matchesTags;
});

const toggleTag = (tagName: string) => {
  setSelectedTags(prev =>
    prev.includes(tagName)
      ? prev.filter(t => t !== tagName)
      : [...prev, tagName]
  );
};

  const clearFilters = () => {
    setSelectedTags([]);
    setSearchQuery('');
  };

  // const handleLike = async (articleId: string) => {
  //   try {
  //     const updatedArticle = await mockApi.likeArticle(articleId);
  //     if (updatedArticle) {
  //       setArticles(prev => prev.map(article => 
  //         article.id === articleId ? updatedArticle : article
  //       ));
        
  //       // Add XP for liking an article
  //       if (updatedArticle.isLiked) {
  //         //mockApi.addXp(10, 'Liked an article');
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Failed to like article:', error);
  //   }
  // };

  const handleLike = (articleId: string) => {
    setArticles(prev => prev.map(article => article.id === articleId ? {...article, isLiked: !article.isLiked, likes: article.isLiked ? article.likes - 1 : article.likes + 1 } : article));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">Discover Articles</span>
          </h1>
          <p className="text-xl text-gray-600">
            Explore curated content tailored to your interests
          </p>
        </div>

        {/* Enhanced Search and Filters */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search articles, authors, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters {selectedTags.length > 0 && `(${selectedTags.length})`}
              </Button>
              {(selectedTags.length > 0 || searchQuery) && (
                <Button variant="ghost" onClick={clearFilters}>
                  Clear All
                </Button>
              )}
            </div>

            {/* Filter Tags */}
            {showFilters && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-3">Filter by topics:</h3>
                <div className="flex gap-2 flex-wrap">
                  {allTags.map((tagName) => (
                    <Badge 
                      key={tagName}
                      variant={selectedTags.includes(tagName) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/10"
                      onClick={() => toggleTag(tagName)}
                    >
                      {tagName}
                      {selectedTags.includes(tagName) && (
                        <X className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Active Filters */}
            {selectedTags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600">Active filters:</span>
                {selectedTags.map((tag) => (
                  <Badge key={tag} className="bg-primary/10 text-primary border-primary/20">
                    {tag}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer hover:text-red-500" 
                      onClick={() => toggleTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Results Summary */}
        {(searchQuery || selectedTags.length > 0) && (
          <div className="mb-6">
            <p className="text-gray-600">
              Found {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
              {searchQuery && ` matching "${searchQuery}"`}
              {selectedTags.length > 0 && ` in ${selectedTags.join(', ')}`}
            </p>
          </div>
        )}

        {/* Articles Grid */}
        <div className="grid gap-6">
          {filteredArticles.map((article) => (
            <Card key={article.id} className="p-6 hover-lift">
              <div className="flex flex-col md:flex-row gap-6">
                <img 
                  src={article.thumbnail}
                  alt={article.title}
                  className="w-full md:w-48 h-32 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                  {article.tags.map((tag) => (
                  <Badge 
                    key={tag.id}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => toggleTag(tag.name)}
                  >
                    {tag.name}
                  </Badge>
                ))}
                  </div>
                  
                  <Link to={`/articles/${article.id}`}>
                    <h3 className="text-2xl font-semibold mb-2 hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                  </Link>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <img 
                          src={article.author.avatar}
                          alt={article.author.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="text-sm font-medium">{article.author.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(article.publishDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {article.readTime} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {article.views}
                        </span>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(article.id)}
                        className={`flex items-center gap-1 ${
                          article.isLiked ? 'text-red-500' : 'text-gray-500'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${article.isLiked ? 'fill-current' : ''}`} />
                        {article.likes}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No articles found matching your criteria.</p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Articles;
