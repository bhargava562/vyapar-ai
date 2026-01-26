/**
 * Vendor profile management service
 * Handles API calls for vendor CRUD operations
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export interface VendorProfile {
  id: string;
  name: string;
  stall_id?: string;
  market_location: string;
  phone_number: string;
  email?: string;
  preferred_language: string;
  points: number;
  status: string;
  created_at: string;
  last_active: string;
  updated_at?: string;
}

export interface VendorProfileCreate {
  name: string;
  stall_id?: string;
  market_location: string;
  phone_number: string;
  email?: string;
  preferred_language: string;
}

export interface VendorProfileUpdate {
  name?: string;
  stall_id?: string;
  market_location?: string;
  email?: string;
  preferred_language?: string;
}

export interface VendorProfileCompletion {
  is_complete: boolean;
  completion_percentage: number;
  missing_fields: string[];
  completed_optional: string[];
  next_step: string;
}

export interface VendorStatistics {
  vendor_id: string;
  points: number;
  submissions_count: number;
  fpc_count: number;
  achievements_count: number;
  member_since: string;
  last_active: string;
  status: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

class VendorService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const status = response.status;
    
    try {
      const data = await response.json();
      
      if (!response.ok) {
        return {
          error: data.detail || `HTTP ${status}: ${response.statusText}`,
          status
        };
      }
      
      return { data, status };
    } catch (error) {
      return {
        error: `Failed to parse response: ${error}`,
        status
      };
    }
  }

  async getProfile(): Promise<ApiResponse<VendorProfile>> {
    try {
      const response = await fetch(`${API_BASE_URL}/vendor/profile`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse<VendorProfile>(response);
    } catch (error) {
      return {
        error: `Network error: ${error}`,
        status: 0
      };
    }
  }

  async createProfile(profileData: VendorProfileCreate): Promise<ApiResponse<VendorProfile>> {
    try {
      const response = await fetch(`${API_BASE_URL}/vendor/profile`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profileData)
      });

      return this.handleResponse<VendorProfile>(response);
    } catch (error) {
      return {
        error: `Network error: ${error}`,
        status: 0
      };
    }
  }

  async updateProfile(profileData: VendorProfileUpdate): Promise<ApiResponse<VendorProfile>> {
    try {
      const response = await fetch(`${API_BASE_URL}/vendor/profile`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profileData)
      });

      return this.handleResponse<VendorProfile>(response);
    } catch (error) {
      return {
        error: `Network error: ${error}`,
        status: 0
      };
    }
  }

  async deleteProfile(): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/vendor/profile`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse<{ message: string }>(response);
    } catch (error) {
      return {
        error: `Network error: ${error}`,
        status: 0
      };
    }
  }

  async getProfileCompletion(): Promise<ApiResponse<VendorProfileCompletion>> {
    try {
      const response = await fetch(`${API_BASE_URL}/vendor/profile/completion`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse<VendorProfileCompletion>(response);
    } catch (error) {
      return {
        error: `Network error: ${error}`,
        status: 0
      };
    }
  }

  async getStatistics(): Promise<ApiResponse<VendorStatistics>> {
    try {
      const response = await fetch(`${API_BASE_URL}/vendor/statistics`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse<VendorStatistics>(response);
    } catch (error) {
      return {
        error: `Network error: ${error}`,
        status: 0
      };
    }
  }

  async getDashboard(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/vendor/dashboard`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse<any>(response);
    } catch (error) {
      return {
        error: `Network error: ${error}`,
        status: 0
      };
    }
  }

  async searchVendors(query: string, limit: number = 20): Promise<ApiResponse<any>> {
    try {
      const params = new URLSearchParams({
        q: query,
        limit: limit.toString()
      });

      const response = await fetch(`${API_BASE_URL}/vendor/search?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse<any>(response);
    } catch (error) {
      return {
        error: `Network error: ${error}`,
        status: 0
      };
    }
  }

  async getVendorsByMarket(marketLocation: string, limit: number = 50): Promise<ApiResponse<VendorProfile[]>> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString()
      });

      const response = await fetch(`${API_BASE_URL}/vendor/market/${encodeURIComponent(marketLocation)}?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return this.handleResponse<VendorProfile[]>(response);
    } catch (error) {
      return {
        error: `Network error: ${error}`,
        status: 0
      };
    }
  }
}

export const vendorService = new VendorService();