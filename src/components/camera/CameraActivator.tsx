
import React from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

interface CameraActivatorProps {
  onActivate: () => void;
  disabled?: boolean;
}

export const CameraActivator: React.FC<CameraActivatorProps> = ({ 
  onActivate, 
  disabled 
}) => {
  return (
    <Button onClick={onActivate} disabled={disabled}>
      <Camera className="mr-2 h-4 w-4" /> Start Camera
    </Button>
  );
};
