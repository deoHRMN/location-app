import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'; // importing markers, blue line for route and other components of a map
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios'; // importing to be used to fetch route information from API.

// Define the coordinates for the KPU Surrey Library
const libraryCoords = [49.13204, -122.87139];

// Define a custom icon for the library marker
const libraryIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/167/167707.png', // icon URL
  iconSize: [36, 61],       // Size of the icon
  iconAnchor: [12, 41],     // Point of the icon which corresponds to the library's location
  popupAnchor: [1, -34],    // Point from which the popup should open relative to the iconAnchor
});

// Define a custom icon for the user's current location marker
const userIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149060.png', // icon URL
  iconSize: [41, 41],       // Size of the icon
  iconAnchor: [12, 41],     // Point of the icon which corresponds to the user's location
  popupAnchor: [1, -34],    // Point from which the popup should open relative to the iconAnchor
});

const MapComponent = ({ setDistance, setLoading }) => {
  const [userCoords, setUserCoords] = useState(null); // State to hold user's current coordinates
  const [route, setRoute] = useState([]);             // State to hold the route coordinates

  // Function to calculate route from user's current location to KPU Surrey Library
  const calculateRoute = useCallback(async (start, end) => {
    const startStr = `${start[1]},${start[0]}`;  // Format coordinates for API request
    const endStr = `${end[1]},${end[0]}`;

    try {
      // Fetch route information using OSRM API
      const response = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${startStr};${endStr}?overview=full&geometries=geojson`
      );
      const data = response.data.routes[0];  // Extract route data from response
      const routeCoords = data.geometry.coordinates.map(coord => [coord[1], coord[0]]);  // Extract route coordinates
      setRoute(routeCoords);  // Update state with route coordinates
      setDistance(data.distance / 1000); // Convert meters to kilometers and update distance state
      setLoading(false); // Set loading state to false once distance is calculated
    } catch (error) {
      console.error('Error fetching route data:', error); // Log error if API request fails
    }
  }, [setDistance, setLoading]);

  // Effect hook to watch user's position and update map and route accordingly
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const coords = [position.coords.latitude, position.coords.longitude];  // Get user's current coordinates
          setUserCoords(coords);  // Update state with current coordinates
          calculateRoute(coords, libraryCoords);  // Calculate route to KPU Surrey Library
        },
        (error) => {
          console.error('Error getting user location:', error);  // Log error if user location retrieval fails
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }  // Options for geolocation API
      );

      // Cleanup function to stop watching position when component unmounts
      return () => {
        navigator.geolocation.clearWatch(watchId);  // Clear watch position
      };
    }
  }, [calculateRoute]);  // Dependency array ensures useEffect runs only when calculateRoute changes

  return (
    <div>
      <MapContainer center={libraryCoords} zoom={13} style={{ height: "100vh", width: "100%" }} id="map">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"  // OpenStreetMap tile layer URL
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {userCoords && (
          <Marker position={userCoords} icon={userIcon}>
            <Popup>Current Location</Popup>
          </Marker>
        )}
        <Marker position={libraryCoords} icon={libraryIcon}>
          <Popup>KPU Surrey Library</Popup>
        </Marker>
        {route.length > 0 && <Polyline positions={route} color="blue" />}  {/* Render polyline for route if route coordinates exist */}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
