import React, { useState, useEffect } from 'react';
import './App.css';
import SpotifyPlayer from './components/SpotifyPlayer';

function App() {
  const [token, setToken] = useState('');

  useEffect(() => {
    // Replace this with your actual Spotify access token
    const spotifyToken = 'YOUR_ACTUAL_SPOTIFY_ACCESS_TOKEN';
    setToken(spotifyToken);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify Web Player</h1>
        {token && <SpotifyPlayer token={token} />}
      </header>
    </div>
  );
}

export default App;
