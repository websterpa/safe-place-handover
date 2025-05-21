
import React, {
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Your browser doesn't support camera access.");
      }
      
      // Cleanup function to ensure camera is stopped when component unmounts
      return () => {
        stopCamera();
      };
    }, []);

    // Expose methods to parent components
    useImperativeHandle(ref, () => ({
      startCamera,
      stopCamera,
      takePhoto,
    }));

    const startCamera = async () => {
      if (!videoRef.current) {
        setError("Video element not found.");
        return;
      }

      try {
        setError(null);
        setLoading(true);
        console.log("Requesting camera access...");
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            facingMode: "environment" // Prefer back camera when available
          } 
        });
        
        console.log("Camera access granted, setting up video stream");
        videoRef.current.srcObject = stream;
        
        // Set up event listeners for better error catching
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded");
        };
        
        videoRef.current.oncanplay = () => {
          console.log("Video can play, attempting to play");
          videoRef.current?.play()
            .then(() => {
              console.log("Video playing successfully");
              setCameraActive(true);
              setLoading(false);
            })
            .catch((err) => {
              console.error("Video play error:", err);
              setError(`Failed to play video stream: ${err.message}`);
              setLoading(false);
              stopCamera(); // Clean up the stream if play fails
            });
        };
        
        videoRef.current.onerror = (event) => {
          console.error("Video element error:", event);
          setError("Video element error occurred");
          setLoading(false);
          stopCamera();
        };
        
      } catch (err: any) {
        console.error("Camera access error:", err);
        setError("Failed to access camera: " + err.message);
        setLoading(false);
      }
    };

    const stopCamera = () => {
      console.log("Stopping camera...");
      const stream = videoRef.current?.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((track) => {
          console.log("Stopping track:", track.kind);
          track.stop();
        });
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      setCameraActive(false);
    };

    const takePhoto = () => {
      if (!videoRef.current || !canvasRef.current) {
        console.error("Cannot take photo: video or canvas ref is null");
        return;
      }

      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (!context) {
          console.error("Failed to get canvas 2d context");
          return;
        }

        // Set canvas dimensions to match video dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        console.log(`Canvas dimensions set to: ${canvas.width}x${canvas.height}`);
        
        // Draw the current video frame to the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        console.log("Image drawn to canvas");
        
        // Convert canvas to data URL
        const photoData = canvas.toDataURL("image/png");
        console.log("Photo captured successfully");
        
        // Pass the photo data to the parent component
        onPhotoCapture(photoData);
        
        // Stop the camera after taking the photo
        stopCamera();
      } catch (err) {
        console.error("Error taking photo:", err);
        setError(`Failed to capture photo: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    return (
      <div className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {!cameraActive && !loading && (
          <Button onClick={startCamera} disabled={loading}>
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
