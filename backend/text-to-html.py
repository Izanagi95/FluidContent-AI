from google import genai
from google.genai import types
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Body
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
import os
import logging
import uuid
import aiofiles

load_dotenv()

# Carica le variabili d'ambiente dal file .env
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

OUTPUT_HTML_DIR = "generated_html_files" # Relativo alla directory

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables. Please set it in your .env file.")

# --- Configurazione del Logging ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Pydantic Models (come da tua definizione) ---
class MakerProfile(BaseModel):
    user_id: str
    name: Optional[str] = Field(default=None, description="Nome dell'utente, se disponibile")
    age: Optional[int] = Field(default=None, description="Età dell'utente, se disponibile", ge=0)
    interests: List[str] = Field(default_factory=list, description="Interessi personali dell'utente")
    content_styles: List[str] = Field(default_factory=list, description="Stili del contenuto")
    previous_contents: List[str] = Field(default_factory=list, description="Contenuti precedenti")
    preferences: Dict[str, Any] = Field(default_factory=dict, description="Preferenze varie")

class ContentInput(BaseModel):
    title: str
    description: Optional[str] = Field(default=None, description="Descrizione breve del contenuto")
    original_text: str = Field(..., min_length=1, description="Il contenuto testuale originale")

class ProcessRequest(BaseModel):
    profile: MakerProfile
    content: ContentInput
    # Potresti aggiungere qui opzioni di generazione, es:
    # output_format: str = Field(default="html_full_page", description="Formato dell'output desiderato")
    # llm_temperature: float = Field(default=0.5, ge=0, le=1, description="Temperatura per il modello LLM")

class HTMLOutput(BaseModel):
    user_id: str
    content_title: str
    filename: str
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

    # Costruzione stringhe profilo
    profile_name_str = f"Nome del creatore (opzionale): {profile.name}" if profile.name else "Nome del creatore: Non specificato"
    profile_age_str = f"Età del creatore (opzionale): {profile.age}" if profile.age is not None else "Età del creatore: Non specificata"
    profile_interests_str = f"Interessi principali del creatore: {', '.join(profile.interests)}" if profile.interests else "Interessi principali del creatore: Non specificati"

    profile_content_styles_str = f"Stili di contenuto preferiti/precedenti del creatore: {', '.join(profile.content_styles)}" if profile.content_styles else "Stili di contenuto preferiti/precedenti del creatore: Non specificati"
    profile_previous_contents_str = f"Temi/titoli di contenuti precedenti del creatore: {', '.join(profile.previous_contents)}" if profile.previous_contents else "Temi/titoli di contenuti precedenti del creatore: Non specificati"
    preferences_str_parts = []
    if profile.preferences:
        for key, value in profile.preferences.items():
            # Semplice formattazione per rendere la chiave più leggibile
            formatted_key = key.replace('_', ' ').capitalize()
            preferences_str_parts.append(f"- {formatted_key}: {value}")
        profile_preferences_str = "Preferenze specifiche del creatore:\n" + "\n".join(preferences_str_parts)
    else:
        profile_preferences_str = "Preferenze specifiche del creatore: Non specificate"

    # Costruzione stringhe contenuto
    content_title_str = f"Titolo: \"{content.title}\""
    content_description_str = f"Descrizione Breve: \"{content.description}\"" if content.description else ""

    system_prompt = f"""
Sei un esperto sviluppatore front-end e creative technologist, specializzato nella creazione di esperienze web single-page 2D altamente interattive e immersive. Il tuo obiettivo è trasformare concetti e dati (forniti come testo) in mappe concettuali interattive e coinvolgenti. Queste mappe devono essere il fulcro dell'esperienza utente, permettendo una navigazione intuitiva e la scoperta di informazioni su richiesta. Circa il 90% dell'esperienza utente dovrebbe essere guidata dall'interazione diretta con i nodi e le relazioni della mappa concettuale. Fondamentale: Prima di procedere alla generazione del codice, analizza e semplifica il contenuto del testo originale. Estrai i concetti chiave (che diventeranno i nodi della mappa) e le loro relazioni (che diventeranno i collegamenti tra i nodi). Lo scopo principale della mappa concettuale interattiva è di far comprendere meglio il contenuto all'utente.

TASK:
Contenuto da Trasformare:
Titolo: {content_title_str}
{("Descrizione: " + content_description_str) if content_description_str else ""}
Testo Principale:
{content.original_text}

Devi generare un singolo file HTML auto-contenuto (.html) che includa quanto segue:
Per la STRUTTURA HTML: un documento HTML5 ben formato; l'input title nel tag <title> e come un <h1> (che potrebbe essere un overlay o un'intestazione minimale sopra la mappa); l'input descrizione per il tag <meta name="description"> e forse un breve testo introduttivo; un elemento <canvas> che sarà gestito da Fabric.js per disegnare la mappa concettuale. Le informazioni da original_text devono essere analizzate per estrarre concetti (nodi) e relazioni (collegamenti); le informazioni testuali associate a ciascun concetto devono essere semplificate e visualizzate dinamicamente quando un utente interagisce con il nodo corrispondente (es. in un popup o pannello laterale).
Per lo STYLING CSS: tutto il CSS deve essere incluso internamente; lo styling deve essere moderno, chiaro e coinvolgente, supportando la natura visiva di una mappa concettuale; cruciale è lo styling per nodi, collegamenti, etichette, e elementi UI interattivi (es. pannelli informativi che appaiono al click, tooltip); la pagina deve essere responsive, con la mappa concettuale che si adatta bene e rimane navigabile.
Per la FUNZIONALITÀ JAVASCRIPT: tutto il JavaScript deve essere incluso internamente (eccetto i CDN per le librerie). Le librerie da includere via CDN sono Fabric.js (ad esempio, <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js"></script> o versione più recente stabile) e Anime.js (ad esempio, <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js"></script>).
La rappresentazione della mappa concettuale con Fabric.js utilizzerà Fabric.js per disegnare la mappa sul canvas. I Nodi saranno creati come oggetti Fabric (fabric.Rect, fabric.Circle, fabric.Text, fabric.Group) per rappresentare i concetti, ognuno idealmente con un'etichetta testuale breve e chiara; si valuterà l'utilizzo di icone SVG (es. da svgrepo.com tramite fabric.loadSVGFromURL o stringhe SVG) all'interno dei nodi per migliorarne la riconoscibilità e l'appeal visivo. I Collegamenti saranno disegnati come linee o curve (fabric.Line, fabric.Path) per rappresentare le relazioni tra i nodi, e potranno avere frecce o etichette per indicare la direzione o la natura della relazione. Il Layout disporrà i nodi e i collegamenti in modo chiaro e logico.
L'interattività fondamentale con Fabric.js includerà: la selezione dei nodi da parte dell'utente tramite click; la visualizzazione di informazioni dettagliate (semplificate) in un pannello/popup al click su un nodo; effetti di hover sui nodi e/o sui collegamenti per feedback visivo; opzionalmente (ma raccomandato per mappe grandi), funzionalità di zoom e pan del canvas.
Le animazioni coinvolgenti con Anime.js renderanno la mappa dinamica e coinvolgente: animando la comparsa/scomparsa dei pannelli informativi; animando l'entrata in scena di nodi e collegamenti; creando transizioni fluide al focus su un nodo; animando l'evidenziazione di nodi e collegamenti; e qualsiasi altra animazione utile.
AUTO-CONTENUTO: Il file HTML generato non deve richiedere alcun file CSS o JS esterno (ad eccezione dei CDN specificati).
LINEE GUIDA CREATIVE: Chiarezza e comprensione (la mappa deve rendere i concetti e le relazioni immediatamente comprensibili); Coinvolgimento visivo e interattivo (animazioni e design curato per esplorazione piacevole); L'interazione è centrale (l'utente scopre informazioni tramite interazione diretta); Informazioni concise su richiesta (il testo nei popup/pannelli è semplificato); Performance (animazioni e interazioni fluide); Coerenza visiva (stile grafico coerente).
FORMATO DELL'OUTPUT: Fornisci SOLO il codice HTML completo come output. Non includere alcun testo esplicativo prima o dopo il blocco di codice.
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
            model="gemini-2.5-flash-preview-05-20",
            contents=system_prompt,
            # config={
            #     "response_mime_type": "application/json",
            #     "response_schema": HTMLOutput,
            # },
            config=types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(
                include_thoughts=True
            ))
        )
        print(response)
        # response_data_dict = json.loads(response.text)
        # print(response_data_dict)
        # print(response_data_dict['tags'])
        # html_output = HTMLOutput(**response_data_dict)
        return response.text

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
    generated_html_content = clean_html_output(generated_html_content)

    # 1. Genera un filename univoco usando UUID
    # Sarà qualcosa come "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.html"
    generated_filename = f"{uuid.uuid4()}.html"
    logger.info(f"Filename generato: {generated_filename}")

    if not generated_html_content:
        # L'eccezione dovrebbe essere già stata sollevata da generate_html_from_llm
        # Ma per sicurezza:
        raise HTTPException(status_code=500, detail="Impossibile generare il contenuto HTML.")

    logger.info(f"HTML generato con successo per user_id: {request.profile.user_id}")

       # --- Logica per salvare il file HTML ---
    # Assicurati che la directory di output esista
    try:
        # os.makedirs è sincrono, ma va bene per una creazione una tantum o poco frequente
        # Per un'alternativa completamente asincrona, potresti usare loop.run_in_executor
        os.makedirs(OUTPUT_HTML_DIR, exist_ok=True) 
        logger.info(f"Directory di output '{OUTPUT_HTML_DIR}' assicurata.")
    except OSError as e:
        logger.error(f"Errore durante la creazione della directory '{OUTPUT_HTML_DIR}': {e}")
        raise HTTPException(status_code=500, detail=f"Impossibile creare la directory di output: {e}")

    file_path = os.path.join(OUTPUT_HTML_DIR, generated_filename)

    try:
        async with aiofiles.open(file_path, mode="w", encoding="utf-8") as f:
            await f.write(generated_html_content)
        logger.info(f"File HTML salvato con successo in: {file_path}")
    except Exception as e:
        logger.error(f"Errore durante il salvataggio del file HTML in '{file_path}': {e}")
    
    return HTMLOutput(
        user_id=request.profile.user_id,
        content_title=request.content.title,
        filename=generated_filename,
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