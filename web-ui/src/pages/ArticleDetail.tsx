
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Eye, Clock, Share2, BookOpen, Star } from "lucide-react";
import { Article } from "@/services/ServiceInterface";
import { toast } from "sonner";
import axios from "axios";

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
      const loadArticle = async () => {
        if (!id) return;

        try {
          const response = await axios.get(`http://localhost:8000/articles/${id}`);
          const data = response.data;
          setArticle(data);
          
          // Add XP for reading an article
          if (data) {
            //mockApi.addXp(25, 'Read an article');
            toast.success('Great job reading! +25 XP', {
              icon: <Star className="h-4 w-4 text-yellow-500" />
            });
          }
        } catch (error) {
          console.error('Failed to load article:', error);
        } finally {
          setLoading(false);
        }
      };

    loadArticle();
  }, [id, navigate]);
  

  const handleLike = async () => {
    if (!article) return;
    
    try {
      // const updatedArticle = await mockApi.likeArticle(article.id);
      // if (updatedArticle) {
      //   setArticle(updatedArticle);
        
      //   if (updatedArticle.isLiked) {
      //     //mockApi.addXp(10, 'Liked an article');
      //     toast.success('Article liked! +10 XP', {
      //       icon: <Heart className="h-4 w-4 text-red-500" />
      //     });
      //   }
      // }

      setArticle({...article, isLiked: !article.isLiked, likes: article.isLiked ? article.likes - 1 : article.likes + 1 });
      toast.success('Article liked! +10 XP', {
            icon: <Heart className="h-4 w-4 text-red-500" />
          });
    } catch (error) {
      console.error('Failed to like article:', error);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Article link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-6">The article you're looking for doesn't exist.</p>
            <Link to="/articles">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Articles
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link to="/articles" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Articles
        </Link>

        {/* Article Header */}
        <div className="mb-8">
          <img 
            src={article.thumbnail}
            alt={article.title}
            className="w-full h-64 md:h-80 rounded-lg object-cover mb-6"
          />
          
          <div className="flex items-center gap-2 mb-4">
            {article.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary">{tag.name}</Badge>
            ))}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{article.title}</h1>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <img 
                src={article.author.avatar}
                alt={article.author.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="font-medium">{article.author.name}</p>
                <p className="text-sm text-gray-500">
                  {new Date(article.publishDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {article.readTime} min read
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {article.views} views
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLike}
                  className={`flex items-center gap-1 ${
                    article.isLiked ? 'text-red-500 border-red-200' : ''
                  }`}
                >
                  <Heart className={`h-4 w-4 ${article.isLiked ? 'fill-current' : ''}`} />
                  {article.likes}
                </Button>
                
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <Card className="p-8">
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </Card>

        {/* Related Articles Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Continue Reading</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-4 hover-lift">
              <img 
                src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200&h=120&fit=crop"
                alt="Related article"
                className="w-full h-24 rounded object-cover mb-3"
              />
              <h3 className="font-semibold mb-2">Understanding React Hooks</h3>
              <p className="text-sm text-gray-600 mb-3">Deep dive into useState, useEffect, and custom hooks...</p>
              <Button size="sm" variant="outline" className="w-full">
                <BookOpen className="h-4 w-4 mr-2" />
                Read Article
              </Button>
            </Card>
            
            <Card className="p-4 hover-lift">
              <img 
                src="https://images.unsplash.com/photo-1561070791-2526d30994b5?w=200&h=120&fit=crop"
                alt="Related article"
                className="w-full h-24 rounded object-cover mb-3"
              />
              <h3 className="font-semibold mb-2">Design Systems Best Practices</h3>
              <p className="text-sm text-gray-600 mb-3">Creating scalable and maintainable design systems...</p>
              <Button size="sm" variant="outline" className="w-full">
                <BookOpen className="h-4 w-4 mr-2" />
                Read Article
              </Button>
            </Card>
          </div>
          
          <div className="text-center mt-8">
            <Link to="/articles">
              <Button variant="outline">
                Explore More Articles
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
