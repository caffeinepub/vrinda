import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, X } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import SongCard from "../components/SongCard";
import { searchMusic } from "../services/youtube";

export default function ExplorePage() {
  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInput = useCallback((val: string) => {
    setInputValue(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setQuery(val.trim()), 300);
  }, []);

  const {
    data: results = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["search", query],
    queryFn: () => searchMusic(query, 24),
    enabled: query.length > 1,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <main className="px-4 sm:px-8 pb-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-6 pb-4"
      >
        <h1 className="font-display font-bold text-2xl mb-6">Explore</h1>
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            data-ocid="explore.search_input"
            type="search"
            value={inputValue}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="Search songs, artists, albums..."
            className="w-full glass-strong rounded-2xl pl-12 pr-12 py-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-vrinda-cyan/50 transition-all"
            autoComplete="off"
          />
          {inputValue && (
            <button
              type="button"
              data-ocid="explore.button"
              onClick={() => {
                setInputValue("");
                setQuery("");
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </motion.div>

      {isLoading && (
        <div
          data-ocid="explore.loading_state"
          className="flex justify-center py-16"
        >
          <Loader2 className="w-8 h-8 text-vrinda-cyan animate-spin" />
        </div>
      )}

      {isError && (
        <div data-ocid="explore.error_state" className="text-center py-12">
          <p className="text-destructive">
            Failed to search. Check your connection and try again.
          </p>
        </div>
      )}

      {!isLoading && !isError && query.length > 1 && results.length === 0 && (
        <div
          data-ocid="explore.empty_state"
          className="text-center py-16 text-muted-foreground"
        >
          <Search size={40} className="mx-auto mb-4 opacity-30" />
          <p>No results for "{query}"</p>
        </div>
      )}

      {!query && (
        <div className="text-center py-16 text-muted-foreground">
          <Search size={40} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Discover music</p>
          <p className="text-sm mt-1">
            Type something to search millions of tracks
          </p>
        </div>
      )}

      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
        >
          {results.map((song, i) => (
            <SongCard
              key={song.videoId}
              song={song}
              queue={results}
              index={i + 1}
            />
          ))}
        </motion.div>
      )}
    </main>
  );
}
