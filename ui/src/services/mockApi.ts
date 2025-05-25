
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

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  publishDate: string;
  readTime: number;
  tags: string[];
  likes: number;
  views: number;
  isLiked: boolean;
  thumbnail: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  xpReward: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  level: number;
  totalXp: number;
  articlesRead: number;
  streak: number;
}

// Mock data
const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: (localStorage.getItem('userRole') as any) || 'consumer',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
  level: 7,
  xp: 2450,
  xpToNext: 550,
  totalXp: 2450,
  achievements: [
    {
      id: '1',
      name: 'First Steps',
      description: 'Read your first article',
      icon: '📖',
      unlockedAt: '2024-01-15',
      xpReward: 50
    },
    {
      id: '2',
      name: 'Speed Reader',
      description: 'Read 10 articles in one day',
      icon: '⚡',
      unlockedAt: '2024-01-20',
      xpReward: 200
    }
  ],
  joinDate: '2024-01-01'
};

const mockArticles: Article[] = [
  {
    id: '1',
    title: 'The Future of Web Development',
    excerpt: 'Exploring the latest trends and technologies shaping the future of web development.',
    content: `
      <h2>Introduction</h2>
      <p>Web development continues to evolve at a rapid pace, with new frameworks, tools, and methodologies emerging regularly. In this comprehensive guide, we'll explore the key trends that are shaping the future of web development.</p>
      
      <h2>AI Integration</h2>
      <p>Artificial Intelligence is becoming increasingly integrated into web development workflows. From automated code generation to intelligent debugging, AI tools are revolutionizing how we build web applications.</p>
      
      <h2>WebAssembly Revolution</h2>
      <p>WebAssembly (WASM) is opening new possibilities for web applications, allowing developers to run high-performance code written in languages like C++, Rust, and Go directly in the browser.</p>
      
      <h2>Edge Computing</h2>
      <p>Edge computing is bringing computation closer to users, reducing latency and improving performance. This shift is changing how we architect and deploy web applications.</p>
      
      <h2>Conclusion</h2>
      <p>The future of web development is exciting and full of possibilities. By staying informed about these trends, developers can build better, more efficient, and more user-friendly applications.</p>
    `,
    author: {
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop'
    },
    publishDate: '2024-01-25',
    readTime: 8,
    tags: ['Technology', 'Web Development', 'AI'],
    likes: 234,
    views: 1520,
    isLiked: false,
    thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop'
  },
  {
    id: '2',
    title: 'Building Sustainable Design Systems',
    excerpt: 'Learn how to create design systems that scale with your organization and stand the test of time.',
    content: `
      <h2>What is a Design System?</h2>
      <p>A design system is a collection of reusable components, guided by clear standards, that can be assembled together to build any number of applications.</p>
      
      <h2>Key Components</h2>
      <p>Successful design systems include typography, color palettes, spacing guidelines, component libraries, and documentation.</p>
      
      <h2>Implementation Strategy</h2>
      <p>Start small with core components and gradually expand. Ensure buy-in from stakeholders and maintain comprehensive documentation.</p>
    `,
    author: {
      name: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
    },
    publishDate: '2024-01-23',
    readTime: 12,
    tags: ['Design', 'UX', 'Systems'],
    likes: 189,
    views: 945,
    isLiked: true,
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop'
  },
  {
    id: '3',
    title: 'Mastering React Performance',
    excerpt: 'Advanced techniques for optimizing React applications and improving user experience.',
    content: `
      <h2>Performance Fundamentals</h2>
      <p>Understanding React's rendering cycle is crucial for optimizing performance. Learn about reconciliation, virtual DOM, and React's optimization strategies.</p>
      
      <h2>Optimization Techniques</h2>
      <p>Explore memo, useMemo, useCallback, and other React hooks that can help prevent unnecessary re-renders.</p>
      
      <h2>Measuring Performance</h2>
      <p>Use React DevTools Profiler and browser performance tools to identify bottlenecks in your applications.</p>
    `,
    author: {
      name: 'Emma Wilson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
    },
    publishDate: '2024-01-22',
    readTime: 15,
    tags: ['React', 'Performance', 'JavaScript'],
    likes: 312,
    views: 2100,
    isLiked: false,
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop'
  }
];

const mockLeaderboard: LeaderboardEntry[] = [
  {
    id: '1',
    name: 'Alex Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    level: 15,
    totalXp: 8750,
    articlesRead: 127,
    streak: 45
  },
  {
    id: '2',
    name: 'Maria Santos',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
    level: 12,
    totalXp: 6890,
    articlesRead: 98,
    streak: 23
  },
  {
    id: '3',
    name: 'David Kim',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    level: 11,
    totalXp: 5940,
    articlesRead: 85,
    streak: 18
  },
  {
    id: '4',
    name: 'Lisa Chen',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    level: 10,
    totalXp: 5200,
    articlesRead: 76,
    streak: 12
  },
  {
    id: '5',
    name: 'John Doe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    level: 7,
    totalXp: 2450,
    articlesRead: 34,
    streak: 8
  }
];

// Mock API functions
export const mockApi = {
  // User endpoints
  getCurrentUser: (): Promise<User> => {
    return new Promise(resolve => {
      setTimeout(() => resolve(mockUser), 500);
    });
  },

  updateUser: (updates: Partial<User>): Promise<User> => {
    return new Promise(resolve => {
      setTimeout(() => {
        Object.assign(mockUser, updates);
        resolve(mockUser);
      }, 300);
    });
  },

  // Article endpoints
  getArticles: (): Promise<Article[]> => {
    return new Promise(resolve => {
      setTimeout(() => resolve(mockArticles), 600);
    });
  },

  getArticle: (id: string): Promise<Article | null> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const article = mockArticles.find(a => a.id === id);
        resolve(article || null);
      }, 400);
    });
  },

  likeArticle: (id: string): Promise<Article | null> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const article = mockArticles.find(a => a.id === id);
        if (article) {
          article.isLiked = !article.isLiked;
          article.likes += article.isLiked ? 1 : -1;
        }
        resolve(article || null);
      }, 200);
    });
  },

  // Gamification endpoints
  addXp: (amount: number, reason: string): Promise<{ user: User; levelUp: boolean }> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const oldLevel = mockUser.level;
        mockUser.xp += amount;
        mockUser.totalXp += amount;
        
        // Level up logic (1000 XP per level)
        const newLevel = Math.floor(mockUser.totalXp / 1000) + 1;
        const levelUp = newLevel > oldLevel;
        
        if (levelUp) {
          mockUser.level = newLevel;
        }
        
        mockUser.xpToNext = (mockUser.level * 1000) - mockUser.totalXp;
        
        resolve({ user: mockUser, levelUp });
      }, 300);
    });
  },

  // Leaderboard endpoints
  getLeaderboard: (): Promise<LeaderboardEntry[]> => {
    return new Promise(resolve => {
      setTimeout(() => resolve(mockLeaderboard), 500);
    });
  }
};
