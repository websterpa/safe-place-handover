
import React from "react";
import { Button } from "@/components/ui/button";
import { CameraOff, FlipHorizontal } from "lucide-react";

interface VideoPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onTakePhoto: () => void;
  onStopCamera: () => void;
  onToggleFacing?: () => void;
  showFacingToggle?: boolean;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  videoRef,
  onTakePhoto,
  onStopCamera,
  onToggleFacing,
  showFacingToggle = true,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="relative border rounded overflow-hidden bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-auto"
        />
      </div>
      <div className="flex gap-2 justify-between">
        <Button onClick={onTakePhoto}>Take Photo</Button>
        <div className="flex gap-2">
          {showFacingToggle && onToggleFacing && (
            <Button variant="outline" onClick={onToggleFacing}>
              <FlipHorizontal className="mr-2 h-4 w-4" /> Flip Camera
            </Button>
          )}
          <Button variant="outline" onClick={onStopCamera}>
            <CameraOff className="mr-2 h-4 w-4" /> Stop Camera
          </Button>
        </div>
      </div>
    </div>
  );
};
