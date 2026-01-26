"""
Bhashini ASR/TTS Service
Integrates with AI4Bharat's Bhashini platform for multilingual speech recognition and synthesis
"""

import asyncio
import aiohttp
import base64
import json
import logging
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, timedelta
from app.core.config import settings
from app.core.redis_client import get_redis_client

logger = logging.getLogger(__name__)

class BhashiniService:
    """Service for Bhashini ASR and TTS operations"""
    
    def __init__(self):
        self.api_key = settings.BHASHINI_API_KEY
        self.base_url = "https://meity-hf.hf.space"  # Bhashini API endpoint
        self.redis_client = get_redis_client()
        
        # Language mapping for Bhashini
        self.language_codes = {
            'hi': 'hi',  # Hindi
            'en': 'en',  # English
            'ta': 'ta',  # Tamil
            'te': 'te',  # Telugu
            'bn': 'bn',  # Bengali
            'mr': 'mr',  # Marathi
            'gu': 'gu',  # Gujarati
            'kn': 'kn',  # Kannada
            'ml': 'ml',  # Malayalam
            'or': 'or',  # Odia
            'pa': 'pa',  # Punjabi
            'as': 'as',  # Assamese
        }
        
        # ASR model configurations
        self.asr_models = {
            'hi': 'ai4bharat/conformer_hi',
            'en': 'ai4bharat/conformer_en',
            'ta': 'ai4bharat/conformer_ta',
            'te': 'ai4bharat/conformer_te',
            'bn': 'ai4bharat/conformer_bn',
            'mr': 'ai4bharat/conformer_mr',
            'gu': 'ai4bharat/conformer_gu',
            'kn': 'ai4bharat/conformer_kn',
            'ml': 'ai4bharat/conformer_ml',
            'or': 'ai4bharat/conformer_or',
        }
        
        # TTS model configurations
        self.tts_models = {
            'hi': 'ai4bharat/indic-tts-hi-female',
            'en': 'ai4bharat/indic-tts-en-female',
            'ta': 'ai4bharat/indic-tts-ta-female',
            'te': 'ai4bharat/indic-tts-te-female',
            'bn': 'ai4bharat/indic-tts-bn-female',
            'mr': 'ai4bharat/indic-tts-mr-female',
            'gu': 'ai4bharat/indic-tts-gu-female',
            'kn': 'ai4bharat/indic-tts-kn-female',
            'ml': 'ai4bharat/indic-tts-ml-female',
        }

    async def transcribe_audio(
        self, 
        audio_data: bytes, 
        language: str = 'hi',
        audio_format: str = 'wav'
    ) -> Dict[str, Any]:
        """
        Transcribe audio using Bhashini ASR
        
        Args:
            audio_data: Raw audio bytes
            language: Language code (hi, en, ta, etc.)
            audio_format: Audio format (wav, mp3, etc.)
            
        Returns:
            Dict containing transcription result and metadata
        """
        try:
            # Validate language support
            if language not in self.language_codes:
                raise ValueError(f"Unsupported language: {language}")
            
            # Check cache first
            cache_key = f"asr:{language}:{hash(audio_data)}"
            cached_result = await self._get_cached_result(cache_key)
            if cached_result:
                logger.info(f"ASR cache hit for language {language}")
                return cached_result
            
            # Prepare audio for Bhashini API
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')
            
            # Prepare request payload
            payload = {
                "audio": {
                    "audioContent": audio_base64,
                    "audioFormat": audio_format.upper(),
                    "sampleRate": 16000,
                    "languageCode": self.language_codes[language]
                },
                "config": {
                    "language": self.language_codes[language],
                    "model": self.asr_models.get(language, self.asr_models['hi']),
                    "enableAutomaticPunctuation": True,
                    "enableWordTimeOffsets": True,
                    "maxAlternatives": 3
                }
            }
            
            # Make API request
            async with aiohttp.ClientSession() as session:
                headers = {
                    'Authorization': f'Bearer {self.api_key}',
                    'Content-Type': 'application/json'
                }
                
                async with session.post(
                    f"{self.base_url}/asr",
                    json=payload,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    
                    if response.status != 200:
                        error_text = await response.text()
                        logger.error(f"Bhashini ASR API error: {response.status} - {error_text}")
                        return await self._fallback_asr(audio_data, language)
                    
                    result = await response.json()
                    
                    # Process and format result
                    processed_result = await self._process_asr_result(result, language)
                    
                    # Cache successful result
                    await self._cache_result(cache_key, processed_result, ttl=3600)
                    
                    return processed_result
                    
        except asyncio.TimeoutError:
            logger.error("Bhashini ASR request timeout")
            return await self._fallback_asr(audio_data, language)
        except Exception as e:
            logger.error(f"ASR error: {str(e)}")
            return await self._fallback_asr(audio_data, language)

    async def synthesize_speech(
        self, 
        text: str, 
        language: str = 'hi',
        voice_gender: str = 'female',
        audio_format: str = 'wav'
    ) -> Dict[str, Any]:
        """
        Synthesize speech using Bhashini TTS
        
        Args:
            text: Text to synthesize
            language: Language code
            voice_gender: Voice gender (male/female)
            audio_format: Output audio format
            
        Returns:
            Dict containing audio data and metadata
        """
        try:
            # Validate inputs
            if language not in self.language_codes:
                raise ValueError(f"Unsupported language: {language}")
            
            if not text.strip():
                raise ValueError("Text cannot be empty")
            
            # Check cache first
            cache_key = f"tts:{language}:{voice_gender}:{hash(text)}"
            cached_result = await self._get_cached_result(cache_key)
            if cached_result:
                logger.info(f"TTS cache hit for language {language}")
                return cached_result
            
            # Prepare request payload
            payload = {
                "input": {
                    "text": text.strip()
                },
                "voice": {
                    "languageCode": self.language_codes[language],
                    "name": self.tts_models.get(language, self.tts_models['hi']),
                    "ssmlGender": voice_gender.upper()
                },
                "audioConfig": {
                    "audioEncoding": audio_format.upper(),
                    "sampleRateHertz": 22050,
                    "speakingRate": 1.0,
                    "pitch": 0.0,
                    "volumeGainDb": 0.0
                }
            }
            
            # Make API request
            async with aiohttp.ClientSession() as session:
                headers = {
                    'Authorization': f'Bearer {self.api_key}',
                    'Content-Type': 'application/json'
                }
                
                async with session.post(
                    f"{self.base_url}/tts",
                    json=payload,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    
                    if response.status != 200:
                        error_text = await response.text()
                        logger.error(f"Bhashini TTS API error: {response.status} - {error_text}")
                        return await self._fallback_tts(text, language)
                    
                    result = await response.json()
                    
                    # Process and format result
                    processed_result = await self._process_tts_result(result, language, text)
                    
                    # Cache successful result
                    await self._cache_result(cache_key, processed_result, ttl=7200)
                    
                    return processed_result
                    
        except asyncio.TimeoutError:
            logger.error("Bhashini TTS request timeout")
            return await self._fallback_tts(text, language)
        except Exception as e:
            logger.error(f"TTS error: {str(e)}")
            return await self._fallback_tts(text, language)

    async def detect_language(self, audio_data: bytes) -> Dict[str, Any]:
        """
        Detect language from audio using Bhashini
        
        Args:
            audio_data: Raw audio bytes
            
        Returns:
            Dict containing detected language and confidence
        """
        try:
            # Prepare audio for API
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')
            
            payload = {
                "audio": {
                    "audioContent": audio_base64,
                    "audioFormat": "WAV"
                },
                "config": {
                    "candidateLanguages": list(self.language_codes.values())
                }
            }
            
            async with aiohttp.ClientSession() as session:
                headers = {
                    'Authorization': f'Bearer {self.api_key}',
                    'Content-Type': 'application/json'
                }
                
                async with session.post(
                    f"{self.base_url}/language-detection",
                    json=payload,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=15)
                ) as response:
                    
                    if response.status != 200:
                        logger.error(f"Language detection API error: {response.status}")
                        return {"language": "hi", "confidence": 0.5}  # Default fallback
                    
                    result = await response.json()
                    
                    return {
                        "language": result.get("detectedLanguage", "hi"),
                        "confidence": result.get("confidence", 0.5),
                        "alternatives": result.get("alternatives", [])
                    }
                    
        except Exception as e:
            logger.error(f"Language detection error: {str(e)}")
            return {"language": "hi", "confidence": 0.5}

    async def process_voice_query(
        self, 
        audio_data: bytes, 
        language: str = 'hi',
        context: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Process complete voice query: ASR + Intent Recognition + TTS Response
        
        Args:
            audio_data: Raw audio bytes
            language: Language code
            context: Additional context for intent recognition
            
        Returns:
            Dict containing transcription, intent, and response
        """
        try:
            # Step 1: Transcribe audio
            asr_result = await self.transcribe_audio(audio_data, language)
            
            if not asr_result.get("success", False):
                return {
                    "success": False,
                    "error": "Speech recognition failed",
                    "fallback_message": "कृपया दोबारा बोलें या टाइप करें"  # Please speak again or type
                }
            
            transcription = asr_result.get("transcription", "")
            confidence = asr_result.get("confidence", 0.0)
            
            # Step 2: Process intent (simplified for now)
            intent_result = await self._process_intent(transcription, language, context)
            
            # Step 3: Generate response
            response_text = await self._generate_response(intent_result, language)
            
            # Step 4: Synthesize response speech
            tts_result = await self.synthesize_speech(response_text, language)
            
            return {
                "success": True,
                "transcription": transcription,
                "confidence": confidence,
                "intent": intent_result,
                "response_text": response_text,
                "response_audio": tts_result.get("audio_data"),
                "processing_time": asr_result.get("processing_time", 0) + tts_result.get("processing_time", 0)
            }
            
        except Exception as e:
            logger.error(f"Voice query processing error: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "fallback_message": "कुछ गलत हुआ है। कृपया दोबारा कोशिश करें।"
            }

    async def _process_asr_result(self, result: Dict, language: str) -> Dict[str, Any]:
        """Process and format ASR result"""
        try:
            # Extract transcription from Bhashini response
            transcription = ""
            confidence = 0.0
            alternatives = []
            
            if "results" in result and result["results"]:
                best_result = result["results"][0]
                if "alternatives" in best_result and best_result["alternatives"]:
                    best_alternative = best_result["alternatives"][0]
                    transcription = best_alternative.get("transcript", "")
                    confidence = best_alternative.get("confidence", 0.0)
                    
                    # Get all alternatives
                    alternatives = [
                        {
                            "transcript": alt.get("transcript", ""),
                            "confidence": alt.get("confidence", 0.0)
                        }
                        for alt in best_result["alternatives"]
                    ]
            
            return {
                "success": True,
                "transcription": transcription.strip(),
                "confidence": confidence,
                "alternatives": alternatives,
                "language": language,
                "processing_time": result.get("processingTime", 0),
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"ASR result processing error: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "transcription": "",
                "confidence": 0.0
            }

    async def _process_tts_result(self, result: Dict, language: str, text: str) -> Dict[str, Any]:
        """Process and format TTS result"""
        try:
            audio_content = result.get("audioContent", "")
            
            if not audio_content:
                raise ValueError("No audio content in TTS response")
            
            # Decode base64 audio
            audio_data = base64.b64decode(audio_content)
            
            return {
                "success": True,
                "audio_data": audio_data,
                "audio_base64": audio_content,
                "text": text,
                "language": language,
                "duration": result.get("duration", 0),
                "processing_time": result.get("processingTime", 0),
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"TTS result processing error: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "audio_data": None
            }

    async def _process_intent(self, text: str, language: str, context: Optional[Dict] = None) -> Dict[str, Any]:
        """Process intent from transcribed text (simplified implementation)"""
        text_lower = text.lower()
        
        # Simple keyword-based intent recognition
        # In production, this would use a proper NLU model
        
        if any(word in text_lower for word in ['कीमत', 'price', 'விலை', 'ధర', 'দাম']):
            return {
                "intent": "price_query",
                "confidence": 0.8,
                "entities": {"product": self._extract_product(text, language)}
            }
        elif any(word in text_lower for word in ['qr', 'कोड', 'code', 'குறியீடு', 'కోడ్', 'কোড']):
            return {
                "intent": "generate_qr",
                "confidence": 0.8,
                "entities": {}
            }
        elif any(word in text_lower for word in ['मदद', 'help', 'உதவி', 'సహాయం', 'সাহায্য']):
            return {
                "intent": "help",
                "confidence": 0.9,
                "entities": {}
            }
        else:
            return {
                "intent": "unknown",
                "confidence": 0.3,
                "entities": {}
            }

    def _extract_product(self, text: str, language: str) -> Optional[str]:
        """Extract product name from text (simplified)"""
        # This is a simplified implementation
        # In production, use proper NER models
        
        common_products = {
            'hi': ['टमाटर', 'प्याज', 'आलू', 'चावल', 'गेहूं'],
            'en': ['tomato', 'onion', 'potato', 'rice', 'wheat'],
            'ta': ['தக்காளி', 'வெங்காயம்', 'உருளைக்கிழங்கு', 'அரிசி', 'கோதுமை'],
            'te': ['టమాటో', 'ఉల్లిపాయ', 'బంగాళాదుంప', 'బియ్యం', 'గోధుమ'],
            'bn': ['টমেটো', 'পেঁয়াজ', 'আলু', 'চাল', 'গম']
        }
        
        products = common_products.get(language, common_products['hi'])
        text_lower = text.lower()
        
        for product in products:
            if product.lower() in text_lower:
                return product
        
        return None

    async def _generate_response(self, intent_result: Dict, language: str) -> str:
        """Generate response text based on intent"""
        intent = intent_result.get("intent", "unknown")
        
        responses = {
            'hi': {
                'price_query': 'मैं आपके लिए कीमत की जानकारी ला रहा हूं।',
                'generate_qr': 'मैं आपके लिए QR कोड बना रहा हूं।',
                'help': 'मैं आपकी मदद कर सकता हूं। आप कीमत पूछ सकते हैं या QR कोड बना सकते हैं।',
                'unknown': 'मुझे समझ नहीं आया। कृपया दोबारा बोलें।'
            },
            'en': {
                'price_query': 'I am getting price information for you.',
                'generate_qr': 'I am generating a QR code for you.',
                'help': 'I can help you. You can ask for prices or generate QR codes.',
                'unknown': 'I did not understand. Please speak again.'
            },
            'ta': {
                'price_query': 'உங்களுக்காக விலை தகவலைப் பெற்று வருகிறேன்.',
                'generate_qr': 'உங்களுக்காக QR குறியீட்டை உருவாக்குகிறேன்.',
                'help': 'நான் உங்களுக்கு உதவ முடியும். நீங்கள் விலைகளைக் கேட்கலாம் அல்லது QR குறியீடுகளை உருவாக்கலாம்.',
                'unknown': 'எனக்குப் புரியவில்லை. தயவுசெய்து மீண்டும் பேசுங்கள்.'
            }
        }
        
        lang_responses = responses.get(language, responses['hi'])
        return lang_responses.get(intent, lang_responses['unknown'])

    async def _fallback_asr(self, audio_data: bytes, language: str) -> Dict[str, Any]:
        """Fallback ASR when Bhashini fails"""
        logger.warning(f"Using fallback ASR for language {language}")
        return {
            "success": False,
            "transcription": "",
            "confidence": 0.0,
            "error": "ASR service unavailable",
            "fallback": True
        }

    async def _fallback_tts(self, text: str, language: str) -> Dict[str, Any]:
        """Fallback TTS when Bhashini fails"""
        logger.warning(f"Using fallback TTS for language {language}")
        return {
            "success": False,
            "audio_data": None,
            "error": "TTS service unavailable",
            "fallback": True
        }

    async def _get_cached_result(self, cache_key: str) -> Optional[Dict]:
        """Get cached result from Redis"""
        try:
            if self.redis_client:
                cached_data = await self.redis_client.get(cache_key)
                if cached_data:
                    return json.loads(cached_data)
        except Exception as e:
            logger.error(f"Cache retrieval error: {str(e)}")
        return None

    async def _cache_result(self, cache_key: str, result: Dict, ttl: int = 3600):
        """Cache result in Redis"""
        try:
            if self.redis_client:
                await self.redis_client.setex(
                    cache_key, 
                    ttl, 
                    json.dumps(result, default=str)
                )
        except Exception as e:
            logger.error(f"Cache storage error: {str(e)}")

# Global service instance
bhashini_service = BhashiniService()