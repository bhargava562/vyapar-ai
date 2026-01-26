# Market Mania Authentication Implementation

## Overview

This document describes the complete implementation of the Supabase authentication service with OTP support for the Market Mania multilingual marketplace application. The implementation includes phone/email OTP generation and verification, rate limiting, brute force protection, session management with JWT tokens, and comprehensive security measures.

## Features Implemented

### 1. Core Authentication Service (`app/services/auth_service.py`)

#### Phone and Email Validation
- **Indian Phone Number Support**: Validates and normalizes Indian phone numbers (+91XXXXXXXXXX format)
- **Email Validation**: Standard email format validation with regex
- **Input Normalization**: Automatically formats phone numbers to standard +91 format

#### OTP Generation and Management
- **Secure OTP Generation**: 6-digit cryptographically secure random OTPs
- **Configurable Expiry**: 5-minute OTP expiration (configurable)
- **Hashed Storage**: OTPs are bcrypt-hashed before database storage
- **Attempt Limiting**: Maximum 3 verification attempts per OTP

#### Rate Limiting and Security
- **OTP Rate Limiting**: 5 OTP requests per hour per identifier
- **Login Rate Limiting**: 10 login attempts per hour per identifier
- **Progressive Lockout**: 15-minute lockout with exponential backoff for repeated violations
- **Brute Force Protection**: Automatic account lockout after failed attempts

#### Session Management
- **JWT Tokens**: Secure access tokens (1 hour) and refresh tokens (30 days)
- **Database Sessions**: Session tracking in Supabase with automatic cleanup
- **Redis Caching**: Fast session validation with Redis cache
- **Token Rotation**: Secure token refresh mechanism

#### Vendor Management
- **Auto-Creation**: Automatic vendor account creation on first successful OTP verification
- **Profile Setup**: Placeholder data for profile completion during onboarding
- **Activity Tracking**: Last active timestamp updates

### 2. API Endpoints (`app/api/v1/endpoints/auth.py`)

#### Authentication Endpoints
- `POST /api/v1/auth/login` - Send OTP to phone/email
- `POST /api/v1/auth/verify-otp` - Verify OTP and authenticate
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout and invalidate session
- `GET /api/v1/auth/me` - Get current user information
- `POST /api/v1/auth/validate` - Validate authentication token

#### Security Features
- **Bearer Token Authentication**: Secure HTTP Bearer token authentication
- **Input Validation**: Pydantic schema validation for all requests
- **Error Handling**: Comprehensive error handling with appropriate HTTP status codes
- **Dependency Injection**: Clean separation of concerns with FastAPI dependencies

### 3. Rate Limiting Middleware (`app/middleware/rate_limiting.py`)

#### Advanced Rate Limiting
- **Sliding Window Algorithm**: Precise rate limiting with minute and hour windows
- **Endpoint-Specific Limits**: Different limits for sensitive endpoints (auth endpoints have stricter limits)
- **Client Identification**: IP + User-Agent hash for privacy-preserving client identification
- **Redis-Based Counters**: Distributed rate limiting with Redis

#### Brute Force Protection
- **Failed Attempt Tracking**: Tracks failed authentication attempts per endpoint
- **Progressive Lockout**: Exponentially increasing lockout durations
- **Automatic Cleanup**: Expired lockouts and counters are automatically cleaned up

### 4. Database Schema

#### Core Tables
- **vendors**: Vendor profiles with authentication data
- **otp_verifications**: OTP storage with expiration and attempt tracking
- **vendor_sessions**: JWT session management
- **audit_logs**: Comprehensive audit trail for security monitoring

#### Security Features
- **Row Level Security (RLS)**: Supabase RLS policies for data isolation
- **Encrypted Storage**: Sensitive data encryption at rest
- **Automatic Cleanup**: Database functions for expired data cleanup

### 5. Configuration and Environment

#### Security Configuration
- **Environment Variables**: Secure configuration through environment variables
- **JWT Secrets**: Configurable JWT signing keys
- **Encryption Keys**: AES-256 encryption keys for sensitive data
- **API Keys**: External service integration keys

#### Development Setup
- **Docker Support**: Complete Docker configuration for development
- **Environment Files**: Separate configuration for development and production
- **Testing Configuration**: Mock configurations for testing

## Security Measures

### 1. Authentication Security
- **OTP Security**: Cryptographically secure OTP generation with bcrypt hashing
- **Rate Limiting**: Multiple layers of rate limiting (per minute, per hour, per endpoint)
- **Session Security**: Secure JWT tokens with proper expiration and rotation
- **Brute Force Protection**: Progressive lockout with exponential backoff

### 2. Data Protection
- **Encryption at Rest**: AES-256 encryption for sensitive database fields
- **Secure Transmission**: HTTPS-only communication with proper CORS configuration
- **Input Validation**: Comprehensive input validation and sanitization
- **SQL Injection Prevention**: Parameterized queries and ORM usage

### 3. Privacy Protection
- **Data Minimization**: Only collect necessary data for authentication
- **Anonymized Logging**: Client identification through hashes, not raw data
- **Automatic Cleanup**: Expired data is automatically removed
- **GDPR Compliance**: Data export and deletion capabilities

## Testing Implementation

### 1. Unit Tests (`tests/test_auth_service.py`)
- **Validation Testing**: Phone/email format validation
- **OTP Testing**: OTP generation, storage, and verification
- **Rate Limiting Testing**: Rate limit enforcement and lockout behavior
- **Session Testing**: JWT generation, validation, and refresh
- **Error Handling**: Comprehensive error condition testing

### 2. Integration Tests (`tests/test_integration_basic.py`)
- **API Endpoint Testing**: Complete authentication flow testing
- **Error Response Testing**: Proper HTTP status codes and error formats
- **Security Testing**: Authentication requirement enforcement
- **CORS Testing**: Cross-origin request handling

### 3. Rate Limiting Tests (`tests/test_rate_limiting.py`)
- **Middleware Testing**: Rate limiting middleware functionality
- **Brute Force Testing**: Brute force protection mechanisms
- **Redis Integration**: Cache-based rate limiting
- **Error Handling**: Graceful degradation on Redis failures

## API Usage Examples

### 1. Complete Authentication Flow

```bash
# Step 1: Request OTP
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"phone_or_email": "+919876543210"}'

# Response: {"success": true, "message": "OTP sent to phone", "token": "abc123", "expires_in": 300}

# Step 2: Verify OTP
curl -X POST "http://localhost:8000/api/v1/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{"token": "abc123", "otp": "123456"}'

# Response: {"access_token": "jwt_token", "refresh_token": "refresh_jwt", "vendor_id": "vendor_id"}

# Step 3: Use authenticated endpoints
curl -X GET "http://localhost:8000/api/v1/auth/me" \
  -H "Authorization: Bearer jwt_token"

# Step 4: Refresh token when needed
curl -X POST "http://localhost:8000/api/v1/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "refresh_jwt"}'

# Step 5: Logout
curl -X POST "http://localhost:8000/api/v1/auth/logout" \
  -H "Authorization: Bearer jwt_token"
```

### 2. Error Handling Examples

```bash
# Rate limit exceeded
# Response: 429 Too Many Requests
# {"detail": "Rate limit exceeded. Try again in 900 seconds."}

# Invalid OTP
# Response: 400 Bad Request
# {"detail": "Invalid OTP. 2 attempts remaining"}

# Expired OTP
# Response: 400 Bad Request
# {"detail": "OTP has expired"}

# Invalid token
# Response: 401 Unauthorized
# {"detail": "Invalid or expired token"}
```

## Configuration

### Environment Variables

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Security
JWT_SECRET=your-jwt-secret-key
ENCRYPTION_KEY=your-32-byte-encryption-key
HMAC_SECRET=your-hmac-secret-key

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Development
DEBUG=true
LOG_LEVEL=info
```

### Rate Limiting Configuration

```python
# Default rate limits
RATE_LIMIT_PER_MINUTE = 60
RATE_LIMIT_PER_HOUR = 1000

# Sensitive endpoint limits
AUTH_LOGIN_LIMIT = {"per_minute": 5, "per_hour": 20}
AUTH_VERIFY_LIMIT = {"per_minute": 10, "per_hour": 50}
AUTH_REFRESH_LIMIT = {"per_minute": 20, "per_hour": 200}
```

## Deployment Considerations

### 1. Production Security
- Use strong, unique JWT secrets and encryption keys
- Enable HTTPS-only communication
- Configure proper CORS origins
- Set up monitoring and alerting for security events

### 2. Scalability
- Redis clustering for distributed rate limiting
- Database connection pooling
- Horizontal scaling with load balancers
- CDN for static assets

### 3. Monitoring
- Authentication success/failure rates
- Rate limiting violations
- Session creation and expiration
- API response times and error rates

## Future Enhancements

### 1. Additional Security Features
- Two-factor authentication (TOTP)
- Device fingerprinting
- Geolocation-based security
- Advanced fraud detection

### 2. User Experience Improvements
- Social login integration
- Biometric authentication
- Remember device functionality
- Seamless token refresh

### 3. Administrative Features
- Admin dashboard for user management
- Security event monitoring
- Rate limit configuration UI
- Audit log analysis tools

## Conclusion

The Market Mania authentication system provides a robust, secure, and scalable foundation for the multilingual marketplace application. With comprehensive OTP support, advanced rate limiting, and strong security measures, it meets the requirements for a production-ready authentication service while maintaining excellent user experience for semi-literate vendors in Indian markets.

The implementation follows security best practices, includes comprehensive testing, and provides clear documentation for maintenance and future enhancements. The modular architecture allows for easy extension and customization as the application grows.