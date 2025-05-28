from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, EmailStr

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