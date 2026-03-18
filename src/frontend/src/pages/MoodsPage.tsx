import { useQuery } from "@tanstack/react-query";
import { Brain, Camera, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import FaceEmotionDetector from "../components/FaceEmotionDetector";
import SongCard from "../components/SongCard";
import { usePlayer } from "../contexts/PlayerContext";
import { MOOD_QUERIES, searchMusic } from "../services/youtube";

const MOOD_COLORS: Record<
  string,
  { border: string; activeBg: string; text: string; glow: string }
> = {
  yellow: {
    border: "border-vrinda-yellow/40",
    activeBg: "bg-vrinda-yellow/20",
    text: "text-vrinda-yellow",
    glow: "shadow-[0_0_20px_oklch(0.88_0.17_80/0.35)]",
  },
  blue: {
    border: "border-vrinda-blue/40",
    activeBg: "bg-vrinda-blue/20",
    text: "text-vrinda-blue",
    glow: "shadow-[0_0_20px_oklch(0.60_0.20_255/0.35)]",
  },
  aqua: {
    border: "border-vrinda-aqua/40",
    activeBg: "bg-vrinda-aqua/20",
    text: "text-vrinda-aqua",
    glow: "shadow-[0_0_20px_oklch(0.80_0.13_190/0.35)]",
  },
  pink: {
    border: "border-vrinda-pink/40",
    activeBg: "bg-vrinda-pink/20",
    text: "text-vrinda-pink",
    glow: "shadow-[0_0_20px_oklch(0.65_0.24_345/0.35)]",
  },
  cyan: {
    border: "border-vrinda-cyan/40",
    activeBg: "bg-vrinda-cyan/20",
    text: "text-vrinda-cyan",
    glow: "shadow-[0_0_20px_oklch(0.85_0.14_195/0.35)]",
  },
};

const MOOD_EMOJI: Record<string, string> = {
  happy: "😊",
  energetic: "⚡",
  sad: "😢",
  focus: "🎯",
  chill: "😌",
  romantic: "❤️",
};

const MOOD_LABELS: Record<string, string> = {
  happy: "Happy",
  energetic: "Energetic",
  sad: "Sad",
  focus: "Focus",
  chill: "Chill",
  romantic: "Romantic",
};

const MOODS = Object.entries(MOOD_QUERIES).map(([key, val]) => ({
  key,
  ...val,
}));

export default function MoodsPage() {
  const { state, playSong, setMood } = usePlayer();
  const [selectedMood, setSelectedMood] = useState<string | null>(
    state.currentMood,
  );
  const [showDetector, setShowDetector] = useState(false);

  const { data: moodSongs = [], isLoading } = useQuery({
    queryKey: ["mood", selectedMood],
    queryFn: () => {
      const mood = MOOD_QUERIES[selectedMood!];
      return searchMusic(mood.query, 20);
    },
    enabled: !!selectedMood,
    staleTime: 10 * 60 * 1000,
  });

  const handleMoodSelect = (moodKey: string) => {
    setSelectedMood(moodKey);
    setMood(moodKey);
  };

  const handleEmotionDetected = (moodKey: string) => {
    handleMoodSelect(moodKey);
    setShowDetector(false);
    const emoji = MOOD_EMOJI[moodKey] ?? "🎵";
    const label = MOOD_LABELS[moodKey] ?? moodKey;
    toast.success(`Detected: ${label} ${emoji} — queuing your playlist`, {
      duration: 4000,
    });
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: auto-play on mood load
  useEffect(() => {
    if (moodSongs.length > 0 && selectedMood && !state.currentSong) {
      playSong(moodSongs[0], moodSongs);
    }
  }, [moodSongs]);

  return (
    <main className="px-4 sm:px-8 pb-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-6 pb-4"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Brain size={22} className="text-vrinda-cyan" />
            <h1 className="font-display font-bold text-2xl">AI Moods</h1>
          </div>
          <motion.button
            type="button"
            data-ocid="moods.detect_mood.button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowDetector(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all"
            style={{
              background: "oklch(0.85 0.14 195 / 0.15)",
              border: "1px solid oklch(0.85 0.14 195 / 0.35)",
              color: "oklch(0.85 0.14 195)",
              boxShadow: "0 0 16px oklch(0.85 0.14 195 / 0.2)",
            }}
          >
            <Camera size={16} />
            Detect My Mood
          </motion.button>
        </div>
        <p className="text-muted-foreground text-sm">
          Let your emotion guide your playlist
        </p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {MOODS.map((mood, i) => {
          const colors = MOOD_COLORS[mood.color];
          const isActive = selectedMood === mood.key;
          return (
            <motion.button
              type="button"
              key={mood.key}
              data-ocid={`moods.tab.${i + 1}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => handleMoodSelect(mood.key)}
              className={`glass rounded-2xl p-5 flex flex-col items-center gap-3 border transition-all ${
                isActive
                  ? `${colors.activeBg} ${colors.border} ${colors.glow}`
                  : "border-white/10"
              }`}
            >
              <span className="text-4xl">{mood.icon}</span>
              <div className="text-center">
                <p
                  className={`font-semibold ${
                    isActive ? colors.text : "text-foreground"
                  }`}
                >
                  {mood.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isActive ? "Playing this vibe" : "Tap to explore"}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {selectedMood && (
          <motion.div
            key={selectedMood}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <h2 className="font-display font-bold text-lg mb-4">
              {MOOD_QUERIES[selectedMood]?.icon}{" "}
              {MOOD_QUERIES[selectedMood]?.label} Picks
            </h2>
            {isLoading ? (
              <div
                data-ocid="moods.loading_state"
                className="flex justify-center py-12"
              >
                <Loader2 className="w-8 h-8 text-vrinda-cyan animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {moodSongs.map((song, i) => (
                  <SongCard
                    key={song.videoId}
                    song={song}
                    queue={moodSongs}
                    index={i + 1}
                    variant="list"
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedMood && (
        <div
          data-ocid="moods.empty_state"
          className="text-center py-12 text-muted-foreground"
        >
          <span className="text-5xl">🎵</span>
          <p className="mt-4 text-lg font-medium">Pick a mood above</p>
          <p className="text-sm mt-1">
            We'll curate the perfect playlist for you
          </p>
        </div>
      )}

      <FaceEmotionDetector
        isOpen={showDetector}
        onClose={() => setShowDetector(false)}
        onEmotionDetected={handleEmotionDetected}
      />
    </main>
  );
}
