import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";
import type { YTVideo } from "../services/youtube";

export type RepeatMode = "none" | "one" | "all";

interface PlayerState {
  currentSong: YTVideo | null;
  queue: YTVideo[];
  isPlaying: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  volume: number;
  currentTime: number;
  duration: number;
  currentMood: string | null;
  isExpanded: boolean;
  showQueue: boolean;
}

type PlayerAction =
  | { type: "PLAY"; song: YTVideo; queue?: YTVideo[] }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "NEXT" }
  | { type: "PREV" }
  | { type: "SET_QUEUE"; queue: YTVideo[] }
  | { type: "ADD_TO_QUEUE"; song: YTVideo }
  | { type: "REMOVE_FROM_QUEUE"; videoId: string }
  | { type: "SET_SHUFFLE"; shuffle: boolean }
  | { type: "SET_REPEAT"; repeat: RepeatMode }
  | { type: "SET_VOLUME"; volume: number }
  | { type: "SET_TIME"; currentTime: number; duration: number }
  | { type: "SET_MOOD"; mood: string }
  | { type: "TOGGLE_EXPANDED" }
  | { type: "SET_EXPANDED"; expanded: boolean }
  | { type: "TOGGLE_QUEUE" };

const initialState: PlayerState = {
  currentSong: null,
  queue: [],
  isPlaying: false,
  shuffle: false,
  repeat: "none",
  volume: 80,
  currentTime: 0,
  duration: 0,
  currentMood: null,
  isExpanded: false,
  showQueue: false,
};

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case "PLAY":
      return {
        ...state,
        currentSong: action.song,
        queue: action.queue ?? state.queue,
        isPlaying: true,
        currentTime: 0,
      };
    case "PAUSE":
      return { ...state, isPlaying: false };
    case "RESUME":
      return { ...state, isPlaying: true };
    case "NEXT": {
      if (!state.currentSong || state.queue.length === 0) return state;
      if (state.repeat === "one")
        return { ...state, currentTime: 0, isPlaying: true };
      const idx = state.queue.findIndex(
        (s) => s.videoId === state.currentSong!.videoId,
      );
      let nextIdx: number;
      if (state.shuffle) {
        nextIdx = Math.floor(Math.random() * state.queue.length);
      } else {
        nextIdx = idx + 1;
        if (nextIdx >= state.queue.length) {
          if (state.repeat === "all") nextIdx = 0;
          else return { ...state, isPlaying: false };
        }
      }
      return {
        ...state,
        currentSong: state.queue[nextIdx],
        isPlaying: true,
        currentTime: 0,
      };
    }
    case "PREV": {
      if (!state.currentSong || state.queue.length === 0) return state;
      if (state.currentTime > 3) return { ...state, currentTime: 0 };
      const idx = state.queue.findIndex(
        (s) => s.videoId === state.currentSong!.videoId,
      );
      const prevIdx = Math.max(0, idx - 1);
      return {
        ...state,
        currentSong: state.queue[prevIdx],
        isPlaying: true,
        currentTime: 0,
      };
    }
    case "SET_QUEUE":
      return { ...state, queue: action.queue };
    case "ADD_TO_QUEUE":
      return { ...state, queue: [...state.queue, action.song] };
    case "REMOVE_FROM_QUEUE":
      return {
        ...state,
        queue: state.queue.filter((s) => s.videoId !== action.videoId),
      };
    case "SET_SHUFFLE":
      return { ...state, shuffle: action.shuffle };
    case "SET_REPEAT":
      return { ...state, repeat: action.repeat };
    case "SET_VOLUME":
      return { ...state, volume: action.volume };
    case "SET_TIME":
      return {
        ...state,
        currentTime: action.currentTime,
        duration: action.duration,
      };
    case "SET_MOOD":
      return { ...state, currentMood: action.mood };
    case "TOGGLE_EXPANDED":
      return { ...state, isExpanded: !state.isExpanded };
    case "SET_EXPANDED":
      return { ...state, isExpanded: action.expanded };
    case "TOGGLE_QUEUE":
      return { ...state, showQueue: !state.showQueue };
    default:
      return state;
  }
}

interface PlayerContextValue {
  state: PlayerState;
  playSong: (song: YTVideo, queue?: YTVideo[]) => void;
  pauseSong: () => void;
  resumeSong: () => void;
  nextSong: () => void;
  prevSong: () => void;
  addToQueue: (song: YTVideo) => void;
  removeFromQueue: (videoId: string) => void;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
  setRepeat: (repeat: RepeatMode) => void;
  setShuffle: (shuffle: boolean) => void;
  setMood: (mood: string) => void;
  toggleExpanded: () => void;
  setExpanded: (expanded: boolean) => void;
  toggleQueue: () => void;
  playerRef: React.MutableRefObject<any>;
  onSongEnded: () => void;
  onTimeUpdate: (currentTime: number, duration: number) => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  const playerRef = useRef<any>(null);

  const playSong = useCallback((song: YTVideo, queue?: YTVideo[]) => {
    dispatch({ type: "PLAY", song, queue });
  }, []);

  const pauseSong = useCallback(() => {
    dispatch({ type: "PAUSE" });
    playerRef.current?.pauseVideo();
  }, []);

  const resumeSong = useCallback(() => {
    dispatch({ type: "RESUME" });
    playerRef.current?.playVideo();
  }, []);

  const nextSong = useCallback(() => dispatch({ type: "NEXT" }), []);
  const prevSong = useCallback(() => dispatch({ type: "PREV" }), []);

  const addToQueue = useCallback(
    (song: YTVideo) => dispatch({ type: "ADD_TO_QUEUE", song }),
    [],
  );
  const removeFromQueue = useCallback(
    (videoId: string) => dispatch({ type: "REMOVE_FROM_QUEUE", videoId }),
    [],
  );

  const setVolume = useCallback((volume: number) => {
    dispatch({ type: "SET_VOLUME", volume });
    playerRef.current?.setVolume(volume);
  }, []);

  const seekTo = useCallback((time: number) => {
    playerRef.current?.seekTo(time, true);
  }, []);

  const setRepeat = useCallback(
    (repeat: RepeatMode) => dispatch({ type: "SET_REPEAT", repeat }),
    [],
  );
  const setShuffle = useCallback(
    (shuffle: boolean) => dispatch({ type: "SET_SHUFFLE", shuffle }),
    [],
  );
  const setMood = useCallback(
    (mood: string) => dispatch({ type: "SET_MOOD", mood }),
    [],
  );
  const toggleExpanded = useCallback(
    () => dispatch({ type: "TOGGLE_EXPANDED" }),
    [],
  );
  const setExpanded = useCallback(
    (expanded: boolean) => dispatch({ type: "SET_EXPANDED", expanded }),
    [],
  );
  const toggleQueue = useCallback(() => dispatch({ type: "TOGGLE_QUEUE" }), []);

  const onSongEnded = useCallback(() => dispatch({ type: "NEXT" }), []);
  const onTimeUpdate = useCallback((currentTime: number, duration: number) => {
    dispatch({ type: "SET_TIME", currentTime, duration });
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        state,
        playSong,
        pauseSong,
        resumeSong,
        nextSong,
        prevSong,
        addToQueue,
        removeFromQueue,
        setVolume,
        seekTo,
        setRepeat,
        setShuffle,
        setMood,
        toggleExpanded,
        setExpanded,
        toggleQueue,
        playerRef,
        onSongEnded,
        onTimeUpdate,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
