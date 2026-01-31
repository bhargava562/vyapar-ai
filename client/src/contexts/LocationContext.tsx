
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface LocationState {
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    permissionDenied: boolean;
    loading: boolean;
    error: string | null;
}

interface LocationContextType extends LocationState {
    requestLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<LocationState>({
        latitude: null,
        longitude: null,
        accuracy: null,
        permissionDenied: false,
        loading: true, // Start loading on mount
        error: null
    });

    const requestLocation = async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        if (!navigator.geolocation) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: 'Geolocation is not supported by your browser'
            }));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setState({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    permissionDenied: false,
                    loading: false,
                    error: null
                });
            },
            (error) => {
                let errorMessage = 'Failed to get location';
                let denied = false;

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'User denied the request for Geolocation';
                        denied = true;
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'The request to get user location timed out';
                        break;
                }

                setState({
                    latitude: null,
                    longitude: null,
                    accuracy: null,
                    permissionDenied: denied,
                    loading: false,
                    error: errorMessage
                });
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };

    // Auto-request on mount
    useEffect(() => {
        requestLocation();
    }, []);

    return (
        <LocationContext.Provider value={{ ...state, requestLocation }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};
