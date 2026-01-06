import React, { useState } from 'react'
import './App.css'

function App() {
  const [userLocation, setUserLocation] = useState({ latitude: "Not set", longitude: "Not set", city: "Unknown" });
  const [weatherImage, setWeatherImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageGallery, setImageGallery] = useState<string[]>([]);

  async function getLocation() {
    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(async user_position => {
      const lat = user_position.coords.latitude;
      const lon = user_position.coords.longitude;
      
      // Get city name
      try {
        const geoResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`);
        const geoData = await geoResponse.json();
        const city = geoData.address?.city || geoData.address?.town || geoData.address?.village || "Unknown";
        setUserLocation({
          latitude: lat.toFixed(4).toString(),
          longitude: lon.toFixed(4).toString(),
          city
        });
        console.log(`Latitude: ${lat}, Longitude: ${lon}, City: ${city}`);
      } catch (err) {
        setUserLocation({
          latitude: lat.toFixed(4).toString(),
          longitude: lon.toFixed(4).toString(),
          city: "Unknown"
        });
      }
      
      // Generate image
      try {
        const response = await fetch('http://localhost:3077/image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ latitude: lat, longitude: lon })
        });
        if (response.ok) {
          const blob = await response.blob();
          const imageUrl = URL.createObjectURL(blob);
          setWeatherImage(imageUrl);
          setImageGallery(prev => [imageUrl, ...prev.slice(0, 4)]); // Keep last 5
        } else {
          setError(`Failed to generate image: ${response.status}`);
        }
      } catch (err) {
        setError('Network error occurred.');
      } finally {
        setLoading(false);
      }
    }, (err) => {
      setError('Location access denied or unavailable.');
      setLoading(false);
    });
  }

  return (
    <div className="app">
      <div className="top-section">
        <div className="location-pill">
          <p>📍 {userLocation.city} | Lat: {userLocation.latitude} | Lon: {userLocation.longitude}</p>
        </div>
        <header>
          <h1>🐼 Panda Weather Image Generator 🐼</h1>
          <p>Get a beautiful AI-generated image based on your current weather! 🐼</p>
        </header>
      </div>
      
      <div className="main-container">
        <main className="main-content">
          <button 
            onClick={getLocation} 
            disabled={loading}
            className="generate-button"
          >
            {loading ? 'Generating... 🐼' : 'Generate Weather Image 🐼'}
          </button>
          
          {error && <p className="error">❌ {error}</p>}
          
          {weatherImage && (
            <div className="image-container">
              <h2>Generated Weather Image 🖼️</h2>
              <img 
                src={weatherImage} 
                alt="AI-generated weather scene" 
                className="weather-image"
              />
            </div>
          )}
        </main>
        
        <aside className="gallery">
          <h2>Image Gallery 🖼️🐼</h2>
          {imageGallery.length === 0 ? (
            <p>No images yet! Generate some weather art! 🐼</p>
          ) : (
            <div className="gallery-grid">
              {imageGallery.map((img, index) => (
                <img key={index} src={img} alt={`Weather image ${index + 1}`} className="gallery-image" />
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

export default App
