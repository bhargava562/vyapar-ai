"""
Pydantic schemas for voice processing operations
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Union
from datetime import datetime

class VoiceProcessRequest(BaseModel):
    """Request schema for complete voice processing"""
    language: str = Field(default="hi", description="Language code (hi, en, ta, etc.)")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context for intent recognition")
    
    @validator('language')
    def validate_language(cls, v):
        supported_languages = ['hi', 'en', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'or', 'pa', 'as']
        if v not in supported_languages:
            raise ValueError(f'Unsupported language: {v}. Supported: {supported_languages}')
        return v

class VoiceProcessResponse(BaseModel):
    """Response schema for complete voice processing"""
    success: bool = Field(description="Whether the processing was successful")
    transcription: Optional[str] = Field(None, description="Transcribed text from audio")
    confidence: Optional[float] = Field(None, description="Confidence score (0.0-1.0)")
    intent: Optional[Dict[str, Any]] = Field(None, description="Detected intent and entities")
    response_text: Optional[str] = Field(None, description="Generated response text")
    response_audio: Optional[bytes] = Field(None, description="Generated response audio")
    processing_time: Optional[float] = Field(None, description="Total processing time in seconds")
    error: Optional[str] = Field(None, description="Error message if processing failed")
    fallback_message: Optional[str] = Field(None, description="Fallback message for user")

class ASRRequest(BaseModel):
    """Request schema for Automatic Speech Recognition"""
    language: str = Field(default="hi", description="Language code")
    audio_format: str = Field(default="wav", description="Audio format (wav, mp3, etc.)")
    
    @validator('language')
    def validate_language(cls, v):
        supported_languages = ['hi', 'en', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'or', 'pa', 'as']
        if v not in supported_languages:
            raise ValueError(f'Unsupported language: {v}')
        return v
    
    @validator('audio_format')
    def validate_audio_format(cls, v):
        supported_formats = ['wav', 'mp3', 'ogg', 'flac', 'm4a']
        if v.lower() not in supported_formats:
            raise ValueError(f'Unsupported audio format: {v}. Supported: {supported_formats}')
        return v.lower()

class ASRAlternative(BaseModel):
    """Alternative transcription result"""
    transcript: str = Field(description="Alternative transcription text")
    confidence: float = Field(description="Confidence score for this alternative")

class ASRResponse(BaseModel):
    """Response schema for ASR"""
    success: bool = Field(description="Whether ASR was successful")
    transcription: str = Field(default="", description="Primary transcription result")
    confidence: float = Field(default=0.0, description="Confidence score (0.0-1.0)")
    alternatives: List[ASRAlternative] = Field(default=[], description="Alternative transcriptions")
    language: str = Field(description="Language used for recognition")
    processing_time: Optional[float] = Field(None, description="Processing time in seconds")
    timestamp: Optional[str] = Field(None, description="Processing timestamp")
    error: Optional[str] = Field(None, description="Error message if failed")
    fallback: Optional[bool] = Field(False, description="Whether fallback was used")

class TTSRequest(BaseModel):
    """Request schema for Text-to-Speech"""
    text: str = Field(description="Text to synthesize", min_length=1, max_length=1000)
    language: str = Field(default="hi", description="Language code")
    voice_gender: str = Field(default="female", description="Voice gender (male/female)")
    audio_format: str = Field(default="wav", description="Output audio format")
    
    @validator('language')
    def validate_language(cls, v):
        supported_languages = ['hi', 'en', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'or']
        if v not in supported_languages:
            raise ValueError(f'Unsupported language: {v}')
        return v
    
    @validator('voice_gender')
    def validate_voice_gender(cls, v):
        if v.lower() not in ['male', 'female']:
            raise ValueError('Voice gender must be "male" or "female"')
        return v.lower()
    
    @validator('audio_format')
    def validate_audio_format(cls, v):
        supported_formats = ['wav', 'mp3', 'ogg']
        if v.lower() not in supported_formats:
            raise ValueError(f'Unsupported audio format: {v}. Supported: {supported_formats}')
        return v.lower()
    
    @validator('text')
    def validate_text(cls, v):
        if not v.strip():
            raise ValueError('Text cannot be empty or only whitespace')
        return v.strip()

class TTSResponse(BaseModel):
    """Response schema for TTS"""
    success: bool = Field(description="Whether TTS was successful")
    audio_data: Optional[bytes] = Field(None, description="Generated audio data")
    audio_base64: Optional[str] = Field(None, description="Base64 encoded audio")
    text: str = Field(description="Original text")
    language: str = Field(description="Language used for synthesis")
    duration: Optional[float] = Field(None, description="Audio duration in seconds")
    processing_time: Optional[float] = Field(None, description="Processing time in seconds")
    timestamp: Optional[str] = Field(None, description="Processing timestamp")
    error: Optional[str] = Field(None, description="Error message if failed")
    fallback: Optional[bool] = Field(False, description="Whether fallback was used")

class LanguageDetectionResponse(BaseModel):
    """Response schema for language detection"""
    language: str = Field(description="Detected language code")
    confidence: float = Field(description="Detection confidence (0.0-1.0)")
    alternatives: List[Dict[str, Union[str, float]]] = Field(default=[], description="Alternative language detections")

class VoiceIntent(BaseModel):
    """Voice intent recognition result"""
    intent: str = Field(description="Detected intent type")
    confidence: float = Field(description="Intent confidence score")
    entities: Dict[str, Any] = Field(default={}, description="Extracted entities")

class VoiceError(BaseModel):
    """Voice processing error details"""
    error_type: str = Field(description="Type of error (asr_failed, tts_failed, etc.)")
    error_message: str = Field(description="Human-readable error message")
    error_code: Optional[str] = Field(None, description="Error code for debugging")
    retry_suggested: bool = Field(default=True, description="Whether retry is suggested")
    fallback_available: bool = Field(default=False, description="Whether fallback is available")

class VoiceMetrics(BaseModel):
    """Voice processing metrics"""
    asr_latency: Optional[float] = Field(None, description="ASR processing latency in ms")
    tts_latency: Optional[float] = Field(None, description="TTS processing latency in ms")
    total_latency: Optional[float] = Field(None, description="Total processing latency in ms")
    audio_duration: Optional[float] = Field(None, description="Input audio duration in seconds")
    cache_hit: bool = Field(default=False, description="Whether result was served from cache")
    model_version: Optional[str] = Field(None, description="Model version used")

class VoiceCapabilities(BaseModel):
    """Voice service capabilities"""
    asr_languages: List[str] = Field(description="Supported ASR languages")
    tts_languages: List[str] = Field(description="Supported TTS languages")
    audio_formats: List[str] = Field(description="Supported audio formats")
    max_audio_duration: int = Field(description="Maximum audio duration in seconds")
    max_text_length: int = Field(description="Maximum text length for TTS")
    real_time_processing: bool = Field(description="Whether real-time processing is supported")

class VoiceSessionContext(BaseModel):
    """Context for voice session"""
    session_id: str = Field(description="Unique session identifier")
    vendor_id: Optional[str] = Field(None, description="Vendor ID if authenticated")
    preferred_language: str = Field(default="hi", description="User's preferred language")
    conversation_history: List[Dict[str, Any]] = Field(default=[], description="Recent conversation turns")
    current_task: Optional[str] = Field(None, description="Current task context (price_query, fpc_generate, etc.)")
    market_location: Optional[str] = Field(None, description="Vendor's market location")

class VoiceOverlayConfig(BaseModel):
    """Configuration for voice interface overlay"""
    enabled: bool = Field(default=True, description="Whether voice overlay is enabled")
    position: str = Field(default="bottom-right", description="Overlay position")
    size: str = Field(default="medium", description="Overlay size (small, medium, large)")
    auto_hide: bool = Field(default=True, description="Whether to auto-hide when inactive")
    noise_cancellation: bool = Field(default=True, description="Whether noise cancellation is enabled")
    push_to_talk: bool = Field(default=False, description="Whether push-to-talk mode is enabled")
    
    @validator('position')
    def validate_position(cls, v):
        valid_positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']
        if v not in valid_positions:
            raise ValueError(f'Invalid position: {v}. Valid: {valid_positions}')
        return v
    
    @validator('size')
    def validate_size(cls, v):
        valid_sizes = ['small', 'medium', 'large']
        if v not in valid_sizes:
            raise ValueError(f'Invalid size: {v}. Valid: {valid_sizes}')
        return v

class VoiceAnalytics(BaseModel):
    """Voice usage analytics"""
    total_requests: int = Field(description="Total voice requests")
    successful_requests: int = Field(description="Successful voice requests")
    failed_requests: int = Field(description="Failed voice requests")
    average_confidence: float = Field(description="Average ASR confidence score")
    language_distribution: Dict[str, int] = Field(description="Usage by language")
    intent_distribution: Dict[str, int] = Field(description="Usage by intent type")
    error_distribution: Dict[str, int] = Field(description="Errors by type")
    performance_metrics: VoiceMetrics = Field(description="Performance metrics")

# Configuration models for different voice processing modes
class VoiceProcessingMode(BaseModel):
    """Voice processing mode configuration"""
    mode: str = Field(description="Processing mode (real_time, batch, streaming)")
    buffer_size: Optional[int] = Field(None, description="Audio buffer size for streaming")
    chunk_duration: Optional[float] = Field(None, description="Chunk duration for real-time processing")
    quality: str = Field(default="standard", description="Processing quality (fast, standard, high)")
    
    @validator('mode')
    def validate_mode(cls, v):
        valid_modes = ['real_time', 'batch', 'streaming']
        if v not in valid_modes:
            raise ValueError(f'Invalid mode: {v}. Valid: {valid_modes}')
        return v
    
    @validator('quality')
    def validate_quality(cls, v):
        valid_qualities = ['fast', 'standard', 'high']
        if v not in valid_qualities:
            raise ValueError(f'Invalid quality: {v}. Valid: {valid_qualities}')
        return v