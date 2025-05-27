
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

// Mock data
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
      avatar: 'https://images.unsplash.com/photo-1742234857006-ceaba909665c?w=100&h=100&fit=crop'
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
      name: 'Paolo',
      avatar: 'https://www.plai-accelerator.com/content/uploads/2024/05/ruscitti-e1715625676685.jpg'
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

// Mock API functions
export const mockApi = {

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
