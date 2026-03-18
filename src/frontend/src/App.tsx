import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import BottomNav, { type TabId } from "./components/BottomNav";
import Footer from "./components/Footer";
import FullPlayer from "./components/FullPlayer";
import Header from "./components/Header";
import MiniPlayer from "./components/MiniPlayer";
import YouTubeEmbed from "./components/YouTubeEmbed";
import { PlayerProvider, usePlayer } from "./contexts/PlayerContext";
import {
  useGetLikedSongs,
  useLikeSong,
  useSavePreferences,
  useUnlikeSong,
} from "./hooks/useQueries";
import ExplorePage from "./pages/ExplorePage";
import HomePage from "./pages/HomePage";
import LibraryPage from "./pages/LibraryPage";
import MoodsPage from "./pages/MoodsPage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
});

function AppInner() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const { state } = usePlayer();
  const { data: likedSongs = [] } = useGetLikedSongs();
  const likeMutation = useLikeSong();
  const unlikeMutation = useUnlikeSong();
  const savePrefs = useSavePreferences();
  const savePrefsRef = useRef(savePrefs.mutate);
  savePrefsRef.current = savePrefs.mutate;

  const likedIds = new Set(likedSongs.map((s) => s.videoId));

  const handleLike = (song: {
    videoId: string;
    title: string;
    artist: string;
  }) => {
    likeMutation.mutate(song, {
      onSuccess: () => toast.success("Added to liked songs"),
      onError: () => toast.error("Sign in to like songs"),
    });
  };

  const handleUnlike = (videoId: string) => {
    unlikeMutation.mutate(videoId, {
      onSuccess: () => toast.success("Removed from liked songs"),
      onError: () => toast.error("Sign in to manage likes"),
    });
  };

  // Save preferences when mood changes
  useEffect(() => {
    if (state.currentMood && state.currentSong) {
      savePrefsRef.current({
        mood: state.currentMood,
        recentlyPlayed: [state.currentSong.videoId],
      });
    }
  }, [state.currentMood, state.currentSong]);

  const handleTabChange = (tab: TabId) => setActiveTab(tab);

  return (
    <div className="min-h-screen" data-ocid="app.page">
      <YouTubeEmbed />
      <Header onSearchClick={() => setActiveTab("explore")} />

      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <HomePage key="home" onTabChange={handleTabChange} />
          )}
          {activeTab === "explore" && <ExplorePage key="explore" />}
          {activeTab === "moods" && <MoodsPage key="moods" />}
          {activeTab === "library" && <LibraryPage key="library" />}
        </AnimatePresence>
        <Footer />
      </div>

      <AnimatePresence>
        {state.currentSong && !state.isExpanded && <MiniPlayer />}
      </AnimatePresence>

      <AnimatePresence>
        {state.isExpanded && (
          <FullPlayer
            likedIds={likedIds}
            onLike={handleLike}
            onUnlike={handleUnlike}
          />
        )}
      </AnimatePresence>

      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        hasPlayer={!!state.currentSong}
      />

      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PlayerProvider>
        <AppInner />
      </PlayerProvider>
    </QueryClientProvider>
  );
}
