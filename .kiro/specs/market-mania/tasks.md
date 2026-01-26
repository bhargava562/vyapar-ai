# Implementation Plan: Market Mania

## Overview

This implementation plan converts the Market Mania design into discrete coding tasks for a multilingual marketplace application. The system uses Python/FastAPI for the backend with LangChain integration, React/TypeScript PWA for the frontend, and Supabase for authentication and data storage. Each task builds incrementally toward a complete voice-first, offline-capable marketplace platform for Indian vendors.

## Tasks

- [x] 1. Set up project structure and core infrastructure
  - Create backend directory structure with FastAPI, LangChain, and Supabase integration
  - Set up frontend React PWA with TypeScript, Tailwind CSS, and i18n support
  - Configure development environment with Docker, Redis, and testing frameworks
  - Set up CI/CD pipeline with automated testing and deployment
  - Configure Supabase connection with environment variables (secure .env setup)
  - _Requirements: 22.1, 22.2_

- [x] 2. Implement authentication and vendor management system
  - [x] 2.1 Create Supabase authentication service with OTP support
    - Implement phone/email OTP generation and verification
    - Add rate limiting and brute force protection
    - Create session management with JWT tokens
    - _Requirements: 1.1, 1.2, 22.1, 22.3_
  
  - [ ]* 2.2 Write property test for authentication round trip
    - **Property 1: Authentication Round Trip**
    - **Validates: Requirements 1.1, 1.2**
  
  - [x] 2.3 Implement vendor profile management
    - Create vendor profile CRUD operations
    - Add multilingual profile setup with voice input support
    - Implement profile data persistence and validation
    - _Requirements: 1.3, 1.4, 1.5_
  
  - [ ]* 2.4 Write property test for profile data persistence
    - **Property 2: Profile Data Persistence**
    - **Validates: Requirements 1.5**

- [ ] 3. Build multilingual interface and voice system
  - [x] 3.1 Set up React i18n with Hindi, English, and regional languages
    - Configure react-i18next with language detection
    - Create translation files for all supported languages
    - Implement language switching with persistence
    - _Requirements: 2.1, 2.2, 2.3, 2.5_
  
  - [-] 3.2 Integrate Bhashini ASR/TTS for voice interface
    - Set up Bhashini API integration for speech recognition
    - Implement text-to-speech with multilingual support
    - Create voice interface overlay component
    - Add noise handling and error recovery
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ]* 3.3 Write property test for language preference consistency
    - **Property 3: Language Preference Consistency**
    - **Validates: Requirements 2.3, 2.4, 2.5**
  
  - [ ]* 3.4 Write property test for voice interface accuracy
    - **Property 8: Voice Interface Accuracy**
    - **Validates: Requirements 5.1, 5.3**

- [ ] 4. Checkpoint - Ensure authentication and multilingual interface work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement PPI calculation engine with LangChain
  - [ ] 5.1 Create LangChain agent for PPI calculations
    - Set up LangChain with custom tools for data integration
    - Implement weighted algorithm for PPI scoring (wholesale 40%, crowdsourced 30%, weather 20%, historical 10%)
    - Add confidence scoring and explainable AI features
    - Create fallback strategies for missing data sources
    - _Requirements: 3.1, 13.1, 13.2, 13.3, 13.4, 13.9_
  
  - [ ] 5.2 Integrate external data sources
    - Connect to Agmarknet API for wholesale prices
    - Integrate weather API for spoilage risk assessment
    - Implement data validation and caching strategies
    - Add mock APIs for development and testing
    - _Requirements: 11.1, 11.2, 11.3, 12.1, 12.2_
  
  - [ ] 5.3 Build PPI display components with color coding
    - Create visual PPI meter component (0-100 scale)
    - Implement color coding (red <30, yellow 30-70, green >70)
    - Add accessibility features for color-blind users
    - Display PPI factors and explanations
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.7_
  
  - [ ]* 5.4 Write property test for PPI calculation completeness
    - **Property 4: PPI Calculation Completeness**
    - **Validates: Requirements 3.1, 3.2**
  
  - [ ]* 5.5 Write property test for PPI color coding accuracy
    - **Property 5: PPI Color Coding Accuracy**
    - **Validates: Requirements 3.3, 3.4, 3.5**

- [ ] 6. Develop Fair Price Certificate system with QR codes
  - [ ] 6.1 Implement secure QR code generation
    - Create FPC data structure with encryption and signing
    - Generate unique QR codes with AES-256-GCM encryption
    - Add HMAC-SHA256 signatures for tamper detection
    - Implement key rotation and security measures
    - _Requirements: 4.1, 4.2, 22.2_
  
  - [ ] 6.2 Build QR code verification system
    - Create consumer-facing QR scanner (PWA camera integration)
    - Implement certificate validation and authenticity checking
    - Add expiration handling and status display
    - Create sharing functionality (WhatsApp/SMS)
    - _Requirements: 4.3, 4.4, 4.5, 7.1, 7.2, 7.3, 7.4_
  
  - [ ] 6.3 Add certificate history and audit trail
    - Implement FPC history tracking for vendors
    - Create audit logs for all certificate operations
    - Add analytics for scan rates and effectiveness
    - _Requirements: 4.6, 7.6, 19.1, 19.2_
  
  - [ ]* 6.4 Write property test for FPC generation uniqueness
    - **Property 6: FPC Generation Uniqueness**
    - **Validates: Requirements 4.1, 4.2**
  
  - [ ]* 6.5 Write property test for FPC expiration handling
    - **Property 7: FPC Expiration Handling**
    - **Validates: Requirements 4.5**
  
  - [ ]* 6.6 Write property test for QR code verification consistency
    - **Property 10: QR Code Verification Consistency**
    - **Validates: Requirements 7.1, 7.3, 7.4**

- [ ] 7. Build crowdsourced data collection system
  - [ ] 7.1 Create price submission interface
    - Build voice and manual price input components
    - Implement data validation and outlier detection
    - Add ML-based anomaly detection using XGBoost
    - Create submission confirmation and feedback
    - _Requirements: 6.1, 6.2, 6.5_
  
  - [ ] 7.2 Implement gamification and points system
    - Create points award system for valid submissions
    - Add leaderboards and achievement badges
    - Implement point redemption for mobile recharge/discounts
    - Add fraud detection and penalty system
    - _Requirements: 6.3, 15.1, 15.2, 15.3, 15.4, 15.7, 15.8_
  
  - [ ] 7.3 Build community price trends display
    - Create price trend visualization components
    - Implement data aggregation for PPI improvement
    - Add regional price comparison features
    - _Requirements: 6.4, 6.6_
  
  - [ ]* 7.4 Write property test for price submission validation
    - **Property 9: Price Submission Validation**
    - **Validates: Requirements 6.1, 6.3, 6.5**

- [ ] 8. Checkpoint - Ensure PPI and FPC systems work together
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement PWA offline-first functionality
  - [ ] 9.1 Set up service worker with caching strategies
    - Configure Workbox for PWA functionality
    - Implement cache-first for static assets, network-first for API data
    - Add intelligent cache eviction (LRU, 50MB limit)
    - Create offline fallback pages and indicators
    - _Requirements: 8.1, 8.6, 20.1, 20.2, 20.6_
  
  - [ ] 9.2 Build offline data synchronization
    - Create offline action queue with conflict resolution
    - Implement background sync when connectivity returns
    - Add data integrity checks and error recovery
    - Handle storage quota exceeded scenarios
    - _Requirements: 8.2, 8.3, 8.4, 8.5, 20.3, 20.7, 20.8_
  
  - [ ] 9.3 Add PWA installation and mobile optimization
    - Configure PWA manifest and install prompts
    - Optimize for one-handed operation and large touch targets
    - Implement mobile-first responsive design
    - Add accessibility features for semi-literate users
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 20.4_
  
  - [ ]* 9.4 Write property test for offline data synchronization
    - **Property 11: Offline Data Synchronization**
    - **Validates: Requirements 8.3**
  
  - [ ]* 9.5 Write property test for cache eviction strategy
    - **Property 12: Cache Eviction Strategy**
    - **Validates: Requirements 8.5**

- [ ] 10. Build notification and alert system
  - [ ] 10.1 Implement push notification service
    - Set up push notification infrastructure
    - Create notification preferences and customization
    - Add PPI change alerts and FPC expiry reminders
    - Implement market anomaly notifications
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.6_
  
  - [ ] 10.2 Add SMS and WhatsApp fallback notifications
    - Integrate SMS gateway for critical alerts
    - Set up WhatsApp Business API for notifications
    - Implement notification delivery tracking
    - Add re-engagement notifications for inactive vendors
    - _Requirements: 14.5, 14.7, 14.8_

- [ ] 11. Create admin analytics and management system
  - [ ] 11.1 Build admin dashboard with real-time analytics
    - Create vendor statistics and PPI trend visualizations
    - Implement interactive maps for vendor density
    - Add time-series charts with customizable date ranges
    - Create exportable reports for market insights
    - _Requirements: 9.1, 9.3, 9.7, 9.8_
  
  - [ ] 11.2 Implement role-based admin access control
    - Create Super Admin, Regional Admin, Analytics Viewer, and Market Moderator roles
    - Add two-factor authentication for admin accounts
    - Implement audit logging for all admin actions
    - Create user management and role assignment interfaces
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6_
  
  - [ ] 11.3 Add monitoring and alerting systems
    - Set up Prometheus metrics collection
    - Create Grafana dashboards for system health
    - Implement anomaly detection alerts for administrators
    - Add performance monitoring and error tracking
    - _Requirements: 9.5, 19.3, 19.4, 19.5_

- [ ] 12. Implement bulk operations and vendor efficiency features
  - [ ] 12.1 Create bulk price update functionality
    - Build CSV import/export for bulk product management
    - Implement batch PPI calculations with progress indicators
    - Add bulk FPC generation with QR code batching
    - Create validation and error reporting for bulk operations
    - _Requirements: 24.1, 24.2, 24.4, 24.5, 24.6_
  
  - [ ] 12.2 Add offline bulk operation support
    - Implement offline queuing for bulk operations
    - Add sync progress tracking and conflict resolution
    - Create bulk operation history and audit trails
    - _Requirements: 24.3_

- [ ] 13. Build predictive analytics and market intelligence
  - [ ] 13.1 Implement PPI trend prediction system
    - Create 7-day PPI forecasting using historical patterns
    - Add seasonal price pattern identification
    - Implement vendor churn risk prediction
    - Create demand spike forecasting using crowdsourced data
    - _Requirements: 25.1, 25.2, 25.3, 25.4_
  
  - [ ] 13.2 Add market opportunity alerts
    - Create favorable condition prediction system
    - Generate automated market reports for stakeholders
    - Implement proactive vendor guidance system
    - _Requirements: 25.5, 25.6_

- [ ] 14. Implement disaster recovery and data resilience
  - [ ] 14.1 Set up automated backup and recovery systems
    - Configure multi-geographic backup locations
    - Implement 6-hour automated backup schedule
    - Create 30-day rolling backup retention
    - Add point-in-time recovery capabilities
    - _Requirements: 23.1, 23.3, 23.5_
  
  - [ ] 14.2 Build data integrity and corruption handling
    - Implement local data integrity checks
    - Create backup restoration for corrupted offline data
    - Add monthly disaster recovery testing
    - _Requirements: 23.2, 23.4, 23.6_

- [ ] 15. Add comprehensive security and privacy features
  - [ ] 15.1 Implement data privacy and rights management
    - Create self-service data export functionality
    - Add account deletion with 30-day grace period
    - Implement data anonymization for historical records
    - Create granular privacy controls for data sharing
    - _Requirements: 21.1, 21.2, 21.3, 21.5_
  
  - [ ] 15.2 Add security auditing and compliance
    - Implement comprehensive audit logging
    - Create 7-year log retention for regulatory compliance
    - Add real-time security monitoring dashboards
    - Set up quarterly security audits and penetration testing
    - _Requirements: 19.1, 19.2, 19.6, 22.6_

- [ ] 16. Performance optimization and load testing
  - [ ] 16.1 Implement performance monitoring and optimization
    - Set up API latency monitoring with P50/P95/P99 targets
    - Optimize PPI calculation performance (<1.5s target)
    - Implement Redis clustering for improved caching
    - Add Celery worker configuration for background tasks
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_
  
  - [ ] 16.2 Add load testing and stress testing
    - Create load test scenarios for normal and peak usage
    - Implement stress testing for 1000 concurrent vendors
    - Add offline sync stress testing with massive backlogs
    - Test conflict resolution under high concurrency
    - _Requirements: 17.6_

- [ ] 17. Final integration and end-to-end testing
  - [ ] 17.1 Wire all components together
    - Connect authentication → PPI → FPC → voice interface flow
    - Integrate offline sync with all major operations
    - Connect admin analytics with all data sources
    - Test complete vendor and consumer user journeys
    - _Requirements: All requirements integration_
  
  - [ ]* 17.2 Write comprehensive integration tests
    - Test end-to-end vendor onboarding and usage flows
    - Test consumer QR scanning and verification flows
    - Test admin management and analytics workflows
    - Test offline-to-online synchronization scenarios
  
  - [ ]* 17.3 Write performance and load tests
    - Test system under normal load (100 concurrent vendors)
    - Test system under peak load (500 concurrent vendors)
    - Test offline sync with large data backlogs
    - Test voice interface under various network conditions

- [ ] 18. Final checkpoint - Complete system validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at major milestones
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples, edge cases, and integration points
- The implementation follows mobile-first, voice-first, and offline-first principles
- All components are designed for semi-literate users with accessibility in mind
- Security and privacy are built-in from the ground up, not added later

## Environment Configuration

Create a `.env` file in the backend directory with the following Supabase configuration:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here

# Security
JWT_SECRET=your-jwt-secret-key-here
ENCRYPTION_KEY=your-32-byte-encryption-key-here
HMAC_SECRET=your-hmac-secret-key-here

# External APIs
AGMARKNET_API_KEY=your-agmarknet-api-key
WEATHER_API_KEY=your-weather-api-key
BHASHINI_API_KEY=your-bhashini-api-key

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Development
DEBUG=true
LOG_LEVEL=info
```

**Important Security Notes:**
- Add `.env` to `.gitignore` to prevent committing secrets
- Use different keys for production environment
- Frontend should only access SUPABASE_URL and SUPABASE_ANON_KEY
- Service role key should only be used in backend server code
- Never expose service role key to frontend or client-side code

## Database Schema

Run the following SQL queries in the Supabase SQL Live Editor to create the complete database schema:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE vendor_status AS ENUM ('active', 'suspended', 'inactive');
CREATE TYPE submission_method AS ENUM ('voice', 'manual');
CREATE TYPE validation_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE fpc_status AS ENUM ('active', 'expired', 'revoked');
CREATE TYPE admin_role AS ENUM ('super_admin', 'regional_admin', 'analytics_viewer', 'market_moderator');

-- Vendors table
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    stall_id VARCHAR(100),
    market_location VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    preferred_language VARCHAR(10) DEFAULT 'hi',
    points INTEGER DEFAULT 0,
    status vendor_status DEFAULT 'active',
    last_active TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en VARCHAR(255) NOT NULL,
    name_hi VARCHAR(255),
    name_regional JSONB DEFAULT '{}',
    category VARCHAR(100) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    perishable BOOLEAN DEFAULT false,
    seasonal_pattern JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- PPI calculations table
CREATE TABLE ppi_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    ppi_value INTEGER NOT NULL CHECK (ppi_value >= 0 AND ppi_value <= 100),
    confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
    factors JSONB NOT NULL DEFAULT '[]',
    wholesale_price DECIMAL(10,2),
    weather_risk DECIMAL(3,2),
    crowd_price DECIMAL(10,2),
    recommendation VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Fair Price Certificates table
CREATE TABLE fair_price_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    qr_code TEXT NOT NULL,
    qr_data TEXT NOT NULL,
    signature VARCHAR(255) NOT NULL,
    ppi_reference UUID REFERENCES ppi_calculations(id),
    scan_count INTEGER DEFAULT 0,
    status fpc_status DEFAULT 'active',
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Price submissions table
CREATE TABLE price_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    market_location VARCHAR(255) NOT NULL,
    submission_method submission_method NOT NULL,
    validation_status validation_status DEFAULT 'pending',
    anomaly_score DECIMAL(3,2) DEFAULT 0.0,
    points_awarded INTEGER DEFAULT 0,
    flagged BOOLEAN DEFAULT false,
    flagged_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Vendor sessions table
CREATE TABLE vendor_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_used TIMESTAMP DEFAULT NOW()
);

-- OTP verification table
CREATE TABLE otp_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_or_email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    attempts INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT false,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- FPC scan logs table
CREATE TABLE fpc_scan_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fpc_id UUID REFERENCES fair_price_certificates(id) ON DELETE CASCADE,
    scanner_ip INET,
    scanner_user_agent TEXT,
    scan_result VARCHAR(50) NOT NULL, -- 'valid', 'expired', 'invalid'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'ppi_change', 'fpc_expiry', 'market_alert', etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    read BOOLEAN DEFAULT false,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Admin users table
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role admin_role NOT NULL,
    region_access TEXT[], -- Array of regions for regional admins
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(255),
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- Can reference vendors(id) or admin_users(id)
    user_type VARCHAR(20) NOT NULL, -- 'vendor' or 'admin'
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Market data cache table
CREATE TABLE market_data_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_source VARCHAR(50) NOT NULL, -- 'agmarknet', 'weather', 'crowdsourced'
    location VARCHAR(255) NOT NULL,
    product_id UUID REFERENCES products(id),
    data JSONB NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Gamification achievements table
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL, -- 'submissions_100', 'scans_50', etc.
    achievement_name VARCHAR(255) NOT NULL,
    points_awarded INTEGER NOT NULL,
    earned_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_vendors_phone ON vendors(phone_number);
CREATE INDEX idx_vendors_market_location ON vendors(market_location);
CREATE INDEX idx_vendors_status ON vendors(status);

CREATE INDEX idx_ppi_vendor_product ON ppi_calculations(vendor_id, product_id);
CREATE INDEX idx_ppi_expires_at ON ppi_calculations(expires_at);

CREATE INDEX idx_fpc_vendor_id ON fair_price_certificates(vendor_id);
CREATE INDEX idx_fpc_status ON fair_price_certificates(status);
CREATE INDEX idx_fpc_expires_at ON fair_price_certificates(expires_at);

CREATE INDEX idx_price_submissions_vendor ON price_submissions(vendor_id);
CREATE INDEX idx_price_submissions_product ON price_submissions(product_id);
CREATE INDEX idx_price_submissions_location ON price_submissions(market_location);
CREATE INDEX idx_price_submissions_flagged ON price_submissions(flagged);

CREATE INDEX idx_sessions_vendor_id ON vendor_sessions(vendor_id);
CREATE INDEX idx_sessions_token ON vendor_sessions(session_token);
CREATE INDEX idx_sessions_expires_at ON vendor_sessions(expires_at);

CREATE INDEX idx_otp_phone_email ON otp_verifications(phone_or_email);
CREATE INDEX idx_otp_expires_at ON otp_verifications(expires_at);

CREATE INDEX idx_notifications_vendor_read ON notifications(vendor_id, read);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, user_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

CREATE INDEX idx_market_cache_source_location ON market_data_cache(data_source, location);
CREATE INDEX idx_market_cache_expires_at ON market_data_cache(expires_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppi_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE fair_price_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Vendor can only access their own data
CREATE POLICY "Vendors can view own data" ON vendors
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Vendors can update own data" ON vendors
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Vendors can view own PPI calculations" ON ppi_calculations
    FOR SELECT USING (auth.uid()::text = vendor_id::text);

CREATE POLICY "Vendors can view own FPCs" ON fair_price_certificates
    FOR SELECT USING (auth.uid()::text = vendor_id::text);

CREATE POLICY "Vendors can create own FPCs" ON fair_price_certificates
    FOR INSERT WITH CHECK (auth.uid()::text = vendor_id::text);

CREATE POLICY "Vendors can view own price submissions" ON price_submissions
    FOR SELECT USING (auth.uid()::text = vendor_id::text);

CREATE POLICY "Vendors can create own price submissions" ON price_submissions
    FOR INSERT WITH CHECK (auth.uid()::text = vendor_id::text);

CREATE POLICY "Vendors can view own sessions" ON vendor_sessions
    FOR SELECT USING (auth.uid()::text = vendor_id::text);

CREATE POLICY "Vendors can view own notifications" ON notifications
    FOR SELECT USING (auth.uid()::text = vendor_id::text);

CREATE POLICY "Vendors can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid()::text = vendor_id::text);

CREATE POLICY "Vendors can view own achievements" ON achievements
    FOR SELECT USING (auth.uid()::text = vendor_id::text);

-- Public read access for products (needed for all vendors)
CREATE POLICY "Products are publicly readable" ON products
    FOR SELECT USING (true);

-- FPC verification is publicly accessible (for consumers)
CREATE POLICY "FPCs are publicly verifiable" ON fair_price_certificates
    FOR SELECT USING (true);

-- Insert sample data
INSERT INTO products (name_en, name_hi, category, unit, perishable) VALUES
('Tomato', 'टमाटर', 'vegetables', 'kg', true),
('Onion', 'प्याज', 'vegetables', 'kg', false),
('Potato', 'आलू', 'vegetables', 'kg', false),
('Rice', 'चावल', 'grains', 'kg', false),
('Wheat', 'गेहूं', 'grains', 'kg', false),
('Apple', 'सेब', 'fruits', 'kg', true),
('Banana', 'केला', 'fruits', 'dozen', true),
('Milk', 'दूध', 'dairy', 'liter', true),
('Chicken', 'मुर्गा', 'meat', 'kg', true),
('Lentils', 'दाल', 'pulses', 'kg', false);

-- Create a function to clean up expired data
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS void AS $$
BEGIN
    -- Clean up expired OTP verifications
    DELETE FROM otp_verifications WHERE expires_at < NOW();
    
    -- Clean up expired PPI calculations
    DELETE FROM ppi_calculations WHERE expires_at < NOW();
    
    -- Mark expired FPCs
    UPDATE fair_price_certificates 
    SET status = 'expired' 
    WHERE expires_at < NOW() AND status = 'active';
    
    -- Clean up expired market data cache
    DELETE FROM market_data_cache WHERE expires_at < NOW();
    
    -- Clean up old audit logs (keep for 7 years as per requirements)
    DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '7 years';
END;
$$ LANGUAGE plpgsql;

-- Create a function to award points for valid submissions
CREATE OR REPLACE FUNCTION award_points_for_submission()
RETURNS TRIGGER AS $$
BEGIN
    -- Award 10 points for approved price submissions
    IF NEW.validation_status = 'approved' AND OLD.validation_status != 'approved' THEN
        UPDATE vendors 
        SET points = points + 10 
        WHERE id = NEW.vendor_id;
        
        UPDATE price_submissions 
        SET points_awarded = 10 
        WHERE id = NEW.id;
        
        -- Record achievement
        INSERT INTO achievements (vendor_id, achievement_type, achievement_name, points_awarded)
        VALUES (NEW.vendor_id, 'price_submission', 'Price Data Submitted', 10);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for point awarding
CREATE TRIGGER award_points_trigger
    AFTER UPDATE ON price_submissions
    FOR EACH ROW
    EXECUTE FUNCTION award_points_for_submission();

-- Create a function to award points for FPC scans
CREATE OR REPLACE FUNCTION award_points_for_fpc_scan()
RETURNS TRIGGER AS $$
BEGIN
    -- Award 5 points for each valid FPC scan
    IF NEW.scan_count > OLD.scan_count THEN
        UPDATE vendors 
        SET points = points + 5 
        WHERE id = (SELECT vendor_id FROM fair_price_certificates WHERE id = NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for FPC scan points
CREATE TRIGGER fpc_scan_points_trigger
    AFTER UPDATE ON fair_price_certificates
    FOR EACH ROW
    EXECUTE FUNCTION award_points_for_fpc_scan();
```

## Security Configuration

After running the database schema, configure the following security settings in Supabase:

1. **Authentication Settings:**
   - Enable phone authentication
   - Set OTP expiry to 5 minutes
   - Enable rate limiting for auth endpoints

2. **API Settings:**
   - Configure CORS for your frontend domain
   - Set up API rate limiting (1000 requests/hour per user)

3. **Database Settings:**
   - Enable Row Level Security (already done in schema)
   - Configure backup retention (30 days minimum)
   - Set up real-time subscriptions for notifications

This schema provides a complete foundation for the Market Mania application with proper security, indexing, and data integrity constraints.