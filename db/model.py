from sqlalchemy import Column, String, Integer, Boolean, Date, ForeignKey
from sqlalchemy.orm import declarative_base, relationship
from db.database import Base  # ✅ Usa la stessa Base condivisa


# ORM MODELS
class User(Base):
    __tablename__ = "Users"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    role = Column(String, nullable=False)
    avatar = Column(String)
    level = Column(Integer, nullable=False)
    xp = Column(Integer, nullable=False)
    xpToNext = Column(Integer, nullable=False)
    totalXp = Column(Integer, nullable=False)
    joinDate = Column(Date, nullable=False)

    achievements = relationship("UserAchievement", back_populates="user")


class Achievement(Base):
    __tablename__ = "Achievements"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    icon = Column(String, nullable=False)
    xpReward = Column(Integer, nullable=False)

    users = relationship("UserAchievement", back_populates="achievement")


class UserAchievement(Base):
    __tablename__ = "UserAchievements"
    userId = Column(String, ForeignKey("Users.id"), primary_key=True)
    achievementId = Column(String, ForeignKey("Achievements.id"), primary_key=True)
    unlockedAt = Column(Date, nullable=False)

    user = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement", back_populates="users")


class Author(Base):
    __tablename__ = "Authors"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    avatar = Column(String)

    articles = relationship("Article", back_populates="author")


class Article(Base):
    __tablename__ = "Articles"
    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    excerpt = Column(String, nullable=False)
    content = Column(String, nullable=False)
    authorId = Column(String, ForeignKey("Authors.id"))
    publishDate = Column(Date, nullable=False)
    readTime = Column(Integer, nullable=False)
    likes = Column(Integer, nullable=False)
    views = Column(Integer, nullable=False)
    isLiked = Column(Boolean, nullable=False)
    thumbnail = Column(String)

    author = relationship("Author", back_populates="articles")
    tags = relationship("Tag", secondary="ArticleTags", back_populates="articles")


class Tag(Base):
    __tablename__ = "Tags"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    articles = relationship("Article", secondary="ArticleTags", back_populates="tags")


class ArticleTag(Base):
    __tablename__ = "ArticleTags"
    articleId = Column(String, ForeignKey("Articles.id"), primary_key=True)
    tagId = Column(String, ForeignKey("Tags.id"), primary_key=True)


class Leaderboard(Base):
    __tablename__ = "Leaderboard"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    avatar = Column(String)
    level = Column(Integer)
    totalXp = Column(Integer)
    articlesRead = Column(Integer)
    streak = Column(Integer)
