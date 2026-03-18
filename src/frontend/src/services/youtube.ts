const API_KEY = "AIzaSyCz98PuENyWbXCvtDrJxWlYhpJZnaKxVBw";
const BASE_URL = "https://www.googleapis.com/youtube/v3";

export interface YTVideo {
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration?: string;
}

function parseDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";
  const h = Number.parseInt(match[1] || "0");
  const m = Number.parseInt(match[2] || "0");
  const s = Number.parseInt(match[3] || "0");
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function extractVideos(items: any[]): YTVideo[] {
  return items
    .filter((item: any) => {
      const id = item.id?.videoId || item.id;
      return typeof id === "string";
    })
    .map((item: any) => {
      const id = item.id?.videoId || item.id;
      const snippet = item.snippet || {};
      const thumb =
        snippet.thumbnails?.maxres?.url ||
        snippet.thumbnails?.high?.url ||
        snippet.thumbnails?.medium?.url ||
        `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
      return {
        videoId: id,
        title: snippet.title || "Unknown",
        artist: snippet.channelTitle || "Unknown Artist",
        thumbnail: thumb,
        duration: item.contentDetails
          ? parseDuration(item.contentDetails.duration)
          : undefined,
      };
    });
}

export async function searchMusic(
  query: string,
  maxResults = 20,
): Promise<YTVideo[]> {
  const url = new URL(`${BASE_URL}/search`);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("q", query);
  url.searchParams.set("type", "video");
  url.searchParams.set("videoCategoryId", "10");
  url.searchParams.set("maxResults", String(maxResults));
  url.searchParams.set("key", API_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);
  const data = await res.json();
  return extractVideos(data.items || []);
}

export async function getTrendingMusic(maxResults = 20): Promise<YTVideo[]> {
  const url = new URL(`${BASE_URL}/videos`);
  url.searchParams.set("part", "snippet,contentDetails");
  url.searchParams.set("chart", "mostPopular");
  url.searchParams.set("videoCategoryId", "10");
  url.searchParams.set("maxResults", String(maxResults));
  url.searchParams.set("key", API_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);
  const data = await res.json();
  return extractVideos(data.items || []);
}

export const MOOD_QUERIES: Record<
  string,
  { label: string; query: string; color: string; icon: string }
> = {
  happy: {
    label: "Happy",
    query: "happy upbeat pop music 2024",
    color: "yellow",
    icon: "😊",
  },
  sad: {
    label: "Sad",
    query: "sad emotional music playlist",
    color: "blue",
    icon: "😢",
  },
  chill: {
    label: "Chill",
    query: "chill lo-fi beats study music",
    color: "aqua",
    icon: "😌",
  },
  energetic: {
    label: "Energetic",
    query: "energetic workout gym music",
    color: "pink",
    icon: "⚡",
  },
  romantic: {
    label: "Romantic",
    query: "romantic love songs playlist",
    color: "pink",
    icon: "❤️",
  },
  focus: {
    label: "Focus",
    query: "focus deep work concentration music",
    color: "blue",
    icon: "🎯",
  },
};
