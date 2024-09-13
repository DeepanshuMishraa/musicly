declare module 'react-spotify-player' {
  import React from 'react';

  interface SpotifyPlayerProps {
    uri: string;
    size: {
      width: string | number;
      height: string | number;
    };
    view?: 'list' | 'coverart';
    theme?: 'black' | 'white';
  }

  const SpotifyPlayer: React.FC<SpotifyPlayerProps>;

  export default SpotifyPlayer;
}
