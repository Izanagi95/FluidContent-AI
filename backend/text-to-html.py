from google import genai
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Body
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
import os
import logging

load_dotenv()

# Carica le variabili d'ambiente dal file .env
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables. Please set it in your .env file.")

# --- Configurazione del Logging ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Pydantic Models (come da tua definizione) ---
class UserProfile(BaseModel):
    user_id: str
    name: Optional[str] = Field(default=None, description="Nome dell'utente, se disponibile")
    age: Optional[int] = Field(default=None, description="Età dell'utente, se disponibile", ge=0)
    interests: List[str] = Field(default_factory=list, description="Interessi personali dell'utente")
    preferences: Dict[str, Any] = Field(default_factory=dict, description="Preferenze varie (es. {'learning_style': 'visual', 'pace': 'fast'})")

class ContentInput(BaseModel):
    title: str
    description: Optional[str] = Field(default=None, description="Descrizione breve del contenuto")
    original_text: str = Field(..., min_length=1, description="Il contenuto testuale originale")

class ProcessRequest(BaseModel):
    profile: UserProfile
    content: ContentInput
    # Potresti aggiungere qui opzioni di generazione, es:
    # output_format: str = Field(default="html_full_page", description="Formato dell'output desiderato")
    # llm_temperature: float = Field(default=0.5, ge=0, le=1, description="Temperatura per il modello LLM")

class HTMLOutput(BaseModel):
    user_id: str
    content_title: str
    generated_html: str
    # Potremmo aggiungere qui metadati sulla generazione, se utili
    # model_used: Optional[str] = None
    # generation_time_ms: Optional[int] = None

# --- Configurazione dell'Applicazione FastAPI ---
app = FastAPI(
    title="FluidContent AI Generator",
    description="API per generare HTML interattivo e personalizzato da contenuti testuali e profili utente.",
    version="0.1.0"
)


def build_system_prompt(request_data: ProcessRequest) -> str:
    profile = request_data.profile
    content = request_data.content

    profile_name_str = f"Nome: {profile.name}" if profile.name else "Nome: Non specificato"
    profile_age_str = f"Età: {profile.age}" if profile.age is not None else "Età: Non specificata"
    profile_interests_str = f"Interessi Principali: {', '.join(profile.interests)}" if profile.interests else "Interessi Principali: Non specificati"

    preferences_str_parts = []
    if profile.preferences:
        for key, value in profile.preferences.items():
            preferences_str_parts.append(f"{key.replace('_', ' ').capitalize()}: {value}")
        profile_preferences_str = f"Preferenze di Apprendimento/Stile: {'; '.join(preferences_str_parts)}"
    else:
        profile_preferences_str = "Preferenze di Apprendimento/Stile: Non specificate"

    content_title_str = f"Titolo: \"{content.title}\""
    content_description_str = f"Descrizione Breve: \"{content.description}\"" if content.description else ""

    system_prompt = f"""
Sei un esperto sviluppatore frontend e instructional designer specializzato nella creazione di esperienze web educative, interattive e coinvolgenti.
Il tuo compito è trasformare il contenuto fornito in una pagina HTML dinamica, tenendo conto del profilo dell'utente.

**Profilo Utente (ID: {profile.user_id}):**
*   {profile_name_str}
*   {profile_age_str}
*   {profile_interests_str}
*   {profile_preferences_str}

**Contenuto da Trasformare:**
*   {content_title_str}
{("    *   " + content_description_str) if content_description_str else ""}
*   Testo Principale:
    ```
    {content.original_text}
    ```

**Istruzioni per la Generazione dell'Output HTML:**

1.  **Struttura HTML Autonoma:** Genera una singola pagina HTML5 completa e autonoma, pronta per essere visualizzata direttamente in un browser senza dipendenze esterne (eccetto i CDN specificati per le librerie JS).
    *   Il codice HTML deve essere semanticamente corretto.
    *   Includi un titolo `<title>` nel tag `<head>` basato sul titolo del contenuto.
    *   Tutto il CSS necessario deve essere incluso all'interno di un tag `<style>` nell'`<head>`.
    *   Tutto il JavaScript necessario deve essere incluso all'interno di tag `<script>` (preferibilmente alla fine del `<body>`, prima della chiusura `</body>`, o nell'`<head>` se strettamente necessario per il rendering iniziale).
    *   **Personalizzazione Contestuale:** Se appropriato e naturale per il contenuto e il tono della pagina, puoi utilizzare il nome dell'utente, `{profile.name if profile.name else 'l\'utente'}`, per personalizzare parti del testo (ad esempio, in un'introduzione o in messaggi interattivi). Non è obbligatorio includere un saluto formale.

2.  **Stile (CSS Inline nel `<head>`):** Utilizza CSS per rendere la pagina esteticamente piacevole, moderna e leggibile. Considera le preferenze dell'utente, come `learning_style: {profile.preferences.get('learning_style', 'non specificato')}` o `preferred_colors: {profile.preferences.get('preferred_colors', 'default')}`. Assicurati che questo CSS sia contenuto nel tag `<style>` come specificato al punto 1.

3.  **Contenuto Adattato:** Adatta il linguaggio e la profondità dei concetti all'età ({profile.age if profile.age is not None else 'non specificata'}) e agli interessi ({', '.join(profile.interests) if profile.interests else 'non specificati'}) dell'utente. Se hai utilizzato il nome dell'utente in precedenza, assicurati che il riferimento sia coerente.

4.  **Interattività e Dinamismo (JavaScript Inline nel `<body>` o `<head>`):**
    *   **Librerie da Utilizzare:** Integra JavaScript utilizzando **Three.js** per elementi 3D (solo se `enable_3d_elements: {profile.preferences.get('enable_3d_elements', False)}` è true e se appropriato per il contenuto) e **Anime.js** per animazioni fluide di elementi 2D.
    *   Includi i CDN per Three.js (https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js) e Anime.js (https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js) nell'`<head>`.
    *   Fornisci codice JS funzionante e ben commentato, assicurandoti che sia contenuto nei tag `<script>` come specificato al punto 1.
    *   Considera il livello di interazione desiderato: `interaction_level: {profile.preferences.get('interaction_level', 'medium')}`.
    *   Se crei messaggi interattivi o feedback, considera se la personalizzazione con il nome dell'utente `{profile.name if profile.name else 'l\'utente'}` può migliorare l'esperienza, ma applicala solo se naturale.

5.  **Output Finale (Singolo File HTML):** Fornisci **SOLO il codice HTML completo come un singolo blocco di testo**. Non aggiungere spiegazioni esterne al codice HTML stesso. Il codice deve iniziare con `<!DOCTYPE html>` e contenere al suo interno tutto il CSS e JavaScript necessari per il suo funzionamento (eccetto i CDN specificati).

"""
    return system_prompt

def clean_html_output(raw_html: str) -> str:
    """Pulisce l'output dell'LLM per estrarre il blocco HTML."""
    # Logica di pulizia migliorata
    stripped_html = raw_html.strip()

    # Caso 1: Blocco ```html ... ```
    if stripped_html.startswith("```html") and stripped_html.endswith("```"):
        return stripped_html[len("```html"):-len("```")].strip()
    
    # Caso 2: Solo ``` ... ``` (a volte l'AI omette 'html')
    if stripped_html.startswith("```") and stripped_html.endswith("```"):
        # Verifica se il contenuto sembra HTML prima di tagliare
        potential_html = stripped_html[len("```"):-len("```")].strip()
        if potential_html.lower().startswith("<!doctype html>"):
            return potential_html
        # Altrimenti, potrebbe essere un altro tipo di blocco di codice, restituisci com'è o solleva errore
        logger.warning("Blocco di codice generico trovato, non necessariamente HTML.")
        return raw_html # o sollevare un'eccezione specifica se si aspetta solo HTML

    # Caso 3: L'AI fornisce HTML diretto senza markdown
    if stripped_html.lower().startswith("<!doctype html>"):
        return stripped_html

    # Caso di fallback o errore: l'output non è nel formato atteso
    logger.warning(f"Output dell'LLM non riconosciuto come blocco HTML standard. Output ricevuto:\n{raw_html[:500]}...")
    # Potresti voler sollevare un'eccezione qui se l'HTML pulito è cruciale
    # raise ValueError("Formato HTML di output non riconosciuto.")
    return raw_html # Restituisci l'output grezzo se non riesci a pulirlo


async def generate_html_from_llm(system_prompt: str, temperature: float = 0.5) -> Optional[str]:
    if not GEMINI_API_KEY:
        logger.error("GEMINI API key non configurata. Impossibile procedere con la generazione.")
        raise HTTPException(status_code=500, detail="Configurazione API Gemini key mancante lato server.")
    try:
        logger.info(f"Invio richiesta a Gemini con temperatura: {temperature}")
        client = genai.Client(api_key=GEMINI_API_KEY)
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=system_prompt,
            # config={
            #     "response_mime_type": "application/json",
            #     "response_schema": ProcessedContent,
            # },
        )
        print(response)
        return response
        return clean_html_output(raw_html_output)
    except Exception as e:
        logger.error(f"Errore durante la generazione HTML: {e}")
        raise HTTPException(status_code=500, detail="Errore durante la generazione HTML.")

# --- Endpoint API ---
@app.post("/generate-interactive-content/", response_model=HTMLOutput, status_code=201)
async def process_content_to_html(request: ProcessRequest = Body(...)):
    """
    Riceve il profilo utente e il contenuto testuale, e genera una pagina HTML
    interattiva e personalizzata utilizzando un modello LLM.
    """
    logger.info(f"Richiesta ricevuta per user_id: {request.profile.user_id}, titolo: {request.content.title}")

    # Estrai la temperatura dalla richiesta se l'hai aggiunta a ProcessRequest, altrimenti usa un default
    # current_temperature = request.llm_temperature if hasattr(request, 'llm_temperature') else 0.5
    current_temperature = request.profile.preferences.get("llm_temperature", 0.5) # Esempio alternativo

    system_prompt_content = build_system_prompt(request)
    
    generated_html_content = await generate_html_from_llm(system_prompt_content, temperature=current_temperature)

    if not generated_html_content:
        # L'eccezione dovrebbe essere già stata sollevata da generate_html_from_llm
        # Ma per sicurezza:
        raise HTTPException(status_code=500, detail="Impossibile generare il contenuto HTML.")

    logger.info(f"HTML generato con successo per user_id: {request.profile.user_id}")
    
    return HTMLOutput(
        user_id=request.profile.user_id,
        content_title=request.content.title,
        generated_html=generated_html_content
    )

# --- Per eseguire l'applicazione (es. con Uvicorn) ---
# Salva questo file come main.py e poi esegui da terminale:
# uvicorn main:app --reload
#
# Poi puoi accedere alla documentazione API interattiva su http://127.0.0.1:8000/docs
# e inviare richieste POST a http://127.0.0.1:8000/generate-interactive-content/

if __name__ == "__main__":
    # Questa parte è solo per testare lo script direttamente, non per l'esecuzione con Uvicorn
    # Per testare l'API, devi avviare Uvicorn come descritto sopra.
    logger.warning("Questo script è pensato per essere eseguito con Uvicorn (es. 'uvicorn main:app --reload').")
    logger.warning("L'esecuzione diretta con 'python main.py' non avvierà il server FastAPI.")

    # Potresti mettere qui un piccolo client di test se vuoi, ma è meglio usare /docs
    # import httpx
    # async def test_client():
    #     async with httpx.AsyncClient(app=app, base_url="http://127.0.0.1:8000") as client:
    #         # ... costruisci il tuo sample_input_data qui ...
    #         # response = await client.post("/generate-interactive-content/", json=sample_input_data)
    #         # print(response.status_code)
    #         # print(response.json())
    # pass