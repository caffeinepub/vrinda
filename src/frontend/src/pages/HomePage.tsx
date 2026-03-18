import { useQuery } from "@tanstack/react-query";
import { Sparkles, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import type { TabId } from "../components/BottomNav";
import SongCard from "../components/SongCard";
import { usePlayer } from "../contexts/PlayerContext";
import { MOOD_QUERIES, getTrendingMusic } from "../services/youtube";

const MOOD_COLORS: Record<
  string,
  { border: string; glow: string; text: string }
> = {
  yellow: {
    border: "border-vrinda-yellow/50",
    glow: "hover:shadow-[0_0_16px_oklch(0.88_0.17_80/0.4)]",
    text: "text-vrinda-yellow",
  },
  blue: {
    border: "border-vrinda-blue/50",
    glow: "hover:shadow-[0_0_16px_oklch(0.60_0.20_255/0.4)]",
    text: "text-vrinda-blue",
  },
  aqua: {
    border: "border-vrinda-aqua/50",
    glow: "hover:shadow-[0_0_16px_oklch(0.80_0.13_190/0.4)]",
    text: "text-vrinda-aqua",
  },
  pink: {
    border: "border-vrinda-pink/50",
    glow: "hover:shadow-[0_0_16px_oklch(0.65_0.24_345/0.4)]",
    text: "text-vrinda-pink",
  },
  cyan: {
    border: "border-vrinda-cyan/50",
    glow: "hover:shadow-[0_0_16px_oklch(0.85_0.14_195/0.4)]",
    text: "text-vrinda-cyan",
  },
};

const HERO_MOODS = ["happy", "sad", "chill", "energetic"] as const;

interface HomePageProps {
  onTabChange: (tab: TabId) => void;
}

export default function HomePage({ onTabChange }: HomePageProps) {
  const { setMood } = usePlayer();

  const { data: trending = [], isLoading: trendingLoading } = useQuery({
    queryKey: ["trending"],
    queryFn: () => getTrendingMusic(16),
    staleTime: 10 * 60 * 1000,
  });

  const handleMoodSelect = (moodKey: string) => {
    const mood = MOOD_QUERIES[moodKey];
    if (!mood) return;
    setMood(moodKey);
    onTabChange("moods");
  };

  return (
    <main className="px-4 sm:px-8 pb-4">
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-12 sm:py-16"
      >
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-tight">
          <span className="text-gradient-cyan">Stream.</span>{" "}
          <span style={{ color: "oklch(0.97 0.01 265)" }}>Feel.</span>{" "}
          <span className="text-gradient-cyan">Discover.</span>
        </h1>
        <p className="mt-4 text-muted-foreground text-lg max-w-md mx-auto">
          AI-powered music that matches your mood.
        </p>
        <button
          type="button"
          data-ocid="home.search_input"
          onClick={() => onTabChange("explore")}
          className="mt-6 glass-strong rounded-full px-8 py-3 text-muted-foreground hover:text-foreground hover:border-vrinda-cyan/40 transition-all flex items-center gap-3 mx-auto"
        >
          <span className="text-sm">Search for music, artists, moods...</span>
        </button>
      </motion.section>

      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-vrinda-cyan" />
          <h2 className="font-display font-bold text-xl">Select Your Vibe</h2>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {HERO_MOODS.map((moodKey, i) => {
            const mood = MOOD_QUERIES[moodKey];
            const colors = MOOD_COLORS[mood.color];
            return (
              <motion.button
                type="button"
                key={moodKey}
                data-ocid={`mood.tab.${i + 1}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => handleMoodSelect(moodKey)}
                className={`glass rounded-xl p-3 sm:p-4 flex flex-col items-center gap-2 border transition-all ${colors.border} ${colors.glow}`}
              >
                <span className="text-2xl sm:text-3xl">{mood.icon}</span>
                <span
                  className={`text-xs sm:text-sm font-medium ${colors.text}`}
                >
                  {mood.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-vrinda-pink" />
          <h2 className="font-display font-bold text-xl">Trending Now</h2>
        </div>
        {trendingLoading ? (
          <div
            data-ocid="trending.loading_state"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
              <div key={i} className="glass rounded-xl overflow-hidden">
                <div className="aspect-video bg-white/5 animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-white/5 rounded animate-pulse" />
                  <div className="h-2 bg-white/5 rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {trending.map((song, i) => (
              <SongCard
                key={song.videoId}
                song={song}
                queue={trending}
                index={i + 1}
              />
            ))}
          </div>
        )}
        {trending.length === 0 && !trendingLoading && (
          <div
            data-ocid="trending.empty_state"
            className="text-center py-12 text-muted-foreground"
          >
            <p>No trending music available right now.</p>
          </div>
        )}
      </section>
    </main>
  );
}
