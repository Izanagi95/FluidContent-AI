
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import date

# Pydantic Schemas
class AchievementBase(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    xpReward: int

class AchievementCreate(AchievementBase):
    pass

class AchievementOut(AchievementBase):
    class Config:
        orm_mode = True


class UserAchievementBase(BaseModel):
    userId: str
    achievementId: str
    unlockedAt: date

class UserAchievementCreate(UserAchievementBase):
    pass

class UserAchievementOut(UserAchievementBase):
    achievement: Optional[AchievementOut] 
    class Config:
        orm_mode = True

class UserBase(BaseModel):
    name: str
    email: EmailStr
    password: str
    avatar: Optional[str] = None
    level: int
    xp: int
    xpToNext: int
    totalXp: int
    joinDate: date

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    name: Optional[str]
    email: Optional[EmailStr]
    password: Optional[str]
    avatar: Optional[str]


class UserOut(UserBase):
    achievements: List[UserAchievementOut] = []

    class Config:
        orm_mode = True

class TagBase(BaseModel):
    id: str
    name: str

class TagCreate(TagBase):
    pass

class TagOut(TagBase):
    class Config:
        orm_mode = True


class ArticleBase(BaseModel):
    # id: str
    title: str
    excerpt: str
    content: str
    authorId: Optional[str]
    status: str  # e.g., 'draft', 'published'
    publishDate: date
    readTime: int
    likes: int
    views: int
    isLiked: bool
    thumbnail: Optional[str]
    tags: str

class ArticleCreate(ArticleBase):
    pass

class ArticleGet(ArticleBase):
    id: str

class ArticleOut(ArticleBase):
    id: str
    author: Optional[UserOut]
    filename: str

    
    class Config:
        orm_mode = True


class ArticleOutEnhanced(ArticleBase):
    author: Optional[UserOut]
    enhanced_content: object

class LeaderboardBase(BaseModel):
    id: str
    name: str
    avatar: Optional[str]
    level: Optional[int]
    totalXp: Optional[int]
    articlesRead: Optional[int]
    streak: Optional[int]

class LeaderboardCreate(LeaderboardBase):
    pass

class LeaderboardOut(LeaderboardBase):
    class Config:
        orm_mode = True


# Pydantic schemas for Configuration
class ConfigurationBase(BaseModel):
    tone_preference: str | None = None
    length_preference: str | None = None
    format_preference: str | None = None
    age_preference: int | None = None
    interests: str | None = None  # Assuming interests is a comma-separated string

class ConfigurationCreate(ConfigurationBase):
    user_id: str  # link to user on creation

class ConfigurationOut(ConfigurationBase):
    id: str
    user_id: str

    class Config:
        orm_mode = True