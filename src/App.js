import React, { useState, useEffect } from 'react';
import './App.css';
import SpotifyPlayer from './components/SpotifyPlayer';
import Login from './components/Login';

function App() {
  const [token, setToken] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const hash = window.location.hash
      .substring(1)
      .split('&')
      .reduce((initial, item) => {
        if (item) {
          var parts = item.split('=');
          initial[parts[0]] = decodeURIComponent(parts[1]);
        }
        return initial;
      }, {});

    window.location.hash = '';

    if (hash.access_token) {
      setToken(hash.access_token);
      window.localStorage.setItem('token', hash.access_token);
      console.log('Token set:', hash.access_token);
    } else if (hash.error) {
      setError(hash.error);
      console.error('Error:', hash.error);
    } else {
      const storedToken = window.localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        console.log('Using stored token:', storedToken);
      }
    }
  }, []);

  const logout = () => {
    setToken('');
    window.localStorage.removeItem('token');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify Web Player</h1>
        {error && <div className="error">Error: {error}</div>}
        {!token ? (
          <Login />
        ) : (
          <>
            <SpotifyPlayer token={token} deviceName="Spotify Web Player" />
            <button className="spotify-button logout" onClick={logout}>
              Logout
            </button>
          </>
        )}
      </header>
    </div>
  );
}

export default App;
