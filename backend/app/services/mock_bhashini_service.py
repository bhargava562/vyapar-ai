"""
Mock Bhashini Service
Provides mock data for Bhashini API until real API keys are available
"""

import random
import asyncio
from typing import Dict, List, Optional
import base64
import json

class MockBhashiniService:
    """Mock service for Bhashini AI4Bharat API"""
    
    def __init__(self):
        self.supported_languages = {
            "hi": {"name": "Hindi", "native": "हिंदी"},
            "en": {"name": "English", "native": "English"},
            "ta": {"name": "Tamil", "native": "தமிழ்"},
            "te": {"name": "Telugu", "native": "తెలుగు"},
            "bn": {"name": "Bengali", "native": "বাংলা"}
        }
        
        # Mock responses for different languages
        self.mock_responses = {
            "hi": [
                "मैं आपकी बात समझ गया हूं।",
                "यह बहुत अच्छा है।",
                "क्या मैं आपकी और मदद कर सकता हूं?",
                "धन्यवाद, आपका दिन शुभ हो।"
            ],
            "en": [
                "I understand what you said.",
                "That sounds great.",
                "How else can I help you?",
                "Thank you, have a great day."
            ],
            "ta": [
                "நீங்கள் சொன்னது எனக்குப் புரிந்தது.",
                "அது நன்றாக இருக்கிறது.",
                "வேறு எப்படி உதவ முடியும்?",
                "நன்றி, நல்ல நாள் இருக்கட்டும்."
            ],
            "te": [
                "మీరు చెప్పినది నాకు అర్థమైంది.",
                "అది చాలా బాగుంది.",
                "నేను మరెలా సహాయం చేయగలను?",
                "ధన్యవాదాలు, మంచి రోజు గడపండి."
            ],
            "bn": [
                "আপনি যা বলেছেন তা আমি বুঝতে পেরেছি।",
                "এটা খুব ভালো।",
                "আমি আর কীভাবে সাহায্য করতে পারি?",
                "ধন্যবাদ, আপনার দিন ভালো কাটুক।"
            ]
        }
    
    async def transcribe_audio(
        self, 
        audio_data: bytes, 
        source_language: str = "hi",
        audio_format: str = "wav"
    ) -> Dict:
        """Mock audio transcription"""
        
        # Simulate processing delay
        await asyncio.sleep(random.uniform(0.5, 2.0))
        
        # Mock transcriptions based on language
        mock_transcriptions = {
            "hi": [
                "नमस्ते, मैं एक किसान हूं",
                "आज बाजार में प्याज का भाव क्या है",
                "मुझे अपनी फसल बेचनी है",
                "क्या यह सही दाम है"
            ],
            "en": [
                "Hello, I am a farmer",
                "What is the price of onions in the market today",
                "I need to sell my crops",
                "Is this the right price"
            ],
            "ta": [
                "வணக்கம், நான் ஒரு விவசாயி",
                "இன்று சந்தையில் வெங்காயத்தின் விலை என்ன",
                "எனக்கு என் பயிர்களை விற்க வேண்டும்",
                "இது சரியான விலையா"
            ],
            "te": [
                "నమస్కారం, నేను ఒక రైతును",
                "ఈరోజు మార్కెట్‌లో ఉల్లిపాయల ధర ఎంత",
                "నేను నా పంటలను అమ్మాలి",
                "ఇది సరైన ధరనా"
            ],
            "bn": [
                "নমস্কার, আমি একজন কৃষক",
                "আজ বাজারে পেঁয়াজের দাম কত",
                "আমার ফসল বিক্রি করতে হবে",
                "এটা কি সঠিক দাম"
            ]
        }
        
        transcription = random.choice(
            mock_transcriptions.get(source_language, mock_transcriptions["en"])
        )
        
        return {
            "success": True,
            "transcription": transcription,
            "confidence": round(random.uniform(0.75, 0.95), 2),
            "language": source_language,
            "processing_time": round(random.uniform(0.5, 2.0), 2),
            "source": "mock_bhashini"
        }
    
    async def synthesize_speech(
        self, 
        text: str, 
        target_language: str = "hi",
        voice_gender: str = "female",
        audio_format: str = "wav"
    ) -> Dict:
        """Mock text-to-speech synthesis"""
        
        # Simulate processing delay
        await asyncio.sleep(random.uniform(0.3, 1.5))
        
        # Generate mock audio data (base64 encoded silence)
        mock_audio_data = base64.b64encode(b'\x00' * 1024).decode('utf-8')
        
        return {
            "success": True,
            "audio_data": mock_audio_data,
            "text": text,
            "language": target_language,
            "voice_gender": voice_gender,
            "duration": round(len(text) * 0.1, 2),  # Mock duration based on text length
            "processing_time": round(random.uniform(0.3, 1.5), 2),
            "source": "mock_bhashini"
        }
    
    async def translate_text(
        self, 
        text: str, 
        source_language: str, 
        target_language: str
    ) -> Dict:
        """Mock text translation"""
        
        # Simulate processing delay
        await asyncio.sleep(random.uniform(0.2, 1.0))
        
        # Simple mock translation (in real implementation, this would use Bhashini)
        translations = {
            ("en", "hi"): {
                "hello": "नमस्ते",
                "thank you": "धन्यवाद",
                "price": "दाम",
                "market": "बाजार"
            },
            ("hi", "en"): {
                "नमस्ते": "hello",
                "धन्यवाद": "thank you",
                "दाम": "price",
                "बाजार": "market"
            }
        }
        
        # Mock translation (simplified)
        translation_dict = translations.get((source_language, target_language), {})
        translated_text = translation_dict.get(text.lower(), f"[Translated: {text}]")
        
        return {
            "success": True,
            "translated_text": translated_text,
            "source_language": source_language,
            "target_language": target_language,
            "confidence": round(random.uniform(0.8, 0.95), 2),
            "processing_time": round(random.uniform(0.2, 1.0), 2),
            "source": "mock_bhashini"
        }
    
    async def detect_language(self, text: str) -> Dict:
        """Mock language detection"""
        
        # Simple mock language detection based on script
        if any(ord(char) >= 0x0900 and ord(char) <= 0x097F for char in text):
            detected_lang = "hi"  # Devanagari script
        elif any(ord(char) >= 0x0B80 and ord(char) <= 0x0BFF for char in text):
            detected_lang = "ta"  # Tamil script
        elif any(ord(char) >= 0x0C00 and ord(char) <= 0x0C7F for char in text):
            detected_lang = "te"  # Telugu script
        elif any(ord(char) >= 0x0980 and ord(char) <= 0x09FF for char in text):
            detected_lang = "bn"  # Bengali script
        else:
            detected_lang = "en"  # Default to English
        
        return {
            "success": True,
            "detected_language": detected_lang,
            "confidence": round(random.uniform(0.85, 0.98), 2),
            "alternatives": [
                {
                    "language": lang,
                    "confidence": round(random.uniform(0.1, 0.3), 2)
                }
                for lang in self.supported_languages.keys()
                if lang != detected_lang
            ][:2],  # Top 2 alternatives
            "source": "mock_bhashini"
        }
    
    async def get_supported_languages(self) -> Dict:
        """Get supported languages"""
        return {
            "success": True,
            "languages": [
                {
                    "code": code,
                    "name": info["name"],
                    "native_name": info["native"],
                    "asr_supported": True,
                    "tts_supported": True,
                    "translation_supported": True
                }
                for code, info in self.supported_languages.items()
            ],
            "source": "mock_bhashini"
        }
    
    async def process_voice_query(
        self, 
        audio_data: bytes, 
        language: str = "hi",
        context: Optional[Dict] = None
    ) -> Dict:
        """Mock complete voice query processing"""
        
        # Step 1: Transcribe audio
        transcription_result = await self.transcribe_audio(audio_data, language)
        
        if not transcription_result["success"]:
            return transcription_result
        
        transcription = transcription_result["transcription"]
        
        # Step 2: Generate response
        response_text = random.choice(self.mock_responses.get(language, self.mock_responses["en"]))
        
        # Step 3: Synthesize response
        tts_result = await self.synthesize_speech(response_text, language)
        
        return {
            "success": True,
            "transcription": transcription,
            "confidence": transcription_result["confidence"],
            "intent": {
                "intent": "general_query",
                "confidence": 0.8,
                "entities": {}
            },
            "response_text": response_text,
            "response_audio": tts_result.get("audio_data") if tts_result["success"] else None,
            "processing_time": round(
                transcription_result["processing_time"] + tts_result.get("processing_time", 0), 2
            ),
            "source": "mock_bhashini"
        }

# Singleton instance
mock_bhashini_service = MockBhashiniService()