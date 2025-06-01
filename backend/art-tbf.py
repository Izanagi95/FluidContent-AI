from google import genai
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import os
import json
from fastapi import FastAPI # Per creare l'API endpoint
from typing import List, Set # Per i tipi

# Carica le variabili d'ambiente dal file .env
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables. Please set it in your .env file.")

# --- Definizione dei Modelli Pydantic ---
class ArticleTags(BaseModel):
    tags: list[str] = Field(description="A list of unique tags extracted from the article, including entities, keywords, and conceptual topics. All tags should be lowercase.")

class ArticleInput(BaseModel):
    article_text: str
    article_title: str


# --- Logica di Estrazione Tag con Gemini ---
def extract_tags_with_gemini(article: ArticleInput) -> ArticleTags:
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

    # print(prompt)

    response = genai.Client(api_key=GEMINI_API_KEY).models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": ArticleTags,
        },
    )
    response_data_dict = json.loads(response.text)
    # print(response_data_dict)
    # print(response_data_dict['tags'])
    article_tags = ArticleTags(**response_data_dict)
    return article_tags


# --- Definizione dell'API con FastAPI ---
app = FastAPI(
    title="FluidContent AI - Tag Extractor API",
    description="API to extract relevant tags from article text using Gemini.",
    version="0.1.0"
)

@app.post("/extract-tags/", response_model=ArticleTags)
async def extract_tags_endpoint(article_input: ArticleInput):
    """
    Extracts relevant tags (entities, keywords, topics) from the provided article text.
    """
    if not article_input.article_text.strip():
        return ArticleTags # O solleva un HTTPException

    extracted_data = extract_tags_with_gemini(article_input)
    return extracted_data

# --- Esempio di Utilizzo (se esegui questo script direttamente) ---
if __name__ == "__main__":
    mock_data_tech = {
        "article_title": "TechNova Inc. Unveils Groundbreaking SynergyAI Platform in Milan",
        "article_text": """
        ROME - After weeks of speculation, TechNova Inc. officially announced its groundbreaking new AI platform, "SynergyAI", 
        at a packed conference in Milan. CEO Elena Rossi stated that SynergyAI aims to revolutionize how businesses 
        interact with data, leveraging advanced machine learning algorithms and natural language processing. 
        The platform offers features like predictive analytics, automated reporting, and a conversational interface. 
        Early adopters from the finance and healthcare sectors have reported significant efficiency gains. 
        TechNova also revealed plans for an R&D center in Southern Italy to focus on ethical AI development.
        The stock market reacted positively to the news.
        """
    }

    print("--- Esempio di Estrazione Tag ---")
    if GEMINI_API_KEY:
        result = extract_tags_with_gemini(mock_data_tech)
        print(f"Articolo di Esempio:\n{mock_data_tech["article_text"][:200]}...\n")
        # print(f"Tag Estratti (Set): {result["general_tags"]}")
        
        # Puoi anche eseguire FastAPI per testare l'endpoint:
        # import uvicorn
        # print("\nPer testare l'API, esegui: uvicorn nome_file:app --reload")
        # print("E poi invia una richiesta POST a http://127.0.0.1:8000/extract-tags/")
        # print('Con un body JSON tipo: {"article_text": "Il tuo testo qui..."}')
    else:
        print("GEMINI_API_KEY non configurata. Impossibile eseguire l'esempio.")