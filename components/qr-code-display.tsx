/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import Image from "next/image";
import SwissCard from "./swiss/SwissCard";
import SwissButton from "./swiss/SwissButton";

interface QRCodeDisplayProps {
  slug: string;
}

export function QRCodeDisplay({ slug }: QRCodeDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    generateQRCode();
  }, []); // Removed unnecessary dependency: slug

  const generateQRCode = async () => {
    try {
      const url = `${window.location.origin}/gathering/join/${slug}`;
      const qrCodeDataUrl = await QRCode.toDataURL(url);
      setQrCodeUrl(qrCodeDataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const downloadQRCode = () => {
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `gathering-${slug}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <SwissCard variant="white" pattern="grid" className="max-w-xs mx-auto">
      <div className="flex flex-col items-center">
        {qrCodeUrl && (
          <div className="border-4 border-black p-2 bg-white mb-8">
            <Image
              width={200}
              height={200}
              src={qrCodeUrl || "/placeholder.svg"}
              alt="Gathering QR Code"
              className="rounded-none"
            />
          </div>
        )}
        <SwissButton variant="accent" className="w-full" onClick={downloadQRCode}>
          DOWNLOAD QR CODE
        </SwissButton>
      </div>
    </SwissCard>
  );
}
