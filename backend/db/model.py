from sqlalchemy import Column, String, Integer, Boolean, Date, ForeignKey
from sqlalchemy.orm import relationship
from db.database import Base
import bcrypt
import uuid


# ORM MODELS
class User(Base):
    __tablename__ = "Users"
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    avatar = Column(String, nullable=True)
    level = Column(Integer, nullable=False)
    xp = Column(Integer, nullable=False)
    xpToNext = Column(Integer, nullable=False)
    totalXp = Column(Integer, nullable=False)
    joinDate = Column(Date, nullable=False)
    configuration = relationship("Configuration", back_populates="user", uselist=False)
    achievements = relationship("UserAchievement", back_populates="user")

    def set_password(self, plain_password: str):
        if not plain_password.startswith("$2b$"):
            self.password = bcrypt.hashpw(plain_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        else:
            self.password = plain_password
    
    def check_password(self, plain_password: str) -> bool:
        return bcrypt.checkpw(plain_password.encode("utf-8"), self.password.encode("utf-8"))


class Configuration(Base):
    __tablename__ = "Configurations"
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    tone_preference = Column(String, nullable=True)
    length_preference = Column(String, nullable=True)
    format_preference = Column(String, nullable=True)
    age_preference = Column(Integer, nullable=True)
    user_id = Column(String, ForeignKey("Users.id"), nullable=False, unique=True)  # <-- add this line
    user =  relationship("User", back_populates="configuration",  uselist=False)


class Achievement(Base):
    __tablename__ = "Achievements"
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
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
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    avatar = Column(String)

    articles = relationship("Article", back_populates="author")


class Article(Base):
    __tablename__ = "Articles"
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
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
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, nullable=False)

    articles = relationship("Article", secondary="ArticleTags", back_populates="tags")


class ArticleTag(Base):
    __tablename__ = "ArticleTags"
    articleId = Column(String, ForeignKey("Articles.id"), primary_key=True)
    tagId = Column(String, ForeignKey("Tags.id"), primary_key=True)


class Leaderboard(Base):
    __tablename__ = "Leaderboard"
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    avatar = Column(String)
    level = Column(Integer)
    totalXp = Column(Integer)
    articlesRead = Column(Integer)
    streak = Column(Integer)
