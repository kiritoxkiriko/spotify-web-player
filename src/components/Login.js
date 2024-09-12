import React from 'react';
import config from '../config';

const { CLIENT_ID, REDIRECT_URI, AUTH_ENDPOINT } = config;
const RESPONSE_TYPE = 'code';
const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-library-read',
  'user-library-modify',
  'user-read-playback-state',
  'user-modify-playback-state',
];

function Login() {
  const handleLogin = () => {
    window.location = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPES.join('%20')}`;
  };

  return (
    <button className="spotify-button" onClick={handleLogin}>
      Login with Spotify
    </button>
  );
}

export default Login;
