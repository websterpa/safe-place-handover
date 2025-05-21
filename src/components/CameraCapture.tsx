
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff } from "lucide-react";

interface CameraCaptureProps {
  onPhotoCapture: (photoData: string) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onPhotoCapture }) => {
  const [isActive, setIsActive] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Start the camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "environment",  // Prefer back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 } 
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  // Stop the camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsActive(false);
    }
  };

  // Take a photo
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match the video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame on the canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL (base64)
        const data = canvas.toDataURL('image/jpeg', 0.8);
        setPhotoData(data);
        setPhotoTaken(true);
        onPhotoCapture(data);
        
        // Stop the camera after taking the photo
        stopCamera();
      }
    }
  };

  // Retake photo
  const retakePhoto = () => {
    setPhotoTaken(false);
    setPhotoData(null);
    startCamera();
  };

  return (
    <div className="space-y-4 border rounded-lg p-4">
      <h3 className="text-lg font-medium">Item Photo</h3>
      
      <div className="relative bg-gray-100 rounded-md overflow-hidden aspect-video">
        {isActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : photoTaken && photoData ? (
          <img 
            src={photoData} 
            alt="Captured item" 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full min-h-[200px]">
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
