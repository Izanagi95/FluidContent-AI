-- USERS
CREATE TABLE Users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK(role IN ('consumer', 'maker', 'provider')) NOT NULL,
  avatar TEXT,
  level INTEGER NOT NULL,
  xp INTEGER NOT NULL,
  xpToNext INTEGER NOT NULL,
  totalXp INTEGER NOT NULL,
  joinDate DATE NOT NULL
);

-- ACHIEVEMENTS
CREATE TABLE Achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  xpReward INTEGER NOT NULL
);

-- USER_ACHIEVEMENTS
CREATE TABLE UserAchievements (
  userId TEXT,
  achievementId TEXT,
  unlockedAt DATE NOT NULL,
  PRIMARY KEY (userId, achievementId),
  FOREIGN KEY (userId) REFERENCES Users(id),
  FOREIGN KEY (achievementId) REFERENCES Achievements(id)
);

-- AUTHORS
CREATE TABLE Authors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar TEXT
);

-- ARTICLES
CREATE TABLE Articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  authorId TEXT,
  publishDate DATE NOT NULL,
  readTime INTEGER NOT NULL,
  likes INTEGER NOT NULL,
  views INTEGER NOT NULL,
  isLiked BOOLEAN NOT NULL,
  thumbnail TEXT,
  FOREIGN KEY (authorId) REFERENCES Authors(id)
);

-- TAGS
CREATE TABLE Tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- ARTICLE_TAGS
CREATE TABLE ArticleTags (
  articleId TEXT,
  tagId TEXT,
  PRIMARY KEY (articleId, tagId),
  FOREIGN KEY (articleId) REFERENCES Articles(id),
  FOREIGN KEY (tagId) REFERENCES Tags(id)
);

-- LEADERBOARD
CREATE TABLE Leaderboard (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar TEXT,
  level INTEGER,
  totalXp INTEGER,
  articlesRead INTEGER,
  streak INTEGER
);



INSERT INTO Users (id, name, email, role, avatar, level, xp, xpToNext, totalXp, joinDate)
VALUES ('1', 'Gabriele', 'gabbo@ai.com', 'consumer', 'https://forums.terraria.org/data/avatars/h/197/197802.jpg', 6, 619, 81, 619, '2025-05-05');


INSERT INTO Achievements (id, name, description, icon, xpReward) VALUES
('1', 'First Steps', 'Read your first article', '📖', 50),
('2', 'Speed Reader', 'Read 10 articles in one day', '⚡', 200);

INSERT INTO UserAchievements (userId, achievementId, unlockedAt) VALUES
('1', '1', '2025-05-15'),
('1', '2', '2025-05-20');


INSERT INTO Authors (id, name, avatar) VALUES
('a1', 'Sarah Johnson', 'https://images.unsplash.com/photo-1742234857006-ceaba909665c?w=100&h=100&fit=crop'),
('a2', 'Paolo', 'https://www.plai-accelerator.com/content/uploads/2024/05/ruscitti-e1715625676685.jpg'),
('a3', 'Emma Wilson', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop');

INSERT INTO Articles (id, title, excerpt, content, authorId, publishDate, readTime, likes, views, isLiked, thumbnail) VALUES
('1', 'The Future of Web Development', 'Exploring the latest trends...', '<html content>', 'a1', '2024-01-25', 8, 234, 1520, 0, 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop'),
('2', 'Building Sustainable Design Systems', 'Learn how to create design systems...', '<html content>', 'a2', '2024-01-23', 12, 189, 945, 1, 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop'),
('3', 'Mastering React Performance', 'Advanced techniques for optimizing...', '<html content>', 'a3', '2024-01-22', 15, 312, 2100, 0, 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop');


-- Tags
INSERT INTO Tags (id, name) VALUES
('t1', 'Technology'),
('t2', 'Web Development'),
('t3', 'AI'),
('t4', 'Design'),
('t5', 'UX'),
('t6', 'Systems'),
('t7', 'React'),
('t8', 'Performance'),
('t9', 'JavaScript');

-- ArticleTags
INSERT INTO ArticleTags (articleId, tagId) VALUES
('1', 't1'), ('1', 't2'), ('1', 't3'),
('2', 't4'), ('2', 't5'), ('2', 't6'),
('3', 't7'), ('3', 't8'), ('3', 't9');

INSERT INTO Leaderboard (id, name, avatar, level, totalXp, articlesRead, streak) VALUES
('1', 'Stefano', 'https://www.plai-accelerator.com/content/uploads/2024/05/WhatsApp-Image-2024-05-30-at-22.20.28-e1717100490694.jpeg', 15, 8750, 127, 45),
('2', 'Antonio', 'https://www.plai-accelerator.com/content/uploads/2024/05/Antonio-Porro-AD-Gruppo-Mondadori-e1716021576318.jpeg', 13, 6890, 98, 23),
('3', 'Andrea', 'https://www.plai-accelerator.com/content/uploads/2024/04/Sito_Santagata.jpg', 12, 5940, 85, 18),
('4', 'Margherita', 'https://www.plai-accelerator.com/content/uploads/2025/05/corini-foto_346.jpg', 12, 5200, 76, 12);


