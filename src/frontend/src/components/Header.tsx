import { Music2, Search, User } from "lucide-react";
import { motion } from "motion/react";

interface HeaderProps {
  onSearchClick: () => void;
}

export default function Header({ onSearchClick }: HeaderProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 glass px-4 sm:px-8 py-3 flex items-center justify-between"
    >
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.85 0.14 195), oklch(0.60 0.20 255))",
          }}
        >
          <Music2 size={16} className="text-white" />
        </div>
        <span className="font-display font-bold text-xl text-gradient-cyan tracking-tight">
          Vrinda
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          data-ocid="header.search_input"
          onClick={onSearchClick}
          className="w-9 h-9 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
          aria-label="Search"
        >
          <Search size={16} />
        </button>
        <button
          type="button"
          data-ocid="header.button"
          className="w-9 h-9 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
          aria-label="Profile"
        >
          <User size={16} />
        </button>
      </div>
    </motion.header>
  );
}
