import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, ScanFace, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const EMOTION_TO_MOOD: Record<string, string> = {
  happy: "happy",
  surprised: "energetic",
  sad: "sad",
  fearful: "sad",
  disgusted: "focus",
  angry: "focus",
  neutral: "chill",
};

const MOOD_LABELS: Record<string, string> = {
  happy: "Happy 😊",
  energetic: "Energetic ⚡",
  sad: "Sad 😢",
  focus: "Focus 🎯",
  chill: "Chill 😌",
  romantic: "Romantic ❤️",
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onEmotionDetected: (moodKey: string) => void;
}

type Status =
  | "loading"
  | "ready"
  | "detecting"
  | "detected"
  | "error"
  | "denied";

function stopTracks(stream: MediaStream) {
  for (const track of stream.getTracks()) {
    track.stop();
  }
}

export default function FaceEmotionDetector({
  isOpen,
  onClose,
  onEmotionDetected,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const detectionCountRef = useRef<Record<string, number>>({});
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [detectedMood, setDetectedMood] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);

  const stopCamera = () => {
    if (streamRef.current) {
      stopTracks(streamRef.current);
      streamRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleClose = () => {
    stopCamera();
    setStatus("loading");
    setDetectedMood(null);
    setScanProgress(0);
    detectionCountRef.current = {};
    onClose();
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: stopCamera is stable
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const init = async () => {
      try {
        setStatus("loading");
        const faceapi = await import("face-api.js");
        const CDN =
          "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights";

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(CDN),
          faceapi.nets.faceExpressionNet.loadFromUri(CDN),
        ]);

        if (cancelled) return;

        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "user",
              width: { ideal: 640 },
              height: { ideal: 480 },
            },
          });
        } catch {
          setStatus("denied");
          setErrorMsg(
            "Camera access denied. Please allow camera permissions and try again.",
          );
          return;
        }

        if (cancelled) {
          stopTracks(stream);
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setStatus("detecting");
        detectionCountRef.current = {};
        let elapsed = 0;

        timeoutRef.current = setTimeout(() => {
          if (intervalRef.current) clearInterval(intervalRef.current);
          const counts = detectionCountRef.current;
          const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
          const moodKey = best
            ? (EMOTION_TO_MOOD[best[0]] ?? "chill")
            : "chill";
          setDetectedMood(moodKey);
          setStatus("detected");
          stopCamera();
        }, 4000);

        intervalRef.current = setInterval(async () => {
          if (!videoRef.current || cancelled) return;
          elapsed += 500;
          setScanProgress(Math.min((elapsed / 4000) * 100, 100));

          try {
            const result = await faceapi
              .detectSingleFace(
                videoRef.current,
                new faceapi.TinyFaceDetectorOptions(),
              )
              .withFaceExpressions();

            if (!result) return;

            const expressions = result.expressions;
            const dominant = (
              Object.entries(expressions) as [string, number][]
            ).sort((a, b) => b[1] - a[1])[0][0];

            detectionCountRef.current[dominant] =
              (detectionCountRef.current[dominant] ?? 0) + 1;

            if (detectionCountRef.current[dominant] >= 3) {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              if (intervalRef.current) clearInterval(intervalRef.current);
              const moodKey = EMOTION_TO_MOOD[dominant] ?? "chill";
              setDetectedMood(moodKey);
              setStatus("detected");
              stopCamera();
            }
          } catch {
            // Detection can fail on individual frames - that's OK
          }
        }, 500);
      } catch (_err) {
        if (!cancelled) {
          setStatus("error");
          setErrorMsg(
            "Failed to load AI models. Check your internet connection.",
          );
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [isOpen]);

  const handleUseDetected = () => {
    if (detectedMood) {
      onEmotionDetected(detectedMood);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          data-ocid="emotion_detector.modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="glass-strong rounded-3xl w-full max-w-sm overflow-hidden"
            style={{ border: "1px solid oklch(0.85 0.14 195 / 0.25)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div className="flex items-center gap-2">
                <ScanFace size={20} className="text-vrinda-cyan" />
                <span className="font-display font-bold text-base">
                  Detect My Mood
                </span>
              </div>
              <button
                type="button"
                data-ocid="emotion_detector.close_button"
                onClick={handleClose}
                className="rounded-full p-1.5 hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            {/* Camera / Content area */}
            <div className="relative mx-5 mb-5">
              {/* Video feed */}
              <div
                className="relative rounded-2xl overflow-hidden bg-black"
                style={{ aspectRatio: "4/3" }}
              >
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  style={{ transform: "scaleX(-1)" }}
                />

                {/* Scanning overlay */}
                {status === "detecting" && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                      className="rounded-2xl"
                      style={{
                        width: "60%",
                        height: "75%",
                        border: "2px solid oklch(0.85 0.14 195 / 0.8)",
                        boxShadow:
                          "0 0 20px oklch(0.85 0.14 195 / 0.4), inset 0 0 20px oklch(0.85 0.14 195 / 0.05)",
                      }}
                    />
                    {[
                      {
                        pos: "top-0 left-0",
                        r: "4px 0 0 0",
                        bl: "2px",
                        br: "0",
                        bt: "2px",
                        bb: "0",
                      },
                      {
                        pos: "top-0 right-0",
                        r: "0 4px 0 0",
                        bl: "0",
                        br: "2px",
                        bt: "2px",
                        bb: "0",
                      },
                      {
                        pos: "bottom-0 left-0",
                        r: "0 0 0 4px",
                        bl: "2px",
                        br: "0",
                        bt: "0",
                        bb: "2px",
                      },
                      {
                        pos: "bottom-0 right-0",
                        r: "0 0 4px 0",
                        bl: "0",
                        br: "2px",
                        bt: "0",
                        bb: "2px",
                      },
                    ].map(({ pos, r, bl, br, bt, bb }) => (
                      <div
                        key={pos}
                        className={`absolute ${pos} w-4 h-4`}
                        style={{
                          margin: "20%",
                          borderColor: "oklch(0.85 0.14 195)",
                          borderStyle: "solid",
                          borderLeftWidth: bl,
                          borderRightWidth: br,
                          borderTopWidth: bt,
                          borderBottomWidth: bb,
                          borderRadius: r,
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Detected success overlay */}
                {status === "detected" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.7)" }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.5 }}
                      className="text-5xl mb-3"
                    >
                      ✨
                    </motion.div>
                    <p className="font-bold text-lg text-vrinda-cyan">
                      {detectedMood && MOOD_LABELS[detectedMood]}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Mood detected!
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Status bar below video */}
              <div className="mt-4 space-y-3">
                {status === "loading" && (
                  <div
                    data-ocid="emotion_detector.loading_state"
                    className="flex items-center gap-3 justify-center py-2"
                  >
                    <Loader2
                      size={18}
                      className="text-vrinda-cyan animate-spin"
                    />
                    <span className="text-sm text-muted-foreground">
                      Loading AI model...
                    </span>
                  </div>
                )}

                {status === "detecting" && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-vrinda-cyan animate-pulse" />
                      <span className="text-sm text-vrinda-cyan font-medium">
                        Scanning your face...
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: "oklch(0.85 0.14 195)" }}
                        animate={{ width: `${scanProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}

                {(status === "error" || status === "denied") && (
                  <div
                    data-ocid="emotion_detector.error_state"
                    className="flex items-start gap-2 p-3 rounded-xl"
                    style={{
                      background: "oklch(0.65 0.24 345 / 0.1)",
                      border: "1px solid oklch(0.65 0.24 345 / 0.2)",
                    }}
                  >
                    <AlertCircle
                      size={16}
                      className="text-destructive mt-0.5 shrink-0"
                    />
                    <p className="text-sm text-destructive">{errorMsg}</p>
                  </div>
                )}

                {status === "detected" && detectedMood && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <Button
                      data-ocid="emotion_detector.confirm_button"
                      className="w-full font-semibold"
                      style={{
                        background: "oklch(0.85 0.14 195)",
                        color: "oklch(0.09 0.025 265)",
                        boxShadow: "0 0 20px oklch(0.85 0.14 195 / 0.4)",
                      }}
                      onClick={handleUseDetected}
                    >
                      Play {MOOD_LABELS[detectedMood]} Playlist
                    </Button>
                    <Button
                      data-ocid="emotion_detector.cancel_button"
                      variant="ghost"
                      className="w-full text-muted-foreground hover:text-foreground"
                      onClick={handleClose}
                    >
                      Cancel
                    </Button>
                  </motion.div>
                )}

                {(status === "error" || status === "denied") && (
                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground"
                    onClick={handleClose}
                  >
                    Close
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
