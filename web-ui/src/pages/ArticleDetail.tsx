import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Heart, Eye, Clock, Share2, BookOpen, Star, Brain, CheckCircle, ExternalLink, MonitorPlay , HelpCircle, Play, Pause, Square } from "lucide-react";
import { Article } from "@/services/ServiceInterface";
import { toast } from "sonner";
import axios from "axios";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { marked } from 'marked';


interface EnhancedContent {
  adapted_text: string;
  key_takeaways: string[];
  suggested_title: string;
  sentiment_analysis: string;
  quiz: Array<{
    question: string;
    options: string[];
    correct_answer: number;
  }>;
}

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<{[key: number]: number}>({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [showIframe, setShowIframe] = useState(false);

  const { speak, pause, resume, stop, isPlaying, isPaused, isSupported } = useTextToSpeech();


  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

const userData = localStorage.getItem("user");
const userId = userData ? JSON.parse(userData).id : null;

const loadArticle = async () => {
        if (!id) return;

        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/enhanced-articles/${id}/user/${userId}`);
          const data = response.data;
          setArticle({...data, enhanced_content: {...data.enhanced_content//, 
            // quiz: [
            //   {
            //     question: "What is the most important factor for successful implementation?",
            //     options: ["Speed", "Planning", "Tools", "Budget"],
            //     correct_answer: 1
            //   },
            //   {
            //     question: "How can you accelerate your learning process?",
            //     options: ["Working alone", "Using expensive tools", "Collaboration and sharing", "Avoiding mistakes"],
            //     correct_answer: 2
            //   },
            //   {
            //     question: "What leads to mastery according to the article?",
            //     options: ["Natural talent", "Expensive courses", "Regular practice and iteration", "Perfect planning"],
            //     correct_answer: 2
            //   }
            // ]
          },
            tags: data.tags == "" ? [] : data.tags.split(",").map((tag: string) => tag.trim())
          });
          
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

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    setSelectedQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const submitQuiz = () => {
    setShowQuizResults(true);
    const correctAnswers = article.enhanced_content?.quiz.filter((question, index) => 
      selectedQuizAnswers[index] === question.correct_answer
    ).length || 0;
    
    if (correctAnswers > 0) {
      const xpEarned = correctAnswers * 15;
      toast.success(`Great job! +${xpEarned} XP for quiz completion`, {
        icon: <Brain className="h-4 w-4 text-purple-500" />
      });
    }
  };

const openExternalResource = () => {
    setShowIframe(!showIframe);
  };

    const handleTextToSpeech = () => {
    if (!article.enhanced_content) return;

    if (isPlaying && !isPaused) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      // Create a comprehensive text to read
      const textToRead = `
        ${marked(article.enhanced_content.adapted_text)}
        Key takeaways: ${article.enhanced_content.key_takeaways.join('. ')}.
        Sentiment analysis: ${article.enhanced_content.sentiment_analysis}
      `;
      speak(textToRead);
    }
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
              <Badge key={tag} variant="secondary">{tag}</Badge>
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

        {/* Content Tabs */}
        <Tabs defaultValue="enhanced" className="mb-12">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="enhanced" 
              className="flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />
              AI Enhanced
            </TabsTrigger>
            <TabsTrigger value="original" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Original Content
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="original" className="mt-6">
            <Card className="p-8">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </Card>
          </TabsContent>
          
          <TabsContent value="enhanced" className="mt-6 space-y-6">
            {(
              <>
              {/* Text-to-Speech Controls */}
                {(
                  <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <BookOpen className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-green-800">Listen to Enhanced Content</h3>
                          <p className="text-sm text-green-600">Have the AI-enhanced content read aloud to you</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={handleTextToSpeech}
                          variant="outline"
                          size="sm"
                          className="bg-white border-green-300 text-green-700 hover:bg-green-50"
                        >
                          {isPlaying && !isPaused ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                          {isPlaying && !isPaused ? 'Pause' : isPaused ? 'Resume' : 'Play'}
                        </Button>
                        {isPlaying && (
                          <Button
                            onClick={stop}
                            variant="outline"
                            size="sm"
                            className="bg-white border-red-300 text-red-700 hover:bg-red-50"
                          >
                            <Square className="h-4 w-4" />
                            Stop
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                )}

          
                {/* Enhanced Content */}
                <Card className="p-8">
                  <div 
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: article.enhanced_content.adapted_text }}
                  />
                </Card>

                {/* Key Takeaways */}
                <Card className="p-6">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Key Takeaways
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ul className="space-y-2">
                      {article.enhanced_content.key_takeaways.map((takeaway, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                          <span>{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Sentiment Analysis */}
                <Card className="p-6">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-blue-500" />
                      Sentiment Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="text-gray-700">{article.enhanced_content.sentiment_analysis}</p>
                  </CardContent>
                </Card>

                {/* Quiz Section */}
                <Card className="p-6">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-orange-500" />
                      Knowledge Quiz
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-6">
                    {article.enhanced_content.quiz.map((question, questionIndex) => (
                      <div key={questionIndex} className="space-y-3">
                        <p className="font-medium">
                          {questionIndex + 1}. {question.question}
                        </p>
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <label key={optionIndex} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name={`question-${questionIndex}`}
                                value={optionIndex}
                                checked={selectedQuizAnswers[questionIndex] === optionIndex}
                                onChange={() => handleQuizAnswer(questionIndex, optionIndex)}
                                className="text-primary"
                              />
                              <span className={`${
                                showQuizResults && optionIndex === question.correct_answer
                                  ? 'text-green-600 font-medium'
                                  : showQuizResults && selectedQuizAnswers[questionIndex] === optionIndex && optionIndex !== question.correct_answer
                                  ? 'text-red-600'
                                  : ''
                              }`}>
                                {option}
                              </span>
                              {showQuizResults && optionIndex === question.correct_answer && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    {!showQuizResults && (
                      <Button 
                        onClick={submitQuiz}
                        className="w-full"
                        disabled={Object.keys(selectedQuizAnswers).length !== article.enhanced_content.quiz.length}
                      >
                        Submit Quiz
                      </Button>
                    )}
                    
                    {showQuizResults && (
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-green-800 font-medium">
                          Quiz completed! You got {article.enhanced_content.quiz.filter((q, i) => selectedQuizAnswers[i] === q.correct_answer).length} out of {article.enhanced_content.quiz.length} correct.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                 {/* External Resource */}
                  <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardHeader className="p-0 mb-4">
                      <CardTitle className="flex items-center gap-2 text-blue-800">
                        <MonitorPlay  className="h-5 w-5" />
                        Additional Resources
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <p className="text-blue-700 mb-4">
                        Explore related learning materials and deepen your understanding with external resources.
                      </p>
                      <Button onClick={openExternalResource} className="bg-blue-600 hover:bg-blue-700">
                        <MonitorPlay  className="h-4 w-4 mr-2" />
                        {showIframe ? 'Close' : 'Show'} Learning Resources
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Iframe shown on button click */}
                  {showIframe && (
                    <div className="mt-4 h-[90vh] w-full border border-gray-300" style={{ height: "600px", border: "1px solid #ccc" }}>
                      <iframe
                        src="/generated/code.html"
                        title="External Learning Resources"
                        width="100%"
                        height="100%"
                        style={{ border: "none" }}
                      />
                    </div>
                  )}
              </>
            )}
          </TabsContent>
        </Tabs>

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
