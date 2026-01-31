
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocation } from '../../contexts/LocationContext';

export interface Mandi {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    district?: string;
    state?: string;
    distance?: number; // Calculated distance
}

interface MandiMapProps {
    mandis: Mandi[];
    onSelectMandi?: (mandi: Mandi) => void;
    height?: string;
}

// Component to handle map center updates
const RecenterMap: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng], map.getZoom());
    }, [lat, lng, map]);
    return null;
};

const MandiMap: React.FC<MandiMapProps> = ({ mandis, onSelectMandi, height = '400px' }) => {
    const { latitude, longitude, loading } = useLocation();

    // Default to India Center if no location
    const centerLat = latitude || 20.5937;
    const centerLng = longitude || 78.9629;
    const zoom = latitude ? 11 : 5;

    if (loading && !latitude) {
        return <div className="h-64 bg-gray-100 flex items-center justify-center">Loading Map...</div>;
    }

    return (
        <MapContainer
            center={[centerLat, centerLng]}
            zoom={zoom}
            style={{ height: height, width: '100%', borderRadius: '0.5rem' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* User Location Marker */}
            {latitude && longitude && (
                <CircleMarker
                    center={[latitude, longitude]}
                    radius={8}
                    pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.5 }}
                >
                    <Popup>You are here</Popup>
                </CircleMarker>
            )}

            {/* Recenter helper */}
            {latitude && longitude && <RecenterMap lat={latitude} lng={longitude} />}

            {/* Mandi Markers */}
            {mandis.map((mandi) => (
                <CircleMarker
                    key={mandi.id}
                    center={[mandi.latitude, mandi.longitude]}
                    radius={10}
                    pathOptions={{
                        color: 'green',
                        fillColor: '#10B981', // Tailwind green-500
                        fillOpacity: 0.8
                    }}
                    eventHandlers={{
                        click: () => onSelectMandi && onSelectMandi(mandi)
                    }}
                >
                    <Popup>
                        <div className="p-1">
                            <h3 className="font-bold text-lg">{mandi.name}</h3>
                            <p className="text-sm text-gray-600">{mandi.district}, {mandi.state}</p>
                            {mandi.distance && (
                                <p className="text-xs font-semibold mt-1">
                                    {mandi.distance.toFixed(1)} km away
                                </p>
                            )}
                            <button
                                onClick={() => onSelectMandi && onSelectMandi(mandi)}
                                className="mt-2 w-full bg-green-600 text-white text-xs py-1 px-2 rounded hover:bg-green-700"
                            >
                                Select Mandi
                            </button>
                        </div>
                    </Popup>
                </CircleMarker>
            ))}
        </MapContainer>
    );
};

export default MandiMap;
