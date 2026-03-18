import { Slider } from "@/components/ui/slider";
import {
  Heart,
  ListMusic,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { usePlayer } from "../contexts/PlayerContext";
import QueuePanel from "./QueuePanel";

function formatTime(s: number): string {
  if (!s || Number.isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

interface FullPlayerProps {
  likedIds: Set<string>;
  onLike: (song: { videoId: string; title: string; artist: string }) => void;
  onUnlike: (videoId: string) => void;
}

export default function FullPlayer({
  likedIds,
  onLike,
  onUnlike,
}: FullPlayerProps) {
  const {
    state,
    pauseSong,
    resumeSong,
    nextSong,
    prevSong,
    setRepeat,
    setShuffle,
    setVolume,
    seekTo,
    setExpanded,
    toggleQueue,
  } = usePlayer();

  if (!state.isExpanded || !state.currentSong) return null;

  const song = state.currentSong;
  const progress =
    state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;
  const isLiked = likedIds.has(song.videoId);

  const cycleRepeat = () => {
    if (state.repeat === "none") setRepeat("all");
    else if (state.repeat === "all") setRepeat("one");
    else setRepeat("none");
  };

  return (
    <AnimatePresence>
      <motion.div
        data-ocid="fullplayer.modal"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed inset-0 z-50 flex"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.14 0.05 265) 0%, oklch(0.09 0.025 265) 100%)",
        }}
      >
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <button
              type="button"
              data-ocid="fullplayer.close_button"
              onClick={() => setExpanded(false)}
              className="w-9 h-9 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
              Now Playing
            </p>
            <button
              type="button"
              data-ocid="fullplayer.secondary_button"
              onClick={toggleQueue}
              className={`w-9 h-9 rounded-full glass flex items-center justify-center transition-colors ${
                state.showQueue
                  ? "text-vrinda-cyan"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ListMusic size={18} />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-8 gap-6 overflow-y-auto">
            <motion.div
              key={song.videoId}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-xs aspect-square flex-shrink-0"
            >
              <img
                src={song.thumbnail}
                alt={song.title}
                className="w-full h-full rounded-2xl object-cover"
                style={{
                  boxShadow:
                    "0 20px 60px rgba(0,0,0,0.5), 0 0 40px oklch(0.85 0.14 195 / 0.15)",
                }}
              />
              <div
                className="absolute inset-0 rounded-2xl"
                style={{ border: "1px solid rgba(255,255,255,0.12)" }}
              />
            </motion.div>

            <div className="w-full flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-display font-bold truncate">
                  {song.title}
                </h2>
                <p className="text-muted-foreground mt-1 truncate">
                  {song.artist}
                </p>
              </div>
              <button
                type="button"
                data-ocid="fullplayer.toggle"
                onClick={() =>
                  isLiked ? onUnlike(song.videoId) : onLike(song)
                }
                className={`w-10 h-10 rounded-full glass flex items-center justify-center flex-shrink-0 ml-3 transition-colors ${
                  isLiked
                    ? "text-vrinda-pink"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Heart size={20} className={isLiked ? "fill-current" : ""} />
              </button>
            </div>

            <div className="w-full space-y-2">
              <Slider
                data-ocid="fullplayer.editor"
                value={[progress]}
                max={100}
                step={0.1}
                onValueChange={([v]) => seekTo((v / 100) * state.duration)}
                className="w-full [&>span:first-child]:h-1 [&>span:first-child]:bg-white/15 [&_[role=slider]]:w-4 [&_[role=slider]]:h-4 [&_[role=slider]]:bg-vrinda-cyan [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-neon [&>span:first-child>span]:bg-vrinda-cyan"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(state.currentTime)}</span>
                <span>{formatTime(state.duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                data-ocid="fullplayer.toggle"
                onClick={() => setShuffle(!state.shuffle)}
                className={`p-2 rounded-lg transition-colors ${
                  state.shuffle
                    ? "text-vrinda-cyan"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Shuffle size={20} />
              </button>
              <button
                type="button"
                data-ocid="fullplayer.button"
                onClick={prevSong}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <SkipBack size={26} />
              </button>
              <button
                type="button"
                data-ocid="fullplayer.primary_button"
                onClick={state.isPlaying ? pauseSong : resumeSong}
                className="w-16 h-16 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform"
                style={{ boxShadow: "0 0 24px rgba(255,255,255,0.3)" }}
              >
                {state.isPlaying ? (
                  <Pause size={28} className="text-gray-900 fill-gray-900" />
                ) : (
                  <Play
                    size={28}
                    className="text-gray-900 fill-gray-900 ml-1"
                  />
                )}
              </button>
              <button
                type="button"
                data-ocid="fullplayer.button"
                onClick={nextSong}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <SkipForward size={26} />
              </button>
              <button
                type="button"
                data-ocid="fullplayer.toggle"
                onClick={cycleRepeat}
                className={`p-2 rounded-lg transition-colors ${
                  state.repeat !== "none"
                    ? "text-vrinda-cyan"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {state.repeat === "one" ? (
                  <Repeat1 size={20} />
                ) : (
                  <Repeat size={20} />
                )}
              </button>
            </div>

            <div className="flex items-center gap-3 w-full pb-6">
              <Volume2
                size={16}
                className="text-muted-foreground flex-shrink-0"
              />
              <Slider
                value={[state.volume]}
                max={100}
                onValueChange={([v]) => setVolume(v)}
                className="flex-1 [&>span:first-child]:h-1 [&>span:first-child]:bg-white/15 [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:bg-vrinda-cyan [&_[role=slider]]:border-0 [&>span:first-child>span]:bg-vrinda-cyan/60"
              />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {state.showQueue && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-80 glass border-l border-white/10 overflow-hidden flex-shrink-0"
            >
              <QueuePanel />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
