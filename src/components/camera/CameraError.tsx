
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CameraErrorProps {
  error: string;
}

export const CameraError: React.FC<CameraErrorProps> = ({ error }) => {
  return (
    <Alert variant="destructive">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
};
