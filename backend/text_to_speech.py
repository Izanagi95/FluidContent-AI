from elevenlabs import ElevenLabs, save
from dotenv import load_dotenv
import os
from typing import List, Dict, Any, Optional, Literal
from pathlib import Path
from pydantic import BaseModel, Field

# Carica le variabili d'ambiente dal file .env
load_dotenv()

# --- CONFIGURATION: OUTPUT DIRECTORY ---
AUDIO_OUTPUT_DIRECTORY = "generated_audio" # Name of the folder to save audio files

class UserProfile(BaseModel):
    user_id: str
    name: Optional[str] = Field(default=None, description="Nome dell'utente, se disponibile")
    age: Optional[int] = Field(default=None, description="Età dell'utente, se disponibile", ge=0)
    # More specific preferences for voice selection
    preferred_voice_gender: Optional[Literal["female", "male", "neutral"]] = Field(
        default=None, description="Preferred voice gender (female, male, neutral)"
    )
    preferred_voice_style: Optional[Literal["calm", "energetic", "formal", "narration"]] = Field(
        default=None, description="Preferred voice style (e.g., calm, energetic, formal, narration)"
    )
    interests: List[str] = Field(default_factory=list, description="Interessi personali dell'utente")
    preferences: Dict[str, Any] = Field(default_factory=dict, description="Preferenze varie (less structured)")

class ContentInput(BaseModel):
    title: str
    description: Optional[str] = None
    original_text: str = Field(..., min_length=1, description="Il contenuto testuale originale")

# --- CONFIGURATION: VOICE ID MAPPING ---
VOICE_PROFILES: Dict[str, str] = {
    "default": "JBFqnCBsd6RMkjVDRZzb",
    "young_female_energetic": "09AoN6tYyW3VSTQqCo7C",
    "young_male_calm": "TX3LPaxmHKxFdv7VOQHJ",
    "adult_female_narration": "XrExE9yKIg1WjnnlVkGX",
    "adult_male_formal": "nPczCjzI2devNBz1zQrb",
    "senior_female_calm": "9BWtsMINqrJLrRacOk9x",
    "senior_male_narration": "uScy1bXtKz8vPzfdFsFw",
}
# --- END CONFIGURATION ---

def select_voice_id(profile: UserProfile) -> str:
    """
    Selects an ElevenLabs voice_id based on the user profile.
    This is a simplified logic. You can make it as complex as needed.
    """
    age = profile.age
    gender_pref = profile.preferred_voice_gender
    style_pref = profile.preferred_voice_style

    # Attempt to find a specific match
    if age is not None:
        if 0 <= age <= 12: # Child
            if gender_pref == "female" and style_pref == "energetic" and "young_female_energetic" in VOICE_PROFILES:
                return VOICE_PROFILES["young_female_energetic"]
            elif gender_pref == "male" and style_pref == "calm" and "young_male_calm" in VOICE_PROFILES:
                return VOICE_PROFILES["young_male_calm"]
            # Fallback for child if specific style/gender not found
            elif "young_female_energetic" in VOICE_PROFILES: # Generic young voice
                 return VOICE_PROFILES["young_female_energetic"]

        elif 13 <= age <= 19: # Teenager (can reuse adult or have specific teen voices)
            if gender_pref == "female" and style_pref == "narration" and "adult_female_narration" in VOICE_PROFILES:
                return VOICE_PROFILES["adult_female_narration"]
            elif gender_pref == "male" and style_pref == "formal" and "adult_male_formal" in VOICE_PROFILES:
                return VOICE_PROFILES["adult_male_formal"]

        elif 20 <= age <= 60: # Adult
            if gender_pref == "female" and style_pref == "narration" and "adult_female_narration" in VOICE_PROFILES:
                return VOICE_PROFILES["adult_female_narration"]
            elif gender_pref == "male" and style_pref == "formal" and "adult_male_formal" in VOICE_PROFILES:
                return VOICE_PROFILES["adult_male_formal"]
            elif gender_pref == "female" and "adult_female_narration" in VOICE_PROFILES: # Fallback adult female
                return VOICE_PROFILES["adult_female_narration"]
            elif gender_pref == "male" and "adult_male_formal" in VOICE_PROFILES: # Fallback adult male
                return VOICE_PROFILES["adult_male_formal"]

        elif age > 60: # Senior
            if gender_pref == "female" and style_pref == "calm" and "senior_female_calm" in VOICE_PROFILES:
                return VOICE_PROFILES["senior_female_calm"]
            elif gender_pref == "male" and style_pref == "narration" and "senior_male_narration" in VOICE_PROFILES:
                return VOICE_PROFILES["senior_male_narration"]

    # Fallback based on gender if no age match or specific age match failed
    if gender_pref == "female" and "adult_female_narration" in VOICE_PROFILES:
        return VOICE_PROFILES["adult_female_narration"] # Default female voice
    if gender_pref == "male" and "adult_male_formal" in VOICE_PROFILES:
        return VOICE_PROFILES["adult_male_formal"] # Default male voice

    # Absolute fallback
    print(f"Warning: No specific voice found for profile. Using default voice.")
    return VOICE_PROFILES["default"]


def generate_audio_for_user(
    user_profile: UserProfile,
    content: ContentInput,
    client: ElevenLabs = ElevenLabs(api_key=os.getenv("ELABS_API_KEY")),
    base_filename: str = "output.mp3", # Just the filename, not the path
    output_directory: str = AUDIO_OUTPUT_DIRECTORY, # Use the configured directory
    model_id: str = "eleven_multilingual_v2",
    output_format: str = "mp3_44100_128"
) -> object:
    """
    Generates audio for the given user profile and content, saving it to a file
    within the specified output directory.
    Returns the full path to the saved audio file.
    """
    selected_voice_id = select_voice_id(user_profile)
    print(f"User: {user_profile.name or user_profile.user_id}, Age: {user_profile.age}, Preferred Gender: {user_profile.preferred_voice_gender}, Preferred Style: {user_profile.preferred_voice_style}")
    print(f"Selected Voice ID: {selected_voice_id}")
    print(f"Generating audio for text: \"{content.original_text[:50]}...\"")

    # Ensure the output directory exists
    output_dir_path = Path(output_directory)
    output_dir_path.mkdir(parents=True, exist_ok=True) # Create if not exists, no error if it does

    # Construct the full output path
    full_output_path = output_dir_path / base_filename

    try:
        audio_stream = client.text_to_speech.convert(
            voice_id=selected_voice_id,
            output_format=output_format,
            text=content.original_text,
            model_id=model_id,
        )

        # save(audio_stream, str(full_output_path)) # save expects a string path
        print(f"Audio successfully saved to {full_output_path}")
        return {"path":str(full_output_path), "stream": audio_stream}
    except Exception as e:
        print(f"Error during ElevenLabs API call or saving audio: {e}")
        raise

# --- Main execution block ---
if __name__ == "__main__":
    api_key = os.getenv("ELABS_API_KEY")
    if not api_key:
        raise ValueError("ELABS_API_KEY not found in environment variables. Please set it in your .env file.")

    eleven_client = ElevenLabs(api_key=api_key)

    # Example User Profiles
    user1_profile = UserProfile(
        user_id="user001", name="Alice", age=8,
        preferred_voice_gender="female", preferred_voice_style="energetic",
        interests=["cartoons", "fairy tales"]
    )
    user2_profile = UserProfile(
        user_id="user002", name="Bob", age=45,
        preferred_voice_gender="male", preferred_voice_style="formal",
        interests=["history", "documentaries"]
    )
    user3_profile = UserProfile(
        user_id="user003", name="Carol", age=28,
        interests=["technology", "podcasts"]
    )

    # Example Content
    content1 = ContentInput(
        title="The Magical Forest",
        original_text="Once upon a time, in a magical forest, lived a little squirrel named Squeaky. Squeaky loved adventures!"
    )
    content2 = ContentInput(
        title="The Roman Empire",
        original_text="The Roman Empire was one of the most powerful and influential civilizations in world history, lasting for over a thousand years."
    )
    content3 = ContentInput(
        title="Tech News",
        original_text="Today in tech: a new AI model promises to revolutionize how we interact with computers."
    )

    print(f"Audio files will be saved in: '{AUDIO_OUTPUT_DIRECTORY}' folder.")

    print("\n--- Generating for User 1 (Alice) ---")
    try:
        if VOICE_PROFILES.get("young_female_energetic", "").startswith("placeholder_"):
             print("Skipping User 1 generation as 'young_female_energetic' voice ID is a placeholder. Please update VOICE_PROFILES.")
        else:
            generate_audio_for_user(
                eleven_client, user1_profile, content1,
                base_filename="audio_alice_magical_forest.mp3"
                # output_directory will use the default AUDIO_OUTPUT_DIRECTORY
            )
    except Exception as e:
        print(f"Could not generate audio for User 1: {e}")

    # print("\n--- Generating for User 2 (Bob) ---")
    # try:
    #     if VOICE_PROFILES.get("adult_male_formal", "").startswith("placeholder_"):
    #         print("Skipping User 2 generation as 'adult_male_formal' voice ID is a placeholder. Please update VOICE_PROFILES.")
    #     else:
    #         generate_audio_for_user(
    #             eleven_client, user2_profile, content2,
    #             base_filename="audio_bob_roman_empire.mp3"
    #         )
    # except Exception as e:
    #     print(f"Could not generate audio for User 2: {e}")

    # print("\n--- Generating for User 3 (Carol) ---")
    # try:
    #     generate_audio_for_user(
    #         eleven_client, user3_profile, content3,
    #         base_filename="audio_carol_tech_news.mp3"
    #     )
    except Exception as e:
        print(f"Could not generate audio for User 3: {e}")

    # You can also specify a different directory per call if needed:
    # print("\n--- Generating for User 3 (Carol) in a custom directory ---")
    # try:
    #     generate_audio_for_user(
    #         eleven_client, user3_profile, content3,
    #         base_filename="audio_carol_tech_news_custom_dir.mp3",
    #         output_directory="custom_audio_outputs"
    #     )
    # except Exception as e:
    #     print(f"Could not generate audio for User 3 in custom dir: {e}")