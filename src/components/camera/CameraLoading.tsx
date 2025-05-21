
import React from "react";

export const CameraLoading: React.FC = () => {
  return (
    <div className="flex justify-center py-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
};
