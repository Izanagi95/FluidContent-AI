import json
import os
import uvicorn
from fastapi import FastAPI, HTTPException, Body, Depends, UploadFile, File, Form
from pydantic import BaseModel, Field, EmailStr
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from google import genai
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from db.model import *
from db.schemas import (
    UserCreate, UserUpdate, UserOut, 
    AchievementOut, UserAchievementOut, UserAchievementCreate, ConfigurationOut, ConfigurationCreate,
    ConfigurationBase,
    AchievementCreate, AuthorCreate, AuthorOut, ArticleCreate, ArticleOut, TagCreate, TagOut, LeaderboardOut, LeaderboardCreate
)
from db.database import get_db, engine, Base
from db.seed import seed

# Carica le variabili d'ambiente dal file .env
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# --- Inizializzazione dell'app FastAPI ---
app = FastAPI(
    title="FluidContent AI Backend",
    description="API per elaborare e adattare contenuti usando Gemini AI.",
    version="0.1.0"
)

Base.metadata.create_all(bind=engine)
seed()
print("Tabelle create:", Base.metadata.tables.keys())


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or use specific origin for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# INPUT
class UserProfile(BaseModel):
    user_id: str
    name: Optional[str] = Field(default=None, description="Nome dell'utente, se disponibile")
    age: Optional[int] = Field(default=None, description="Età dell'utente, se disponibile", ge=0)
    interests: List[str] = Field(default_factory=list, description="Interessi personali dell'utente")
    preferences: Dict[str, Any] = Field(default_factory=dict, description="Preferenze varie")

class ContentInput(BaseModel):
    title: str
    description: Optional[str] = None
    original_text: str = Field(..., min_length=1, description="Il contenuto testuale originale") # min_length=1 o più

class ProcessRequest(BaseModel):
    profile: UserProfile
    content: ContentInput

# OUTPUT
class ProcessedContent(BaseModel):
    adapted_text: str = Field(..., description="Il testo completamente adattato.")
    key_takeaways: Optional[List[str]] = Field(default=None, description="I punti chiave estratti.")
    suggested_title: Optional[str] = Field(default=None, description="Il nuovo titolo suggerito.")
    sentiment_analysis: Optional[str] = Field(default=None, description="L'analisi del sentiment.")

class ErrorResponse(BaseModel):
    detail: str


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@app.post("/api/signup")
def signup(data: SignupRequest):
    # Implement user creation logic and password hashing
    # Return mock response for now
    return {"user": {"id": 1, "email": data.email, "name": data.name}}

@app.post("/api/login")
def login(data: LoginRequest):
    # Implement user verification and password check
    # Return mock response for now
    return {"user": {"id": 1, "email": data.email, "name": "John Doe"}}


@app.post("/save-draft")
async def save_draft(
    title: str = Form(...),
    content: str = Form(...),
    images: List[UploadFile] = File(default=[])
):
    print(f"Title: {title}")
    print(f"Content: {content}")
    print(f"Received {len(images)} images")

    # TODO - save in DB
    os.makedirs("uploads", exist_ok=True)
    for image in images:
        contents = await image.read()
        with open(f"uploads/{image.filename}", "wb") as f:
            f.write(contents)

    return {"status": "draft saved"}


SYSTEM_PROMPT_TEMPLATE = """
Sei un assistente AI avanzato specializzato nella trasformazione e adattamento di contenuti digitali per FluidContent AI.
Il tuo obiettivo è rendere il contenuto più coinvolgente, personalizzato e fruibile per l'utente finale.

DATO IL SEGUENTE PROFILO UTENTE:
Nome: {user_name}
Età: {user_age}
Interessi: {user_interests}
Preferenze: {user_preferences}

E IL SEGUENTE CONTENUTO ORIGINALE:
Titolo: {content_title}
Descrizione: {content_description}
Testo:
---
{original_content_text}
---

IL TUO COMPITO È:
1. ADATTARE IL TESTO: Modifica il tono, lo stile, la complessità del linguaggio e, se necessario, la lunghezza del testo originale per allinearlo al meglio con il nome (se rilevante per un tocco personale), l'età, gli interessi e le preferenze dell'utente.
   Ad esempio, potresti iniziare il testo con un saluto personalizzato se il tono lo permette e il nome è fornito.
   Per un utente più giovane, usa un linguaggio più semplice e diretto. Per un utente adulto con preferenze formali, mantieni un tono professionale.
2. ESTRARRE PUNTI CHIAVE (Key Takeaways): Identifica e restituisci da 3 a 5 punti chiave o "takeaways" principali dal contenuto adattato, in formato lista.
3. SUGGERIRE UN NUOVO TITOLO (Opzionale): Se ritieni che un titolo diverso possa essere più accattivante per l'utente, suggeriscine uno.
4. ANALISI DEL SENTIMENT (Opzionale): Fornisci una breve analisi del sentiment del testo adattato (es. Positivo, Negativo, Neutro, Informativo).

FORMATO DELLA RISPOSTA RICHIESTA:
Restituisci un oggetto JSON strutturato con le seguenti chiavi:
- "adapted_text": (stringa) Il testo completamente adattato.
- "key_takeaways": (lista di stringhe, opzionale) I punti chiave estratti.
- "suggested_title": (stringa, opzionale) Il nuovo titolo suggerito.
- "sentiment_analysis": (stringa, opzionale) L'analisi del sentiment.

REGOLE IMPORTANTI:
- Mantieni l'accuratezza fattuale del contenuto originale.
- Non inventare informazioni.
- Sii creativo ma pertinente.
- Se una preferenza utente è in conflitto con la natura del contenuto, usa il tuo miglior giudizio per trovare un equilibrio o segnalalo.
- L'output "adapted_text" DEVE essere il testo completo e pronto per essere mostrato all'utente.
"""

def generate_final_system_prompt(request_data: ProcessRequest, template: str) -> str:
    """
    Genera il prompt di sistema finale formattando il template con i dati
    estratti dall'oggetto ProcessRequest.
    """
    user_profile = request_data.profile
    content_input = request_data.content

    # Preparazione dei valori per il .format(), gestendo i valori opzionali
    # UserProfile fields
    user_name_str = user_profile.name if user_profile.name is not None else "Utente"
    user_age_str = str(user_profile.age) if user_profile.age is not None else "Non specificata"

    # user_profile.interests è una lista, default_factory=list assicura che sia [] se non fornito
    user_interests_str = ", ".join(user_profile.interests) if user_profile.interests else "Nessuno specificato"

    # user_profile.preferences è un dict, default_factory=dict assicura che sia {} se non fornito
    user_preferences_str = str(user_profile.preferences) if user_profile.preferences else "Nessuna specificata"

    # ContentInput fields
    content_title_str = content_input.title # Campo obbligatorio
    content_description_str = content_input.description if content_input.description is not None else "Nessuna descrizione fornita"
    original_content_text_str = content_input.original_text # Campo obbligatorio

    # Composizione del prompt finale
    final_prompt = template.format(
        user_name=user_name_str,
        user_age=user_age_str,
        user_interests=user_interests_str,
        user_preferences=user_preferences_str,
        content_title=content_title_str,
        content_description=content_description_str,
        original_content_text=original_content_text_str
    )
    return final_prompt



# --- Endpoint API ---
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

    client = genai.Client(api_key=GEMINI_API_KEY)
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=generate_final_system_prompt(request_data, SYSTEM_PROMPT_TEMPLATE),
        config={
            "response_mime_type": "application/json",
            "response_schema": ProcessedContent,
        },
    )
    # Use the response as a JSON string.
    # print(response.text)

    # Deserializza la stringa JSON in un dizionario Python
    try:
        response_data_dict = json.loads(response.text)
    except json.JSONDecodeError:
        # Logga l'errore e la risposta per il debug
        print(f"Errore nella deserializzazione JSON da Gemini. Risposta: {response.text}")
        raise HTTPException(status_code=500, detail="Failed to parse JSON response from Gemini API.")

    return response_data_dict


@app.post(
    "/process-content/sample",
    # response_model=ProcessedContent,
    responses={500: {"model": ErrorResponse}, 400: {"model": ErrorResponse}}
)
async def process_content_sample():
    request_data = ProcessRequest(
        profile=UserProfile(
            user_id="12345",
            name="Mario Rossi",
            age=30,
            interests=["tecnologia", "sport", "viaggi"],
            preferences={"lingua": "italiano", "stile": "informale"}
        ),
        content=ContentInput(
            title="Introduzione alla Programmazione",
            description="Un articolo introduttivo sulla programmazione per principianti.",
            original_text="La programmazione è un'abilità fondamentale nel mondo moderno..."
        )
    )
    return await process_content_endpoint(request_data)





# CRUD Users
@app.post("/users/", response_model=UserOut)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user.id).first()
    if db_user:
        raise HTTPException(status_code=400, detail="User already exists")
    new_user = User(**user.dict())
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


# CRUD Authors
@app.post("/authors/", response_model=AuthorOut)
def create_author(author: AuthorCreate, db: Session = Depends(get_db)):
    db_author = db.query(Author).filter(Author.id == author.id).first()
    if db_author:
        raise HTTPException(400, "Author already exists")
    new_author = Author(**author.dict())
    db.add(new_author)
    db.commit()
    db.refresh(new_author)
    return new_author

@app.get("/authors/", response_model=List[AuthorOut])
def read_authors(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Author).offset(skip).limit(limit).all()

@app.get("/authors/{author_id}", response_model=AuthorOut)
def read_author(author_id: str, db: Session = Depends(get_db)):
    author = db.query(Author).filter(Author.id == author_id).first()
    if not author:
        raise HTTPException(404, "Author not found")
    return author

@app.put("/authors/{author_id}", response_model=AuthorOut)
def update_author(author_id: str, author: AuthorCreate, db: Session = Depends(get_db)):
    db_author = db.query(Author).filter(Author.id == author_id).first()
    if not db_author:
        raise HTTPException(404, "Author not found")
    for key, value in author.dict().items():
        setattr(db_author, key, value)
    db.commit()
    db.refresh(db_author)
    return db_author

@app.delete("/authors/{author_id}")
def delete_author(author_id: str, db: Session = Depends(get_db)):
    db_author = db.query(Author).filter(Author.id == author_id).first()
    if not db_author:
        raise HTTPException(404, "Author not found")
    db.delete(db_author)
    db.commit()
    return {"detail": "Author deleted"}

# CRUD Tags
@app.post("/tags/", response_model=TagOut)
def create_tag(tag: TagCreate, db: Session = Depends(get_db)):
    db_tag = db.query(Tag).filter(Tag.id == tag.id).first()
    if db_tag:
        raise HTTPException(400, "Tag already exists")
    new_tag = Tag(**tag.dict())
    db.add(new_tag)
    db.commit()
    db.refresh(new_tag)
    return new_tag

@app.get("/tags/", response_model=List[TagOut])
def read_tags(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Tag).offset(skip).limit(limit).all()

@app.get("/tags/{tag_id}", response_model=TagOut)
def read_tag(tag_id: str, db: Session = Depends(get_db)):
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(404, "Tag not found")
    return tag

@app.put("/tags/{tag_id}", response_model=TagOut)
def update_tag(tag_id: str, tag: TagCreate, db: Session = Depends(get_db)):
    db_tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not db_tag:
        raise HTTPException(404, "Tag not found")
    for key, value in tag.dict().items():
        setattr(db_tag, key, value)
    db.commit()
    db.refresh(db_tag)
    return db_tag

@app.delete("/tags/{tag_id}")
def delete_tag(tag_id: str, db: Session = Depends(get_db)):
    db_tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not db_tag:
        raise HTTPException(404, "Tag not found")
    db.delete(db_tag)
    db.commit()
    return {"detail": "Tag deleted"}

# CRUD Articles (with tags handling)
@app.post("/articles/", response_model=ArticleOut)
def create_article(article: ArticleCreate, db: Session = Depends(get_db)):
    db_article = db.query(Article).filter(Article.id == article.id).first()
    if db_article:
        raise HTTPException(400, "Article already exists")
    new_article = Article(
        id=article.id,
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
    )
    # associate tags
    tags = db.query(Tag).filter(Tag.id.in_(article.tags)).all()
    new_article.tags = tags

    db.add(new_article)
    db.commit()
    db.refresh(new_article)
    return new_article

@app.get("/articles/", response_model=List[ArticleOut])
def read_articles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Article).offset(skip).limit(limit).all()


@app.get("/enhanced-articles/{article_id}")
async def asyncread_article(article_id: str, db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(404, "Article not found")
    configuration = db.query(Configuration).filter(Configuration.id == '1').first()
    user = db.query(User).filter(User.id == '1').first()

    request_data = ProcessRequest(
        profile=UserProfile(
            user_id=configuration.user_id,
            name=user.name,
            age=configuration.age_preference,
            interests=["tecnologia", "sport", "viaggi"],
            preferences={"lingua": "italiano", "stile": configuration.tone_preference}
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
        "likes": article.likes,
        "views": article.views,
        "isLiked": article.isLiked,
        "thumbnail": article.thumbnail,
        "author": article.author,
        "tags": [tag.name for tag in article.tags],
        "enhanced_content": await process_content_endpoint(request_data)
    }


@app.get("/articles/{article_id}", response_model=ArticleOut)
def read_article(article_id: str, db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(404, "Article not found")
    return article

@app.put("/articles/{article_id}", response_model=ArticleOut)
def update_article(article_id: str, article: ArticleCreate, db: Session = Depends(get_db)):
    db_article = db.query(Article).filter(Article.id == article_id).first()
    if not db_article:
        raise HTTPException(404, "Article not found")
    for key, value in article.dict(exclude={"tags"}).items():
        setattr(db_article, key, value)
    tags = db.query(Tag).filter(Tag.id.in_(article.tags)).all()
    db_article.tags = tags
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

@app.delete("/configurations/{config_id}")
def delete_configuration(config_id: str, db: Session = Depends(get_db)):
    config = db.query(Configuration).filter(Configuration.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    db.delete(config)
    db.commit()
    return {"detail": "Configuration deleted"}


# Per eseguire l'app con Uvicorn (se esegui questo file direttamente)
if __name__ == "__main__":
    if not GEMINI_API_KEY:
        print("ERRORE: GEMINI_API_KEY non impostata. L'applicazione potrebbe non funzionare.")
    else:
        print(f"Avvio Uvicorn su host 0.0.0.0 e porta 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)