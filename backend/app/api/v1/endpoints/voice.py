"""
Voice API endpoints for ASR/TTS functionality
"""

import asyncio
import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from fastapi.responses import Response
from app.services.bhashini_service import bhashini_service
from app.schemas.voice import (
    VoiceProcessRequest,
    VoiceProcessResponse,
    ASRRequest,
    ASRResponse,
    TTSRequest,
    TTSResponse,
    LanguageDetectionResponse
)
from app.middleware.rate_limiting import rate_limit

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/process", response_model=VoiceProcessResponse)
@rate_limit(calls=30, period=60)  # 30 calls per minute
async def process_voice_query(
    audio_file: UploadFile = File(...),
    language: str = Form("hi"),
    context: Optional[str] = Form(None)
):
    """
    Process complete voice query: ASR + Intent + TTS Response
    
    Args:
        audio_file: Audio file (WAV, MP3, etc.)
        language: Language code (hi, en, ta, te, bn, etc.)
        context: Optional context for better intent recognition
        
    Returns:
        Complete voice processing result with transcription and response
    """
    try:
        # Validate file type
        if not audio_file.content_type or not audio_file.content_type.startswith('audio/'):
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Please upload an audio file."
            )
        
        # Read audio data
        audio_data = await audio_file.read()
        
        if len(audio_data) == 0:
            raise HTTPException(
                status_code=400,
                detail="Empty audio file"
            )
        
        # Validate file size (max 10MB)
        if len(audio_data) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="Audio file too large. Maximum size is 10MB."
            )
        
        # Parse context if provided
        context_dict = None
        if context:
            try:
                import json
                context_dict = json.loads(context)
            except json.JSONDecodeError:
                logger.warning(f"Invalid context JSON: {context}")
        
        # Process voice query
        result = await bhashini_service.process_voice_query(
            audio_data=audio_data,
            language=language,
            context=context_dict
        )
        
        return VoiceProcessResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Voice processing error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Voice processing failed. Please try again."
        )

@router.post("/asr", response_model=ASRResponse)
@rate_limit(calls=50, period=60)  # 50 calls per minute
async def speech_to_text(
    audio_file: UploadFile = File(...),
    language: str = Form("hi"),
    audio_format: str = Form("wav")
):
    """
    Convert speech to text using Bhashini ASR
    
    Args:
        audio_file: Audio file to transcribe
        language: Language code
        audio_format: Audio format (wav, mp3, etc.)
        
    Returns:
        Transcription result with confidence scores
    """
    try:
        # Validate inputs
        if not audio_file.content_type or not audio_file.content_type.startswith('audio/'):
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Please upload an audio file."
            )
        
        # Read audio data
        audio_data = await audio_file.read()
        
        if len(audio_data) == 0:
            raise HTTPException(
                status_code=400,
                detail="Empty audio file"
            )
        
        # Transcribe audio
        result = await bhashini_service.transcribe_audio(
            audio_data=audio_data,
            language=language,
            audio_format=audio_format
        )
        
        return ASRResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"ASR error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Speech recognition failed. Please try again."
        )

@router.post("/tts", response_model=TTSResponse)
@rate_limit(calls=50, period=60)  # 50 calls per minute
async def text_to_speech(request: TTSRequest):
    """
    Convert text to speech using Bhashini TTS
    
    Args:
        request: TTS request with text and parameters
        
    Returns:
        Audio data and metadata
    """
    try:
        # Validate text length
        if len(request.text.strip()) == 0:
            raise HTTPException(
                status_code=400,
                detail="Text cannot be empty"
            )
        
        if len(request.text) > 1000:
            raise HTTPException(
                status_code=400,
                detail="Text too long. Maximum length is 1000 characters."
            )
        
        # Synthesize speech
        result = await bhashini_service.synthesize_speech(
            text=request.text,
            language=request.language,
            voice_gender=request.voice_gender,
            audio_format=request.audio_format
        )
        
        return TTSResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"TTS error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Speech synthesis failed. Please try again."
        )

@router.post("/tts/audio")
@rate_limit(calls=50, period=60)
async def text_to_speech_audio(request: TTSRequest):
    """
    Convert text to speech and return raw audio data
    
    Args:
        request: TTS request with text and parameters
        
    Returns:
        Raw audio file
    """
    try:
        # Synthesize speech
        result = await bhashini_service.synthesize_speech(
            text=request.text,
            language=request.language,
            voice_gender=request.voice_gender,
            audio_format=request.audio_format
        )
        
        if not result.get("success", False) or not result.get("audio_data"):
            raise HTTPException(
                status_code=500,
                detail="Speech synthesis failed"
            )
        
        # Return audio as response
        audio_data = result["audio_data"]
        
        # Set appropriate content type
        content_type_map = {
            "wav": "audio/wav",
            "mp3": "audio/mpeg",
            "ogg": "audio/ogg"
        }
        content_type = content_type_map.get(request.audio_format.lower(), "audio/wav")
        
        return Response(
            content=audio_data,
            media_type=content_type,
            headers={
                "Content-Disposition": f"attachment; filename=speech.{request.audio_format}",
                "Cache-Control": "public, max-age=3600"  # Cache for 1 hour
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"TTS audio error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Speech synthesis failed. Please try again."
        )

@router.post("/detect-language", response_model=LanguageDetectionResponse)
@rate_limit(calls=20, period=60)  # 20 calls per minute
async def detect_language(
    audio_file: UploadFile = File(...)
):
    """
    Detect language from audio
    
    Args:
        audio_file: Audio file for language detection
        
    Returns:
        Detected language with confidence score
    """
    try:
        # Validate file type
        if not audio_file.content_type or not audio_file.content_type.startswith('audio/'):
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Please upload an audio file."
            )
        
        # Read audio data
        audio_data = await audio_file.read()
        
        if len(audio_data) == 0:
            raise HTTPException(
                status_code=400,
                detail="Empty audio file"
            )
        
        # Detect language
        result = await bhashini_service.detect_language(audio_data)
        
        return LanguageDetectionResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Language detection error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Language detection failed. Please try again."
        )

@router.get("/supported-languages")
async def get_supported_languages():
    """
    Get list of supported languages for ASR/TTS
    
    Returns:
        List of supported language codes and names
    """
    try:
        languages = [
            {"code": "hi", "name": "Hindi", "native_name": "हिन्दी"},
            {"code": "en", "name": "English", "native_name": "English"},
            {"code": "ta", "name": "Tamil", "native_name": "தமிழ்"},
            {"code": "te", "name": "Telugu", "native_name": "తెలుగు"},
            {"code": "bn", "name": "Bengali", "native_name": "বাংলা"},
            {"code": "mr", "name": "Marathi", "native_name": "मराठी"},
            {"code": "gu", "name": "Gujarati", "native_name": "ગુજરાતી"},
            {"code": "kn", "name": "Kannada", "native_name": "ಕನ್ನಡ"},
            {"code": "ml", "name": "Malayalam", "native_name": "മലയാളം"},
            {"code": "or", "name": "Odia", "native_name": "ଓଡ଼ିଆ"},
            {"code": "pa", "name": "Punjabi", "native_name": "ਪੰਜਾਬੀ"},
            {"code": "as", "name": "Assamese", "native_name": "অসমীয়া"}
        ]
        
        return {
            "success": True,
            "languages": languages,
            "total_count": len(languages)
        }
        
    except Exception as e:
        logger.error(f"Error getting supported languages: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get supported languages"
        )

@router.get("/health")
async def voice_service_health():
    """
    Check voice service health
    
    Returns:
        Service health status
    """
    try:
        # Test basic service connectivity
        # In production, this could ping Bhashini API
        
        return {
            "success": True,
            "service": "voice",
            "status": "healthy",
            "features": {
                "asr": True,
                "tts": True,
                "language_detection": True
            },
            "supported_languages": 12
        }
        
    except Exception as e:
        logger.error(f"Voice service health check failed: {str(e)}")
        return {
            "success": False,
            "service": "voice",
            "status": "unhealthy",
            "error": str(e)
        }