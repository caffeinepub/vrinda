import { Music2 } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 pb-48 px-6 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.85 0.14 195), oklch(0.60 0.20 255))",
          }}
        >
          <Music2 size={12} className="text-white" />
        </div>
        <span className="font-display font-bold text-gradient-cyan">
          Vrinda
        </span>
      </div>
      <p className="text-xs text-muted-foreground">© {year}</p>
    </footer>
  );
}
