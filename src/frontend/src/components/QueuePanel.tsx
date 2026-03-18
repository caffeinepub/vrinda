import { ScrollArea } from "@/components/ui/scroll-area";
import { GripVertical, X } from "lucide-react";
import { usePlayer } from "../contexts/PlayerContext";

export default function QueuePanel() {
  const { state, playSong, removeFromQueue } = usePlayer();

  return (
    <div className="h-full flex flex-col">
      <div className="px-5 py-5 border-b border-white/10">
        <h3 className="font-display font-bold text-lg">Up Next</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {state.queue.length} songs in queue
        </p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {state.queue.length === 0 && (
            <div
              data-ocid="queue.empty_state"
              className="py-12 text-center text-muted-foreground"
            >
              <p className="text-sm">Queue is empty</p>
              <p className="text-xs mt-1">Add songs to get started</p>
            </div>
          )}
          {state.queue.map((song, i) => {
            const isCurrent = state.currentSong?.videoId === song.videoId;
            return (
              <button
                type="button"
                key={`${song.videoId}-${i}`}
                data-ocid={`queue.item.${i + 1}`}
                className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all group ${
                  isCurrent
                    ? "bg-vrinda-cyan/15 border border-vrinda-cyan/30"
                    : "hover:bg-white/10"
                }`}
                onClick={() => playSong(song, state.queue)}
              >
                <GripVertical
                  size={14}
                  className="text-muted-foreground/40 flex-shrink-0"
                />
                <img
                  src={song.thumbnail}
                  alt={song.title}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0 text-left">
                  <p
                    className={`text-xs font-medium truncate ${isCurrent ? "text-vrinda-cyan" : ""}`}
                  >
                    {song.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {song.artist}
                  </p>
                </div>
                <button
                  type="button"
                  data-ocid={`queue.delete_button.${i + 1}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromQueue(song.videoId);
                  }}
                  className="p-1 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                >
                  <X size={12} />
                </button>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
