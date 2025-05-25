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

# --- I tuoi dati Python ---
INPUT_DATA_1 = {
    "profile": {
        "user_id": "user-singer",
        "name": "Taylor",
        "age": 18,
        "interests": ["musica", "viaggi avventura", "cucina vegetariana", "gatti"],
        "preferences": {
            "tone": "entusiasta e informativo",
            "length": "conciso",
            "format_preference": "articoli con punti elenco"
        }
    },
    "content": {
        "title": "Il Futuro dell'Energia Solare: Innovazioni e Sfide",
        "description": "Un'analisi approfondita delle nuove tecnologie nel campo solare e degli ostacoli alla loro adozione su larga scala.",
        "original_text": "L'energia solare rappresenta una delle pietre miliari nella transizione verso un futuro energetico più sostenibile. Negli ultimi anni, abbiamo assistito a progressi significativi nella tecnologia dei pannelli fotovoltaici, con un aumento dell'efficienza e una riduzione dei costi. Tuttavia, sfide come l'intermittenza della produzione e lo stoccaggio dell'energia rimangono cruciali. Le smart grid e le soluzioni di accumulo innovative, come le batterie al flusso, stanno emergendo come risposte promettenti. L'integrazione di politiche di incentivazione governative e la sensibilizzazione pubblica sono altresì fondamentali per accelerare l'adozione di questa fonte rinnovabile..."
    }
}

INPUT_DATA_2 = {
    "profile": {
        "user_id": "user-gabbosaur",
        "name": "Gabbo",
        "age": 31,
        "interests": ["artificial intelligence", "calisthenics", "photography", "gaming", "naruto"],
        "preferences": {
            "tone": "entusiasta e informativo",
            "length": "conciso",
            "format_preference": "articoli con punti elenco"
        }
    },
    "content": {
        "title": "Il Futuro dell'Energia Solare: Innovazioni e Sfide",
        "description": "Un'analisi approfondita delle nuove tecnologie nel campo solare e degli ostacoli alla loro adozione su larga scala.",
        "original_text": "L'energia solare rappresenta una delle pietre miliari nella transizione verso un futuro energetico più sostenibile. Negli ultimi anni, abbiamo assistito a progressi significativi nella tecnologia dei pannelli fotovoltaici, con un aumento dell'efficienza e una riduzione dei costi. Tuttavia, sfide come l'intermittenza della produzione e lo stoccaggio dell'energia rimangono cruciali. Le smart grid e le soluzioni di accumulo innovative, come le batterie al flusso, stanno emergendo come risposte promettenti. L'integrazione di politiche di incentivazione governative e la sensibilizzazione pubblica sono altresì fondamentali per accelerare l'adozione di questa fonte rinnovabile..."
    }
}

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

INPUT = INPUT_DATA_2

# Estrazione dei dati da INPUT
user_profile_data = INPUT["profile"]
content_data = INPUT["content"]

# Preparazione dei valori per il .format()
user_name_str = user_profile_data.get("name", "Utente")

# Gestione dell'età (opzionale nel dizionario INPUT)
user_age_val = user_profile_data.get("age") # Usa .get() per evitare KeyError se "age" non c'è
user_age_str = str(user_age_val) if user_age_val is not None else "Non specificata"

user_interests_str = ", ".join(user_profile_data.get("interests", [])) if user_profile_data.get("interests") else "Nessuno specificato"
# Usato .get("interests", []) per fornire una lista vuota di default se "interests" non esiste,
# così .join non fallisce.

user_preferences_str = str(user_profile_data.get("preferences", {})) if user_profile_data.get("preferences") else "Nessuna specificata"
# Usato .get("preferences", {}) per fornire un dizionario vuoto di default.

content_title_str = content_data.get("title", "Nessun titolo fornito")
content_description_str = content_data.get("description") if content_data.get("description") else "Nessuna descrizione fornita"
original_content_text_str = content_data.get("original_text", "Nessun contenuto fornito")


# Composizione del prompt finale
final_system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
    user_name=user_name_str,
    user_age=user_age_str,
    user_interests=user_interests_str,
    user_preferences=user_preferences_str,
    content_title=content_title_str,
    content_description=content_description_str,
    original_content_text=original_content_text_str
)

# print(final_system_prompt)


class ProcessedContent(BaseModel):
    adapted_text: str = Field(..., description="Il testo completamente adattato.")
    key_takeaways: Optional[List[str]] = Field(default=None, description="I punti chiave estratti.")
    suggested_title: Optional[str] = Field(default=None, description="Il nuovo titolo suggerito.")
    sentiment_analysis: Optional[str] = Field(default=None, description="L'analisi del sentiment.")

class ErrorResponse(BaseModel):
    detail: str


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
    response_model=ProcessedContent,
    responses={500: {"model": ErrorResponse}, 400: {"model": ErrorResponse}}
)
async def process_content_endpoint(request_data: ProcessRequest = Body(...)):
    if not request_data:
        raise HTTPException(status_code=400, detail="Request data not provided.")

    client = genai.Client(api_key=GEMINI_API_KEY)
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=final_system_prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": ProcessedContent,
        },
    )
    # Use the response as a JSON string.
    # print(response.text)
    return response.text

# Per eseguire l'app con Uvicorn (se esegui questo file direttamente)
if __name__ == "__main__":
    if not GEMINI_API_KEY:
        print("ERRORE: GEMINI_API_KEY non impostata. L'applicazione potrebbe non funzionare.")
    else:
        print(f"Avvio Uvicorn su host 0.0.0.0 e porta 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)