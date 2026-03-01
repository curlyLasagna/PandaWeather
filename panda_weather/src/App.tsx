import { useState } from 'react'
import './App.css'
import QuestionIcon from './components/QuestionIcon'

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
      setError(`Location access denied or unavailable. ${err.message}`);
      setLoading(false);
    });
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="top-section pt-6 pb-4">
        <div className="location-pill-container px-4">
          <div className="bg-gray-900 text-white rounded-lg px-4 py-3 flex items-center gap-3 mx-auto w-fit">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
              {weatherImage ? (
                <img 
                  src={weatherImage} 
                  alt="Location weather preview" 
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <QuestionIcon size={18} className="text-white" />
              )}
            </div>
            <span className="text-sm font-medium">
              📍 {userLocation.city} | Lat: {userLocation.latitude} | Lon: {userLocation.longitude}
            </span>
          </div>
        </div>
        <header className="text-center mt-6">
          <h1 className="text-3xl font-bold text-gray-900">🐼 Panda Weather Image Generator 🐼</h1>
          <p className="text-gray-600 mt-2">Get a beautiful AI-generated image based on your current weather! 🐼</p>
        </header>
      </div>
      
      <div className="main-container px-4 pb-8">
        <main className="main-content max-w-4xl mx-auto">
          <div className="text-center">
            <button 
              onClick={getLocation} 
              disabled={loading}
              className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating... 🐼' : 'Generate Weather Image 🐼'}
            </button>
          </div>
          
          {error && <p className="text-red-600 text-center mt-4">❌ {error}</p>}
          
          {weatherImage && (
            <div className="image-container mt-8">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">Generated Weather Image 🖼️</h2>
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img 
                  src={weatherImage} 
                  alt="AI-generated weather scene" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          )}
        </main>
        
        <aside className="gallery mt-12 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Image Gallery 🖼️🐼</h2>
          {imageGallery.length === 0 ? (
            <p className="text-gray-600 text-center">No images yet! Generate some weather art! 🐼</p>
          ) : (
            <div className="gallery-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {imageGallery.map((img, index) => (
                <div key={index} className="rounded-lg overflow-hidden shadow-md">
                  <img src={img} alt={`Weather image ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

export default App
