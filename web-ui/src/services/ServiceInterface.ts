
// Mock API service with consistent fake data
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'consumer' | 'maker' | 'provider';
  avatar: string;
  level: number;
  xp: number;
  xpToNext: number;
  totalXp: number;
  achievements: Achievement[];
  joinDate: string;
}


type Tag = {
  id: string;
  name: string;
};

type Author = {
  id: string;
  name: string;
  avatar: string;
};

type Article = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  authorId: string;
  publishDate: string;
  readTime: number;
  likes: number;
  views: number;
  isLiked: boolean;
  thumbnail: string;
  author: Author;
  tags: Tag[];
};


type Achievement = {
  userId: string;
  achievementId: string;
  unlockedAt: string;
  achievement: {
    id: string;
    name: string;
    description: string;
    icon: string;
    xpReward: number;
  };
};

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  level: number;
  totalXp: number;
  articlesRead: number;
  streak: number;
}

// Mock API functions
export const mockApi = {

  // Article endpoints
  // likeArticle: (id: string): Promise<Article | null> => {
  //   return new Promise(resolve => {
  //     setTimeout(() => {
  //       const article = mockArticles.find(a => a.id === id);
  //       if (article) {
  //         article.isLiked = !article.isLiked;
  //         article.likes += article.isLiked ? 1 : -1;
  //       }
  //       resolve(article || null);
  //     }, 200);
  //   });
  // },

  // Gamification endpoints
  // addXp: (amount: number, reason: string): Promise<{ user: User; levelUp: boolean }> => {
  //   return new Promise(resolve => {
  //     setTimeout(() => {
  //       const oldLevel = mockUser.level;
  //       mockUser.xp += amount;
  //       mockUser.totalXp += amount;
        
  //       // Level up logic (1000 XP per level)
  //       const newLevel = Math.floor(mockUser.totalXp / 1000) + 1;
  //       const levelUp = newLevel > oldLevel;
        
  //       if (levelUp) {
  //         mockUser.level = newLevel;
  //       }
        
  //       mockUser.xpToNext = (mockUser.level * 1000) - mockUser.totalXp;
        
  //       resolve({ user: mockUser, levelUp });
  //     }, 300);
  //   });
  // },

};
