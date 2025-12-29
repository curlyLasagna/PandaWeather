import React, { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
'use client'
function App() {
  const [count, setCount] = useState(0);
  const [userLocation, setUserLocation] = useState({ latitude: "67", longitude: "67" });
  async function getLocation() {
    // navigator.geolocation.getCurrentPosition(user_position => {
    //   const response = await fetch('https://localhost:3077/image', {
    //     method: 'POST',
    //     body: JSON.stringify({ latitude: user_position.coords.latitude, longtitude: user_position.coords.longitude })
    //   })
    // })
    navigator.geolocation.getCurrentPosition((pos) => {
      setUserLocation({
        latitude: pos.coords.latitude.toFixed(4).toString(),
        longitude: pos.coords.longitude.toFixed(4).toString()
      });
    })
  }

  return (

    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React + panda</h1>
      <div className="card">
        <p>Latitude: {userLocation.latitude}, Longitude: {userLocation.longitude}</p>
        <button onClick={() => setCount((count) => count + 1)}>
          + 1
        </button>
        <button onClick={() => setCount((count) => count - 1)}>
          - 1
        </button>

        <button onClick={getLocation}>
          Get Location
        </button>
        {<p>Count is {count}</p>}
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
