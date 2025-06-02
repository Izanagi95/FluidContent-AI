import json
import os
import uvicorn
from fastapi import FastAPI, HTTPException, Body, Depends, UploadFile, File, Form, status, BackgroundTasks
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from db.model import *
from db.schemas import (
    UserCreate, UserUpdate, UserOut, 
    AchievementOut, UserAchievementOut, UserAchievementCreate, 
    ConfigurationOut, ConfigurationCreate,
    ConfigurationBase, ArticleOutEnhanced, ArticleGet,
    AchievementCreate, ArticleCreate, ArticleOut, 
    LeaderboardOut, LeaderboardCreate)
from db.database import get_db, engine, Base
from db.seed import seed
from models import (
    ProcessRequest, UserProfile, ContentInput, ErrorResponse,
    SignupRequest, LoginRequest
)
from ai_core import process_request, extract_tags, ArticleInput, HTMLOutput, generate_html_content
from datetime import date
import aiofiles
import logging
import asyncio
from text_to_speech import generate_audio_for_user
from fastapi.responses import StreamingResponse
from elevenlabs import ElevenLabs, save

# --- Inizializzazione dell'app FastAPI ---
app = FastAPI(
    title="FluidContent AI Backend",
    description="API per elaborare e adattare contenuti usando Gemini AI.",
    version="0.1.0"
)

Base.metadata.create_all(bind=engine)
seed()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info(f"Tabelle create: {list(Base.metadata.tables.keys())}")

OUTPUT_HTML_DIR = "generated_html_files" # Relativo alla directory

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or use specific origin for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth
@app.post("/api/signup")
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    user = UserCreate(
    name=data.name,
    email=data.email,
    password=data.password,
    avatar="https://forums.terraria.org/data/avatars/h/197/197802.jpg",
    level=0,
    xp=0,
    xpToNext=1000,
    totalXp=0,
    joinDate=date.today()
    )    
    create_user(user, db)
    getUser = db.query(User).filter(User.email == data.email).first()

    configuration = ConfigurationCreate(
    tone_preference="",
    length_preference="",
    format_preference="",
    age_preference=0,
    user_id=getUser.id
    )
    conf_id = create_configuration(configuration, db).id

    return {"user": {"id": getUser.id, "email": data.email, "name": data.name}, "configuration": {"id": conf_id}}

@app.post("/api/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(email=data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not user.check_password(data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "avatar": user.avatar,
            "level": user.level,
            "xp": user.xp,
            "xpToNext": user.xpToNext,
            "totalXp": user.totalXp,
            "joinDate": user.joinDate.isoformat()
        }
    }

# Others
@app.post("/save_article/", status_code=status.HTTP_201_CREATED)
async def save_article(
    title: str = Form(...),
    content: str = Form(...),
    status: str = Form(...),  # e.g., 'draft', 'published'
    user_id: str = Form(...),
    images: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db)
):

    # TODO - save in DB
    os.makedirs("uploads", exist_ok=True)
    for image in images:
        contents = await image.read()
        with open(f"uploads/{image.filename}", "wb") as f:
            f.write(contents)

    logger.info(f"status: {status}")
    await create_article(ArticleCreate(
        title=title,
        excerpt=content[:100],
        content=content,
        status=status,
        authorId=user_id,  
        publishDate=date.today(),
        readTime=int(len(content)/150),  
        likes=0,
        views=0,
        isLiked=False,
        thumbnail="",  
        tags="" 
    ),
    BackgroundTasks(),
    db)

    return {"status": "article saved"}

@app.get("/")
async def read_root():
    return {"message": "FluidContent AI Backend è attivo!"}

@app.post(
    "/process-content/",
    # response_model=ProcessedContent,
    responses={500: {"model": ErrorResponse}, 400: {"model": ErrorResponse}}
)
async def process_content_endpoint(request_data: ProcessRequest = Body(...)):
    if not request_data:
        raise HTTPException(status_code=400, detail="Request data not provided.")
    response = process_request(request_data)
    # Deserializza la stringa JSON in un dizionario Python
    try:
        response_data_dict = json.loads(response.text)
    except json.JSONDecodeError:
        # Logga l'errore e la risposta per il debug
        raise HTTPException(status_code=500, detail="Failed to parse JSON response from Gemini API.")
    return response_data_dict

# CRUD Users
@app.post("/users/", response_model=UserOut)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="User already exists")
    new_user = User(**user.dict())
    new_user.set_password(user.password)  # Hash the password
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.get("/users/", response_model=List[UserOut])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@app.get("/users/{user_id}", response_model=UserOut)
def read_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    return user

@app.put("/users/{user_id}", response_model=UserOut)
def update_user(user_id: str, user: UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(404, "User not found")
    
    user_data = {k: v for k, v in user.dict(exclude_unset=True).items() if v not in (None, "")}

    for key, value in user_data.items():
        setattr(db_user, key, value)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.delete("/users/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(404, "User not found")
    db.delete(db_user)
    db.commit()
    return {"detail": "User deleted"}

# CRUD Achievements
@app.post("/achievements/", response_model=AchievementOut)
def create_achievement(achievement: AchievementCreate, db: Session = Depends(get_db)):
    db_ach = db.query(Achievement).filter(Achievement.id == achievement.id).first()
    if db_ach:
        raise HTTPException(400, "Achievement already exists")
    new_ach = Achievement(**achievement.dict())
    db.add(new_ach)
    db.commit()
    db.refresh(new_ach)
    return new_ach

@app.get("/achievements/", response_model=List[AchievementOut])
def read_achievements(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Achievement).offset(skip).limit(limit).all()

@app.get("/achievements/{achievement_id}", response_model=AchievementOut)
def read_achievement(achievement_id: str, db: Session = Depends(get_db)):
    ach = db.query(Achievement).filter(Achievement.id == achievement_id).first()
    if not ach:
        raise HTTPException(404, "Achievement not found")
    return ach

@app.put("/achievements/{achievement_id}", response_model=AchievementOut)
def update_achievement(achievement_id: str, achievement: AchievementCreate, db: Session = Depends(get_db)):
    db_ach = db.query(Achievement).filter(Achievement.id == achievement_id).first()
    if not db_ach:
        raise HTTPException(404, "Achievement not found")
    for key, value in achievement.dict().items():
        setattr(db_ach, key, value)
    db.commit()
    db.refresh(db_ach)
    return db_ach

@app.delete("/achievements/{achievement_id}")
def delete_achievement(achievement_id: str, db: Session = Depends(get_db)):
    db_ach = db.query(Achievement).filter(Achievement.id == achievement_id).first()
    if not db_ach:
        raise HTTPException(404, "Achievement not found")
    db.delete(db_ach)
    db.commit()
    return {"detail": "Achievement deleted"}

# CRUD UserAchievements
@app.post("/userachievements/", response_model=UserAchievementOut)
def create_userachievement(ua: UserAchievementCreate, db: Session = Depends(get_db)):
    exists = db.query(UserAchievement).filter(
        UserAchievement.userId == ua.userId,
        UserAchievement.achievementId == ua.achievementId
    ).first()
    if exists:
        raise HTTPException(400, "UserAchievement already exists")
    new_ua = UserAchievement(**ua.dict())
    db.add(new_ua)
    db.commit()
    db.refresh(new_ua)
    return new_ua

@app.get("/userachievements/", response_model=List[UserAchievementOut])
def read_userachievements(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(UserAchievement).offset(skip).limit(limit).all()

@app.get("/userachievements/{user_id}/{achievement_id}", response_model=UserAchievementOut)
def read_userachievement(user_id: str, achievement_id: str, db: Session = Depends(get_db)):
    ua = db.query(UserAchievement).filter(
        UserAchievement.userId == user_id,
        UserAchievement.achievementId == achievement_id
    ).first()
    if not ua:
        raise HTTPException(404, "UserAchievement not found")
    return ua

@app.delete("/userachievements/{user_id}/{achievement_id}")
def delete_userachievement(user_id: str, achievement_id: str, db: Session = Depends(get_db)):
    ua = db.query(UserAchievement).filter(
        UserAchievement.userId == user_id,
        UserAchievement.achievementId == achievement_id
    ).first()
    if not ua:
        raise HTTPException(404, "UserAchievement not found")
    db.delete(ua)
    db.commit()
    return {"detail": "UserAchievement deleted"}

# CRUD Articles
@app.post("/articles/", response_model=ArticleOut)
async def create_article(article: ArticleCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):

    article_input= ArticleInput(
        article_text=article.content,
        article_title=article.title
    )

    article_tags = extract_tags(article_input)

    generated_filename = f"{uuid.uuid4()}.html"
    logger.info(f"Filename generato: {generated_filename}")
    new_article = Article(
        title=article.title,
        excerpt=article.excerpt,
        content=article.content,
        authorId=article.authorId,
        publishDate=article.publishDate,
        readTime=article.readTime,
        likes=article.likes,
        views=article.views,
        isLiked=article.isLiked,
        thumbnail=article.thumbnail,
        filename=generated_filename,
        tags = ",".join(article_tags.tags)
    )

    db.add(new_article)
    db.commit()
    db.refresh(new_article)

    process_content_to_html_request = ProcessRequest(
        profile=UserProfile(
            user_id=article.authorId,
            name="",
            age=0,
            interests=[],
            preferences={}
        ),
        content=ContentInput(
            title=article.title,
            description=article.excerpt,
            original_text=article.content
        )
    )
    background_tasks.add_task(
        process_content_to_html_sync,
        process_content_to_html_request,
        generated_filename
    )
    return new_article

def process_content_to_html_sync(request: ProcessRequest, generated_filename: str):
    return asyncio.run(process_content_to_html(request, generated_filename))


async def process_content_to_html(request: ProcessRequest, generated_filename: str):
    logger.info(f"Richiesta ricevuta per user_id: {request.profile.user_id}, titolo: {request.content.title}")

    generated_html_content = await generate_html_content(request)
    if not generated_html_content:
        raise HTTPException(status_code=500, detail="Impossibile generare il contenuto HTML.")

    logger.info(f"HTML generato con successo per user_id: {request.profile.user_id}")

    try:
        os.makedirs(OUTPUT_HTML_DIR, exist_ok=True) 
        logger.info(f"Directory di output '{OUTPUT_HTML_DIR}' assicurata.")
    except OSError as e:
        logger.info(f"Errore durante la creazione della directory '{OUTPUT_HTML_DIR}': {e}")
        raise HTTPException(status_code=500, detail=f"Impossibile creare la directory di output: {e}")

    file_path = os.path.join(OUTPUT_HTML_DIR, generated_filename)

    try:
        async with aiofiles.open(file_path, mode="w", encoding="utf-8") as f:
            await f.write(generated_html_content)
        logger.info(f"File HTML salvato con successo in: {file_path}")
    except Exception as e:
        logger.info(f"Errore durante il salvataggio del file HTML in '{file_path}': {e}")
    
    return HTMLOutput(
        user_id=request.profile.user_id,
        content_title=request.content.title,
        filename=generated_filename,
        generated_html=generated_html_content
    )


@app.get("/articles/", response_model=List[ArticleOut])
def read_articles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Article).offset(skip).limit(limit).all()


@app.get("/enhanced-articles/{article_id}/user/{user_id}", response_model=ArticleOutEnhanced)
async def asyncread_article(article_id: str, user_id: str, db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(404, "Article not found")
    configuration = db.query(Configuration).filter(Configuration.user_id == user_id).first()
    user = db.query(User).filter(User.id == user_id).first()

    request_data = ProcessRequest(
        profile=UserProfile(
            user_id=user.id,
            name=user.name,
            age=configuration.age_preference,
            interests=["tecnologia", "sport", "viaggi"],
            preferences={"lingua": "italiano", 
            "stile": configuration.tone_preference}
        ),
        content=ContentInput(
            title=article.title,
            description=article.excerpt,
            original_text=article.content
        )
    )
    return {
        "id": article.id,
        "title": article.title,
        "excerpt": article.excerpt,
        "content": article.content,
        "authorId": article.authorId,
        "publishDate": article.publishDate,
        "readTime": article.readTime,
        "status": article.status,
        "likes": article.likes,
        "views": article.views,
        "isLiked": article.isLiked,
        "thumbnail": article.thumbnail,
        "author": article.author,
        "tags": "", # [tag.name for tag in article.tags],
        "enhanced_content": await process_content_endpoint(request_data)
    }


@app.get("/articles/{article_id}", response_model=ArticleOut)
def read_article(article_id: str, db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(404, "Article not found")
    return article

@app.get("/articles/user/{user_id}", response_model=List[ArticleOut])
def read_article(user_id: str, db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.authorId == user_id).all()
    if not article:
        raise HTTPException(404, "Article not found")
    return article

@app.put("/articles/{article_id}", response_model=ArticleOut)
def update_article(article_id: str, article: ArticleCreate, db: Session = Depends(get_db)):
    db_article = db.query(Article).filter(Article.id == article_id).first()
    if not db_article:
        raise HTTPException(404, "Article not found")
    db.commit()
    db.refresh(db_article)
    return db_article

@app.delete("/articles/{article_id}")
def delete_article(article_id: str, db: Session = Depends(get_db)):
    db_article = db.query(Article).filter(Article.id == article_id).first()
    if not db_article:
        raise HTTPException(404, "Article not found")
    db.delete(db_article)
    db.commit()
    return {"detail": "Article deleted"}

# CRUD Leaderboard
@app.post("/leaderboard/", response_model=LeaderboardOut)
def create_leaderboard(lb: LeaderboardCreate, db: Session = Depends(get_db)):
    db_lb = db.query(Leaderboard).filter(Leaderboard.id == lb.id).first()
    if db_lb:
        raise HTTPException(400, "Leaderboard entry already exists")
    new_lb = Leaderboard(**lb.dict())
    db.add(new_lb)
    db.commit()
    db.refresh(new_lb)
    return new_lb

@app.get("/leaderboard/", response_model=List[LeaderboardOut])
def read_leaderboard(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Leaderboard).offset(skip).limit(limit).all()

@app.get("/leaderboard/{lb_id}", response_model=LeaderboardOut)
def read_leaderboard_entry(lb_id: str, db: Session = Depends(get_db)):
    lb = db.query(Leaderboard).filter(Leaderboard.id == lb_id).first()
    if not lb:
        raise HTTPException(404, "Leaderboard entry not found")
    return lb

@app.put("/leaderboard/{lb_id}", response_model=LeaderboardOut)
def update_leaderboard(lb_id: str, lb: LeaderboardCreate, db: Session = Depends(get_db)):
    db_lb = db.query(Leaderboard).filter(Leaderboard.id == lb_id).first()
    if not db_lb:
        raise HTTPException(404, "Leaderboard entry not found")
    for key, value in lb.dict().items():
        setattr(db_lb, key, value)
    db.commit()
    db.refresh(db_lb)
    return db_lb

@app.delete("/leaderboard/{lb_id}")
def delete_leaderboard(lb_id: str, db: Session = Depends(get_db)):
    db_lb = db.query(Leaderboard).filter(Leaderboard.id == lb_id).first()
    if not db_lb:
        raise HTTPException(404, "Leaderboard entry not found")
    db.delete(db_lb)
    db.commit()
    return {"detail": "Leaderboard entry deleted"}


@app.post("/configurations/", response_model=ConfigurationOut)
def create_configuration(config: ConfigurationCreate, db: Session = Depends(get_db)):
    existing = db.query(Configuration).filter(Configuration.user_id == config.user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Configuration for user already exists")
    new_config = Configuration(**config.dict())
    db.add(new_config)
    db.commit()
    db.refresh(new_config)
    return new_config

@app.get("/configurations/", response_model=List[ConfigurationOut])
def read_configurations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Configuration).offset(skip).limit(limit).all()

@app.get("/configurations/{config_id}", response_model=ConfigurationOut)
def read_configuration(config_id: str, db: Session = Depends(get_db)):
    config = db.query(Configuration).filter(Configuration.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    return config

@app.get("/configurations/user/{user_id}", response_model=ConfigurationOut)
def read_configuration(user_id: str, db: Session = Depends(get_db)):
    config = db.query(Configuration).filter(Configuration.user_id == user_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    return config

@app.put("/configurations/{config_id}", response_model=ConfigurationOut)
def update_configuration(config_id: str, config_in: ConfigurationBase, db: Session = Depends(get_db)):
    config = db.query(Configuration).filter(Configuration.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    for key, value in config_in.dict(exclude_unset=True).items():
        setattr(config, key, value)
    db.commit()
    db.refresh(config)
    return config

@app.put("/configurations/user/{user_id}", response_model=ConfigurationOut)
def update_configuration(user_id: str, config_in: ConfigurationBase, db: Session = Depends(get_db)):
    config = db.query(Configuration).filter(Configuration.user_id == user_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    for key, value in config_in.dict(exclude_unset=True).items():
        setattr(config, key, value)
    db.commit()
    db.refresh(config)
    return config

@app.delete("/configurations/{config_id}")
def delete_configuration(config_id: str, db: Session = Depends(get_db)):
    config = db.query(Configuration).filter(Configuration.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    db.delete(config)
    db.commit()
    return {"detail": "Configuration deleted"}


@app.get("/text2speech/", response_model=object)
def text2speech():

    user1_profile = UserProfile(
    user_id="user001", name="Alice", age=8,
    preferred_voice_gender="female", preferred_voice_style="energetic",
    interests=["cartoons", "fairy tales"]
    )

    content1 = ContentInput(
        title="The Magical Forest",
        original_text="Once upon a time, in a magical forest, lived a little squirrel named Squeaky. Squeaky loved adventures!"
    )

    return generate_audio_for_user(user1_profile, content1)


    # const payload = {
    #   user: {
    #     user_id: "user001",
    #     name: "Alice",
    #     age: 8,
    #     preferred_voice_gender: "female",
    #     preferred_voice_style: "energetic",
    #     interests: ["cartoons", "fairy tales"]
    #   },
    #   content: {
    #     title: "",
    #     original_text: text
    #   }
    # };

@app.post("/text2speech/")
def text2speech(request: object = Body(...)):

    user_profile = UserProfile(
    user_id=request["user"]["user_id"], name=request["user"]["name"], age=request["user"]["age"],
    preferred_voice_gender=request["user"]["preferred_voice_gender"], preferred_voice_style=request["user"]["preferred_voice_style"],
    interests=request["user"]["interests"]
    )

    content_input = ContentInput(
        title=request["content"]["title"],
        original_text="PROVA a scrivere questo" #request["content"]["original_text"]
    )

    result = generate_audio_for_user(user_profile, content_input)
    audio_stream = result["stream"] 
    return StreamingResponse(audio_stream, media_type="audio/mpeg")


# Per eseguire l'app con Uvicorn (se esegui questo file direttamente)
if __name__ == "__main__":
    logger.info(f"Avvio Uvicorn su host 0.0.0.0 e porta 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)