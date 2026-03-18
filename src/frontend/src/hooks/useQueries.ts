import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Song } from "../backend.d";
import { useActor } from "./useActor";

export function useGetLikedSongs() {
  const { actor, isFetching } = useActor();
  return useQuery<Song[]>({
    queryKey: ["likedSongs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLikedSongs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPreferences() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["preferences"],
    queryFn: async () => {
      if (!actor) return { favoriteMood: "", recentlyPlayed: [] };
      return actor.getPreferences();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLikeSong() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      videoId,
      title,
      artist,
    }: { videoId: string; title: string; artist: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.likeSong(videoId, title, artist);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["likedSongs"] }),
  });
}

export function useUnlikeSong() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (videoId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.unlikeSong(videoId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["likedSongs"] }),
  });
}

export function useSavePreferences() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      mood,
      recentlyPlayed,
    }: { mood: string; recentlyPlayed: string[] }) => {
      if (!actor) throw new Error("Not connected");
      return actor.savePreferences(mood, recentlyPlayed);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["preferences"] }),
  });
}
