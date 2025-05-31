import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Trophy, Star, BookOpen, Flame, Medal, Crown, Music, Play, Pause, Coins, Volume2 } from "lucide-react";
import { LeaderboardEntry } from "@/services/ServiceInterface";
import axios from "axios";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('all');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressUpdateInterval = useRef<NodeJS.Timeout | null>(null);

useEffect(() => {
  const loadLeaderboard = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/leaderboard`, {
        params: { timeframe } // if your API supports filtering by timeframe via query params
      });
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };
  loadLeaderboard();
}, [timeframe]);


  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio('resources/prize.mp3');
    
    const audio = audioRef.current;
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (progressUpdateInterval.current) {
        clearInterval(progressUpdateInterval.current);
      }
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      if (progressUpdateInterval.current) {
        clearInterval(progressUpdateInterval.current);
      }
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.pause();
    };
  }, []);

  const togglePlayPause = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        if (progressUpdateInterval.current) {
          clearInterval(progressUpdateInterval.current);
        }
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    
    const newTime = value[0];
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getPrizeCredits = (position: number) => {
    switch (position) {
      case 1: return 1000;
      case 2: return 750;
      case 3: return 500;
      default: return 0;
    }
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Medal className="h-6 w-6 text-orange-600" />;
      default: return <span className="text-lg font-bold text-gray-600">#{position}</span>;
    }
  };

  const getRankBadge = (position: number) => {
    switch (position) {
      case 1: return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case 2: return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
      case 3: return "bg-gradient-to-r from-orange-400 to-orange-600 text-white";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">Leaderboard</span>
          </h1>
          <p className="text-xl text-gray-600">
            See how you stack up against other readers
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            {(['week', 'month', 'all'] as const).map((period) => (
              <Button
                key={period}
                variant={timeframe === period ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeframe(period)}
                className={timeframe === period ? "bg-primary text-white" : ""}
              >
                {period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'All Time'}
              </Button>
            ))}
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* 2nd Place */}
          {leaderboard[1] && (
            <Card className="p-6 text-center transform translate-y-4">
              <div className="relative mb-4">
                <img 
                  src={leaderboard[1].avatar}
                  alt={leaderboard[1].name}
                  className="w-16 h-16 rounded-full mx-auto border-4 border-gray-300"
                />
                <div className="absolute -top-2 -right-2">
                  <Medal className="h-8 w-8 text-gray-400" />
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-1">{leaderboard[1].name}</h3>
              <Badge className="bg-gray-100 text-gray-600 mb-2">2nd Place</Badge>
              <div className="text-sm text-gray-600 mb-3">
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-4 w-4" />
                  {leaderboard[1].totalXp} XP
                </div>
              </div>
              
              {/* Prize Section */}
              <div className="border-t pt-3">
                <div className="flex items-center justify-center gap-1 text-sm text-yellow-600 font-medium">
                  <Coins className="h-4 w-4" />
                  {getPrizeCredits(2)} Credits
                </div>
              </div>
            </Card>
          )}

          {/* 1st Place */}
          {leaderboard[0] && (
            <Card className="p-6 text-center bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <div className="relative mb-4">
                <img 
                  src={leaderboard[0].avatar}
                  alt={leaderboard[0].name}
                  className="w-20 h-20 rounded-full mx-auto border-4 border-yellow-400"
                />
                <div className="absolute -top-2 -right-2">
                  <Crown className="h-10 w-10 text-yellow-500" />
                </div>
              </div>
              <h3 className="font-bold text-xl mb-1">{leaderboard[0].name}</h3>
              <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white mb-2">
                👑 Champion
              </Badge>
              <div className="text-sm text-gray-600 mb-3">
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-4 w-4" />
                  {leaderboard[0].totalXp} XP
                </div>
              </div>
              
              {/* Prize Section */}
              <div className="border-t pt-3">
                <div className="flex items-center justify-center gap-1 text-sm text-yellow-600 font-bold">
                  <Coins className="h-4 w-4" />
                  {getPrizeCredits(1)} Credits
                </div>
              </div>
            </Card>
          )}

          {/* 3rd Place */}
          {leaderboard[2] && (
            <Card className="p-6 text-center transform translate-y-4">
              <div className="relative mb-4">
                <img 
                  src={leaderboard[2].avatar}
                  alt={leaderboard[2].name}
                  className="w-16 h-16 rounded-full mx-auto border-4 border-orange-300"
                />
                <div className="absolute -top-2 -right-2">
                  <Medal className="h-8 w-8 text-orange-600" />
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-1">{leaderboard[2].name}</h3>
              <Badge className="bg-orange-100 text-orange-600 mb-2">3rd Place</Badge>
              <div className="text-sm text-gray-600 mb-3">
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-4 w-4" />
                  {leaderboard[2].totalXp} XP
                </div>
              </div>
              
              {/* Prize Section */}
              <div className="border-t pt-3">
                <div className="flex items-center justify-center gap-1 text-sm text-yellow-600 font-medium">
                  <Coins className="h-4 w-4" />
                  {getPrizeCredits(3)} Credits
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Real Music Player Section */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border-yellow-200">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-3 flex items-center justify-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-600" />
              Celebrate Our Top 3 Champions!
            </h3>
            <p className="text-gray-600 mb-4">
              Play the victory anthem to celebrate all our amazing top performers
            </p>
            
            <div className="flex flex-col items-center gap-4">
              <Button
                onClick={togglePlayPause}
                className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-white px-8 py-3 text-lg font-semibold"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-5 w-5 mr-2" />
                    Playing the Victory Song
                  </>
                ) : (
                  <>
                    <Volume2 className="h-5 w-5 mr-2" />
                    Play the Victory Song
                  </>
                )}
              </Button>

              {duration > 0 && (
                <div className="w-full max-w-md">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Music className="h-4 w-4" />
                    <span>Champions Victory Theme</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 tabular-nums">
                      {formatTime(currentTime)}
                    </span>
                    <Slider
                      value={[currentTime]}
                      onValueChange={handleSeek}
                      max={duration}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-500 tabular-nums">
                      {formatTime(duration)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Full Leaderboard */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-600" />
            Complete Rankings
          </h2>
          
          <div className="space-y-3">
            {leaderboard.map((entry, index) => {
              const position = index + 1;
              const prizeCredits = getPrizeCredits(position);
              
              return (
                <div 
                  key={entry.id}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                    position <= 3 
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {/* Rank */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRankBadge(position)}`}>
                    {getRankIcon(position)}
                  </div>

                  {/* Avatar and Info */}
                  <img 
                    src={entry.avatar}
                    alt={entry.name}
                    className="w-12 h-12 rounded-full"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{entry.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Level {entry.level}</span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {entry.articlesRead} articles
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="h-4 w-4 text-orange-500" />
                        {entry.streak} day streak
                      </span>
                    </div>
                  </div>

                  {/* XP and Prizes */}
                  <div className="text-right">
                    <div className="text-xl font-bold text-yellow-600">
                      {entry.totalXp}
                    </div>
                    <div className="text-sm text-gray-500">XP</div>
                    {prizeCredits > 0 && (
                      <div className="flex items-center gap-1 text-sm text-yellow-600 font-medium mt-1">
                        <Coins className="h-3 w-3" />
                        +{prizeCredits}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Motivational Message */}
        <Card className="p-6 mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-0 text-center">
          <h3 className="text-xl font-semibold mb-2">Keep Reading to Climb Higher!</h3>
          <p className="text-gray-600">
            Read articles, like content, and maintain your streak to earn more XP and climb the leaderboard.
            <br />
            <strong>Top 3 winners get special prizes including celebration music and bonus credits!</strong>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;
