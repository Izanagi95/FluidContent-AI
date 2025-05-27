
from typing import List, Optional
from pydantic import BaseModel, EmailStr, constr
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


RoleType = constr(pattern=r'^(consumer|maker|provider)$')

class UserBase(BaseModel):
    
    id: str
    name: str
    email: EmailStr
    role: RoleType
    avatar: Optional[str] = None
    level: int
    xp: int
    xpToNext: int
    totalXp: int
    joinDate: date

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    id: str
    name: Optional[str]
    email: Optional[EmailStr]
    role: Optional[RoleType]
    avatar: Optional[str]


class UserOut(UserBase):
    achievements: List[UserAchievementOut] = []

    class Config:
        orm_mode = True


class AuthorBase(BaseModel):
    id: str
    name: str
    avatar: Optional[str]

class AuthorCreate(AuthorBase):
    pass

class AuthorOut(AuthorBase):
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
    id: str
    title: str
    excerpt: str
    content: str
    authorId: Optional[str]
    publishDate: date
    readTime: int
    likes: int
    views: int
    isLiked: bool
    thumbnail: Optional[str]

class ArticleCreate(ArticleBase):
    tags: List[str] = []

class ArticleOut(ArticleBase):
    author: Optional[AuthorOut]
    tags: List[TagOut] = []

    class Config:
        orm_mode = True


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