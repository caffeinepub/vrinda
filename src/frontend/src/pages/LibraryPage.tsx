import { Heart, History, LogIn, Music } from "lucide-react";
import { motion } from "motion/react";
import { usePlayer } from "../contexts/PlayerContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetLikedSongs,
  useGetPreferences,
  useUnlikeSong,
} from "../hooks/useQueries";
import type { YTVideo } from "../services/youtube";

export default function LibraryPage() {
  const { login, loginStatus, identity } = useInternetIdentity();
  const { playSong } = usePlayer();
  const { data: likedSongs = [], isLoading } = useGetLikedSongs();
  const { data: preferences } = useGetPreferences();
  const unlikeMutation = useUnlikeSong();

  const isLoggedIn = !!identity;

  const songToYTVideo = (s: {
    videoId: string;
    title: string;
    artist: string;
  }): YTVideo => ({
    videoId: s.videoId,
    title: s.title,
    artist: s.artist,
    thumbnail: `https://i.ytimg.com/vi/${s.videoId}/hqdefault.jpg`,
  });

  if (!isLoggedIn) {
    return (
      <main className="px-4 sm:px-8 pb-4 flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-3xl p-10 text-center max-w-sm"
        >
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.85 0.14 195), oklch(0.60 0.20 255))",
            }}
          >
            <Music size={28} className="text-white" />
          </div>
          <h2 className="font-display font-bold text-xl mb-2">Your Library</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Sign in to access your liked songs, history, and personalized
            recommendations.
          </p>
          <button
            type="button"
            data-ocid="library.primary_button"
            onClick={() => login()}
            disabled={loginStatus === "logging-in"}
            className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.85 0.14 195), oklch(0.60 0.20 255))",
            }}
          >
            <LogIn size={16} />
            {loginStatus === "logging-in" ? "Signing in..." : "Sign In"}
          </button>
        </motion.div>
      </main>
    );
  }

  const ytSongs = likedSongs.map(songToYTVideo);

  return (
    <main className="px-4 sm:px-8 pb-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-6 pb-6"
      >
        <h1 className="font-display font-bold text-2xl">Your Library</h1>
        {preferences?.favoriteMood && (
          <p className="text-sm text-muted-foreground mt-1">
            Favorite vibe:{" "}
            <span className="text-vrinda-cyan capitalize">
              {preferences.favoriteMood}
            </span>
          </p>
        )}
      </motion.div>

      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Heart size={18} className="text-vrinda-pink fill-vrinda-pink" />
          <h2 className="font-display font-bold text-lg">Liked Songs</h2>
          <span className="text-xs text-muted-foreground ml-auto">
            {likedSongs.length}
          </span>
        </div>

        {isLoading && (
          <div data-ocid="library.loading_state" className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
              <div key={i} className="h-16 glass rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && likedSongs.length === 0 && (
          <div
            data-ocid="library.empty_state"
            className="glass rounded-2xl p-8 text-center text-muted-foreground"
          >
            <Heart size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No liked songs yet</p>
            <p className="text-xs mt-1">
              Heart songs while listening to save them here
            </p>
          </div>
        )}

        <div className="space-y-2">
          {ytSongs.map((song, i) => (
            <button
              type="button"
              key={song.videoId}
              data-ocid={`library.item.${i + 1}`}
              className="w-full flex items-center gap-3 p-3 rounded-xl glass hover:bg-white/10 transition-all group text-left"
              onClick={() => playSong(song, ytSongs)}
            >
              <img
                src={song.thumbnail}
                alt={song.title}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{song.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {song.artist}
                </p>
              </div>
              <button
                type="button"
                data-ocid={`library.delete_button.${i + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  unlikeMutation.mutate(song.videoId);
                }}
                className="p-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-vrinda-pink transition-all"
              >
                <Heart size={16} className="fill-current text-vrinda-pink" />
              </button>
            </button>
          ))}
        </div>
      </section>

      {preferences?.recentlyPlayed && preferences.recentlyPlayed.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <History size={18} className="text-vrinda-blue" />
            <h2 className="font-display font-bold text-lg">Recently Played</h2>
          </div>
          <div className="space-y-2">
            {preferences.recentlyPlayed.slice(0, 10).map((videoId, i) => (
              <button
                type="button"
                key={videoId}
                data-ocid={`library.item.${i + 1}`}
                className="w-full flex items-center gap-3 p-3 rounded-xl glass hover:bg-white/10 transition-all text-left"
                onClick={() => {
                  const song: YTVideo = {
                    videoId,
                    title: `Track ${videoId}`,
                    artist: "YouTube",
                    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                  };
                  playSong(song, [song]);
                }}
              >
                <img
                  src={`https://i.ytimg.com/vi/${videoId}/default.jpg`}
                  alt=""
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Track {i + 1}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
