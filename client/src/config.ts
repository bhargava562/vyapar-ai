/**
 * Centralized application configuration
 * All base URLs and environment variables in one place for easy production changes
 */

// API URLs - change API_BASE_URL in .env for production
export const config = {
    // Base API URL (no path suffix)
    API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',

    // API v1 endpoint with path suffix
    API_V1_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',

    // Supabase configuration
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
    SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',

    // Feature flags
    ENABLE_VOICE: import.meta.env.VITE_ENABLE_VOICE === 'true',
    ENABLE_OFFLINE: import.meta.env.VITE_ENABLE_OFFLINE === 'true',

    // Debug mode
    DEBUG: import.meta.env.VITE_DEBUG === 'true',
} as const;

// Export individual items for convenience
export const { API_BASE_URL, API_V1_URL, SUPABASE_URL, SUPABASE_ANON_KEY } = config;

// Type for config object
export type AppConfig = typeof config;
