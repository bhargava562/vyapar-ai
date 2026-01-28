
import { API_BASE_URL } from '../config';

export interface User {
    id: string;
    phone_number: string;
    role: 'vendor' | 'consumer';
    name?: string;
    profile_completed: boolean;
}

export interface LoginResponse {
    success: boolean;
    token?: string;
    user?: User;
    error?: string;
}

// Mock auth service for UI development
class AuthService {
    private isAuthenticated = false;
    private currentUser: User | null = null;

    async sendOtp(phoneNumber: string): Promise<{ success: boolean; message?: string; error?: string }> {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                if (phoneNumber.length >= 10) {
                    resolve({ success: true, message: 'OTP sent successfully' });
                } else {
                    resolve({ success: false, error: 'Invalid phone number' });
                }
            }, 1000);
        });
    }

    async verifyOtp(phoneNumber: string, otp: string): Promise<LoginResponse> {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (otp === '1234') {
                    this.isAuthenticated = true;
                    this.currentUser = {
                        id: '1',
                        phone_number: phoneNumber,
                        role: 'vendor', // Default to vendor for this flow
                        profile_completed: false // Force profile setup for demo
                    };

                    // Store token
                    localStorage.setItem('token', 'mock-jwt-token');
                    localStorage.setItem('user', JSON.stringify(this.currentUser));

                    resolve({
                        success: true,
                        token: 'mock-jwt-token',
                        user: this.currentUser
                    });
                } else {
                    resolve({ success: false, error: 'Invalid OTP' });
                }
            }, 1000);
        });
    }

    logout() {
        this.isAuthenticated = false;
        this.currentUser = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem('token');
    }

    getUser(): User | null {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
}

export const authService = new AuthService();
