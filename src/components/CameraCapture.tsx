
import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, AlertCircle } from "lucide-react";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Check browser compatibility
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Your browser doesn't support camera access. Try using Chrome, Firefox, or Safari.");
    }
  }, []);

  // Start the camera
  const startCamera = async () => {
    try {
      setError(null);
      setLoading(true);
      console.log("Starting camera...");

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "environment",  // Prefer back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 } 
        } 
      });
      
      if (videoRef.current) {
        console.log("Setting video stream...");
        videoRef.current.srcObject = stream;
        videoRef.current.play()
          .then(() => {
            console.log("Video playback started successfully");
            setIsActive(true);
            setLoading(false);
          })
          .catch(err => {
            console.error("Error starting video playback:", err);
            setError(`Error starting video: ${err.message}`);
            setLoading(false);
          });
      } else {
        setError("Video element reference not available");
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      setError(`Camera access denied: ${err.message || 'Unknown error'}`);
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
      
      // Set canvas dimensions to match the video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      console.log(`Canvas dimensions set to: ${canvas.width}x${canvas.height}`);
      
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
    } else {
      setError("Video or canvas reference not available");
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
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
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
