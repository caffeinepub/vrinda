import { ListMusic, Pause, Play, SkipForward } from "lucide-react";
import { motion } from "motion/react";
import { usePlayer } from "../contexts/PlayerContext";

export default function MiniPlayer() {
  const {
    state,
    pauseSong,
    resumeSong,
    nextSong,
    toggleExpanded,
    toggleQueue,
  } = usePlayer();

  if (!state.currentSong) return null;

  const progress =
    state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-[72px] left-4 right-4 z-50"
    >
      <div className="glass-strong rounded-2xl overflow-hidden shadow-glass">
        <div className="h-0.5 bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-vrinda-cyan to-vrinda-blue transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            data-ocid="miniplayer.open_modal_button"
            className="flex items-center gap-3 flex-1 min-w-0"
            onClick={toggleExpanded}
          >
            <img
              src={state.currentSong.thumbnail}
              alt={state.currentSong.title}
              className="w-10 h-10 rounded-lg object-cover flex-shrink-0 animate-spin-slow"
              style={{
                animationPlayState: state.isPlaying ? "running" : "paused",
              }}
            />
            <div className="min-w-0 text-left">
              <p className="text-sm font-medium truncate">
                {state.currentSong.title}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {state.currentSong.artist}
              </p>
            </div>
          </button>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              data-ocid="miniplayer.toggle"
              onClick={state.isPlaying ? pauseSong : resumeSong}
              className="w-9 h-9 rounded-full bg-vrinda-cyan/90 flex items-center justify-center neon-cyan hover:bg-vrinda-cyan transition-colors"
            >
              {state.isPlaying ? (
                <Pause size={16} className="text-white fill-white" />
              ) : (
                <Play size={16} className="text-white fill-white ml-0.5" />
              )}
            </button>
            <button
              type="button"
              data-ocid="miniplayer.button"
              onClick={nextSong}
              className="w-8 h-8 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <SkipForward size={16} />
            </button>
            <button
              type="button"
              data-ocid="miniplayer.secondary_button"
              onClick={toggleQueue}
              className="w-8 h-8 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-vrinda-cyan transition-colors"
            >
              <ListMusic size={15} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
