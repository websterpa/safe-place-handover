
import { useEffect, useRef } from "react";
import QRCodeLib from "qrcode";

interface QRCodeProps {
  handoverId: string;
  size?: number;
}

const QRCode = ({ handoverId, size = 200 }: QRCodeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      // Create the QR code with the handover URL
      const handoverUrl = `${window.location.origin}/handover?id=${handoverId}`;
      
      QRCodeLib.toCanvas(
        canvasRef.current,
        handoverUrl,
        {
          width: size,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        },
        (error) => {
          if (error) console.error("Error generating QR Code:", error);
        }
      );
    }
  }, [handoverId, size]);

  return <canvas ref={canvasRef} />;
};

export default QRCode;
