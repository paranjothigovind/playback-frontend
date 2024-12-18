import { useEffect, useRef } from "react";
import ReactPlayer from "react-player";

function AudioPlayer({ url }: any) {
  const playerRef = useRef(null);

  return (
    <ReactPlayer
      ref={playerRef}
      url={url}
      controls={false}
      playing={true}
      width="0"
      height="0"
    />
  );
}

export default AudioPlayer;