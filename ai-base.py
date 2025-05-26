import json
import os
from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from google import genai
import uvicorn

# Carica le variabili d'ambiente dal file .env
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

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

# --- Inizializzazione dell'app FastAPI ---
app = FastAPI(
    title="FluidContent AI Backend",
    description="API per elaborare e adattare contenuti usando Gemini AI.",
    version="0.1.0"
)

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

# Per eseguire l'app con Uvicorn (se esegui questo file direttamente)
if __name__ == "__main__":
    if not GEMINI_API_KEY:
        print("ERRORE: GEMINI_API_KEY non impostata. L'applicazione potrebbe non funzionare.")
    else:
        print(f"Avvio Uvicorn su host 0.0.0.0 e porta 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)