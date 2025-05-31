from sqlalchemy import Column, String, Integer, Boolean, Date, ForeignKey
from sqlalchemy.orm import relationship
from db.database import Base
import bcrypt
import uuid
from datetime import date


# ORM MODELS
class User(Base):
    __tablename__ = "Users"
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    avatar = Column(String, nullable=True)
    level = Column(Integer, nullable=False, default=1)  # Default value for level
    xp = Column(Integer, nullable=False, default=0)  # Default value for xp
    xpToNext = Column(Integer, nullable=False, default=1000)  # Default value for xpToNext
    totalXp = Column(Integer, nullable=False, default=0)
    joinDate = Column(Date, nullable=False, default=date.today())
    configuration = relationship("Configuration", back_populates="user", uselist=False)
    achievements = relationship("UserAchievement", back_populates="user")
    articles = relationship("Article", back_populates="author")

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
    interests = Column(String, nullable=True) 
    user_id = Column(String, ForeignKey("Users.id"), nullable=False, unique=True)
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

class Article(Base):
    __tablename__ = "Articles"
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    excerpt = Column(String, nullable=False)
    content = Column(String, nullable=False)
    authorId = Column(String, ForeignKey("Users.id"))
    status = Column(String, nullable=False, default="draft")  # <--- default
    publishDate = Column(Date, nullable=False)
    readTime = Column(Integer, nullable=False)
    likes = Column(Integer, nullable=False)
    views = Column(Integer, nullable=False)
    isLiked = Column(Boolean, nullable=False)
    thumbnail = Column(String)

    author = relationship("User", back_populates="articles")
    tags = Column(String, nullable=True)  

class Leaderboard(Base):
    __tablename__ = "Leaderboard"
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    avatar = Column(String)
    level = Column(Integer)
    totalXp = Column(Integer)
    articlesRead = Column(Integer)
    streak = Column(Integer)
