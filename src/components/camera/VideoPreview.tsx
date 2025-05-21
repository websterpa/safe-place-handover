
import React from "react";
import { Button } from "@/components/ui/button";
import { CameraOff } from "lucide-react";

interface VideoPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onTakePhoto: () => void;
  onStopCamera: () => void;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  videoRef,
  onTakePhoto,
  onStopCamera,
}) => {
  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full rounded border"
      />
      <div className="flex gap-2">
        <Button onClick={onTakePhoto}>Take Photo</Button>
        <Button variant="outline" onClick={onStopCamera}>
          <CameraOff className="mr-2 h-4 w-4" /> Stop Camera
        </Button>
      </div>
    </>
  );
};
