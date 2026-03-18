import { Heart, Play, Plus } from "lucide-react";
import { usePlayer } from "../contexts/PlayerContext";
import type { YTVideo } from "../services/youtube";

interface SongCardProps {
  song: YTVideo;
  queue: YTVideo[];
  index: number;
  variant?: "grid" | "list";
  onLike?: (song: YTVideo) => void;
  isLiked?: boolean;
}

export default function SongCard({
  song,
  queue,
  index,
  variant = "grid",
  onLike,
  isLiked,
}: SongCardProps) {
  const { playSong, addToQueue } = usePlayer();

  if (variant === "list") {
    return (
      <button
        type="button"
        data-ocid={`songs.item.${index}`}
        className="w-full flex items-center gap-3 p-3 rounded-xl glass hover:bg-white/10 transition-all group text-left"
        onClick={() => playSong(song, queue)}
      >
        <div className="relative flex-shrink-0">
          <img
            src={song.thumbnail}
            alt={song.title}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play size={14} className="text-white fill-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{song.title}</p>
          <p className="text-xs text-muted-foreground truncate">
            {song.artist}
          </p>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onLike && (
            <button
              type="button"
              data-ocid={`songs.toggle.${index}`}
              onClick={(e) => {
                e.stopPropagation();
                onLike(song);
              }}
              className={`p-1.5 rounded-lg transition-colors ${isLiked ? "text-vrinda-pink" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Heart size={14} className={isLiked ? "fill-current" : ""} />
            </button>
          )}
          <button
            type="button"
            data-ocid={`songs.add_button.${index}`}
            onClick={(e) => {
              e.stopPropagation();
              addToQueue(song);
            }}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-vrinda-cyan transition-colors"
          >
            <Plus size={14} />
          </button>
          {song.duration && (
            <span className="text-xs text-muted-foreground w-10 text-right">
              {song.duration}
            </span>
          )}
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      data-ocid={`songs.item.${index}`}
      className="glass rounded-xl overflow-hidden group text-left hover:bg-white/10 transition-all hover:scale-[1.02]"
      onClick={() => playSong(song, queue)}
    >
      <div className="relative aspect-video">
        <img
          src={song.thumbnail}
          alt={song.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-vrinda-cyan/90 flex items-center justify-center neon-cyan">
            <Play size={18} className="text-white fill-white ml-0.5" />
          </div>
        </div>
        {song.duration && (
          <span className="absolute bottom-2 right-2 text-xs bg-black/70 text-white px-1.5 py-0.5 rounded">
            {song.duration}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium line-clamp-2 leading-tight">
          {song.title}
        </p>
        <p className="text-xs text-muted-foreground mt-1 truncate">
          {song.artist}
        </p>
      </div>
    </button>
  );
}
