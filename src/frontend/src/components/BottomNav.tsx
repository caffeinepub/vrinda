import { Compass, Home, Library, Smile } from "lucide-react";
import { motion } from "motion/react";

export type TabId = "home" | "explore" | "moods" | "library";

const tabs: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "explore", label: "Explore", icon: Compass },
  { id: "moods", label: "Moods", icon: Smile },
  { id: "library", label: "Library", icon: Library },
];

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  hasPlayer: boolean;
}

export default function BottomNav({
  activeTab,
  onTabChange,
  hasPlayer,
}: BottomNavProps) {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 flex justify-center px-4 ${hasPlayer ? "pb-[90px]" : "pb-4"}`}
    >
      <motion.nav
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-strong rounded-2xl px-2 py-2 flex items-center gap-1 shadow-glass"
        style={{ minWidth: 280 }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              type="button"
              key={tab.id}
              data-ocid={`nav.${tab.id}.tab`}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all ${
                isActive
                  ? "bg-vrinda-cyan/15 text-vrinda-cyan"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isActive ? (
                <motion.div layoutId="tab-indicator" className="relative">
                  <Icon size={20} strokeWidth={2.5} />
                </motion.div>
              ) : (
                <Icon size={20} strokeWidth={1.5} />
              )}
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </motion.nav>
    </div>
  );
}
