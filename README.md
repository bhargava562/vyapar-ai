# Market Mania - Multilingual Marketplace

A comprehensive multilingual marketplace application designed for Indian vendors with AI-powered features, voice interface, and multi-language support. The platform empowers vendors with intelligent pricing insights, fair price certification, and voice-first interactions across multiple Indian languages.

## 🌟 Key Features

### Core Functionality
- **Multilingual Support**: Hindi, English, Tamil, Telugu, Bengali with comprehensive voice interface
- **Voice-First Interface**: Advanced speech-to-text and text-to-speech using Bhashini integration
- **Vendor Management**: Complete vendor profile setup and management system
- **Authentication**: Secure OTP-based authentication system
- **Progressive Web App**: Offline-first PWA with service worker support

### AI-Powered Features
- **Voice Processing**: Real-time voice query processing with intent recognition
- **Multilingual AI**: Bhashini integration for Indian language processing
- **Smart Components**: Intelligent form handling and user interaction
- **Price Power Index (PPI)**: AI-powered pricing recommendations
- **Fair Price Certificates (FPC)**: QR code-based price verification system

### Technical Features
- **Real-time Updates**: Live data synchronization with Redis caching
- **Offline Support**: Works without internet connectivity
- **Responsive Design**: Mobile-first, accessible interface
- **Type Safety**: Full TypeScript implementation
- **Comprehensive Testing**: Unit tests, integration tests, and property-based testing
- **CI/CD Pipeline**: Automated testing, building, and deployment

## 🏗️ Architecture

### Backend (FastAPI + Python)
```
backend/
├── app/
│   ├── api/v1/endpoints/     # API endpoints
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── vendor.py        # Vendor management
│   │   ├── voice.py         # Voice processing
│   │   ├── admin.py         # Admin functionality
│   │   ├── crowd.py         # Crowd-sourced features
│   │   ├── fpc.py           # Fair Price Certificate
│   │   └── ppi.py           # Price Power Index
│   ├── core/                # Core functionality
│   │   ├── config.py        # Configuration management
│   │   ├── database.py      # Database connections
│   │   ├── redis_client.py  # Redis caching
│   │   └── logging_config.py # Logging setup
│   ├── middleware/          # Custom middleware
│   │   └── rate_limiting.py # Rate limiting
│   ├── schemas/             # Pydantic schemas
│   ├── services/            # Business logic
│   │   ├── auth_service.py  # Authentication logic
│   │   ├── vendor_service.py # Vendor operations
│   │   └── bhashini_service.py # AI integration
│   └── main.py             # FastAPI application
├── tests/                  # Comprehensive test suite
└── requirements.txt        # Python dependencies
```

**Key Technologies:**
- **FastAPI**: High-performance API with automatic documentation
- **Supabase**: Authentication, database, and real-time features
- **Redis**: Caching and session management
- **Celery**: Background task processing
- **Pydantic**: Data validation and serialization
- **Pytest**: Testing framework with coverage

### Frontend (React PWA + TypeScript)
```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── LanguageSelector.tsx    # Language switching
│   │   ├── VoiceDemo.tsx          # Voice interface demo
│   │   ├── VoiceInput.tsx         # Voice input component
│   │   ├── VoiceOverlay.tsx       # Voice UI overlay
│   │   ├── VendorProfile.tsx      # Vendor profile display
│   │   ├── VendorProfileSetup.tsx # Vendor onboarding
│   │   ├── I18nDemo.tsx           # Internationalization demo
│   │   ├── FormattedText.tsx      # Text formatting
│   │   └── LoadingSpinner.tsx     # Loading states
│   ├── contexts/            # React contexts
│   │   └── LanguageContext.tsx    # Language state management
│   ├── hooks/               # Custom React hooks
│   │   ├── useLanguage.ts         # Language management
│   │   └── useVoice.ts            # Voice interface logic
│   ├── services/            # API services
│   │   ├── voiceService.ts        # Voice processing API
│   │   └── vendorService.ts       # Vendor API calls
│   ├── locales/             # Translation files
│   │   ├── en/              # English translations
│   │   ├── hi/              # Hindi translations
│   │   ├── ta/              # Tamil translations
│   │   ├── te/              # Telugu translations
│   │   └── bn/              # Bengali translations
│   ├── i18n/                # Internationalization config
│   ├── __tests__/           # Test files
│   └── App.tsx              # Main application
├── public/                  # Static assets
└── package.json            # Node.js dependencies
```

**Key Technologies:**
- **React 18**: Modern UI with hooks and concurrent features
- **TypeScript**: Full type safety and developer experience
- **React-i18next**: Comprehensive internationalization
- **Tailwind CSS**: Utility-first responsive design
- **Vite**: Fast build tool and development server
- **Vitest**: Fast unit testing framework
- **PWA**: Service worker and offline capabilities

### External Integrations
- **Bhashini**: AI4Bharat's multilingual ASR/TTS platform
- **Supabase**: Backend-as-a-Service for database and auth
- **Redis**: High-performance caching layer

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ (for frontend)
- **Python** 3.11+ (for backend)
- **Docker & Docker Compose** (recommended)
- **Redis** (for caching)

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd market-mania
   ```

2. **Backend Setup**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   pip install -r requirements.txt
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   cp .env.example .env
   # Edit .env with your API endpoints
   npm install
   ```

### Development with Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Development

1. **Start Backend**
   ```bash
   cd backend
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Start Redis** (if not using Docker)
   ```bash
   redis-server
   ```

### Using Makefile Commands

```bash
# Install all dependencies
make install

# Start development servers
make dev

# Run all tests
make test

# Run linting
make lint

# Build production assets
make build

# Clean build artifacts
make clean
```

### Access Points
- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📱 Application Features

### Voice Interface
- **Multi-language ASR**: Speech recognition in 5+ Indian languages
- **Natural TTS**: High-quality text-to-speech synthesis
- **Voice Commands**: Complete voice-driven navigation
- **Offline Fallback**: Browser speech recognition when Bhashini unavailable
- **Real-time Processing**: Sub-3 second voice query processing

### Vendor Management
- **Profile Setup**: Comprehensive vendor onboarding
- **Multi-language Profiles**: Vendor information in local languages
- **Document Management**: Business registration and verification
- **Performance Analytics**: Sales and engagement metrics
- **QR Code Generation**: For product and vendor identification

### Internationalization
- **5 Languages**: English, Hindi, Tamil, Telugu, Bengali
- **RTL Support**: Right-to-left text for Arabic/Urdu (future)
- **Cultural Adaptation**: Locale-specific formatting
- **Dynamic Loading**: Efficient translation loading
- **Font Support**: Native script fonts for each language

### Admin Features
- **System Statistics**: Real-time monitoring dashboard
- **Vendor Management**: Comprehensive vendor oversight
- **Content Moderation**: AI-powered content filtering
- **Analytics**: Market insights and trends

## 🧪 Testing

### Backend Testing
```bash
cd backend
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test types
pytest -m "not integration"  # Unit tests only
pytest -m integration        # Integration tests only
pytest -m property          # Property-based tests
```

### Frontend Testing
```bash
cd frontend
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test -- --watch

# Run specific tests
npm run test -- VoiceInput
```

### Test Coverage
- **Backend**: Comprehensive unit and integration tests with pytest
- **Frontend**: Component tests, integration tests, and property-based tests with Vitest
- **E2E**: Cross-browser testing with real API integration
- **Property-Based Testing**: Automated test case generation for edge cases

## 🌐 Internationalization

### Supported Languages
| Language | Code | Script | Status | Voice Support |
|----------|------|--------|--------|---------------|
| English | en | Latin | ✅ Complete | ✅ Full |
| Hindi | hi | Devanagari | ✅ Complete | ✅ Full |
| Tamil | ta | Tamil | ✅ Complete | ✅ Full |
| Telugu | te | Telugu | ✅ Complete | ✅ Full |
| Bengali | bn | Bengali | ✅ Complete | ✅ Full |

### Translation Structure
```
locales/{locale}/
├── common.json      # Common UI elements, navigation
├── auth.json        # Authentication flows, errors
├── vendor.json      # Vendor-specific content
├── voice.json       # Voice interface messages
└── ppi.json         # Price-related content
```

### Adding New Languages
1. Create translation files in `frontend/src/locales/{locale}/`
2. Add language configuration in `frontend/src/i18n/config.ts`
3. Update `LanguageSelector.tsx` component
4. Add voice support in `voiceService.ts`
5. Test with native speakers

## 🔧 Configuration

### Backend Environment Variables
```env
# Database
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Security
JWT_SECRET=your-jwt-secret-key
ENCRYPTION_KEY=your-32-char-encryption-key
HMAC_SECRET=your-hmac-secret

# External APIs
BHASHINI_API_KEY=your-bhashini-key
BHASHINI_USER_ID=your-bhashini-user-id

# Redis
REDIS_URL=redis://localhost:6379

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=1000

# CORS
ALLOWED_ORIGINS=["http://localhost:5173"]
ALLOWED_HOSTS=["localhost", "127.0.0.1"]

# Celery
CELERY_BROKER_URL=redis://localhost:6379
CELERY_RESULT_BACKEND=redis://localhost:6379
```

### Frontend Environment Variables
```env
# API Configuration
VITE_API_URL=http://localhost:8000

# Supabase (Public keys only)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# Feature Flags
VITE_ENABLE_VOICE=true
VITE_ENABLE_OFFLINE=true
```

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/send-otp` - Send OTP to phone/email
- `POST /api/v1/auth/verify-otp` - Verify OTP and get JWT
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `POST /api/v1/auth/logout` - Logout user

### Voice Processing
- `POST /api/v1/voice/process` - Process voice queries
- `POST /api/v1/voice/asr` - Speech-to-text conversion
- `POST /api/v1/voice/tts` - Text-to-speech synthesis
- `GET /api/v1/voice/languages` - Supported languages

### Vendor Management
- `GET /api/v1/vendor/profile` - Get vendor profile
- `PUT /api/v1/vendor/profile` - Update vendor profile
- `POST /api/v1/vendor/setup` - Initial vendor setup

### Price Power Index (PPI)
- `POST /api/v1/ppi/calculate` - Calculate PPI for products
- `GET /api/v1/ppi/history` - Get PPI history
- `GET /api/v1/ppi/market-trends` - Market trend analysis

### Fair Price Certificate (FPC)
- `POST /api/v1/fpc/generate` - Generate FPC QR code
- `GET /api/v1/fpc/verify/{code}` - Verify FPC authenticity
- `GET /api/v1/fpc/history` - FPC generation history

### Admin Features
- `GET /api/v1/admin/stats` - System statistics
- `GET /api/v1/admin/vendors` - Vendor management
- `POST /api/v1/admin/moderate` - Content moderation

## 🔒 Security

### Authentication & Authorization
- **OTP-based Authentication**: Phone/email verification
- **JWT Tokens**: Secure session management with refresh tokens
- **Rate Limiting**: Configurable per-endpoint rate limits
- **CORS Protection**: Strict origin validation
- **Trusted Host Middleware**: Host validation

### Data Protection
- **Input Validation**: Comprehensive Pydantic schemas
- **SQL Injection Prevention**: Parameterized queries via Supabase
- **XSS Protection**: Content sanitization
- **CSRF Protection**: Token-based validation
- **Encryption**: AES-256 for sensitive data

### Infrastructure Security
- **HTTPS Only**: TLS 1.3 encryption
- **Security Headers**: HSTS, CSP, X-Frame-Options
- **Environment Isolation**: Separate dev/staging/prod configs
- **Secret Management**: Environment-based secret handling
- **Container Security**: Docker security best practices

## 📈 Performance

### Performance Targets
- **API Response Time**: <200ms (P50), <500ms (P95)
- **Voice Processing**: <3 seconds end-to-end
- **Page Load Time**: <2 seconds (3G network)
- **PWA Install**: <3 sessions prompt
- **Offline Support**: 7 days cached data

### Optimization Strategies
- **Code Splitting**: Dynamic imports for route-based splitting
- **Image Optimization**: WebP format with fallbacks
- **Caching Strategy**: Redis for API, Service Worker for assets
- **Bundle Analysis**: Regular bundle size monitoring
- **Database Optimization**: Query optimization and indexing
- **CDN Integration**: Static asset delivery optimization

## 🚀 Deployment

### Production Deployment
```bash
# Build frontend
cd frontend
npm run build

# Build backend Docker image
cd backend
docker build -t market-mania-backend .

# Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

### CI/CD Pipeline
- **Automated Testing**: Backend and frontend tests on every PR
- **Code Quality**: ESLint, Prettier, Black, MyPy
- **Security Scanning**: Trivy vulnerability scanning
- **Container Registry**: GitHub Container Registry
- **Deployment**: Automated deployment on main branch

### Environment-Specific Configs
- **Development**: Hot reload, debug logging, CORS permissive
- **Staging**: Production-like, test data, monitoring enabled
- **Production**: Optimized builds, security headers, monitoring

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with tests
4. Run the test suite (`make test`)
5. Update documentation if needed
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code Standards
- **TypeScript**: Strict mode enabled, no `any` types
- **Python**: Type hints required, Black formatting
- **Testing**: Minimum 80% code coverage
- **Documentation**: JSDoc for functions, docstrings for Python
- **Accessibility**: WCAG 2.1 AA compliance
- **Internationalization**: All user-facing text must be translatable

### Review Process
- **Automated Checks**: CI/CD pipeline with linting, testing, security scans
- **Code Review**: At least one maintainer approval required
- **Testing**: All tests must pass, new features need tests
- **Documentation**: README and API docs updated as needed

## 🛠️ Development Tools

### Available Commands
```bash
# Development
make dev              # Start development servers
make dev-backend      # Start backend only
make dev-frontend     # Start frontend only

# Testing
make test             # Run all tests
make test-backend     # Backend tests only
make test-frontend    # Frontend tests only
make test-property    # Property-based tests

# Code Quality
make lint             # Run linting
make format           # Format code
make security         # Security checks

# Docker
make docker-up        # Start Docker services
make docker-down      # Stop Docker services
make docker-logs      # View logs

# Utilities
make clean            # Clean build artifacts
make backup           # Create backup
make monitor          # View monitoring
```

### IDE Setup
- **VS Code**: Configured with recommended extensions
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **Python**: Black, MyPy, Pylint integration
- **Docker**: Container development support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **AI4Bharat** for Bhashini multilingual AI platform
- **Supabase** for backend infrastructure and real-time features
- **FastAPI** community for excellent documentation and support
- **React** and **TypeScript** communities for robust tooling
- **Open Source Community** for amazing libraries and tools

## 📞 Support & Resources

### Documentation
- **API Documentation**: Available at `/docs` endpoint
- **Component Documentation**: In-code JSDoc comments
- **Architecture Decision Records**: In `/docs/adr/` directory

### Community
- **Issues**: [GitHub Issues](https://github.com/your-org/market-mania/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/market-mania/discussions)
- **Wiki**: [Project Wiki](https://github.com/your-org/market-mania/wiki)

### Getting Help
- **Bug Reports**: Use GitHub Issues with bug template
- **Feature Requests**: Use GitHub Issues with feature template
- **Security Issues**: Email security@market-mania.com
- **General Questions**: Use GitHub Discussions

---

**Market Mania** - Empowering Indian vendors with intelligent, multilingual marketplace technology. 🇮🇳

*Built with ❤️ for the Indian market ecosystem*