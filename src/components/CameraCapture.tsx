import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CameraCaptureProps {
  onPhotoCapture: (photoData: string) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onPhotoCapture }) => {
  const [isActive, setIsActive] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [browserSupported, setBrowserSupported] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Check browser compatibility immediately
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("Browser doesn't support mediaDevices API");
      setBrowserSupported(false);
      setError("Your browser doesn't support camera access. Try using Chrome, Firefox, or Safari.");
    } else {
      console.log("Browser supports mediaDevices API");
    }
  }, []);

  // Start the camera
  const startCamera = async () => {
    try {
      setError(null);
      setLoading(true);
      console.log("Starting camera...");

      // Check if video ref is available
      if (!videoRef.current) {
        console.error("Video element not found.");
        setError("Video element not found.");
        setLoading(false);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "environment",  // Prefer back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 } 
        } 
      });
      
      console.log("Camera stream obtained successfully");
      
      if (videoRef.current) {
        console.log("Setting video stream to element:", videoRef.current);
        
        // Ensure old tracks are stopped before setting a new stream
        if (videoRef.current.srcObject instanceof MediaStream) {
          const oldStream = videoRef.current.srcObject as MediaStream;
          oldStream.getTracks().forEach(track => track.stop());
        }
        
        videoRef.current.srcObject = stream;
        
        try {
          await videoRef.current.play();
          console.log("Video playback started successfully");
          setIsActive(true);
          setLoading(false);
        } catch (playErr: any) {
          console.error("Error starting video playback:", playErr);
          setError(`Failed to start video playback: ${playErr.message || "Unknown error"}`);
          setLoading(false);
        }
      } else {
        // This should not happen since we check earlier, but just in case
        setError("Video element reference not available after obtaining stream");
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      const errorMessage = err.name === 'NotAllowedError' 
        ? "Camera access was denied. Please allow camera access and try again." 
        : `Failed to access camera: ${err.message || 'Unknown error'}`;
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Stop the camera
  const stopCamera = () => {
    console.log("Stopping camera...");
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => {
        console.log("Stopping track:", track.kind);
        track.stop();
      });
      videoRef.current.srcObject = null;
      setIsActive(false);
    }
  };

  // Take a photo
  const capturePhoto = () => {
    console.log("Capturing photo...");
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Make sure video has valid dimensions
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.error("Video dimensions are invalid", video.videoWidth, video.videoHeight);
        setError("Cannot capture photo: video stream not properly initialized");
        return;
      }
      
      // Set canvas dimensions to match the video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      console.log(`Canvas dimensions set to: ${canvas.width}x${canvas.height}`);
      
      try {
        // Draw the current video frame on the canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Convert canvas to data URL (base64)
          const data = canvas.toDataURL('image/jpeg', 0.8);
          console.log("Photo captured successfully");
          setPhotoData(data);
          setPhotoTaken(true);
          onPhotoCapture(data);
          
          // Stop the camera after taking the photo
          stopCamera();
        } else {
          setError("Could not get canvas context");
        }
      } catch (err: any) {
        console.error("Error capturing photo:", err);
        setError(`Failed to capture photo: ${err.message || "Unknown error"}`);
      }
    } else {
      setError("Video or canvas reference not available for photo capture");
    }
  };

  // Retake photo
  const retakePhoto = () => {
    console.log("Retaking photo...");
    setPhotoTaken(false);
    setPhotoData(null);
    startCamera();
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="space-y-4 border rounded-lg p-4">
      <h3 className="text-lg font-medium">Item Photo</h3>
      
      {!browserSupported && (
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Your browser doesn't support camera access. Please try using Chrome, Firefox, or Safari.
          </AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="relative bg-gray-100 rounded-md overflow-hidden aspect-video min-h-[240px]">
        {isActive && (
          <div className="absolute top-2 right-2 z-10 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            Camera Active
          </div>
        )}
        
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
              <p className="mt-2 text-sm text-gray-600">Activating camera...</p>
            </div>
          </div>
        )}
        
        {isActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ display: isActive ? 'block' : 'none' }}
          />
        ) : photoTaken && photoData ? (
          <img 
            src={photoData} 
            alt="Captured item" 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <p className="text-gray-500">Camera inactive</p>
          </div>
        )}

        {/* Hidden canvas for capturing frame */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex gap-2">
        {!isActive && !photoTaken && (
          <Button 
            type="button" 
            onClick={startCamera}
            className="flex-1"
            disabled={!browserSupported || loading}
          >
            <Camera className="mr-2 h-4 w-4" />
            Start Camera
          </Button>
        )}

        {isActive && !photoTaken && (
          <>
            <Button 
              type="button" 
              onClick={capturePhoto}
              className="flex-1"
            >
              <Camera className="mr-2 h-4 w-4" />
              Take Photo
            </Button>
            <Button 
              type="button" 
              onClick={stopCamera}
              variant="outline"
            >
              <CameraOff className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </>
        )}

        {photoTaken && (
          <Button 
            type="button" 
            onClick={retakePhoto}
            variant="outline"
            className="flex-1"
          >
            <Camera className="mr-2 h-4 w-4" />
            Retake Photo
          </Button>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;
