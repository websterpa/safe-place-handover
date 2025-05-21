
import React, {
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff } from "lucide-react";
import { Alert } from "@/components/ui/alert";

export interface CameraCaptureHandle {
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  takePhoto: () => void;
}

interface CameraCaptureProps {
  onPhotoCapture: (photoData: string) => void;
}

const CameraCapture = forwardRef<CameraCaptureHandle, CameraCaptureProps>(
  ({ onPhotoCapture }, ref) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [cameraActive, setCameraActive] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Your browser doesn't support camera access.");
      }
    }, []);

    const startCamera = async () => {
      if (!videoRef.current) {
        setError("Video element not found.");
        return;
      }

      try {
        setError(null);
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      } catch (err: any) {
        console.error("Camera access error:", err);
        setError("Failed to access camera: " + err.message);
      }
    };

    const stopCamera = () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach((track) => track.stop());
      setCameraActive(false);
    };

    const takePhoto = () => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const photoData = canvas.toDataURL("image/png");
      onPhotoCapture(photoData);
      stopCamera();
    };

    // Expose methods to parent components
    useImperativeHandle(ref, () => ({
      startCamera,
      stopCamera,
      takePhoto,
    }));

    return (
      <div className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <div>{error}</div>
          </Alert>
        )}

        {!cameraActive && (
          <Button onClick={startCamera}>
            <Camera className="mr-2 h-4 w-4" /> Start Camera
          </Button>
        )}

        {cameraActive && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded border"
            />
            <div className="flex gap-2">
              <Button onClick={takePhoto}>Take Photo</Button>
              <Button variant="outline" onClick={stopCamera}>
                <CameraOff className="mr-2 h-4 w-4" /> Stop Camera
              </Button>
            </div>
          </>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }
);

CameraCapture.displayName = "CameraCapture";

export default CameraCapture;
