
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

        {!cameraActive && !loading && (
          <CameraActivator onActivate={handleActivate} disabled={loading} />
        )}

        {cameraActive && (
          <VideoPreview
            videoRef={videoRef}
            onTakePhoto={takePhoto}
            onStopCamera={stopCamera}
            onToggleFacing={toggleCameraFacing}
          />
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }
);

CameraCapture.displayName = "CameraCapture";

export default CameraCapture;
