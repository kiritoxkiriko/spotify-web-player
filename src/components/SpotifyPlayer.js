import React, { useState, useEffect, useCallback, useRef } from 'react';
import SpotifyWebApi from 'spotify-web-api-js';

const spotifyApi = new SpotifyWebApi();

function SpotifyPlayer({ token, deviceName = 'Spotify Web Player' }) {
  const [playerState, setPlayerState] = useState({
    is_paused: false,
    is_active: false,
    current_track: null,
    progress: 0,
    duration: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false); // Add this line
  const [audioQuality, setAudioQuality] = useState('Unknown'); // Add this line
  const playerRef = useRef(null);
  // Remove this line
  // const playerCheckInterval = useRef(null);

  const updatePlayerState = useCallback(() => {
    if (playerRef.current) {
      playerRef.current
        .getCurrentState()
        .then(state => {
          if (state) {
            setPlayerState({
              is_paused: state.paused,
              is_active: true,
              current_track: state.track_window.current_track,
              progress: state.position,
              duration: state.duration,
            });
            // Add this line to update audio quality
            setAudioQuality(state.playback_quality || 'Unknown');
            setIsLoading(false);
            setError(null);
          } else {
            setPlayerState(prev => ({ ...prev, is_active: false }));
            setIsLoading(false);
          }
        })
        .catch(err => {
          console.error('Error getting current state:', err);
          setError('Failed to get player state');
          setIsLoading(false);
        });
    }
  }, []);

  const handlePlayPause = useCallback(() => {
    playerRef.current?.togglePlay();
  }, []);

  const handlePreviousTrack = useCallback(() => {
    playerRef.current?.previousTrack();
  }, []);

  const handleNextTrack = useCallback(() => {
    playerRef.current?.nextTrack();
  }, []);

  const [isDragging, setIsDragging] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);

  const handleProgressChange = useCallback(e => {
    const value = parseInt(e.target.value);
    setLocalProgress(value);
    setIsDragging(true);
  }, []);

  const handleProgressCommit = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.seek(localProgress);
    }
    setIsDragging(false);
  }, [localProgress]);

  useEffect(() => {
    if (!token) return;

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: deviceName,
        getOAuthToken: cb => cb(token),
        volume: 0.5,
      });

      playerRef.current = player;

      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        setIsReady(true); // Add this line
        spotifyApi.setAccessToken(token);
        spotifyApi
          .transferMyPlayback([device_id])
          .then(() => {
            console.log('Transferred playback to ' + device_id);
            updatePlayerState();
          })
          .catch(err => {
            console.error('Error transferring playback:', err);
            setError('Failed to transfer playback');
          });
      });

      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
        setError('Player is not ready');
      });

      player.addListener('player_state_changed', updatePlayerState);

      player
        .connect()
        .then(success => {
          if (success) {
            console.log('The Web Playback SDK successfully connected to Spotify!');
          } else {
            setError('Failed to connect to Spotify');
          }
        })
        .catch(err => {
          console.error('Error connecting to Spotify:', err);
          setError('Error connecting to Spotify');
        });
    };

    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
      }
      // if (playerCheckInterval.current) {
      //   clearInterval(playerCheckInterval.current);
      // }
    };
  }, [deviceName, token, updatePlayerState]);

  useEffect(() => {
    let interval;
    if (isReady) {
      interval = setInterval(updatePlayerState, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isReady, updatePlayerState]);

  const formatTime = milliseconds => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = ((milliseconds % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (isLoading) {
    return <div>Loading player...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!playerState.is_active || !playerState.current_track) {
    return (
      <div>Player is not active or no current track. Please start playing in the Spotify app.</div>
    );
  }

  const { current_track, progress, duration, is_paused } = playerState;

  return (
    <div className="container">
      <div className="main-wrapper">
        <img
          src={current_track.album.images[0].url}
          className="now-playing__cover"
          alt={`${current_track.name} album cover`}
        />
        <div className="now-playing__side">
          <div className="now-playing__name">{current_track.name}</div>
          <div className="now-playing__artist">
            {current_track.artists.map(artist => artist.name).join(', ')}
          </div>
          <div className="now-playing__quality audio-quality-subtle">
            Audio Quality: {audioQuality}
          </div>
        </div>

        <div className="progress-bar">
          <div className="progress-time">{formatTime(isDragging ? localProgress : progress)}</div>
          <input
            type="range"
            value={isDragging ? localProgress : progress}
            max={duration}
            onChange={handleProgressChange}
            onMouseUp={handleProgressCommit}
            onTouchEnd={handleProgressCommit}
            className={isDragging ? 'dragging' : ''}
          />
          <div className="progress-time">{formatTime(duration)}</div>
        </div>

        <div className="controls">
          <button onClick={handlePreviousTrack}>&#9664;&#9664;</button>
          <button onClick={handlePlayPause}>{is_paused ? '▶' : '❚❚'}</button>
          <button onClick={handleNextTrack}>&#9654;&#9654;</button>
        </div>
      </div>
    </div>
  );
}

export default SpotifyPlayer;
