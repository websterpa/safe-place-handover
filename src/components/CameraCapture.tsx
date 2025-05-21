
import React, { forwardRef, useImperativeHandle } from "react";
import { useCamera } from "@/hooks/useCamera";
import { VideoPreview } from "@/components/camera/VideoPreview";
import { CameraError } from "@/components/camera/CameraError";
import { CameraLoading } from "@/components/camera/CameraLoading";
import { CameraActivator } from "@/components/camera/CameraActivator";

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

    // Expose methods to parent components
    useImperativeHandle(ref, () => ({
      startCamera,
      stopCamera,
      takePhoto,
    }));

    const handleActivate = () => {
      console.log("Activating camera from button click");
      startCamera().catch(err => {
        console.error("Failed to start camera:", err);
      });
    };

    return (
      <div className="space-y-4">
        {error && <CameraError error={error} />}
        
        {loading && <CameraLoading />}

        <video 
          ref={videoRef} 
          style={{ display: cameraActive ? 'block' : 'none' }}
          autoPlay 
          playsInline 
          muted 
          className="w-full h-auto border rounded overflow-hidden bg-black"
          height="200"
        />

        {!cameraActive && !loading && (
          <CameraActivator onActivate={handleActivate} disabled={loading} />
        )}

        {cameraActive && (
          <div className="flex gap-2 justify-between">
            <button 
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
              onClick={takePhoto}
            >
              Take Photo
            </button>
            <div className="flex gap-2">
              <button 
                className="border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2 rounded transition-colors flex items-center gap-2" 
                onClick={toggleCameraFacing}
              >
                <span className="mr-2 h-4 w-4">↺</span> Flip Camera
              </button>
              <button 
                className="border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2 rounded transition-colors flex items-center gap-2"
                onClick={stopCamera}
              >
                <span className="mr-2 h-4 w-4">✕</span> Stop Camera
              </button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }
);

CameraCapture.displayName = "CameraCapture";

export default CameraCapture;
