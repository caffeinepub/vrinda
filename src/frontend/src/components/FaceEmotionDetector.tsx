import { Button } from "@/components/ui/button";
import * as faceapi from "face-api.js";
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

type Step =
  | "camera"
  | "scanning"
  | "detected"
  | "not_detected"
  | "error"
  | "denied";

function stopTracks(stream: MediaStream) {
  for (const track of stream.getTracks()) {
    track.stop();
  }
}

let modelsLoaded = false;
let modelsLoading = false;

async function ensureModels() {
  if (modelsLoaded) return;
  if (modelsLoading) {
    // Wait for the loading to complete
    await new Promise<void>((resolve) => {
      const check = setInterval(() => {
        if (modelsLoaded) {
          clearInterval(check);
          resolve();
        }
      }, 100);
    });
    return;
  }
  modelsLoading = true;
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceExpressionNet.loadFromUri("/models"),
  ]);
  modelsLoaded = true;
  modelsLoading = false;
}

export default function FaceEmotionDetector({
  isOpen,
  onClose,
  onEmotionDetected,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [step, setStep] = useState<Step>("camera");
  const [errorMsg, setErrorMsg] = useState("");
  const [detectedMood, setDetectedMood] = useState<string | null>(null);
  const [modelsReady, setModelsReady] = useState(modelsLoaded);

  // Load models on mount
  useEffect(() => {
    if (modelsLoaded) {
      setModelsReady(true);
      return;
    }
    ensureModels()
      .then(() => setModelsReady(true))
      .catch(() => {
        // Models failed to load, we'll handle gracefully
        setModelsReady(true);
      });
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      stopTracks(streamRef.current);
      streamRef.current = null;
    }
  };

  const handleClose = () => {
    stopCamera();
    setStep("camera");
    setDetectedMood(null);
    setErrorMsg("");
    onClose();
  };

  // Start camera when step becomes "camera"
  // biome-ignore lint/correctness/useExhaustiveDependencies: stopCamera is stable
  useEffect(() => {
    if (!isOpen || step !== "camera") return;
    let cancelled = false;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        });
        if (cancelled) {
          stopTracks(stream);
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        if (!cancelled) {
          setStep("denied");
          setErrorMsg(
            "Camera access denied. Please allow camera permissions and try again.",
          );
        }
      }
    };

    startCamera();
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [isOpen, step]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: stopCamera is stable
  useEffect(() => {
    if (isOpen) {
      setStep("camera");
      setDetectedMood(null);
      setErrorMsg("");
    } else {
      stopCamera();
    }
  }, [isOpen]);

  const isCameraBlank = (): boolean => {
    const video = videoRef.current;
    if (!video) return true;
    if (!video.videoWidth || !video.videoHeight) return true;
    if (video.readyState < 2) return true;
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext("2d");
    if (!ctx) return true;
    ctx.drawImage(video, 0, 0, 16, 16);
    const data = ctx.getImageData(0, 0, 16, 16).data;
    let total = 0;
    for (let i = 0; i < data.length; i += 4) {
      total += data[i] + data[i + 1] + data[i + 2];
    }
    const avg = total / ((data.length / 4) * 3);
    return avg < 5;
  };

  const handleScanNow = async () => {
    if (isCameraBlank()) {
      setStep("not_detected");
      return;
    }

    setStep("scanning");
    setErrorMsg("");

    try {
      const video = videoRef.current;
      if (!video) {
        setStep("not_detected");
        return;
      }

      const result = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (!result || !result.expressions) {
        setStep("not_detected");
        return;
      }

      // Find highest-confidence expression
      const topEntry = result.expressions.asSortedArray()[0];
      const topEmotion = topEntry?.expression ?? "";

      const moodKey = EMOTION_TO_MOOD[topEmotion] ?? "chill";
      stopCamera();
      setDetectedMood(moodKey);
      setStep("detected");
    } catch {
      setStep("error");
      setErrorMsg("Detection failed. Please try again.");
    }
  };

  const handleRetry = () => {
    setStep("camera");
    setDetectedMood(null);
  };

  const handleUseDetected = () => {
    if (detectedMood) onEmotionDetected(detectedMood);
  };

  const cornerMarkers = [
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
  ];

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

            <div className="px-5 pb-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key="camera"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {/* Camera frame */}
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
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Scanning border overlay */}
                    {(step === "camera" || step === "scanning") && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <motion.div
                          animate={{
                            opacity: step === "scanning" ? [0.4, 1, 0.4] : 0.6,
                          }}
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
                        {cornerMarkers.map(({ pos, r, bl, br, bt, bb }) => (
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

                    {/* Not detected overlay */}
                    {step === "not_detected" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 flex flex-col items-center justify-center"
                        style={{ background: "rgba(0,0,0,0.75)" }}
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", bounce: 0.4 }}
                          className="text-5xl mb-3"
                        >
                          😶
                        </motion.div>
                        <p
                          className="font-bold text-base"
                          style={{ color: "oklch(0.75 0.18 55)" }}
                        >
                          Mood Not Detected
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 text-center px-4">
                          Make sure your face is visible and well-lit
                        </p>
                      </motion.div>
                    )}

                    {/* Detected success overlay */}
                    {step === "detected" && (
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

                  {/* Status area */}
                  <div className="space-y-3">
                    {step === "scanning" && (
                      <div
                        data-ocid="emotion_detector.loading_state"
                        className="flex items-center gap-3 justify-center py-1"
                      >
                        <Loader2
                          size={18}
                          className="text-vrinda-cyan animate-spin"
                        />
                        <span className="text-sm text-muted-foreground">
                          Analyzing your expression...
                        </span>
                      </div>
                    )}

                    {step === "camera" && (
                      <Button
                        data-ocid="emotion_detector.primary_button"
                        className="w-full font-semibold"
                        disabled={!modelsReady}
                        style={{
                          background: modelsReady
                            ? "oklch(0.85 0.14 195)"
                            : undefined,
                          color: modelsReady
                            ? "oklch(0.09 0.025 265)"
                            : undefined,
                          boxShadow: modelsReady
                            ? "0 0 20px oklch(0.85 0.14 195 / 0.4)"
                            : undefined,
                        }}
                        onClick={handleScanNow}
                      >
                        {modelsReady ? (
                          <>
                            <ScanFace size={16} className="mr-2" />
                            Scan Now
                          </>
                        ) : (
                          <>
                            <Loader2 size={16} className="mr-2 animate-spin" />
                            Loading AI...
                          </>
                        )}
                      </Button>
                    )}

                    {step === "not_detected" && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-2"
                      >
                        <Button
                          className="w-full font-semibold"
                          style={{
                            background: "oklch(0.85 0.14 195)",
                            color: "oklch(0.09 0.025 265)",
                            boxShadow: "0 0 20px oklch(0.85 0.14 195 / 0.4)",
                          }}
                          onClick={handleRetry}
                        >
                          Try Again
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full text-muted-foreground hover:text-foreground"
                          onClick={handleClose}
                        >
                          Cancel
                        </Button>
                      </motion.div>
                    )}

                    {(step === "error" || step === "denied") && (
                      <>
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
                        <Button
                          variant="ghost"
                          className="w-full text-muted-foreground"
                          onClick={handleClose}
                        >
                          Close
                        </Button>
                      </>
                    )}

                    {step === "detected" && detectedMood && (
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
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
