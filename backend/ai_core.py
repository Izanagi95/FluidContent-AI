from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from models import (ProcessRequest, ProcessedContent)
from fastapi import HTTPException, Body
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv
import os
import json
import uuid
import aiofiles

# Carica le variabili d'ambiente dal file .env
load_dotenv()

OUTPUT_HTML_DIR = "generated_html_files" # Relativo alla directory
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("ERRORE: GEMINI_API_KEY non impostata. L'applicazione potrebbe non funzionare.")
else:
    print("GEMINI_API_KEY caricata correttamente.")

# Customize content

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

def process_request(request_data: ProcessRequest) -> ProcessedContent:
    client = genai.Client(api_key=GEMINI_API_KEY)

    system_prompt = """
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

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=generate_final_system_prompt(request_data, system_prompt),
        config={
            "response_mime_type": "application/json",
            "response_schema": ProcessedContent,
        },
    )
    return response

# Tag extraction

class ArticleTags(BaseModel):
    tags: list[str] = Field(description="A list of unique tags extracted from the article, including entities, keywords, and conceptual topics. All tags should be lowercase.")

class ArticleInput(BaseModel):
    article_text: str
    article_title: str

def extract_tags(article: ArticleInput) -> ArticleTags:
    prompt = f"""
    You are an expert content categorization AI. Your task is to analyze the provided article (title and text) and assign it **one or at most three** primary general category tags from the predefined list below.

    Your goal is to select the most relevant and dominant category (or categories, if the article clearly spans two primary areas).

    **Predefined General Category Tags:**
    - technology
    - artificial intelligence
    - business
    - finance
    - science
    - environment
    - politics
    - society
    - culture
    - lifestyle
    - health
    - education
    - sports
    - world news
    - opinion
    - guide/how-to

    **Instructions:**
    1.  Read the article title and text carefully to understand its main subject matter and purpose.
    2.  Choose the **single most fitting category** from the predefined list.
    3.  If the article strongly and clearly covers **two** primary categories from the list, you may select a second one. Do not select more than two.
    4.  If, after careful consideration, **none** of the predefined categories accurately and primarily describe the article's main focus, you MUST output only the tag "other".
    5.  Your output should be a JSON object with a single key "general_tags", which is a list containing the selected tag(s) (e.g., ["technology"] or ["business", "finance"] or ["other"]).
    6.  All tags in the output list must be in lowercase.
    7.  Do not include any other text, explanation, or reasoning outside of the JSON object.

    Article Title:
    ---
    {article.article_title}
    ---

    Article Text:
    ---
    {article.article_text}
    ---

    Provide your output as a JSON object:
    """

    response = genai.Client(api_key=GEMINI_API_KEY).models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": ArticleTags,
        },
    )
    response_data_dict = json.loads(response.text)
    article_tags = ArticleTags(**response_data_dict)
    return article_tags

# Interactive content generation

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

class HTMLOutput(BaseModel):
    user_id: str
    content_title: str
    filename: str
    generated_html: str

def build_system_prompt(request_data: ProcessRequest) -> str:
    content = request_data.content

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
        print("Blocco di codice generico trovato, non necessariamente HTML.")
        return raw_html # o sollevare un'eccezione specifica se si aspetta solo HTML

    # Caso 3: L'AI fornisce HTML diretto senza markdown
    if stripped_html.lower().startswith("<!doctype html>"):
        return stripped_html

    # Caso di fallback o errore: l'output non è nel formato atteso
    print(f"Output dell'LLM non riconosciuto come blocco HTML standard. Output ricevuto:\n{raw_html[:500]}...")
    # Potresti voler sollevare un'eccezione qui se l'HTML pulito è cruciale
    # raise ValueError("Formato HTML di output non riconosciuto.")
    return raw_html # Restituisci l'output grezzo se non riesci a pulirlo

async def generate_html_from_llm(system_prompt: str, temperature: float = 0.5) -> Optional[str]:
    if not GEMINI_API_KEY:
        print("GEMINI API key non configurata. Impossibile procedere con la generazione.")
        raise HTTPException(status_code=500, detail="Configurazione API Gemini key mancante lato server.")
    try:
        print(f"Invio richiesta a Gemini con temperatura: {temperature}")
        client = genai.Client(api_key=GEMINI_API_KEY)
        response = client.models.generate_content(
            model="gemini-2.5-flash-preview-05-20",
            contents=system_prompt,

            config=types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(
                include_thoughts=True
            ))
        )
        print(response)
        return response.text

    except Exception as e:
        print(f"Errore durante la generazione HTML: {e}")
        raise HTTPException(status_code=500, detail="Errore durante la generazione HTML.")


async def generate_html_content(request: ProcessRequest):
    # Estrai la temperatura dalla richiesta se l'hai aggiunta a ProcessRequest, altrimenti usa un default
    # current_temperature = request.llm_temperature if hasattr(request, 'llm_temperature') else 0.5
    current_temperature = request.profile.preferences.get("llm_temperature", 0.5) # Esempio alternativo

    system_prompt_content = build_system_prompt(request)
    generated_html_content = await generate_html_from_llm(system_prompt_content, temperature=current_temperature)
    generated_html_content = clean_html_output(generated_html_content)
    return generated_html_content

async def process_content_to_html(request: ProcessRequest = Body(...)):
    """
    Riceve il profilo utente e il contenuto testuale, e genera una pagina HTML
    interattiva e personalizzata utilizzando un modello LLM.
    """
    print(f"Richiesta ricevuta per user_id: {request.profile.user_id}, titolo: {request.content.title}")

    generated_html_content = await generate_html_content(request)

    # 1. Genera un filename univoco usando UUID
    generated_filename = f"{uuid.uuid4()}.html"
    print(f"Filename generato: {generated_filename}")

    if not generated_html_content:
        # L'eccezione dovrebbe essere già stata sollevata da generate_html_from_llm
        # Ma per sicurezza:
        raise HTTPException(status_code=500, detail="Impossibile generare il contenuto HTML.")

    print(f"HTML generato con successo per user_id: {request.profile.user_id}")

       # --- Logica per salvare il file HTML ---
    # Assicurati che la directory di output esista
    try:
        # os.makedirs è sincrono, ma va bene per una creazione una tantum o poco frequente
        # Per un'alternativa completamente asincrona, potresti usare loop.run_in_executor
        os.makedirs(OUTPUT_HTML_DIR, exist_ok=True) 
        print(f"Directory di output '{OUTPUT_HTML_DIR}' assicurata.")
    except OSError as e:
        print(f"Errore durante la creazione della directory '{OUTPUT_HTML_DIR}': {e}")
        raise HTTPException(status_code=500, detail=f"Impossibile creare la directory di output: {e}")

    file_path = os.path.join(OUTPUT_HTML_DIR, generated_filename)

    try:
        async with aiofiles.open(file_path, mode="w", encoding="utf-8") as f:
            await f.write(generated_html_content)
        print(f"File HTML salvato con successo in: {file_path}")
    except Exception as e:
        print(f"Errore durante il salvataggio del file HTML in '{file_path}': {e}")
    
    return HTMLOutput(
        user_id=request.profile.user_id,
        content_title=request.content.title,
        filename=generated_filename,
        generated_html=generated_html_content
    )
