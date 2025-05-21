
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { useCamera } from "@/hooks/useCamera";
import { CameraError } from "@/components/camera/CameraError";
import { CameraLoading } from "@/components/camera/CameraLoading";
import { CameraActivator } from "@/components/camera/CameraActivator";
import { Button } from "@/components/ui/button";
import { Camera, RotateCcw, Save } from "lucide-react";

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
    const {
      videoRef,
      canvasRef,
      cameraActive,
      error,
      loading,
      startCamera,
      stopCamera,
      takePhoto,
      toggleCameraFacing
    } = useCamera({ onPhotoCapture });
    
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    // Expose methods to parent components
    useImperativeHandle(ref, () => ({
      startCamera,
      stopCamera,
      takePhoto: () => {
        const photo = takePhoto();
        if (photo) setCapturedImage(photo);
        return photo;
      },
    }));

    const handleActivate = () => {
      console.log("Activating camera from button click");
      startCamera().catch(err => {
        console.error("Failed to start camera:", err);
      });
    };
    
    const handleTakePhoto = () => {
      if (capturedImage) {
        // Reset captured image and restart camera if we already have a photo
        setCapturedImage(null);
        startCamera();
        return;
      }
      
      // Take a new photo
      const photoData = takePhoto();
      if (photoData) {
        console.log("Photo captured, setting in state");
        setCapturedImage(photoData);
        stopCamera(); // Stop camera after capturing
      }
    };
    
    const handleSavePhoto = () => {
      if (capturedImage && onPhotoCapture) {
        console.log("Saving photo and passing to parent component");
        onPhotoCapture(capturedImage);
        setCapturedImage(null); // Clear the captured image from component state
      }
    };
    
    const handleRetakePhoto = () => {
      console.log("Retaking photo");
      setCapturedImage(null);
      startCamera();
    };

    return (
      <div className="space-y-4">
        {error && <CameraError error={error} />}
        
        {loading && <CameraLoading />}

        {/* Show video preview if camera is active and no image is captured */}
        {!capturedImage && (
          <video 
            ref={videoRef} 
            style={{ display: cameraActive ? 'block' : 'none' }}
            autoPlay 
            playsInline 
            muted 
            className="w-full h-auto border rounded overflow-hidden bg-black"
            height="200"
          />
        )}
        
        {/* Show captured image if available */}
        {capturedImage && (
          <div className="relative border rounded overflow-hidden bg-black">
            <img 
              src={capturedImage} 
              alt="Captured photo" 
              className="w-full h-auto"
            />
          </div>
        )}

        {!cameraActive && !loading && !capturedImage && (
          <CameraActivator onActivate={handleActivate} disabled={loading} />
        )}

        {/* Camera controls when active */}
        {cameraActive && !capturedImage && (
          <div className="flex gap-2 justify-between">
            <Button 
              variant="default"
              onClick={handleTakePhoto}
              className="flex items-center gap-2"
            >
              <Camera className="h-4 w-4" /> Take Photo
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={toggleCameraFacing}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" /> Flip Camera
              </Button>
              <Button 
                variant="outline"
                onClick={stopCamera}
              >
                Stop Camera
              </Button>
            </div>
          </div>
        )}
        
        {/* Photo action buttons when photo is captured */}
        {capturedImage && (
          <div className="flex gap-2 justify-between">
            <Button 
              variant="default"
              onClick={handleSavePhoto}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" /> Save Photo
            </Button>
            <Button 
              variant="outline"
              onClick={handleRetakePhoto}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" /> Retake Photo
            </Button>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }
);

CameraCapture.displayName = "CameraCapture";

export default CameraCapture;
