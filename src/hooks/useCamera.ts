
import { useState, useRef, useEffect } from "react";

export interface UseCameraProps {
  onPhotoCapture?: (photoData: string) => void;
}

export const useCamera = ({ onPhotoCapture }: UseCameraProps = {}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  useEffect(() => {
    // Check if browser supports media devices
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Your browser doesn't support camera access.");
    }
    
    // Cleanup function to ensure camera is stopped when component unmounts
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    if (!videoRef.current) {
      // Retry after a short delay
      setTimeout(startCamera, 100);
      return;
    }

    try {
      setError(null);
      setLoading(true);
      console.log("Requesting camera access with facing mode:", facingMode);
      
      // First ensure any existing streams are stopped
      stopCamera();
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      console.log(`Camera access granted for ${facingMode} camera, setting up video stream`);
      
      // Make sure video element is still available
      if (!videoRef.current) {
        console.error("Video element not available after stream initialization");
        throw new Error("Video element not available");
      }
      
      videoRef.current.srcObject = stream;
      
      // Set up event listeners for better error catching
      videoRef.current.onloadedmetadata = () => {
        console.log("Video metadata loaded");
      };
      
      videoRef.current.oncanplay = () => {
        console.log("Video can play, attempting to play");
        if (videoRef.current) {
          videoRef.current.play()
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
        }
      };
      
      videoRef.current.onerror = (event) => {
        console.error("Video element error:", event);
        setError("Video element error occurred");
        setLoading(false);
        stopCamera();
      };
      
    } catch (err: any) {
      console.error("Camera access error:", err);
      setError("Failed to access camera: " + (err.message || "Unknown error"));
      setLoading(false);
    }
  };

  const toggleCameraFacing = async () => {
    // First stop current camera
    stopCamera();
    
    // Toggle facing mode
    setFacingMode(prevMode => prevMode === 'environment' ? 'user' : 'environment');
    
    // Small delay to ensure previous camera is fully stopped
    setTimeout(() => {
      startCamera();
    }, 300);
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
      if (onPhotoCapture) {
        onPhotoCapture(photoData);
      }
      
      // Stop the camera after taking the photo
      stopCamera();
    } catch (err) {
      console.error("Error taking photo:", err);
      setError(`Failed to capture photo: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return {
    videoRef,
    canvasRef,
    cameraActive,
    error,
    loading,
    facingMode,
    startCamera,
    stopCamera,
    toggleCameraFacing,
    takePhoto,
    setError
  };
};
