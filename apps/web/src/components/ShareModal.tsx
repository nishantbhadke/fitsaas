import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { exercises, categories, categoryIcons } from "@/data/exercises-data";

interface Workout {
  id: string;
  title: string;
  date: string;
  duration: number | null;
  notes?: string | null;
}

export function ShareModal({
  isOpen,
  onClose,
  workout,
}: {
  isOpen: boolean;
  onClose: () => void;
  workout: Workout | null;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !workout) return null;

  // Find the exercise data to get the correct icon and category
  const exerciseData = exercises.find(
    (e) => e.name.toLowerCase() === workout.title.toLowerCase()
  );
  
  const categoryId = exerciseData?.category || "custom";
  const categoryInfo = categories.find((c) => c.id === categoryId)!;
  const iconPath = categoryIcons[categoryId];

  const handleShare = async () => {
    if (!cardRef.current) return;
    try {
      setIsExporting(true);
      
      // We render at a higher scale for better quality
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 3 });

      // If Web Share API is available (Mobile)
      if (navigator.share) {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], `${workout.title.replace(/\s+/g, "_")}_workout.png`, { type: "image/png" });
        await navigator.share({
          title: "My FitSaaS Workout",
          text: `Crushed my ${workout.title} workout on FitSaaS! 💪`,
          files: [file],
        });
      } else {
        // Fallback for Desktop: Download image
        const link = document.createElement("a");
        link.download = `${workout.title.replace(/\s+/g, "_")}_workout.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error("Failed to export image", err);
      alert("Oops, something went wrong exporting the image.");
    } finally {
      setIsExporting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* The Exportable Card */}
        <div className="p-6 pb-2" style={{ backgroundColor: "#09090b" }}>
          <div
            ref={cardRef}
            className="relative w-full rounded-2xl overflow-hidden flex flex-col p-8 bg-zinc-900 border border-zinc-800"
            style={{
              background: `linear-gradient(135deg, #18181b 0%, #09090b 100%)`,
              aspectRatio: "4/5",
            }}
          >
            {/* Background Glow */}
            <div
              className="absolute top-[-50px] right-[-50px] w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: categoryInfo.color }}
            />
            
            {/* Header: Logo */}
            <div className="flex items-center gap-2 mb-auto text-zinc-100 z-10">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center font-bold text-[10px]">
                F
              </div>
              <span className="font-bold text-sm tracking-tight">FitSaaS</span>
            </div>

            {/* Main Content */}
            <div className="flex flex-col items-center text-center z-10 my-auto">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-xl"
                style={{ backgroundColor: categoryInfo.bgColor, color: categoryInfo.color }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d={iconPath} />
                </svg>
              </div>
              
              <div
                className="text-xs font-bold uppercase tracking-widest mb-2 px-3 py-1 rounded-full"
                style={{ backgroundColor: `${categoryInfo.color}20`, color: categoryInfo.color }}
              >
                {categoryInfo.label}
              </div>

              <h2 className="text-3xl font-black text-white tracking-tight leading-tight mb-2">
                {workout.title}
              </h2>
              
              <p className="text-zinc-400 font-medium text-lg">
                {workout.duration ? `${workout.duration} Minutes` : "Completed"}
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-end justify-between w-full z-10 mt-auto pt-6 border-t border-zinc-800/50 text-zinc-500 text-xs font-medium">
              <span>{new Date(workout.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5z"/></svg>
                Verified
              </span>
            </div>
          </div>
        </div>

        {/* Modal Controls (Not Exported) */}
        <div className="p-6 pt-4 flex flex-col gap-3 bg-card border-t border-border">
          <p className="text-sm text-center text-foreground/60 mb-2">
            Share this summary to Instagram or save it to your camera roll.
          </p>
          <button
            onClick={handleShare}
            disabled={isExporting}
            className="w-full h-12 rounded-full bg-brand-600 text-white font-semibold transition-colors hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                Share / Save Image
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="w-full h-12 rounded-full border border-border bg-card text-foreground font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
