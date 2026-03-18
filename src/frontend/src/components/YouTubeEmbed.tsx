import { useEffect, useRef } from "react";
import { usePlayer } from "../contexts/PlayerContext";

export default function YouTubeEmbed() {
  const { state, playerRef, onSongEnded, onTimeUpdate } = usePlayer();
  const divRef = useRef<HTMLDivElement>(null);
  const isReady = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onSongEndedRef = useRef(onSongEnded);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  onSongEndedRef.current = onSongEnded;
  onTimeUpdateRef.current = onTimeUpdate;

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
  useEffect(() => {
    if (!window.YT) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    }

    const init = () => {
      if (!divRef.current) return;
      const player = new window.YT.Player(divRef.current, {
        height: "1",
        width: "1",
        playerVars: {
          autoplay: 1,
          playsinline: 1,
          rel: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (e) => {
            playerRef.current = e.target;
            isReady.current = true;
            e.target.setVolume(80);
          },
          onStateChange: (e) => {
            if (e.data === 0) onSongEndedRef.current();
          },
          onError: () => {
            setTimeout(() => onSongEndedRef.current(), 1000);
          },
        },
      });
      playerRef.current = player;
    };

    if (window.YT?.Player) {
      init();
    } else {
      window.onYouTubeIframeAPIReady = init;
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional dep on videoId only
  useEffect(() => {
    if (!isReady.current || !playerRef.current || !state.currentSong) return;
    playerRef.current.loadVideoById(state.currentSong.videoId);
  }, [state.currentSong?.videoId]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional dep on isPlaying only
  useEffect(() => {
    if (!isReady.current || !playerRef.current) return;
    if (state.isPlaying) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
  }, [state.isPlaying]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional dep on volume only
  useEffect(() => {
    if (!isReady.current || !playerRef.current) return;
    playerRef.current.setVolume(state.volume);
  }, [state.volume]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional dep on isPlaying only
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!state.isPlaying) return;
    timerRef.current = setInterval(() => {
      if (!playerRef.current) return;
      const current = playerRef.current.getCurrentTime();
      const total = playerRef.current.getDuration();
      if (!Number.isNaN(current) && !Number.isNaN(total) && total > 0) {
        onTimeUpdateRef.current(current, total);
      }
    }, 500);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isPlaying]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: -10,
        left: -10,
        width: 1,
        height: 1,
        overflow: "hidden",
        opacity: 0,
        pointerEvents: "none",
        zIndex: -1,
      }}
      aria-hidden="true"
    >
      <div ref={divRef} id="yt-player" />
    </div>
  );
}
